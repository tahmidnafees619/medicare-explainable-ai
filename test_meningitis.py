import urllib.request, json

BACKEND_URL = 'http://localhost:5000/api/predict/diagnose'
TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW9nd2hkMmIwMDAwaThvaGgzd3MwNG05IiwiaWF0IjoxNzc3Mjc2NDAyLCJleHAiOjE3Nzc4ODEyMDJ9.8UdqRGBg7xhDi2WDQbrLI0o-Ms5NKo9-I28WBohYrj8'

symptoms = ['severe headache', 'neck stiffness', 'photophobia', 'fever', 'confusion']
req = urllib.request.Request(
    BACKEND_URL,
    data=json.dumps({'symptoms': symptoms, 'answers': []}).encode(),
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {TOKEN}'},
    method='POST'
)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read().decode())
print(json.dumps({
    'disease': data['disease'],
    'source': data['prediction_source'],
    'ml_used': data['ml_used'],
    'ml_confidence': data['ml_confidence'],
    'ml_disease': data['ml_disease'],
    'methodology': data['methodology']
}, indent=2))

