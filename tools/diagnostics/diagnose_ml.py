#!/usr/bin/env python3
"""Diagnose ML confidence issues."""
import urllib.request
import json

ML_URL = 'http://localhost:8000/predict'
BACKEND_URL = 'http://localhost:5000/api/predict/diagnose'
TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW9nd2hkMmIwMDAwaThvaGgzd3MwNG05IiwiaWF0IjoxNzc3Mjc2NDAyLCJleHAiOjE3Nzc4ODEyMDJ9.8UdqRGBg7xhDi2WDQbrLI0o-Ms5NKo9-I28WBohYrj8'

tests = [
    ('Bronchitis', ['cough', 'fever', 'shortness of breath', 'chest congestion', 'fatigue']),
    ('UTI', ['painful urination', 'frequent urination', 'blood in urine', 'lower abdominal pain', 'fever']),
    ('Common Cold', ['runny nose', 'sore throat', 'sneezing', 'mild fever', 'nasal congestion']),
    ('Diabetes Type 2', ['frequent urination', 'excessive thirst', 'unexplained weight loss', 'fatigue', 'blurred vision']),
    ('Anxiety Disorder', ['excessive worry', 'restlessness', 'difficulty concentrating', 'muscle tension', 'sleep disturbance']),
    ('Appendicitis', ['abdominal pain', 'nausea', 'vomiting', 'fever', 'loss of appetite']),
    ('Heart Disease', ['chest pain', 'shortness of breath', 'fatigue', 'irregular heartbeat', 'swelling in legs']),
    ('Meningitis', ['severe headache', 'neck stiffness', 'photophobia', 'fever', 'confusion']),
]

print("=== ML SERVICE DIRECT TESTS ===")
for name, symptoms in tests:
    req = urllib.request.Request(
        ML_URL,
        data=json.dumps({'symptoms': symptoms}).encode(),
        headers={'Content-Type': 'application/json'},
        method='POST'
    )
    try:
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode())
        ens = data['ensemble_prediction']
        models = data['model_predictions']
        rf = models['random_forest']
        svm = models['svm']
        nb = models['naive_bayes']
        primary = 'ML' if ens['confidence'] >= 70 and ens['disease'] != 'Other / Rare Disease' else 'LLM'
        print(f"{name:20s}: {ens['disease']:25s} @ {ens['confidence']:5.1f}% -> {primary} | RF={rf['confidence']:5.1f}% SVM={svm['confidence']:5.1f}% NB={nb['confidence']:5.1f}%")
    except Exception as e:
        print(f"{name:20s}: ERROR - {e}")

print("\n=== BACKEND FULL PIPELINE TESTS ===")
for name, symptoms in tests:
    req = urllib.request.Request(
        BACKEND_URL,
        data=json.dumps({'symptoms': symptoms, 'answers': []}).encode(),
        headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {TOKEN}'},
        method='POST'
    )
    try:
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode())
        src = data['prediction_source']
        ml_used = data['ml_used']
        ml_conf = data['ml_confidence']
        ml_dis = data['ml_disease'] or 'N/A'
        final = data['disease']
        print(f"{name:20s}: final={final:25s} source={src:30s} ml_used={ml_used} ml={ml_dis}@{ml_conf}")
    except Exception as e:
        print(f"{name:20s}: ERROR - {e}")

print("\n=== ML KNOWN DISEASES ===")
req = urllib.request.Request('http://localhost:8000/health')
resp = urllib.request.urlopen(req)
print(resp.read().decode())

