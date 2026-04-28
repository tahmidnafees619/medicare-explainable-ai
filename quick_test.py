#!/usr/bin/env python3
"""Quick test of backend agreement-based confidence."""
import urllib.request
import json

BACKEND_URL = 'http://localhost:5000/api/predict/diagnose'
TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW9nd2hkMmIwMDAwaThvaGgzd3MwNG05IiwiaWF0IjoxNzc3Mjc2NDAyLCJleHAiOjE3Nzc4ODEyMDJ9.8UdqRGBg7xhDi2WDQbrLI0o-Ms5NKo9-I28WBohYrj8'

tests = [
    ('Bronchitis', ['cough', 'fever', 'shortness of breath', 'chest congestion', 'fatigue']),
    ('Heart Disease', ['chest pain', 'shortness of breath', 'fatigue', 'irregular heartbeat', 'swelling in legs']),
    ('Appendicitis', ['abdominal pain', 'nausea', 'vomiting', 'fever', 'loss of appetite']),
]

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
        print(f"{name:15s}: final={final:25s} source={src:30s} ml_used={ml_used} ml={ml_dis}@{ml_conf}")
    except Exception as e:
        print(f"{name:15s}: ERROR - {e}")

