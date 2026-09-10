import medicalKnowledge from '../data/medical-knowledge.json';
import * as datasetService from './dataset.service.js';

interface Disease {
  disease: string;
  symptoms: string[];
  description: string;
  treatments: string[];
  severity: string;
  core_symptoms?: string[];
  red_flag_symptoms?: string[];
}

interface SearchResult {
  disease: string;
  relevance: number;
  matchedSymptoms: string[];
  description: string;
  treatments: string[];
  severity: string;
  datasetPrevalence?: number; // % from CSV dataset
  datasetRecords?: number;
}

function normalizeText(text: string): string {
  // Apply synonyms first
  const lower = text.toLowerCase();
  for (const [synonym, canonicals] of Object.entries(SYMPTOM_SYNONYMS)) {
    if (lower.includes(synonym)) {
      return canonicals[0]; // Use first canonical form
    }
  }
  return lower.replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ');
}

export function jaroWinklerSimilarity(s1: string, s2: string): number {
  // Jaro-Winkler distance implementation (0-1 score)
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 && len2 === 0) return 1;
  if (len1 === 0 || len2 === 0) return 0;

  const maxDist = Math.floor(Math.max(len1, len2) / 2) - 1;
  let matchCount = 0;
  const matches1 = new Array(len1).fill(false);
  const matches2 = new Array(len2).fill(false);

  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - maxDist);
    const end = Math.min(len2, i + maxDist + 1);
    for (let j = start; j < end; j++) {
      if (!matches2[j] && s1[i] === s2[j]) {
        matches1[i] = true;
        matches2[j] = true;
        matchCount++;
        break;
      }
    }
  }

  if (matchCount === 0) return 0;

  // Transpositions: walk both match lists in step. `k` indexes matches2 and is
  // bounded by matchCount, so it can never run past the end of the array.
  let transCount = 0;
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!matches1[i]) continue;
    while (!matches2[k]) k++;
    if (s1[i] !== s2[k]) transCount++;
    k++;
  }
  transCount /= 2;

  const jaro = ((matchCount / len1) + (matchCount / len2) + ((matchCount - transCount) / matchCount)) / 3.0;

  // Winkler prefix boost
  const prefix = Math.min(4, Math.min(len1, len2));
  let prefixMatches = 0;
  for (let i = 0; i < prefix; i++) {
    if (s1[i] === s2[i]) prefixMatches++;
    else break;
  }
  const scaling = 0.1;
  return jaro + scaling * prefixMatches * (1 - jaro);
}

/**
 * Maps ML model disease names to medical knowledge base disease names.
 * This bridges the gap between the ML training data and the KB.
 */
const DISEASE_ALIASES: Record<string, string[]> = {
  'acute bronchitis': ['Bronchitis'],
  'cystitis': ['Urinary Tract Infection', 'Bladder Disorder'],
  'conjunctivitis due to allergy': ['Allergic Rhinitis', 'Seasonal Allergies (Hay Fever)'],
  'esophagitis': ['GERD (Acid Reflux)'],
  'gastrointestinal hemorrhage': ['Gastroenteritis (Stomach Flu)'],
  'infectious gastroenteritis': ['Gastroenteritis (Stomach Flu)', 'Infectious Gastroenteritis'],
  'pneumonia': ['Pneumonia'],
  'hypoglycemia': ['Diabetes Type 1', 'Diabetes Type 2'],
  'gout': ['Arthritis', 'Gout'],
  'arthritis of the hip': ['Arthritis'],
  'bursitis': ['Arthritis', 'Bursitis'],
  'spondylosis': ['Arthritis', 'Spondylosis'],
  'diverticulitis': ['Diverticulosis'],
  // Removed 'liver disease': ['Heart Disease'] - incorrect mapping
  'nose disorder': ['Common Cold', 'Nose Disorder'],
  'fungal infection of the hair': ['Fungal Infection Of The Skin'],
  'marijuana abuse': ['Anxiety Disorder', 'Depression', 'Drug Abuse (Marijuana)'],
  'peripheral nerve disorder': ['Peripheral Nerve Disorder'],
  'complex regional pain syndrome': ['Complex Regional Pain Syndrome'],
  'spontaneous abortion': ['Pain during pregnancy', 'Problem During Pregnancy'],
  'vaginal cyst': ['Vaginal Cyst'],
  'vulvodynia': ['Vulvodynia'],
  'sprain or strain': ['Injury to the arm'],
  'injury to the arm': ['Injury to the arm'],
  'strep throat': ['Pharyngitis', 'Strep Throat'],
};

