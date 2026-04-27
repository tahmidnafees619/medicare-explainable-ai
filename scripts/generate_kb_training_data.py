#!/usr/bin/env python3
"""
generate_kb_training_data.py

Generates training_data_kb.csv from the medical knowledge base.
This ensures ML models learn the exact disease names and symptom vocabulary
used by the RAG knowledge base, maximizing validateSymptomMatches() success.

Output format: symptom_text,disease,severity,common_treatments
"""

import csv
import json
import os
import random
import sys

# ── paths ────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
OUTPUT_PATH = os.path.join(BASE_DIR, "training_data.csv")  # Overwrite current training data
MED_KNOWLEDGE = os.path.join(BACKEND_DIR, "data", "medical-knowledge.json")

# ── templates ────────────────────────────────────────────────────
TEMPLATES = [
    "Patient presents with {symptoms}.",
    "I've been experiencing {symptoms} for the past few days.",
    "My main complaints are {symptoms}.",
    "I have {symptoms} and it's getting worse.",
    "The patient reports {symptoms}.",
    "I've noticed {symptoms} recently.",
    "Can you help with {symptoms}?",
    "I went to the clinic because of {symptoms}.",
    "There's been some {symptoms} that started recently.",
    "I came in today due to {symptoms}.",
    "For the last week I've had {symptoms}.",
    "I woke up with {symptoms} and it hasn't gone away.",
    "My family noticed I have {symptoms}.",
    "I'm mainly worried about {symptoms}.",
    "The doctor previously mentioned something about {symptoms}.",
    "I was referred here because of {symptoms}.",
]


