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

    def load_training_data(self, csv_path: str) -> pd.DataFrame:
        """Load and preprocess training data from CSV"""
        try:
            df = pd.read_csv(csv_path)
            print(f"Loaded {len(df)} training samples")
            return df
        except Exception as e:
            print(f"Error loading training data: {e}")
            return None

    def preprocess_data(self, df: pd.DataFrame):
        """Preprocess the training data"""
        # Extract features and labels
        X_text = df['symptom_text'].fillna('')
        y = df['disease']

        # Encode labels
        self.label_encoder = LabelEncoder()
        y_encoded = self.label_encoder.fit_transform(y)

        # Create TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )

        X = self.vectorizer.fit_transform(X_text)

        return X, y_encoded

    def train_models(self, X, y):
        """Train the three ML models"""
        print("Training ML models...")

        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )

        # Train Random Forest
        print("Training Random Forest...")
        rf = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        rf.fit(X_train, y_train)
        self.models['random_forest'] = rf

        # Train SVM
        print("Training SVM...")
        svm = SVC(
            kernel='linear',
            probability=True,
            random_state=42
        )
        svm.fit(X_train, y_train)
        self.models['svm'] = svm

        # Train Naive Bayes
        print("Training Naive Bayes...")
        nb = MultinomialNB()
        nb.fit(X_train, y_train)
        self.models['naive_bayes'] = nb

        # Evaluate models
        self.evaluate_models(X_test, y_test)

        # Save models
        self.save_models()

        self.is_trained = True
        print("All models trained and saved!")

    def evaluate_models(self, X_test, y_test):
        """Evaluate model performance"""
        print("\nModel Evaluation Results:")
        print("-" * 50)

        for name, model in self.models.items():
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            print(f"  {name}: {accuracy:.2%} accuracy")

    def save_models(self):
        """Save trained models to disk"""
        joblib.dump(self.vectorizer, f'{MODEL_DIR}/tfidf_vectorizer.pkl')
        joblib.dump(self.label_encoder, f'{MODEL_DIR}/label_encoder.pkl')

        for name, model in self.models.items():
            joblib.dump(model, f'{MODEL_DIR}/{name}.pkl')

        print(f"Models saved to {MODEL_DIR}/")

    def load_models(self):
        """Load trained models from disk"""
        try:
            self.vectorizer = joblib.load(f'{MODEL_DIR}/tfidf_vectorizer.pkl')
            self.label_encoder = joblib.load(f'{MODEL_DIR}/label_encoder.pkl')

            model_names = ['random_forest', 'svm', 'naive_bayes']
            for name in model_names:
                self.models[name] = joblib.load(f'{MODEL_DIR}/{name}.pkl')

            self.is_trained = True
            print("Models loaded successfully!")
            return True
        except Exception as e:
            print(f"Error loading models: {e}")
            return False

    def predict(self, symptoms: List[str]) -> Dict[str, Any]:
        """Make predictions using ensemble of all 3 models"""
        if not self.is_trained:
            return {"error": "Models not trained or loaded"}

        # Convert symptoms list to text
        symptoms_text = ', '.join(symptoms)

        # Vectorize input
        X = self.vectorizer.transform([symptoms_text])

        # Get predictions from all models
        predictions = {}
        probabilities = {}

        for name, model in self.models.items():
            if hasattr(model, 'predict_proba'):
                proba = model.predict_proba(X)[0]
                pred_idx = np.argmax(proba)
                pred_disease = self.label_encoder.inverse_transform([pred_idx])[0]
                confidence = float(proba[pred_idx] * 100)

                predictions[name] = {
                    'disease': pred_disease,
                    'confidence': confidence
                }
                probabilities[name] = proba.tolist()
            else:
                pred_idx = model.predict(X)[0]
                pred_disease = self.label_encoder.inverse_transform([pred_idx])[0]
                predictions[name] = {
                    'disease': pred_disease,
                    'confidence': 0.0  # SVM doesn't provide probabilities easily
                }

        # Ensemble prediction (average of all models)
        if len(probabilities) > 0:
            avg_probabilities = np.mean(list(probabilities.values()), axis=0)
            ensemble_idx = np.argmax(avg_probabilities)
            ensemble_disease = self.label_encoder.inverse_transform([ensemble_idx])[0]
            ensemble_confidence = float(avg_probabilities[ensemble_idx] * 100)
        else:
            ensemble_disease = predictions['random_forest']['disease']
            ensemble_confidence = predictions['random_forest']['confidence']

        return {
            'ensemble_prediction': {
                'disease': ensemble_disease,
                'confidence': ensemble_confidence
            },
            'model_predictions': predictions,
            'all_diseases': self.label_encoder.classes_.tolist()
        }

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
        print("No pre-trained models found. Use /train endpoint to train new models.")

    print("Starting MediCare ML Service on http://localhost:8000")
    app.run(host='0.0.0.0', port=8000, debug=True)