const SYMPTOM_SYNONYMS: Record<string, string[]> = {
  'head hurts': ['headache'],
  'headache or migraine': ['headache'],
  'stomach ache': ['abdominal pain', 'sharp abdominal pain'],
  'tummy pain': ['abdominal pain'],
  'chest hurts': ['chest pain', 'sharp chest pain'],
  'short of breath': ['shortness of breath'],
  'hard to breathe': ['difficulty breathing', 'shortness of breath'],
  'nauseous': ['nausea'],
  'throwing up': ['vomiting'],
  'hurts to pee': ['painful urination'],
  'frequent peeing': ['frequent urination'],
  'nervous': ['anxiety and nervousness'],
  'sad': ['depression'],
  'insomniac': ['insomnia'],
  'heart racing': ['palpitations', 'increased heart rate'],
  'dizzy': ['dizziness'],
  'stiff neck': ['neck stiffness or tightness'],
  'feverish': ['fever'],
  'rashes': ['skin rash'],
  'itching': ['itching of skin'],
  'joint hurts': ['joint pain'],
  'back hurts': ['back pain'],
  'leg pain or cramps': ['leg pain', 'leg cramps or spasms'],
  'arm hurts': ['arm pain'],
  'tired all time': ['fatigue'],
  'losing weight': ['recent weight loss'],
  'thirsty a lot': ['thirst'],
  'pee a lot': ['frequent urination', 'excessive urination at night'],
  'blurry vision': ['diminished vision', 'spots or clouds in vision'],
  'coughing': ['cough'],
  'runny nose': ['nasal congestion', 'coryza'],
  'sore throat pain': ['sore throat'],
  'ear hurts': ['ear pain'],
  'skin bumps': ['skin lesion', 'skin growth'],
  'belly bloated': ['stomach bloating', 'abdominal distention'],
  'diarrhea loose stool': ['diarrhea'],
  'constipated': ['constipation'],
  'burning pee': ['painful urination'],
  'blood in stool': ['blood in stool', 'melena', 'rectal bleeding'],
  'vomit blood': ['vomiting blood'],
  'yellow skin': ['jaundice'],
  'swollen legs': ['leg swelling', 'peripheral edema'],
  'numb tingling': ['loss of sensation', 'paresthesia'],
  'weak muscles': ['weakness'],
  'confused': ['disturbance of memory', 'depressive or psychotic symptoms'],
  'seeing spots': ['spots or clouds in vision'],
  'ringing ears': ['ringing in ear'],
  'trouble swallowing': ['difficulty in swallowing'],
  'lump throat': ['lump in throat'],
  'hoarse voice change': ['hoarse voice'],
  'night sweats': ['sweating'],
  'unexplained bruises': ['abnormal appearing skin'],
  'easy bleeding': ['nosebleed', 'bleeding gums'],
  'dark urine': ['blood in urine'],
  'pale skin': ['abnormal appearing skin'],
  'big lymph nodes': ['swollen lymph nodes'],
};

/**
 * Look up a disease in the knowledge base, trying exact match first,
 * then aliases if no exact match is found.
 */
function diseaseTokens(name: string): string[] {
  return normalizeText(name).split(/\s+/).filter(Boolean);
}

/** True when every word of `needle` appears as a whole word in `haystack`. */
function isWordSubset(needle: string[], haystack: string[]): boolean {
  return needle.length > 0 && needle.every(token => haystack.includes(token));
}

function findDiseaseInKB(diseaseName: string): Disease | undefined {
  const diseases = medicalKnowledge as Disease[];
  const normalizedTarget = normalizeText(diseaseName);
  const targetTokens = diseaseTokens(diseaseName);

  // 1. An exact name match always wins, and is checked against every entry
  //    before any looser rule gets a chance.
  const exactMatch = diseases.find(d => normalizeText(d.disease) === normalizedTarget);
  if (exactMatch) return exactMatch;

  // 2. Declared aliases. Keys are lowercase, so normalise before looking up -
  //    the ML service emits Title Case names like "Acute Bronchitis".
  const aliases = DISEASE_ALIASES[normalizedTarget] ?? DISEASE_ALIASES[diseaseName];
  if (aliases) {
    for (const alias of aliases) {
      const normalizedAlias = normalizeText(alias);
      const aliasMatch = diseases.find(d => normalizeText(d.disease) === normalizedAlias);
      if (aliasMatch) return aliasMatch;
    }
  }

  // 3. Whole-word containment in either direction.
  //    Plain substring matching is deliberately NOT used: "flu" is a substring
  //    of "reflux", which silently resolved influenza to
  //    "Gastroesophageal Reflux Disease (Gerd)".
  return diseases.find(d => {
    const candidateTokens = diseaseTokens(d.disease);
    return isWordSubset(targetTokens, candidateTokens) || isWordSubset(candidateTokens, targetTokens);
  });
}