def load_medical_knowledge():
    """Load the medical knowledge base JSON."""
    with open(MED_KNOWLEDGE, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


def generate_disease_rows(disease_entry, samples_per_disease=50):
    """
    Generate training rows for a single disease from the KB.
    
    symptom_text: uses natural language templates with KB symptoms
    disease: exact KB disease name
    severity: from KB
    common_treatments: from KB
    """
    disease = disease_entry["disease"]
    symptoms = disease_entry["symptoms"]
    severity = disease_entry["severity"]
    treatments = ", ".join(disease_entry["treatments"])
    
    rows = []
    
    for _ in range(samples_per_disease):
        # Randomly select 2-6 symptoms (min 2 to avoid too-short inputs,
        # max 6 to mimic real patient descriptions)
        num_symptoms = random.randint(2, min(6, len(symptoms)))
        selected = random.sample(symptoms, num_symptoms)
        
        # Randomize order for variety
        random.shuffle(selected)
        
        # Format with "and" for the last symptom if >1 symptom
        if len(selected) == 2:
            symptoms_text = " and ".join(selected)
        elif len(selected) > 2:
            symptoms_text = ", ".join(selected[:-1]) + " and " + selected[-1]
        else:
            symptoms_text = selected[0]
        
        symptom_text = random.choice(TEMPLATES).format(symptoms=symptoms_text)
        rows.append((symptom_text, disease, severity, treatments))
    
    return rows


def generate_heart_training_rows(num_positive=15):
    """Generate heart disease training rows matching KB vocabulary."""
    from_large_dataset = [
        "chest pain", "shortness of breath", "sweating", "nausea",
        "irregular heartbeat", "dizziness", "fatigue", "high blood pressure",
        "high cholesterol", "rapid heartbeat", "anxiety", "arm pain", "jaw pain"
    ]
    rows = []
    for _ in range(num_positive):
        selected = random.sample(from_large_dataset, k=random.randint(4, 8))
        random.shuffle(selected)
        symptoms_text = ", ".join(selected[:-1]) + " and " + selected[-1] if len(selected) > 1 else selected[0]
        symptom_text = random.choice(TEMPLATES).format(symptoms=symptoms_text)
        rows.append((
            symptom_text,
            "Heart Disease",
            "high",
            "Immediate medical attention; aspirin; nitroglycerin; lifestyle changes; cardiac rehabilitation"
        ))
    return rows


def generate_diabetes_training_rows(num_positive=15):
    """Generate diabetes training rows matching KB vocabulary."""
    from_large_dataset = [
        "frequent urination", "excessive thirst", "unexplained weight loss",
        "extreme hunger", "blurred vision", "fatigue", "slow-healing sores",
        "frequent infections", "numbness in hands or feet", "dry skin",
        "high glucose", "increased appetite"
    ]
    rows = []
    for _ in range(num_positive):
        selected = random.sample(from_large_dataset, k=random.randint(4, 8))
        random.shuffle(selected)
        symptoms_text = ", ".join(selected[:-1]) + " and " + selected[-1] if len(selected) > 1 else selected[0]
        symptom_text = random.choice(TEMPLATES).format(symptoms=symptoms_text)
        rows.append((
            symptom_text,
            "Diabetes Type 2",
            "high",
            "Diet changes; exercise; medication; blood sugar monitoring"
        ))
    return rows


def generate_rare_disease_rows(num_samples=50):
    """
    Generate 'Other / Rare Disease' catch-all rows.
    Uses symptoms not strongly associated with any single KB disease.
    """
    generic_symptoms = [
        ["fever", "fatigue", "general discomfort", "loss of appetite"],
        ["headache", "nausea", "dizziness", "weakness"],
        ["body aches", "chills", "sweating", "malaise"],
        ["unusual symptoms", "atypical presentation", "consult specialist"],
        ["mild fever", "occasional pain", "unclear diagnosis", "further testing needed"],
        ["fatigue", "weight loss", "night sweats", "persistent cough"],
        ["rash", "joint pain", "swollen lymph nodes", "sore throat"],
        ["abdominal pain", "bloating", "constipation", "diarrhea"],
        ["numbness", "tingling", "muscle weakness", "coordination problems"],
        ["confusion", "memory problems", "personality changes", "difficulty speaking"],
    ]
    
    rows = []
    for sym_set in random.choices(generic_symptoms, k=num_samples):
        random.shuffle(sym_set)
        symptoms_text = ", ".join(sym_set[:-1]) + " and " + sym_set[-1] if len(sym_set) > 1 else sym_set[0]
        symptom_text = random.choice(TEMPLATES).format(symptoms=symptoms_text)
        rows.append((
            symptom_text,
            "Other / Rare Disease",
            "unknown",
            "Consult a physician; specialist referral; comprehensive testing; differential diagnosis"
        ))
    return rows


def main():
    print("=" * 60)
    print("  MediCare AI - KB-Aligned Training Data Generator")
    print("=" * 60)

    # 1. Load KB
    print("[INFO] Loading medical knowledge base...")
    kb_diseases = load_medical_knowledge()
    print(f"[INFO] Loaded {len(kb_diseases)} diseases from KB")

    # 2. Generate rows from KB diseases
    all_rows = []
    
    for entry in kb_diseases:
        rows = generate_disease_rows(entry, samples_per_disease=50)
        all_rows.extend(rows)
        print(f"  {entry['disease']}: {len(rows)} rows")

    # 3. Add heart & diabetes (with KB-matching names)
    heart_rows = generate_heart_training_rows(15)
    all_rows.extend(heart_rows)
    print(f"  Heart Disease: {len(heart_rows)} rows")

    diabetes_rows = generate_diabetes_training_rows(15)
    # Rename "Diabetes" to match KB "Diabetes Type 2" — already done in function
    all_rows.extend(diabetes_rows)
    print(f"  Diabetes Type 2: {len(diabetes_rows)} rows")

    # 4. Add Other / Rare Disease catch-all
    rare_rows = generate_rare_disease_rows(50)
    all_rows.extend(rare_rows)
    print(f"  Other / Rare Disease: {len(rare_rows)} rows")

    # 5. Shuffle
    random.shuffle(all_rows)

    # 6. Write
    with open(OUTPUT_PATH, "w", encoding="utf-8", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["symptom_text", "disease", "severity", "common_treatments"])
        writer.writerows(all_rows)

    print("-" * 60)
    print(f"[SUCCESS] Wrote {len(all_rows)} rows to {OUTPUT_PATH}")
    
    # Print distribution
    from collections import Counter
    disease_counts = Counter(row[1] for row in all_rows)
    print("[INFO] Disease distribution:")
    for disease, count in disease_counts.most_common():
        print(f"  {disease}: {count}")
    print("=" * 60)

    return 0


if __name__ == "__main__":
    sys.exit(main())
