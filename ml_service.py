#!/usr/bin/env python3
"""
MediCare AI ML Service
Provides ML-based disease prediction using ensemble of 3 models:
1. Random Forest Classifier
2. Support Vector Machine (SVM)
3. Naive Bayes Classifier

This service works alongside the LLM + RAG system for improved accuracy.
"""

import os
import sys

# Windows consoles default to a legacy code page (cp1252) that cannot encode the
# emoji in this file's log output, which crashed the service on startup. Force
# UTF-8 before anything prints.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
import json
from typing import List, Dict, Any

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
MODEL_DIR = 'models'
os.makedirs(MODEL_DIR, exist_ok=True)

class MediCareMLService:
    def __init__(self):
        self.vectorizer = None
        self.label_encoder = None
        self.models = {}
        self.is_trained = False

    def check_models_exist(self) -> bool:
        """Check if all required model files exist"""
        required_files = [
            f'{MODEL_DIR}/tfidf_vectorizer.pkl',
            f'{MODEL_DIR}/label_encoder.pkl',
            f'{MODEL_DIR}/random_forest.pkl',
            f'{MODEL_DIR}/svm.pkl',
            f'{MODEL_DIR}/naive_bayes.pkl',
        ]
        
        for file_path in required_files:
            if not os.path.exists(file_path):
                print(f"Missing: {file_path}")
                return False
        
        return True

    def load_models(self):
        """Load pre-trained models from disk"""
        if not self.check_models_exist():
            print("✗ Pre-trained models not found!")
            print("  Run 'python train_models.py' to train models offline first.")
            return False
        
        try:
            print("📂 Loading pre-trained models...")
            self.vectorizer = joblib.load(f'{MODEL_DIR}/tfidf_vectorizer.pkl')
            self.label_encoder = joblib.load(f'{MODEL_DIR}/label_encoder.pkl')

            model_names = ['random_forest', 'svm', 'naive_bayes']
            for name in model_names:
                self.models[name] = joblib.load(f'{MODEL_DIR}/{name}.pkl')

            self.is_trained = True
            print("✓ Models loaded successfully!")
            print(f"✓ Diseases: {len(self.label_encoder.classes_)}")
            return True
        except Exception as e:
            print(f"✗ Error loading models: {e}")
            return False

    def predict(self, symptoms: List[str]) -> Dict[str, Any]:
        """Make predictions using ensemble of all 3 models.

        Uses dynamic ensemble weighting via softmax on model confidence scores,
        disagreement penalty for low model agreement, and returns detailed
        breakdown for transparency.
        """
        if not self.is_trained:
            return {"error": "Models not trained or loaded"}

        # Convert symptoms list to text
        symptoms_text = ', '.join(symptoms)

        # Vectorize input
        X = self.vectorizer.transform([symptoms_text])

        predictions: Dict[str, Any] = {}
        model_scores: List[float] = []
        proba_vectors: List[np.ndarray] = []

        for name, model in self.models.items():
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba(X)[0]
                best_idx = np.argmax(proba)
                pred_disease = self.label_encoder.inverse_transform([best_idx])[0]
                confidence = float(proba[best_idx] * 100)

                predictions[name] = {
                    'disease': pred_disease,
                    'confidence': confidence,
                }
                model_scores.append(confidence)
                proba_vectors.append(proba)
            else:
                pred_idx = model.predict(X)[0]
                pred_disease = self.label_encoder.inverse_transform([pred_idx])[0]
                predictions[name] = {
                    'disease': pred_disease,
                    'confidence': 0.0,
                }
                model_scores.append(0.0)

        if not model_scores:
            return {
                'ensemble_prediction': {
                    'disease': 'Unknown',
                    'confidence': 0.0,
                },
                'model_predictions': predictions,
            }

        # ── Stage 2A: Softmax weighting ────────────────────────────────────
        def softmax(scores: List[float]) -> List[float]:
            scores_arr = np.array(scores)
            e = np.exp(scores_arr / 25)  # temperature=25 controls spread
            return (e / e.sum()).tolist()

        dynamic_weights = softmax(model_scores)
        weighted_ml_raw = sum(s * w for s, w in zip(model_scores, dynamic_weights))

        # ── Stage 2B: Disagreement penalty ─────────────────────────────────
        std_dev = np.std(model_scores)
        disagreement_penalty = float(std_dev * 0.25)

        # ── Stage 2C: Adjusted ML confidence ───────────────────────────────
        adjusted_ml = max(0.0, weighted_ml_raw - disagreement_penalty)

        # Model agreement level
        if std_dev < 10:
            agreement_level = 'high'
        elif std_dev < 25:
            agreement_level = 'medium'
        else:
            agreement_level = 'low'

        # Top model (highest confidence this run)
        model_names = list(self.models.keys())
        top_model_idx = int(np.argmax(model_scores))
        top_model = model_names[top_model_idx]

        # ── Stage 2D: True ensemble over probability vectors ───────────────
        # Combine the per-class probability vectors using the dynamic weights
        # rather than deferring to whichever single model was most confident.
        n_classes = len(self.label_encoder.classes_)
        if proba_vectors:
            proba_weights = softmax([model_scores[i] for i in range(len(proba_vectors))])
            ensemble_proba = np.average(np.vstack(proba_vectors), axis=0, weights=proba_weights)
        else:
            ensemble_proba = np.full(n_classes, 1.0 / n_classes)

        top_k_idx = np.argsort(ensemble_proba)[::-1][:5]
        top_k = [
            {
                'disease': self.label_encoder.inverse_transform([int(i)])[0],
                'probability': round(float(ensemble_proba[int(i)] * 100), 2),
            }
            for i in top_k_idx
        ]

        ensemble_disease = top_k[0]['disease']
        p1 = float(ensemble_proba[int(top_k_idx[0])])

        # ── Stage 2E: Calibrated confidence for a many-class problem ───────
        # A raw top-1 probability of ~4% looks meaningless but is ~30x the
        # uniform baseline when there are 776 classes. Score two signals:
        #   lift      - how far above chance the top pick is (log-scaled, so a
        #               perfect classifier maps to 100)
        #   dominance - how much of the plausible-candidate mass it holds
        uniform = 1.0 / n_classes
        lift = p1 / uniform if uniform > 0 else 0.0
        lift_score = 0.0
        if lift > 1:
            lift_score = min(100.0, 100.0 * float(np.log10(lift)) / float(np.log10(n_classes)))

        top5_mass = float(sum(ensemble_proba[int(i)] for i in top_k_idx))
        dominance = (p1 / top5_mass) if top5_mass > 0 else 0.0

        calibrated_confidence = 0.6 * lift_score + 0.4 * (dominance * 100.0)
        # Model disagreement still erodes confidence.
        calibrated_confidence = max(0.0, calibrated_confidence - disagreement_penalty)
        calibrated_confidence = round(min(95.0, calibrated_confidence), 1)

        return {
            'ensemble_prediction': {
                'disease': ensemble_disease,
                'confidence': calibrated_confidence,
                'raw_probability': round(p1 * 100, 2),
            },
            'top_k': top_k,
            'calibrated_confidence': calibrated_confidence,
            'raw_top1_probability': round(p1 * 100, 2),
            'n_classes': n_classes,
            'model_predictions': predictions,
            'dynamic_weights': dynamic_weights,
            'weighted_ml_raw': round(weighted_ml_raw, 1),
            'disagreement_penalty': round(disagreement_penalty, 1),
            'adjusted_ml': calibrated_confidence,
            'model_agreement_level': agreement_level,
            'top_model': top_model,
        }

    def load_training_data(self, csv_path: str) -> pd.DataFrame | None:
        if not os.path.exists(csv_path):
            print(f"✗ Error: Training data not found at {csv_path}")
            return None

        try:
            df = pd.read_csv(csv_path)
            print(f"✓ Loaded {len(df)} training samples from {csv_path}")
            return df
        except Exception as e:
            print(f"✗ Error loading training data: {e}")
            return None

    def preprocess_data(self, df: pd.DataFrame):
        print("\n📊 Preprocessing data...")
        X_text = df['symptom_text'].fillna('')
        y = df['disease']

        label_encoder = LabelEncoder()
        y_encoded = label_encoder.fit_transform(y)

        vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95
        )
        X = vectorizer.fit_transform(X_text)

        self.vectorizer = vectorizer
        self.label_encoder = label_encoder

        return X, y_encoded

    def train_models(self, X, y_encoded):
        print("\n🤖 Training models...")

        X_train, X_test, y_train, y_test = train_test_split(
            X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )

        print(f"  • Train samples: {X_train.shape[0]}")
        print(f"  • Test samples: {X_test.shape[0]}")

        rf = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42,
            n_jobs=-1,
            verbose=0
        )
        rf.fit(X_train, y_train)

        svm = SVC(
            kernel='linear',
            probability=True,
            random_state=42,
            verbose=0
        )
        svm.fit(X_train, y_train)

        nb = MultinomialNB()
        nb.fit(X_train, y_train)

        self.models = {
            'random_forest': rf,
            'svm': svm,
            'naive_bayes': nb,
        }
        self.is_trained = True

        self.save_models()

        rf_acc = accuracy_score(y_test, rf.predict(X_test))
        svm_acc = accuracy_score(y_test, svm.predict(X_test))
        nb_acc = accuracy_score(y_test, nb.predict(X_test))
        print(f"     ✓ Random Forest accuracy: {rf_acc:.2%}")
        print(f"     ✓ SVM accuracy: {svm_acc:.2%}")
        print(f"     ✓ Naive Bayes accuracy: {nb_acc:.2%}")

        return self.models

    def save_models(self):
        print("\n💾 Saving models to disk...")

        if self.vectorizer is not None:
            joblib.dump(self.vectorizer, f'{MODEL_DIR}/tfidf_vectorizer.pkl')
            print(f"  ✓ {MODEL_DIR}/tfidf_vectorizer.pkl")

        if self.label_encoder is not None:
            joblib.dump(self.label_encoder, f'{MODEL_DIR}/label_encoder.pkl')
            print(f"  ✓ {MODEL_DIR}/label_encoder.pkl")

        for name, model in self.models.items():
            joblib.dump(model, f'{MODEL_DIR}/{name}.pkl')
            print(f"  ✓ {MODEL_DIR}/{name}.pkl")