function calculateSimilarity(symptoms: string[], diseaseSymptoms: string[]): number {
  const normalizedInput = symptoms.map(normalizeText);
  const normalizedDb = diseaseSymptoms.map(normalizeText);
  
  let matchCount = 0;
  
  for (const inputSymptom of normalizedInput) {
    for (const dbSymptom of normalizedDb) {
      // Fuzzy match: Jaro-Winkler > 0.7 (~70% similar)
      if (jaroWinklerSimilarity(inputSymptom, dbSymptom) > 0.7) {
        matchCount++;
        break;
      }
    }
  }
  
  if (normalizedDb.length === 0) return 0;
  return (matchCount / normalizedDb.length) * 100;
}

export function searchDiseases(symptoms: string[]): SearchResult[] {
  const diseases = medicalKnowledge as Disease[];
  
  const results: SearchResult[] = diseases.map(disease => {
    const relevance = calculateSimilarity(symptoms, disease.symptoms);
    const normalizedInput = symptoms.map(normalizeText);
    const matched = disease.symptoms.filter(ds => 
      normalizedInput.some(is => is.includes(normalizeText(ds)) || normalizeText(ds).includes(is))
    );

    // Get dataset profile for this disease using the service lookup
    const dsProfile = datasetService.getDiseaseProfile(disease.disease);
    
    return {
      disease: disease.disease,
      relevance,
      matchedSymptoms: matched,
      description: disease.description,
      treatments: disease.treatments,
      severity: disease.severity,
      datasetRecords: dsProfile?.totalRecords,
    };
  });
  
  return results
    .filter(r => r.relevance >= 0)
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 10);
}

export function getDiseaseInfo(diseaseName: string): SearchResult | null {
  const diseases = medicalKnowledge as Disease[];
  const normalized = normalizeText(diseaseName);
  
  const disease = diseases.find(d => normalizeText(d.disease).includes(normalized));
  
  if (!disease) return null;
  
  return {
    disease: disease.disease,
    relevance: 100,
    matchedSymptoms: disease.symptoms,
    description: disease.description,
    treatments: disease.treatments,
    severity: disease.severity,
  };
}

export function getAllDiseases(): string[] {
  const diseases = medicalKnowledge as Disease[];
  return diseases.map(d => d.disease);
}



export interface SymptomValidationResult {
  disease: string;
  matchedSymptoms: string[];
  missingSymptoms: string[];
  rag_score: number;
  red_flags_present: string[];
  red_flags_missing: string[];
  /** Defining ("core") symptoms of this disease that the patient did NOT report. */
  missingCoreSymptoms: string[];
  /** Defining symptoms the patient DID report. */
  matchedCoreSymptoms: string[];
}

/**
 * Stage 3: RAG Symptom Validation with weighted symptom matching
 * Core symptoms (must-have) weight = 1.5, Supporting symptoms weight = 1.0
 * Red flag penalties/rewards applied
 */
