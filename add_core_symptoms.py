import json

# Mapping of disease to its core symptoms (must-have, defining symptoms)
CORE_SYMPTOMS_MAP = {
    'Common Cold': ["runny nose", "sore throat", "cough"],
    'Influenza (Flu)': ["high fever", "body aches"],
    'Gastroenteritis (Stomach Flu)': ["nausea", "vomiting", "diarrhea"],
    'Migraine': ["severe headache", "nausea", "sensitivity to light"],
    'Tension Headache': ["headache"],
    'Hypertension (High Blood Pressure)': ["headache"],
    'Pneumonia': ["cough", "fever", "shortness of breath"],
    'Bronchitis': ["cough"],
    'Asthma': ["wheezing", "shortness of breath"],
    'Diabetes Type 2': ["increased thirst", "frequent urination"],
    'Diabetes Type 1': ["increased thirst", "frequent urination", "unintended weight loss"],
    'Heart Disease': ["chest pain", "shortness of breath"],
    'Coronary Artery Disease': ["chest pain"],
    'GERD (Acid Reflux)': ["heartburn", "regurgitation"],
    'Anxiety Disorder': ["excessive worry"],
    'Depression': ["persistent sadness", "loss of interest"],
    'Allergic Rhinitis': ["sneezing", "runny nose"],
    'Arthritis': ["joint pain", "stiffness"],
    'Urinary Tract Infection': ["frequent urination", "burning urination"],
    'Thyroid Disorder (Hypothyroidism)': ["fatigue", "weight gain"],
    'Thyroid Disorder (Hyperthyroidism)': ["weight loss", "rapid heartbeat"],
    'Anemia': ["fatigue", "weakness"],
    'Appendicitis': ["abdominal pain", "vomiting", "fever"],
    'Chickenpox': ["blisters", "itchy rash"],
    'Mononucleosis': ["extreme fatigue", "fever", "sore throat"],
}

# Red flag symptoms (critical indicators requiring attention)
RED_FLAG_SYMPTOMS_MAP = {
    'Common Cold': [],
    'Influenza (Flu)': ["high fever", "body aches"],
    'Gastroenteritis (Stomach Flu)': ["vomiting", "dehydration"],
    'Migraine': ["severe headache", "visual disturbances"],
    'Tension Headache': [],
    'Hypertension (High Blood Pressure)': ["shortness of breath", "chest pain", "vision changes"],
    'Pneumonia': ["fever", "shortness of breath", "chest pain", "confusion"],
    'Bronchitis': ["shortness of breath", "fever"],
    'Asthma': ["shortness of breath", "wheezing", "difficulty breathing"],
    'Diabetes Type 2': ["increased thirst", "frequent urination", "weight loss"],
    'Diabetes Type 1': ["increased thirst", "frequent urination", "extreme hunger", "unintended weight loss"],
    'Heart Disease': ["chest pain", "shortness of breath", "heart palpitations", "dizziness", "nausea"],
    'Coronary Artery Disease': ["chest pain", "shortness of breath", "pain in neck/jaw", "pain in arm", "nausea"],
    'GERD (Acid Reflux)': [],
    'Anxiety Disorder': [],
    'Depression': [],
    'Allergic Rhinitis': [],
    'Arthritis': [],
    'Urinary Tract Infection': ["fever", "nausea"],
    'Thyroid Disorder (Hypothyroidism)': [],
    'Thyroid Disorder (Hyperthyroidism)': ["rapid heartbeat"],
    'Anemia': ["shortness of breath", "dizziness"],
    'Appendicitis': ["abdominal pain", "vomiting", "fever", "loss of appetite"],
    'Chickenpox': ["blisters", "fever"],
    'Mononucleosis': ["extreme fatigue", "fever", "sore throat"],
}

with open('backend/data/medical-knowledge.json', 'r') as f:
    data = json.load(f)

for disease_entry in data:
    name = disease_entry['disease']
    disease_entry['red_flag_symptoms'] = RED_FLAG_SYMPTOMS_MAP.get(name, [])
    disease_entry['core_symptoms'] = CORE_SYMPTOMS_MAP.get(name, [])

with open('backend/data/medical-knowledge.json', 'w') as f:
    json.dump(data, f, indent=2)

print('Updated medical-knowledge.json with red_flag_symptoms and core_symptoms')