# Global ML service instance
ml_service = MediCareMLService()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'models_trained': ml_service.is_trained,
        'available_models': list(ml_service.models.keys()) if ml_service.is_trained else []
    })

@app.route('/predict', methods=['POST'])
def predict():
    """Make disease prediction"""
    try:
        data = request.get_json()

        if not data or 'symptoms' not in data:
            return jsonify({'error': 'Missing symptoms data'}), 400

        symptoms = data['symptoms']
        if not isinstance(symptoms, list):
            return jsonify({'error': 'Symptoms must be a list'}), 400

        result = ml_service.predict(symptoms)
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/train', methods=['POST'])
def train():
    """Train the ML models"""
    try:
        data = request.get_json()
        csv_path = data.get('csv_path', 'training_data.csv') if data else 'training_data.csv'

        df = ml_service.load_training_data(csv_path)
        if df is None:
            return jsonify({'error': 'Could not load training data'}), 500

        X, y = ml_service.preprocess_data(df)
        ml_service.train_models(X, y)

        return jsonify({
            'status': 'training_completed',
            'models_trained': list(ml_service.models.keys()),
            'num_samples': len(df)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/load', methods=['POST'])
def load():
    """Load pre-trained models"""
    try:
        success = ml_service.load_models()
        if success:
            return jsonify({
                'status': 'models_loaded',
                'available_models': list(ml_service.models.keys())
            })
        else:
            return jsonify({'error': 'Failed to load models'}), 500
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Try to load existing models first
    if not ml_service.load_models():
        print("No pre-trained models found or model files are incomplete.")
        if os.path.exists('training_data.csv'):
            print("Training models now from training_data.csv...")
            df = ml_service.load_training_data('training_data.csv')
            if df is None:
                print("ERROR: training_data.csv could not be loaded. Exiting.")
                raise SystemExit(1)
            X, y = ml_service.preprocess_data(df)
            ml_service.train_models(X, y)
        else:
            print("ERROR: training_data.csv not found. Cannot train models.")
            raise SystemExit(1)

    # debug=True enables the Werkzeug interactive debugger, which allows
    # arbitrary code execution for anyone who can reach the port. Opt in
    # explicitly via ML_DEBUG=1 rather than shipping it on by default.
    debug = os.environ.get('ML_DEBUG', '').lower() in ('1', 'true', 'yes')
    host = os.environ.get('ML_HOST', '127.0.0.1')
    port = int(os.environ.get('ML_PORT', '8000'))

    print(f"Starting MediCare ML Service on http://{host}:{port}")
    app.run(host=host, port=port, debug=debug)