export function validateSymptomMatches(
  symptoms: string[],
  diseaseName: string
): SymptomValidationResult {
  const disease = findDiseaseInKB(diseaseName);
  if (!disease) {
    return {
      disease: diseaseName,
      matchedSymptoms: [],
      missingSymptoms: [],
      rag_score: 0,
      red_flags_present: [],
      red_flags_missing: [],
      missingCoreSymptoms: [],
      matchedCoreSymptoms: [],
    };
  }

  const normalizedInput = symptoms.map(normalizeText);
  const normalizedDiseaseSymptoms = disease.symptoms.map(normalizeText);

  const coreSymptoms = (disease.core_symptoms || []).map(normalizeText);
  const redFlagSymptoms = (disease.red_flag_symptoms || []).map(normalizeText);

  const matchedSymptoms: string[] = [];
  const missingSymptoms: string[] = [];
  let weightedMatch = 0;
  let weightedTotal = 0;

  for (let i = 0; i < disease.symptoms.length; i += 1) {
    const dbSymptom = disease.symptoms[i];
    const normalizedDbSymptom = normalizedDiseaseSymptoms[i];

    // Determine weight: core = 1.5, supporting = 1.0
    const isCore = coreSymptoms.some(cs => cs === normalizedDbSymptom);
    const weight = isCore ? 1.5 : 1.0;
    weightedTotal += weight;

    const matched = normalizedInput.some(inputSymptom =>
      jaroWinklerSimilarity(inputSymptom, normalizedDbSymptom) > 0.7
    );

    if (matched) {
      matchedSymptoms.push(dbSymptom);
      weightedMatch += weight;
    } else {
      missingSymptoms.push(dbSymptom);
    }
  }

  let ragScore = weightedTotal === 0 ? 0 : (weightedMatch / weightedTotal) * 100;

  // Red flag checks
  const redFlagsPresent: string[] = [];
  const redFlagsMissing: string[] = [];

  for (const redFlag of redFlagSymptoms) {
    const isPresent = normalizedInput.some(is => is.includes(redFlag) || redFlag.includes(is));
    if (isPresent) {
      redFlagsPresent.push(redFlag);
    } else {
      redFlagsMissing.push(redFlag);
    }
  }

  // Apply penalty: if any red flag symptom is missing, reduce score
  if (redFlagsMissing.length > 0) {
    ragScore *= 0.85;
  }

  // Apply reward: if all red flags are present, boost score (capped at 100)
  if (redFlagsPresent.length > 0 && redFlagsMissing.length === 0) {
    ragScore = Math.min(100, ragScore * 1.15);
  }

  // Which of this disease's DEFINING symptoms did the patient actually report?
  // Checked against the raw core list rather than the matched/missing split, so
  // a core symptom that is not also listed in `symptoms` is still evaluated.
  const matchedCoreSymptoms: string[] = [];
  const missingCoreSymptoms: string[] = [];

  for (const core of disease.core_symptoms || []) {
    const normalizedCore = normalizeText(core);
    const present = normalizedInput.some(inputSymptom =>
      jaroWinklerSimilarity(inputSymptom, normalizedCore) > 0.7
    );
    if (present) {
      matchedCoreSymptoms.push(core);
    } else {
      missingCoreSymptoms.push(core);
    }
  }

  return {
    disease: disease.disease,
    matchedSymptoms,
    missingSymptoms,
    rag_score: Math.round(ragScore * 10) / 10,
    red_flags_present: redFlagsPresent,
    red_flags_missing: redFlagsMissing,
    missingCoreSymptoms,
    matchedCoreSymptoms,
  };
}

/**
 * Get RAG validation scores for top 3 predicted diseases
 */
export function validateTopDiseases(
  symptoms: string[],
  topDiseases: string[]
): Array<{
  disease: string;
  rag_score: number;
  matched: string[];
  missing: string[];
  red_flags_present: string[];
  red_flags_missing: string[];
  missing_core: string[];
  matched_core: string[];
}> {
  // Several ML disease names can resolve to the same knowledge-base entry via
  // DISEASE_ALIASES (e.g. "diabetes" and "diabetes type 2"), so de-duplicate on
  // the resolved name and keep the best-scoring validation for each.
  const byResolvedName = new Map<string, {
    disease: string;
    rag_score: number;
    matched: string[];
    missing: string[];
    red_flags_present: string[];
    red_flags_missing: string[];
    missing_core: string[];
    matched_core: string[];
  }>();

  for (const diseaseName of topDiseases) {
    if (byResolvedName.size >= 3) break;

    const validation = validateSymptomMatches(symptoms, diseaseName);
    const existing = byResolvedName.get(validation.disease);
    if (existing && existing.rag_score >= validation.rag_score) continue;

    byResolvedName.set(validation.disease, {
      disease: validation.disease,
      rag_score: validation.rag_score,
      matched: validation.matchedSymptoms,
      missing: validation.missingSymptoms,
      red_flags_present: validation.red_flags_present,
      red_flags_missing: validation.red_flags_missing,
      missing_core: validation.missingCoreSymptoms,
      matched_core: validation.matchedCoreSymptoms,
    });
  }

  return Array.from(byResolvedName.values()).sort((a, b) => b.rag_score - a.rag_score);
}

export function augmentPrompt(symptoms: string[], userQuery?: string): string {
  const topResults = searchDiseases(symptoms);
  
  let context = "Relevant medical information:\n\n";
  
  for (const result of topResults.slice(0, 5)) {
    context += `Disease: ${result.disease}\n`;
    context += `Description: ${result.description}\n`;
    context += `Symptoms: ${result.matchedSymptoms.join(', ')}\n`;
    context += `Treatments: ${result.treatments.join(', ')}\n`;
    context += `Severity: ${result.severity}\n`;
    if (result.datasetRecords) {
      context += `Dataset Records: ${result.datasetRecords} cases\n`;
    }
    context += "\n";
  }
  
  // Add structured dataset analysis context from CSV files
  const datasetContext = datasetService.buildDatasetRAGContext(symptoms);
  if (datasetContext) {
    context += "=== Dataset Analysis (RAG) ===\n";
    context += datasetContext;
    context += "\n";
  }
  
  if (userQuery) {
    context += `\nUser question: ${userQuery}\n`;
  }
  
  return context;
}
