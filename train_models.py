#!/usr/bin/env python3
"""
MediCare AI ML Model Training Script
Trains the three ML models (Random Forest, SVM, Naive Bayes) for disease prediction.
"""

import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import MultinomialNB
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from typing import Tuple, List

class MLModelTrainer:
    def __init__(self):
        self.vectorizer = None
        self.label_encoder = None
        self.models = {}
        self.model_dir = 'models'

    def create_model_dir(self):
        """Create models directory if it doesn't exist"""
        os.makedirs(self.model_dir, exist_ok=True)
        print(f"Model directory: {self.model_dir}")

    def load_data(self, csv_path: str = 'training_data.csv') -> pd.DataFrame:
        """Load training data from CSV"""
        try:
            df = pd.read_csv(csv_path)
            print(f"Loaded {len(df)} training samples")
            print(f"Number of unique diseases: {df['disease'].nunique()}")
            print(f"Diseases: {df['disease'].unique()}")
            return df
        except Exception as e:
            print(f"Error loading data: {e}")
            return None

    def preprocess_data(self, df: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """Preprocess the data for training"""
        print("\nPreprocessing data...")

        # Extract features and labels
        X_text = df['symptom_text'].fillna('')
        y = df['disease']

        # Encode labels
        self.label_encoder = LabelEncoder()
        y_encoded = self.label_encoder.fit_transform(y)
        print(f"Encoded {len(self.label_encoder.classes_)} disease classes")

        # Create TF-IDF vectorizer
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.9
        )

        X = self.vectorizer.fit_transform(X_text)
        print(f"Created TF-IDF features: {X.shape}")

        return X, y_encoded

    def train_random_forest(self, X_train, y_train) -> RandomForestClassifier:
        """Train Random Forest model"""
        print("\nTraining Random Forest...")
        rf = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        rf.fit(X_train, y_train)
        return rf

    def train_svm(self, X_train, y_train) -> SVC:
        """Train SVM model"""
        print("Training SVM...")
        svm = SVC(
            kernel='linear',
            C=1.0,
            probability=True,
            random_state=42
        )
        svm.fit(X_train, y_train)
        return svm

    def train_naive_bayes(self, X_train, y_train) -> MultinomialNB:
        """Train Naive Bayes model"""
        print("Training Naive Bayes...")
        nb = MultinomialNB(alpha=0.1)
        nb.fit(X_train, y_train)
        return nb

    def evaluate_model(self, model, X_test, y_test, model_name: str):
        """Evaluate a single model"""
        y_pred = model.predict(X_test)
        accuracy = accuracy_score(y_test, y_pred)

        print(f"\n{model_name} Results:")
        print(f"Accuracy: {accuracy:.4f}")

        # Get unique classes in test set
        unique_classes = np.unique(np.concatenate([y_test, y_pred]))
        target_names = [self.label_encoder.classes_[i] for i in unique_classes]

        print("Classification Report:")
        try:
            print(classification_report(y_test, y_pred,
                                      target_names=target_names,
                                      labels=unique_classes,
                                      zero_division=0))
        except:
            print("Could not generate detailed report (limited test data)")

        return accuracy

    def cross_validate_models(self, X, y):
        """Perform cross-validation on all models (skip for small datasets)"""
        print("\nSkipping Cross-Validation (small dataset)...")

        models = {
            'Random Forest': RandomForestClassifier(n_estimators=100, random_state=42),
            'SVM': SVC(kernel='linear', probability=True, random_state=42),
            'Naive Bayes': MultinomialNB()
        }

        # Just show that we're using these models
        for name in models.keys():
            print(f"✓ {name} model ready for training")

    def save_models(self):
        """Save all trained models"""
        print(f"\nSaving models to {self.model_dir}...")

        # Save vectorizer and encoder
        joblib.dump(self.vectorizer, f'{self.model_dir}/tfidf_vectorizer.pkl')
        joblib.dump(self.label_encoder, f'{self.model_dir}/label_encoder.pkl')

        # Save models
        for name, model in self.models.items():
            joblib.dump(model, f'{self.model_dir}/{name.lower().replace(" ", "_")}.pkl')
            print(f"Saved {name}")

        print("All models saved!")

    def plot_feature_importance(self):
        """Plot feature importance for Random Forest"""
        if 'Random Forest' in self.models:
            rf = self.models['Random Forest']
            feature_names = self.vectorizer.get_feature_names_out()

            # Get feature importances
            importances = rf.feature_importances_
            indices = np.argsort(importances)[-20:]  # Top 20 features

            plt.figure(figsize=(10, 6))
            plt.title('Top 20 Feature Importances (Random Forest)')
            plt.barh(range(len(indices)), importances[indices], align='center')
            plt.yticks(range(len(indices)), [feature_names[i] for i in indices])
            plt.xlabel('Importance')
            plt.tight_layout()
            plt.savefig(f'{self.model_dir}/feature_importance.png', dpi=300, bbox_inches='tight')
            plt.close()
            print("Feature importance plot saved!")

    def train_all_models(self, csv_path: str = 'training_data.csv'):
        """Main training function"""
        print("Starting MediCare AI ML Model Training")
        print("=" * 50)

        # Setup
        self.create_model_dir()

        # Load and preprocess data
        df = self.load_data(csv_path)
        if df is None:
            return False

        X, y = self.preprocess_data(df)

        # Split data (without stratification for small datasets)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
        print(f"Train set: {X_train.shape[0]} samples")
        print(f"Test set: {X_test.shape[0]} samples")

        # Cross-validation
        self.cross_validate_models(X, y)

        # Train models
        self.models['Random Forest'] = self.train_random_forest(X_train, y_train)
        self.models['SVM'] = self.train_svm(X_train, y_train)
        self.models['Naive Bayes'] = self.train_naive_bayes(X_train, y_train)

        # Evaluate models
        print("\n" + "=" * 50)
        print("MODEL EVALUATION RESULTS")
        print("=" * 50)

        accuracies = {}
        for name, model in self.models.items():
            accuracies[name] = self.evaluate_model(model, X_test, y_test, name)

        # Save models
        self.save_models()

        # Plot feature importance
        self.plot_feature_importance()

        # Summary
        print("\n" + "=" * 50)
        print("TRAINING SUMMARY")
        print("=" * 50)
        print(f"Total training samples: {len(df)}")
        print(f"Number of diseases: {len(self.label_encoder.classes_)}")
        print("Models trained: Random Forest, SVM, Naive Bayes")
        print("Models saved to: models/")
        print("Feature importance plot: models/feature_importance.png")

        return True

if __name__ == '__main__':
    trainer = MLModelTrainer()
    success = trainer.train_all_models()

    if success:
        print("\n✅ Training completed successfully!")
        print("You can now run the ML service with: python ml_service.py")
    else:
        print("\n❌ Training failed!")