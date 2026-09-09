import json
with open('backend/data/medical-knowledge.json') as f:
    kb = json.load(f)
for d in kb:
    if 'diabetes' in d['disease'].lower():
        print(f"Disease: {d['disease']}")
        print(f"Symptoms: {d['symptoms']}")
        print()

