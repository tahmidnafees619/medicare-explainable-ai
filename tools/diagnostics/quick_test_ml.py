#!/usr/bin/env python3
"""Quick test for ML service"""
import urllib.request
import json

# Test predict endpoint
symptoms = ["fever", "cough", "fatigue"]
req = urllib.request.Request(
    'http://localhost:8000/predict',
    data=json.dumps({'symptoms': symptoms}).encode('utf-8'),
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print("Predict Result:")
        print(json.dumps(data, indent=2))
except Exception as e:
    print(f"Error: {e}")

# Test health endpoint
print("\n\nHealth Check:")
req = urllib.request.Request('http://localhost:8000/health')
with urllib.request.urlopen(req) as resp:
    print(resp.read().decode('utf-8'))
