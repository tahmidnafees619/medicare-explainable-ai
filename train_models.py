#!/usr/bin/env python3
"""
MediCare AI Offline Model Training Pipeline

This script trains ML models ONCE offline and saves them to disk.
The backend loads these pre-trained models at startup for fast inference.

Usage:
  python train_models.py

Output:
  models/tfidf_vectorizer.pkl
  models/label_encoder.pkl
  models/random_forest.pkl
  models/svm.pkl
  models/naive_bayes.pkl
"""

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report
import joblib
from typing import Tuple

# Configuration
MODEL_DIR = 'models'
TRAINING_DATA_PATH = 'training_data.csv'

def setup_models_directory():
    """Create models directory if it doesn't exist"""
    os.makedirs(MODEL_DIR, exist_ok=True)
    print(f"✓ Models directory ready: {MODEL_DIR}/")


def load_training_data(csv_path: str) -> pd.DataFrame:
    """Load and validate training data from CSV"""
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


def preprocess_data(df: pd.DataFrame) -> Tuple:
    """
    Preprocess training data for ML models.
    Standardizes symptom features using TF-IDF vectorization.
    """
    print("\n📊 Preprocessing data...")
    
    # Extract features and labels
    X_text = df['symptom_text'].fillna('')
    y = df['disease']
    
    print(f"  • Input samples: {len(X_text)}")
    print(f"  • Disease classes: {y.nunique()}")
    print(f"  • Unique diseases: {sorted(y.unique())}")

    # Encode disease labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Create TF-IDF vectorizer (standardized feature extraction)
    # This ensures consistent feature representation across training and inference
    vectorizer = TfidfVectorizer(
        max_features=1000,           # Limit feature size
        stop_words='english',        # Remove common English words
        ngram_range=(1, 2),          # Use unigrams and bigrams
        min_df=1,                    # Include rare terms
        max_df=0.95                  # Exclude super common terms
    )
    
    X = vectorizer.fit_transform(X_text)
    
    print(f"  • TF-IDF features: {X.shape[1]}")
    print(f"  • Feature encoder saved: tfidf_vectorizer.pkl")
    
    return X, y_encoded, vectorizer, label_encoder


def train_models(X, y_encoded, vectorizer, label_encoder):
    """
    Train all three ML models with consistent hyperparameters.
    
    Weights for ensemble inference:
      - Random Forest: 0.45
      - SVM: 0.35
      - Naive Bayes: 0.20
    """
    print("\n🤖 Training models...")
    
    # Split data (80% train, 20% test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
    )
    
    print(f"  • Train samples: {X_train.shape[0]}")
    print(f"  • Test samples: {X_test.shape[0]}")
    
    models = {}
    
    # ─────────────────────────────────────────────────────────────
    # 1. Random Forest (weight: 0.45)
    # ─────────────────────────────────────────────────────────────
    print("\n  1️⃣  Training Random Forest...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42,
        n_jobs=-1,
        verbose=0
    )
    rf.fit(X_train, y_train)
    models['random_forest'] = rf
    
    rf_pred = rf.predict(X_test)
    rf_acc = accuracy_score(y_test, rf_pred)
    print(f"     ✓ Random Forest accuracy: {rf_acc:.2%}")
    
    # ─────────────────────────────────────────────────────────────
    # 2. Support Vector Machine (weight: 0.35)
    # ─────────────────────────────────────────────────────────────
    print("\n  2️⃣  Training SVM...")
    svm = SVC(
        kernel='linear',
        probability=True,
        random_state=42,
        verbose=0
    )
    svm.fit(X_train, y_train)
    models['svm'] = svm
    
    svm_pred = svm.predict(X_test)
    svm_acc = accuracy_score(y_test, svm_pred)
    print(f"     ✓ SVM accuracy: {svm_acc:.2%}")
    
    # ─────────────────────────────────────────────────────────────
    # 3. Naive Bayes (weight: 0.20)
    # ─────────────────────────────────────────────────────────────
    print("\n  3️⃣  Training Naive Bayes...")
    nb = MultinomialNB()
    nb.fit(X_train, y_train)
    models['naive_bayes'] = nb
    
    nb_pred = nb.predict(X_test)
    nb_acc = accuracy_score(y_test, nb_pred)
    print(f"     ✓ Naive Bayes accuracy: {nb_acc:.2%}")
    
    # ─────────────────────────────────────────────────────────────
    # Evaluate ensemble (weighted voting)
    # ─────────────────────────────────────────────────────────────
    print("\n📈 Ensemble Evaluation (weighted voting):")
    print("  Ensemble weights: RF=0.45, SVM=0.35, NB=0.20")
    
    ensemble_correct = 0
    for i in range(len(y_test)):
        # Get probabilities from each model
        rf_proba = rf.predict_proba(X_test[i])[0]
        svm_proba = svm.predict_proba(X_test[i])[0]
        nb_proba = nb.predict_proba(X_test[i])[0]
        
        # Weighted ensemble score
        ensemble_scores = (0.45 * rf_proba) + (0.35 * svm_proba) + (0.20 * nb_proba)
        ensemble_pred = np.argmax(ensemble_scores)
        
        if ensemble_pred == y_test[i]:
            ensemble_correct += 1
    
    ensemble_acc = ensemble_correct / len(y_test)
    print(f"  ✓ Ensemble accuracy: {ensemble_acc:.2%}")
    
    print("\n  ✓ All models trained successfully!")
    
    return models


def save_models(models, vectorizer, label_encoder):
    """Save trained models and encoders to disk using Joblib"""
    print("\n💾 Saving models to disk...")
    
    # Save vectorizer
    vectorizer_path = f'{MODEL_DIR}/tfidf_vectorizer.pkl'
    joblib.dump(vectorizer, vectorizer_path)
    print(f"  ✓ {vectorizer_path}")
    
    # Save label encoder
    encoder_path = f'{MODEL_DIR}/label_encoder.pkl'
    joblib.dump(label_encoder, encoder_path)
    print(f"  ✓ {encoder_path}")
    
    # Save trained models
    for name, model in models.items():
        model_path = f'{MODEL_DIR}/{name}.pkl'
        joblib.dump(model, model_path)
        print(f"  ✓ {model_path}")


def main():
    """Main training pipeline"""
    print("=" * 60)
    print("🏥 MediCare AI - Offline Model Training Pipeline")
    print("=" * 60)
    
    # Setup
    setup_models_directory()
    
    # Load data
    df = load_training_data(TRAINING_DATA_PATH)
    if df is None:
        return False
    
    # Preprocess
    X, y_encoded, vectorizer, label_encoder = preprocess_data(df)
    
    # Train
    models = train_models(X, y_encoded, vectorizer, label_encoder)
    
    # Save
    save_models(models, vectorizer, label_encoder)
    
    print("\n" + "=" * 60)
    print("✅ Training Complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("  1. Start the backend: npm run dev")
    print("  2. Models will be loaded at server startup")
    print("  3. Inference will be fast (no retraining)")
    print("\n")
    
    return True


if __name__ == '__main__':
    main()
