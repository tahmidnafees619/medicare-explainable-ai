#!/usr/bin/env python3
"""
MediCare AI Offline Model Training Pipeline

This script trains ML models ONCE offline and saves them to disk.
The backend loads these pre-trained models at startup for fast inference.

Usage:
  python train_models.py

Supported datasets:
  - training_data.csv (text format): ~54 diseases
  - datasets/Final_Augmented_dataset_Diseases_and_Symptoms.csv (binary format): 773 diseases

Output:
  models/tfidf_vectorizer.pkl
  models/label_encoder.pkl
  models/random_forest.pkl
  models/svm.pkl
  models/naive_bayes.pkl
"""

import os
import sys

# Windows consoles default to a legacy code page (cp1252) that cannot encode the
# emoji in this script's progress output. Force UTF-8 before anything prints.
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score
import joblib
from collections import Counter
from typing import Tuple

# Configuration
MODEL_DIR = 'models'
# Use the large dataset (773 diseases)
TRAINING_DATA_PATH = 'datasets/Final_Augmented_dataset_Diseases_and_Symptoms.csv'


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


def convert_binary_to_text(df: pd.DataFrame) -> Tuple[pd.Series, pd.Series]:
    """Convert binary symptom columns to text format."""
    symptom_cols = [col for col in df.columns if col != 'diseases']
    print(f"  Converting {len(symptom_cols)} binary symptom columns to text...")
    
    texts = []
    for idx, row in df.iterrows():
        symptoms = [col.replace('_', ' ') for col in symptom_cols if row[col] == 1]
        texts.append(' '.join(symptoms) if symptoms else 'no symptoms')
    
    return pd.Series(texts), df['diseases']


def preprocess_data(df: pd.DataFrame) -> Tuple:
    """Preprocess training data for ML models."""
    print("\n📊 Preprocessing data...")
    
    if 'symptom_text' in df.columns:
        X_text = df['symptom_text'].fillna('')
        y = df['disease']
        print(f"  Format: text (symptom_text column)")
    else:
        X_text, y = convert_binary_to_text(df)
        print(f"  Format: binary (converted to text)")
    
    print(f"  • Input samples: {len(X_text)}")
    print(f"  • Disease classes: {y.nunique()}")
    print(f"  • Sample diseases: {sorted(y.unique())[:10]}...")

    # Encode disease labels
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)
    
    # Create TF-IDF vectorizer
    vectorizer = TfidfVectorizer(
        max_features=2000,
        stop_words='english',
        ngram_range=(1, 2),
        min_df=1,
        max_df=0.95
    )
    
    X = vectorizer.fit_transform(X_text)
    print(f"  • TF-IDF features: {X.shape[1]}")
    
    return X, y_encoded, vectorizer, label_encoder


def train_models(X, y_encoded, vectorizer, label_encoder):
    """Train all three ML models."""
    print("\n🤖 Training models...")
    
    # Filter out classes with only 1 sample (stratify requires >= 2)
    class_counts = Counter(y_encoded)
    valid_classes = [c for c, count in class_counts.items() if count >= 2]
    mask = np.isin(y_encoded, valid_classes)
    X_filtered = X[mask]
    y_filtered = y_encoded[mask]
    removed = len(y_encoded) - len(y_filtered)
    print(f"  Filtered {removed} samples with rare diseases (< 2)")
    print(f"  Keeping {len(valid_classes)} classes for training")
    
    # Split data (no stratify, simpler split)
    X_train, X_test, y_train, y_test = train_test_split(
        X_filtered, y_filtered, test_size=0.2, random_state=42
    )
    
    print(f"  • Train samples: {X_train.shape[0]}")
    print(f"  • Test samples: {X_test.shape[0]}")
    
    models = {}
    
    # 1. Random Forest
    print("\n  1️⃣  Training Random Forest...")
    rf = RandomForestClassifier(
        n_estimators=100,
        max_depth=15,
        random_state=42,
        n_jobs=-1
    )
    rf.fit(X_train, y_train)
    models['random_forest'] = rf
    rf_acc = accuracy_score(y_test, rf.predict(X_test))
    print(f"     ✓ RF accuracy: {rf_acc:.2%}")
    
    # 2. SVM
    print("\n  2️⃣  Training SVM (this may take a few minutes)...")
    svm = SVC(kernel='linear', probability=True, random_state=42)
    svm.fit(X_train, y_train)
    models['svm'] = svm
    svm_acc = accuracy_score(y_test, svm.predict(X_test))
    print(f"     ✓ SVM accuracy: {svm_acc:.2%}")
    
    # 3. Naive Bayes
    print("\n  3️⃣  Training Naive Bayes...")
    nb = MultinomialNB()
    nb.fit(X_train, y_train)
    models['naive_bayes'] = nb
    nb_acc = accuracy_score(y_test, nb.predict(X_test))
    print(f"     ✓ NB accuracy: {nb_acc:.2%}")
    
    print("\n  ✓ All models trained!")
    return models


def save_models(models, vectorizer, label_encoder):
    """Save trained models to disk"""
    print("\n💾 Saving models...")
    joblib.dump(vectorizer, f'{MODEL_DIR}/tfidf_vectorizer.pkl')
    joblib.dump(label_encoder, f'{MODEL_DIR}/label_encoder.pkl')
    for name, model in models.items():
        joblib.dump(model, f'{MODEL_DIR}/{name}.pkl')
    print(f"  ✓ Saved to {MODEL_DIR}/")


def main():
    print("=" * 60)
    print("🏥 MediCare AI - Model Training")
    print("=" * 60)
    print(f"\nDataset: {TRAINING_DATA_PATH}")
    
    setup_models_directory()
    df = load_training_data(TRAINING_DATA_PATH)
    if df is None:
        return False
    
    X, y_encoded, vectorizer, label_encoder = preprocess_data(df)
    models = train_models(X, y_encoded, vectorizer, label_encoder)
    save_models(models, vectorizer, label_encoder)
    
    print("\n" + "=" * 60)
    print(f"✅ Training Complete! ({label_encoder.classes_.shape[0]} diseases)")
    print("=" * 60)
    print("\nRun: python ml_service.py")
    return True


if __name__ == '__main__':
    main()
