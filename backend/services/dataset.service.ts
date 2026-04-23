import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASETS_DIR = path.resolve(__dirname, '../../datasets');

/* ─────────────────────── Types ─────────────────────── */

export interface SymptomProfile {
  symptom: string;
  prevalence: number; // 0–100%
  presentCount: number;
  totalCount: number;
}

export interface DiseaseProfile {
  disease: string;
  totalRecords: number;
  symptoms: SymptomProfile[];
  topSymptoms: string[];
}

export interface ColumnStats {
  column: string;
  mean: number | null;
  median: number | null;
  min: number | null;
  max: number | null;
  q1: number | null;
  q3: number | null;
  stdDev: number | null;
  missingCount: number;
  zeroCount: number;
}

export interface DatasetProfile {
  recordCount: number;
  columns: string[];
  numericStats: ColumnStats[];
  classDistribution: Record<string, number>;
}

export interface HeartProfile extends DatasetProfile {
  riskFactors: Record<string, { mean: number; highRiskThreshold: number }>;
}

export interface DiabetesProfile extends DatasetProfile {
  riskFactors: Record<string, { mean: number; highRiskThreshold: number }>;
}

/* ─────────────────────── Helpers ─────────────────────── */

function parseCSV(filePath: string): { headers: string[]; rows: string[][] } {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };

  const headers = lines[0].split(',').map(h => h.trim().replace(/^\uFEFF/, ''));
  const rows = lines.slice(1).map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }).filter(r => r.length === headers.length && r.some(c => c !== ''));

  return { headers, rows };
}

function toNumber(val: string): number | null {
  const v = parseFloat(val);
  return isNaN(v) ? null : v;
}

function numericStats(values: (number | null)[]): ColumnStats {
  const valid = values.filter((v): v is number => v !== null);
  const sorted = [...valid].sort((a, b) => a - b);
  const n = valid.length;
  const mean = n ? valid.reduce((a, b) => a + b, 0) / n : null;
  const median = n ? sorted[Math.floor(n / 2)] : null;
  const min = n ? sorted[0] : null;
  const max = n ? sorted[n - 1] : null;
  const q1 = n ? sorted[Math.floor(n * 0.25)] : null;
  const q3 = n ? sorted[Math.floor(n * 0.75)] : null;
  const variance = n ? valid.reduce((sum, v) => sum + (v - mean!) ** 2, 0) / n : null;
  const stdDev = variance !== null ? Math.sqrt(variance) : null;
  const missingCount = values.length - n;
  const zeroCount = valid.filter(v => v === 0).length;

  return { column: '', mean, median, min, max, q1, q3, stdDev, missingCount, zeroCount };
}

/* ─────────────────────── Diseases & Symptoms ─────────────────────── */

let diseaseCache: DiseaseProfile[] | null = null;

export function loadDiseaseProfiles(): DiseaseProfile[] {
  if (diseaseCache) return diseaseCache;

  const filePath = path.join(DATASETS_DIR, 'Final_Augmented_dataset_Diseases_and_Symptoms.csv');
  if (!fs.existsSync(filePath)) {
    console.warn('[dataset.service] Disease dataset not found:', filePath);
    return [];
  }

  const { headers, rows } = parseCSV(filePath);
  if (rows.length === 0) return [];

  // First column = disease name, rest = symptoms (0/1)
  const diseaseCol = headers[0];
  const symptomCols = headers.slice(1);

  const map = new Map<string, { counts: number[]; total: number }>();

  for (const row of rows) {
    const disease = row[0]?.trim().toLowerCase();
    if (!disease) continue;
    if (!map.has(disease)) {
      map.set(disease, { counts: new Array(symptomCols.length).fill(0), total: 0 });
    }
    const entry = map.get(disease)!;
    entry.total++;
    for (let i = 1; i < row.length; i++) {
      const val = parseInt(row[i], 10);
      if (!isNaN(val) && val > 0) {
        entry.counts[i - 1]++;
      }
    }
  }

  const profiles: DiseaseProfile[] = [];
  for (const [disease, data] of map) {
    const symptoms: SymptomProfile[] = [];
    for (let i = 0; i < symptomCols.length; i++) {
      const prevalence = data.total > 0 ? (data.counts[i] / data.total) * 100 : 0;
      if (prevalence > 0) {
        symptoms.push({
          symptom: symptomCols[i],
          prevalence: Math.round(prevalence * 100) / 100,
          presentCount: data.counts[i],
          totalCount: data.total,
        });
      }
    }
    symptoms.sort((a, b) => b.prevalence - a.prevalence);
    profiles.push({
      disease,
      totalRecords: data.total,
      symptoms,
      topSymptoms: symptoms.slice(0, 10).map(s => s.symptom),
    });
  }

  profiles.sort((a, b) => b.totalRecords - a.totalRecords);
  diseaseCache = profiles;
  console.log(`[dataset.service] Loaded ${profiles.length} disease profiles from ${rows.length} records.`);
  return profiles;
}

