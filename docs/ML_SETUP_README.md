# MediCare AI ML Models Setup Guide

## Overview

This guide explains how to set up and run the **ML models** that work alongside your existing **LLM + RAG** system for improved medical diagnosis accuracy.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend        │    │   ML Service    │
│   (React)       │◄──►│   (Express)      │◄──►│   (Python/Flask) │
│                 │    │   - LLM (Ollama) │    │   - Random Forest│
└─────────────────┘    │   - RAG          │    │   - SVM          │
                       │   - ML Ensemble  │    │   - Naive Bayes  │
                       └─────────────────┘    └─────────────────┘
```

## Files Created

### Training Data
- `training_data.csv` - Medical symptoms and diseases dataset

### Python ML Service
- `ml_service.py` - Flask API for ML predictions
- `train_models.py` - Script to train the ML models
- `requirements.txt` - Python dependencies

### Integration
- `run_ml_service.bat` - Windows script to run everything
- Updated `backend/routes/predict.ts` - Now calls both LLM and ML services
- Updated `.env.local` - Added ML service URL

## Quick Start

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

### 2. Train the ML Models
```bash
python train_models.py
```
This will:
- Load training data from `training_data.csv`
- Train 3 ML models (Random Forest, SVM, Naive Bayes)
- Save models to `models/` directory
- Generate evaluation reports and feature importance plots

### 3. Start the ML Service
```bash
# Option 1: Use the batch file (Windows)
run_ml_service.bat

# Option 2: Manual start
python ml_service.py
```

The ML service will run on `http://localhost:8000`

### 4. Restart Your Backend
Since we modified the predict route, restart your backend:
```bash
npm run dev:backend
```

## API Endpoints

### ML Service Endpoints

- `GET /health` - Check if models are loaded
- `POST /predict` - Get disease predictions
- `POST /train` - Train new models
- `POST /load` - Load saved models

### Prediction Request Example
```json
{
  "symptoms": ["fever", "cough", "fatigue", "headache"]
}
```

### Prediction Response Example
```json
{
  "ensemble_prediction": {
    "disease": "Common Cold",
    "confidence": 87.5
  },
  "model_predictions": {
    "random_forest": {"disease": "Common Cold", "confidence": 85.2},
    "svm": {"disease": "Common Cold", "confidence": 89.1},
    "naive_bayes": {"disease": "Flu", "confidence": 78.3}
  },
  "all_diseases": ["Common Cold", "Flu", "Pneumonia", ...]
}
```

## How It Works

### 1. Symptom Input
User describes symptoms → Frontend sends to Backend

### 2. Parallel Processing
Backend calls both services simultaneously:
- **LLM Service**: Uses Ollama + RAG for contextual understanding
- **ML Service**: Uses trained models for statistical prediction

### 3. Ensemble Prediction
Backend combines results:
- Takes the prediction with highest confidence
- Provides both LLM explanation and ML statistical analysis
- Shows predictions from all 3 ML models

### 4. Enhanced Results
User gets:
- Primary diagnosis with confidence score
- Alternative predictions from different models
- Detailed explanations from LLM
- Statistical backing from ML models

## Model Performance

After training, you'll see evaluation metrics for each model:
- **Accuracy**: How often the model predicts correctly
- **Precision/Recall**: Detailed performance metrics
- **Cross-validation**: Ensures model generalizability

## Customization

### Adding More Training Data
1. Edit `training_data.csv` with more symptom-disease pairs
2. Run `python train_models.py` to retrain models
3. Restart ML service

### Modifying Models
Edit `train_models.py` to:
- Change model hyperparameters
- Add new ML algorithms
- Modify feature extraction

### Custom CSV Format
Your CSV should have these columns:
```csv
symptom_text,disease,severity,common_treatments
"fever, cough, fatigue","Common Cold","low","rest, fluids"
```

## Troubleshooting

### ML Service Won't Start
- Check if port 8000 is available
- Ensure Python dependencies are installed
- Verify models are trained (`models/` directory exists)

### Backend Can't Connect to ML Service
- Check if ML service is running on port 8000
- Verify `ML_SERVICE_URL` in `.env.local`
- Check backend logs for connection errors

### Poor Model Performance
- Add more training data
- Balance the dataset (similar number of samples per disease)
- Try different model hyperparameters

## Next Steps

1. **Test the System**: Try different symptom combinations
2. **Add More Data**: Expand `training_data.csv` with more diseases
3. **Fine-tune Models**: Adjust hyperparameters in `train_models.py`
4. **Add New Features**: Include patient age, gender, medical history
5. **Model Monitoring**: Track prediction accuracy over time

## Integration Benefits

- **LLM**: Great at language understanding and explanations
- **ML Models**: Better at pattern recognition and statistical analysis
- **RAG**: Provides factual medical knowledge
- **Ensemble**: Combines strengths of all approaches for higher accuracy

Your system now has both AI approaches working together! 🚀