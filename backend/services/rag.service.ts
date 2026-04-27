import medicalKnowledge from '../data/medical-knowledge.json';
import * as datasetService from './dataset.service.js';

interface Disease {
  disease: string;
  symptoms: string[];
  description: string;
  treatments: string[];
  severity: string;
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
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, '');
}

/**
 * Maps ML model disease names to medical knowledge base disease names.
 * This bridges the gap between the ML training data and the KB.
 */
const DISEASE_ALIASES: Record<string, string[]> = {
  'acute bronchitis': ['Bronchitis'],
  'cystitis': ['Urinary Tract Infection'],
  'conjunctivitis due to allergy': ['Allergic Rhinitis'],
  'esophagitis': ['GERD (Acid Reflux)'],
  'gastrointestinal hemorrhage': ['Gastroenteritis (Stomach Flu)'],
  'infectious gastroenteritis': ['Gastroenteritis (Stomach Flu)'],
  'pneumonia': ['Pneumonia'],
  'hypoglycemia': ['Diabetes Type 1', 'Diabetes Type 2'],
  'gout': ['Arthritis'],
  'arthritis of the hip': ['Arthritis'],
  'bursitis': ['Arthritis'],
  'spondylosis': ['Arthritis'],
  'diverticulitis': ['Appendicitis'],
  'liver disease': ['Heart Disease'],
  'nose disorder': ['Common Cold', 'Allergic Rhinitis'],
  'fungal infection of the hair': ['Abnormal appearing skin'],
  'marijuana abuse': ['Anxiety Disorder', 'Depression'],
  'peripheral nerve disorder': ['Anxiety Disorder'],
  'complex regional pain syndrome': ['Anxiety Disorder', 'Depression'],
  'spontaneous abortion': ['Pain during pregnancy'],
  'vaginal cyst': ['Urinary Tract Infection'],
  'vulvodynia': ['Urinary Tract Infection'],
  'sprain or strain': ['Injury to the arm'],
  'injury to the arm': ['Injury to the arm'],
  'strep throat': ['Common Cold', 'Influenza (Flu)'],
};

/**
 * Look up a disease in the knowledge base, trying exact match first,
 * then aliases if no exact match is found.
 */
function findDiseaseInKB(diseaseName: string): Disease | undefined {
  const diseases = medicalKnowledge as Disease[];
  const normalizedTarget = normalizeText(diseaseName);

  // Try exact or substring match first
  const exactMatch = diseases.find(
    d => normalizeText(d.disease) === normalizedTarget ||
         normalizeText(d.disease).includes(normalizedTarget) ||
         normalizedTarget.includes(normalizeText(d.disease))
  );
  if (exactMatch) return exactMatch;

  // Try aliases
  const aliases = DISEASE_ALIASES[diseaseName];
  if (aliases) {
    for (const alias of aliases) {
      const normalizedAlias = normalizeText(alias);
      const aliasMatch = diseases.find(
        d => normalizeText(d.disease) === normalizedAlias ||
             normalizeText(d.disease).includes(normalizedAlias) ||
             normalizedAlias.includes(normalizeText(d.disease))
      );
      if (aliasMatch) return aliasMatch;
    }
  }

  return undefined;
}

function calculateSimilarity(symptoms: string[], diseaseSymptoms: string[]): number {
  const normalizedInput = symptoms.map(normalizeText);
  const normalizedDb = diseaseSymptoms.map(normalizeText);
  
  let matchCount = 0;
  const matched: string[] = [];
  
  for (const inputSymptom of normalizedInput) {
    for (const dbSymptom of normalizedDb) {
      if (dbSymptom.includes(inputSymptom) || inputSymptom.includes(dbSymptom)) {
        matchCount++;
        matched.push(dbSymptom);
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
    .filter(r => r.relevance > 0)
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

export function validateSymptomMatches(symptoms: string[], diseaseName: string): number {
  const disease = findDiseaseInKB(diseaseName);
  if (!disease) return 0;

  const normalizedInput = symptoms.map(normalizeText);
  const normalizedDb = disease.symptoms.map(normalizeText);

  let matchCount = 0;
  for (const inputSymptom of normalizedInput) {
    for (const dbSymptom of normalizedDb) {
      if (dbSymptom.includes(inputSymptom) || inputSymptom.includes(dbSymptom)) {
        matchCount++;
        break;
      }
    }
  }

  return matchCount;
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
