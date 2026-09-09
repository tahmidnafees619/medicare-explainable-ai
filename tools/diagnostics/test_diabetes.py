import urllib.request, json

BACKEND_URL = 'http://localhost:5000/api/predict/diagnose'
TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbW9nd2hkMmIwMDAwaThvaGgzd3MwNG05IiwiaWF0IjoxNzc3Mjc2NDAyLCJleHAiOjE3Nzc4ODEyMDJ9.8UdqRGBg7xhDi2WDQbrLI0o-Ms5NKo9-I28WBohYrj8'

symptoms = ['frequent urination', 'excessive thirst', 'unexplained weight loss', 'fatigue', 'blurred vision']
req = urllib.request.Request(
    BACKEND_URL,
    data=json.dumps({'symptoms': symptoms, 'answers': []}).encode(),
    headers={'Content-Type': 'application/json', 'Authorization': f'Bearer {TOKEN}'},
    method='POST'
)
resp = urllib.request.urlopen(req)
data = json.loads(resp.read().decode())
print(json.dumps(data, indent=2))

