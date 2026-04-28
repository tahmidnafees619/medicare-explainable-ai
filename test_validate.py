import json

def normalize_text(text):
    return text.lower().replace(r'[^a-z0-9\s]', '')

def validate_symptom_matches(symptoms, disease_name):
    with open('backend/data/medical-knowledge.json') as f:
        kb = json.load(f)
    normalized_target = normalize_text(disease_name)
    disease = None
    for d in kb:
        nd = normalize_text(d['disease'])
        if nd == normalized_target or nd in normalized_target or normalized_target in nd:
            disease = d
            break
    if not disease:
        return 0
    normalized_input = [normalize_text(s) for s in symptoms]
    normalized_db = [normalize_text(s) for s in disease['symptoms']]
    match_count = 0
    for inp in normalized_input:
        for db in normalized_db:
            if db in inp or inp in db:
                match_count += 1
                break
    return match_count

symptoms = ['frequent urination', 'excessive thirst', 'unexplained weight loss', 'fatigue', 'blurred vision']
print(f"Diabetes Type 2 matches: {validate_symptom_matches(symptoms, 'Diabetes Type 2')}")