export function findDiseaseBySymptoms(querySymptoms: string[]): DiseaseProfile[] {
  const profiles = loadDiseaseProfiles();
  const normalizedQueries = querySymptoms.map(s => s.toLowerCase().trim());

  const scored = profiles.map(p => {
    let score = 0;
    const matched: string[] = [];
    for (const qs of normalizedQueries) {
      for (const sp of p.symptoms) {
        const sNorm = sp.symptom.toLowerCase();
        if (sNorm.includes(qs) || qs.includes(sNorm)) {
          score += sp.prevalence;
          if (!matched.includes(sp.symptom)) matched.push(sp.symptom);
        }
      }
    }
    return { profile: p, score, matched };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.filter(s => s.score > 0).map(s => s.profile);
}

export function getDiseaseProfile(diseaseName: string): DiseaseProfile | null {
  const profiles = loadDiseaseProfiles();
  const norm = diseaseName.toLowerCase().trim();
  return profiles.find(p => p.disease === norm || p.disease.includes(norm)) || null;
}

/* ─────────────────────── Heart Disease ─────────────────────── */

let heartCache: HeartProfile | null = null;

export function loadHeartProfile(): HeartProfile {
  if (heartCache) return heartCache;

  const filePath = path.join(DATASETS_DIR, 'heart.csv');
  if (!fs.existsSync(filePath)) {
    console.warn('[dataset.service] Heart dataset not found:', filePath);
    return { recordCount: 0, columns: [], numericStats: [], classDistribution: {}, riskFactors: {} };
  }

  const { headers, rows } = parseCSV(filePath);
  const targetCol = 'target';
  const targetIdx = headers.indexOf(targetCol);
  const classDist: Record<string, number> = {};

  if (targetIdx >= 0) {
    for (const row of rows) {
      const val = row[targetIdx]?.trim();
      classDist[val] = (classDist[val] || 0) + 1;
    }
  }

  const numericStats: ColumnStats[] = [];
  for (let i = 0; i < headers.length; i++) {
    const col = headers[i];
    const values = rows.map(r => toNumber(r[i]));
    const stats = numericStatsHelpers(values);
    stats.column = col;
    numericStats.push(stats);
  }

  // Known clinical thresholds for heart disease risk factors
  const riskFactors: Record<string, { mean: number; highRiskThreshold: number }> = {};
  const chol = numericStats.find(s => s.column === 'chol');
  const trestbps = numericStats.find(s => s.column === 'trestbps');
  const thalach = numericStats.find(s => s.column === 'thalach');
  const oldpeak = numericStats.find(s => s.column === 'oldpeak');
  const age = numericStats.find(s => s.column === 'age');

  if (chol?.mean != null) riskFactors.chol = { mean: Math.round(chol.mean), highRiskThreshold: 240 };
  if (trestbps?.mean != null) riskFactors.trestbps = { mean: Math.round(trestbps.mean), highRiskThreshold: 140 };
  if (thalach?.mean != null) riskFactors.thalach = { mean: Math.round(thalach.mean), highRiskThreshold: 100 };
  if (oldpeak?.mean != null) riskFactors.oldpeak = { mean: Math.round(oldpeak.mean * 10) / 10, highRiskThreshold: 2.0 };
  if (age?.mean != null) riskFactors.age = { mean: Math.round(age.mean), highRiskThreshold: 55 };

  heartCache = {
    recordCount: rows.length,
    columns: headers,
    numericStats,
    classDistribution: classDist,
    riskFactors,
  };

  console.log(`[dataset.service] Loaded heart profile: ${rows.length} records.`);
  return heartCache;
}

/* ─────────────────────── Diabetes ─────────────────────── */

let diabetesCache: DiabetesProfile | null = null;

export function loadDiabetesProfile(): DiabetesProfile {
  if (diabetesCache) return diabetesCache;

  const filePath = path.join(DATASETS_DIR, 'diabetes.csv');
  if (!fs.existsSync(filePath)) {
    console.warn('[dataset.service] Diabetes dataset not found:', filePath);
    return { recordCount: 0, columns: [], numericStats: [], classDistribution: {}, riskFactors: {} };
  }

  const { headers, rows } = parseCSV(filePath);
  const targetCol = 'Outcome';
  const targetIdx = headers.indexOf(targetCol);
  const classDist: Record<string, number> = {};

  if (targetIdx >= 0) {
    for (const row of rows) {
      const val = row[targetIdx]?.trim();
      classDist[val] = (classDist[val] || 0) + 1;
    }
  }

  const numericStats: ColumnStats[] = [];
  for (let i = 0; i < headers.length; i++) {
    const col = headers[i];
    const values = rows.map(r => toNumber(r[i]));
    const stats = numericStatsHelpers(values);
    stats.column = col;
    numericStats.push(stats);
  }

  const riskFactors: Record<string, { mean: number; highRiskThreshold: number }> = {};
  const glucose = numericStats.find(s => s.column === 'Glucose');
  const bmi = numericStats.find(s => s.column === 'BMI');
  const age = numericStats.find(s => s.column === 'Age');
  const bp = numericStats.find(s => s.column === 'BloodPressure');
  const insulin = numericStats.find(s => s.column === 'Insulin');

  if (glucose?.mean != null) riskFactors.glucose = { mean: Math.round(glucose.mean), highRiskThreshold: 140 };
  if (bmi?.mean != null) riskFactors.bmi = { mean: Math.round(bmi.mean * 10) / 10, highRiskThreshold: 30 };
  if (age?.mean != null) riskFactors.age = { mean: Math.round(age.mean), highRiskThreshold: 45 };
  if (bp?.mean != null) riskFactors.bloodPressure = { mean: Math.round(bp.mean), highRiskThreshold: 90 };
  if (insulin?.mean != null) riskFactors.insulin = { mean: Math.round(insulin.mean), highRiskThreshold: 166 };

  diabetesCache = {
    recordCount: rows.length,
    columns: headers,
    numericStats,
    classDistribution: classDist,
    riskFactors,
  };

  console.log(`[dataset.service] Loaded diabetes profile: ${rows.length} records.`);
  return diabetesCache;
}

function numericStatsHelpers(values: (number | null)[]): ColumnStats {
  const valid = values.filter((v): v is number => v !== null);
  const sorted = [...valid].sort((a, b) => a - b);
  const n = valid.length;
  const mean = n ? valid.reduce((a, b) => a + b, 0) / n : null;
  const median = n ? sorted[Math.floor(n / 2)] : null;
  const min = n ? sorted[0] : null;
  const max = n ? sorted[n - 1] : null;
  const q1 = n ? sorted[Math.floor(n * 0.25)] : null;
  const q3 = n ? sorted[Math.floor(n * 0.75)] : null;
  const variance = n && mean !== null ? valid.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n : null;
  const stdDev = variance !== null ? Math.sqrt(variance) : null;
  return { column: '', mean, median, min, max, q1, q3, stdDev, missingCount: values.length - n, zeroCount: valid.filter(v => v === 0).length };
}

/* ─────────────────────── RAG Integration Helpers ─────────────────────── */

export function buildDatasetRAGContext(symptoms: string[]): string {
  const parts: string[] = [];

  // 1. Disease-symptom matches
  const diseaseMatches = findDiseaseBySymptoms(symptoms);
  if (diseaseMatches.length > 0) {
    parts.push('=== Dataset-Based Disease-Symptom Correlations ===');
    for (const d of diseaseMatches.slice(0, 5)) {
      parts.push(`Disease: ${d.disease} (records: ${d.totalRecords})`);
      parts.push(`  Top symptoms: ${d.topSymptoms.slice(0, 8).join(', ')}`);
      const relevant = d.symptoms.filter(s =>
        symptoms.some(qs => s.symptom.toLowerCase().includes(qs.toLowerCase()) || qs.toLowerCase().includes(s.symptom.toLowerCase()))
      );
      if (relevant.length) {
        parts.push(`  Matched symptom prevalence:`);
        for (const r of relevant.slice(0, 5)) {
          parts.push(`    - ${r.symptom}: ${r.prevalence}% of cases`);
        }
      }
      parts.push('');
    }
  }

  // 2. Heart dataset insights if cardiac symptoms present
  const cardiacKeywords = ['chest pain', 'chest tightness', 'palpitations', 'shortness of breath', 'irregular heartbeat', 'heart', 'bp', 'blood pressure', 'cholesterol'];
  if (symptoms.some(s => cardiacKeywords.some(k => s.toLowerCase().includes(k)))) {
    const heart = loadHeartProfile();
    if (heart.recordCount > 0) {
      parts.push('=== Heart Disease Dataset Insights ===');
      parts.push(`Dataset size: ${heart.recordCount} patients`);
      parts.push(`Class distribution: ${JSON.stringify(heart.classDistribution)}`);
      parts.push('Risk factor thresholds from dataset:');
      for (const [factor, data] of Object.entries(heart.riskFactors)) {
        parts.push(`  - ${factor}: avg ${data.mean}, high-risk >${data.highRiskThreshold}`);
      }
      parts.push('');
    }
  }

  // 3. Diabetes dataset insights if metabolic symptoms present
  const metabolicKeywords = ['glucose', 'sugar', 'thirst', 'urination', 'weight loss', 'blurred vision', 'fatigue', 'diabetes', 'insulin', 'bmi'];
  if (symptoms.some(s => metabolicKeywords.some(k => s.toLowerCase().includes(k)))) {
    const diabetes = loadDiabetesProfile();
    if (diabetes.recordCount > 0) {
      parts.push('=== Diabetes Dataset Insights ===');
      parts.push(`Dataset size: ${diabetes.recordCount} patients`);
      parts.push(`Class distribution: ${JSON.stringify(diabetes.classDistribution)}`);
      parts.push('Risk factor thresholds from dataset:');
      for (const [factor, data] of Object.entries(diabetes.riskFactors)) {
        parts.push(`  - ${factor}: avg ${data.mean}, high-risk >${data.highRiskThreshold}`);
      }
      parts.push('');
    }
  }

  return parts.join('\n');
}

export function getAllDatasetDiseases(): string[] {
  const profiles = loadDiseaseProfiles();
  return profiles.map(p => p.disease);
}

/* ─────────────────────── Stats endpoint helper ─────────────────────── */

export function getAllDatasetStats() {
  const diseases = loadDiseaseProfiles();
  const heart = loadHeartProfile();
  const diabetes = loadDiabetesProfile();

  return {
    diseasesAndSymptoms: {
      file: 'Final_Augmented_dataset_Diseases_and_Symptoms.csv',
      recordCount: diseases.reduce((sum, d) => sum + d.totalRecords, 0),
      uniqueDiseases: diseases.length,
      topDiseases: diseases.slice(0, 10).map(d => ({ name: d.disease, records: d.totalRecords })),
    },
    heartDisease: {
      file: 'heart.csv',
      recordCount: heart.recordCount,
      columns: heart.columns,
      classDistribution: heart.classDistribution,
      riskFactors: heart.riskFactors,
    },
    diabetes: {
      file: 'diabetes.csv',
      recordCount: diabetes.recordCount,
      columns: diabetes.columns,
      classDistribution: diabetes.classDistribution,
      riskFactors: diabetes.riskFactors,
    },
  };
}

/* ─────────────────────── Extended profiles for API routes ─────────────────────── */

function computeHeartExtended() {
  const base = loadHeartProfile();
  if (base.recordCount === 0) return null;

  const riskCount = base.classDistribution['1'] || 0;
  const noRiskCount = base.classDistribution['0'] || 0;
  const totalRecords = base.recordCount;

  // Compute means for risk (target=1) and no-risk (target=0) groups
  const filePath = path.join(DATASETS_DIR, 'heart.csv');
  const { headers, rows } = parseCSV(filePath);
  const targetIdx = headers.indexOf('target');

  const riskMeans: Record<string, number> = {};
  const noRiskMeans: Record<string, number> = {};

  for (const col of headers) {
    if (col === 'target') continue;
    const idx = headers.indexOf(col);
    const riskVals: number[] = [];
    const noRiskVals: number[] = [];

    for (const row of rows) {
      const val = toNumber(row[idx]);
      if (val === null) continue;
      const target = parseInt(row[targetIdx], 10);
      if (target === 1) riskVals.push(val);
      else noRiskVals.push(val);
    }

    riskMeans[col] = riskVals.length ? riskVals.reduce((a, b) => a + b, 0) / riskVals.length : 0;
    noRiskMeans[col] = noRiskVals.length ? noRiskVals.reduce((a, b) => a + b, 0) / noRiskVals.length : 0;
  }

  return {
    ...base,
    totalRecords,
    riskCount,
    noRiskCount,
    riskGroup: riskMeans,
    noRiskGroup: noRiskMeans,
    riskAgeMean: Math.round(riskMeans['age'] || 0),
    riskTrestbpsMean: Math.round(riskMeans['trestbps'] || 0),
    riskCholMean: Math.round(riskMeans['chol'] || 0),
    riskOldpeakMean: Math.round((riskMeans['oldpeak'] || 0) * 10) / 10,
  };
}

function computeDiabetesExtended() {
  const base = loadDiabetesProfile();
  if (base.recordCount === 0) return null;

  const diabetesCount = base.classDistribution['1'] || 0;
  const noDiabetesCount = base.classDistribution['0'] || 0;
  const totalRecords = base.recordCount;

  const filePath = path.join(DATASETS_DIR, 'diabetes.csv');
  const { headers, rows } = parseCSV(filePath);
  const targetIdx = headers.indexOf('Outcome');

  const diabetesMeans: Record<string, number> = {};
  const noDiabetesMeans: Record<string, number> = {};

  for (const col of headers) {
    if (col === 'Outcome') continue;
    const idx = headers.indexOf(col);
    const dVals: number[] = [];
    const ndVals: number[] = [];

    for (const row of rows) {
      const val = toNumber(row[idx]);
      if (val === null) continue;
      const target = parseInt(row[targetIdx], 10);
      if (target === 1) dVals.push(val);
      else ndVals.push(val);
    }

    diabetesMeans[col] = dVals.length ? dVals.reduce((a, b) => a + b, 0) / dVals.length : 0;
    noDiabetesMeans[col] = ndVals.length ? ndVals.reduce((a, b) => a + b, 0) / ndVals.length : 0;
  }

  return {
    ...base,
    totalRecords,
    diabetesCount,
    noDiabetesCount,
    diabetesGroup: diabetesMeans,
    noDiabetesGroup: noDiabetesMeans,
    riskGlucoseMean: Math.round(diabetesMeans['Glucose'] || 0),
    riskBmiMean: Math.round((diabetesMeans['BMI'] || 0) * 10) / 10,
    riskAgeMean: Math.round(diabetesMeans['Age'] || 0),
    riskInsulinMean: Math.round(diabetesMeans['Insulin'] || 0),
    riskPedigreeMean: Math.round((diabetesMeans['DiabetesPedigreeFunction'] || 0) * 1000) / 1000,
  };
}

/* ─────────────────────── Service singleton ─────────────────────── */

export const datasetService = {
  getAllDatasetStats,
  getAllDatasetDiseases: () =>
    loadDiseaseProfiles().map((d) => ({ name: d.disease, totalRecords: d.totalRecords, topSymptoms: d.topSymptoms.slice(0, 5) })),
  getDiseaseProfile: (name: string) => getDiseaseProfile(name),
  findDiseaseBySymptoms: (symptoms: string[]) => findDiseaseBySymptoms(symptoms),
  loadHeartProfile: computeHeartExtended,
  loadDiabetesProfile: computeDiabetesExtended,
  buildDatasetRAGContext,
};

