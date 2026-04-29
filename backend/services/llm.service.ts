import 'dotenv/config';

const runtimeProcess = globalThis as typeof globalThis & {
  process?: {
    env?: Record<string, string | undefined>;
  };
};

const OLLAMA_HOST = runtimeProcess.process?.env?.OLLAMA_HOST || 'http://localhost:11434';
const OLLAMA_MODEL = runtimeProcess.process?.env?.OLLAMA_MODEL || 'llama3.2';

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

interface SymptomExtractionResult {
  symptoms: string[];
  severity?: string;
  duration?: string;
}

interface PredictionResult {
  disease: string;
  confidence: number;
  allPredictions: Array<{ disease: string; confidence: number }>;
  explanation: string;
}

function extractSymptomsLocally(userInput: string): SymptomExtractionResult {
  const text = userInput.toLowerCase();

  const symptomMap: Array<{ keywords: string[]; symptom: string }> = [
    { keywords: ['fever', 'temperature', 'hot body'], symptom: 'fever' },
    { keywords: ['cough', 'coughing'], symptom: 'cough' },
    { keywords: ['headache', 'head hurts', 'migraine'], symptom: 'headache' },
    { keywords: ['sore throat', 'throat pain'], symptom: 'sore throat' },
    { keywords: ['runny nose', 'stuffy nose', 'blocked nose', 'nasal congestion'], symptom: 'nasal congestion' },
    { keywords: ['fatigue', 'tired', 'weakness', 'weak'], symptom: 'fatigue' },
    { keywords: ['shortness of breath', 'breathing trouble', 'difficulty breathing', 'breathless'], symptom: 'shortness of breath' },
    { keywords: ['chest pain', 'chest tightness'], symptom: 'chest pain' },
    { keywords: ['nausea', 'nauseous'], symptom: 'nausea' },
    { keywords: ['vomit', 'vomiting'], symptom: 'vomiting' },
    { keywords: ['diarrhea', 'loose stool'], symptom: 'diarrhea' },
    { keywords: ['stomach pain', 'abdominal pain', 'stomach ache', 'abdomen pain'], symptom: 'abdominal pain' },
    { keywords: ['rash', 'skin rash', 'itching'], symptom: 'rash' },
    { keywords: ['dizzy', 'dizziness'], symptom: 'dizziness' },
    { keywords: ['body pain', 'body ache', 'muscle pain', 'muscle ache'], symptom: 'body aches' },
  ];

  const symptoms = symptomMap
    .filter(entry => entry.keywords.some(keyword => text.includes(keyword)))
    .map(entry => entry.symptom);

  const severity = text.includes('severe') || text.includes('intense')
    ? 'severe'
    : text.includes('mild')
      ? 'mild'
      : undefined;

  const durationMatch = userInput.match(/(\d+\s*(day|days|week|weeks|month|months|hour|hours))/i);
  const duration = durationMatch?.[1];

  return {
    symptoms: Array.from(new Set(symptoms)),
    severity,
    duration,
  };
}

function generateFallbackFollowUpQuestions(symptoms: string[]): string[] {
  const normalized = symptoms.map(symptom => symptom.toLowerCase());

  const questions: string[] = [
    'How long have you been having these symptoms?',
    'Are your symptoms getting better, worse, or staying the same?',
  ];

  if (normalized.some(symptom => symptom.includes('fever') || symptom.includes('temperature'))) {
    questions.push('What is the highest temperature you have recorded?');
  }

  if (normalized.some(symptom => symptom.includes('cough') || symptom.includes('breathing') || symptom.includes('shortness of breath'))) {
    questions.push('Are you having any trouble breathing or chest tightness?');
  }

  if (normalized.some(symptom => symptom.includes('pain') || symptom.includes('headache') || symptom.includes('ache'))) {
    questions.push('On a scale of 1 to 10, how severe is the pain or discomfort?');
  }

  if (normalized.some(symptom => symptom.includes('vomit') || symptom.includes('nausea') || symptom.includes('diarrhea') || symptom.includes('stomach'))) {
    questions.push('Have you had vomiting, diarrhea, or trouble keeping fluids down?');
  }

  if (normalized.some(symptom => symptom.includes('rash') || symptom.includes('skin'))) {
    questions.push('When did the rash or skin change start, and is it spreading?');
  }

  questions.push('Do you have any other symptoms that started around the same time?');

  return Array.from(new Set(questions)).slice(0, 5);
}

async function callOllama(prompt: string, systemPrompt?: string, timeoutMs = 100000): Promise<string> {
  try {
    const body: Record<string, string | boolean> = {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    };
    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(`${OLLAMA_HOST}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`Ollama call timed out after ${timeoutMs}ms`);
      throw new Error(`Ollama request timed out after ${timeoutMs}ms`);
    }
    console.error('Ollama call failed:', error);
    throw error;
  }
}

export async function extractSymptoms(userInput: string): Promise<SymptomExtractionResult> {
  const systemPrompt = `You are a medical symptom extractor. Analyze the user's description and extract all symptoms mentioned. Return a JSON array of symptoms found. Be specific and use medical terms where appropriate.

Examples:
- "I have a fever of 38°C" -> ["fever", "high temperature"]
- "My head hurts and I feel tired" -> ["headache", "fatigue"]
- "Chest pain when breathing" -> ["chest pain", "difficulty breathing"]

Return ONLY a JSON array of symptom strings, no other text.`;

  try {
    const result = await callOllama(
      `Extract symptoms from this patient description: "${userInput}"`,
      systemPrompt
    );

    try {
      const symptoms = JSON.parse(result);
      if (Array.isArray(symptoms)) {
        return { symptoms };
      }
      return extractSymptomsLocally(userInput);
    } catch {
      const lines = result.split('\n').filter(l => l.trim());
      return lines.length > 0 ? { symptoms: lines } : extractSymptomsLocally(userInput);
    }
  } catch (error) {
    console.warn('Falling back to local symptom extraction:', error);
    return extractSymptomsLocally(userInput);
  }
}

export async function generateFollowUpQuestions(symptoms: string[], context?: string): Promise<string[]> {
  const symptomsList = symptoms.join(', ');
  
  const systemPrompt = `You are a doctor asking YES/NO follow-up questions to understand a patient's condition. Generate 3-5 TARGETED YES/NO questions ONLY.

Rules (MANDATORY):
- ALL questions MUST be answerable with "yes" or "no"
- Focus: duration (e.g. "Have symptoms lasted >3 days?"), severity ("Is pain severe?"), triggers ("Worse at night?"), associated ("Any chest pain?"), risk ("Recent travel?"), recent changes ("Recent medication?")
- Medical, specific to symptoms
- No open-ended like "how long", "what temperature"

Return ONLY valid JSON array ["question1", "question2"], NO OTHER TEXT. Examples:
["Have symptoms lasted more than 3 days?", "Is the pain severe (8+ /10)?", "Any shortness of breath?", "Recent fever >38C?", "Worse when lying down?"]`;

  try {
    const result = await callOllama(
      `Generate follow-up questions for these symptoms: ${symptomsList}`,
      systemPrompt
    );

    try {
      const questions = JSON.parse(result);
      if (Array.isArray(questions)) {
        return questions.slice(0, 5);
      }
      return generateFallbackFollowUpQuestions(symptoms);
    } catch {
      const lines = result.split('\n').filter(l => l.trim()).slice(0, 5);
      return lines.length > 0 ? lines : generateFallbackFollowUpQuestions(symptoms);
    }
  } catch (error) {
    console.warn('Falling back to local follow-up questions:', error);
    return generateFallbackFollowUpQuestions(symptoms);
  }
}

export async function generatePrediction(
  symptoms: string[],
  followUpAnswers: Array<{ question: string; answer: string }>
): Promise<PredictionResult> {
  const symptomsList = symptoms.join(', ');
  const answersList = followUpAnswers.map(a => `${a.question}: ${a.answer}`).join('; ');
  
  const context = `Patient symptoms: ${symptomsList}. Additional answers: ${answersList}`;

  const systemPrompt = `You are a medical diagnosis assistant. Based on the patient's symptoms and answers, provide a diagnosis with confidence score.

Medical knowledge to consider:
- Common symptom patterns for diseases
- Severity indicators
- Risk factors

Output format (JSON):
{
  "disease": "primary diagnosis",
  "confidence": 0-100,
  "allPredictions": [{"disease": "...", "confidence": 0-100}],
  "explanation": "brief explanation of the diagnosis"
}

Return ONLY valid JSON, no other text.`;

  const result = await callOllama(
    `Analyze and provide diagnosis for: ${context}`,
    systemPrompt
  );

  try {
    const parsed = JSON.parse(result);
    return {
      disease: parsed.disease || 'Unknown',
      confidence: parsed.confidence || 50,
      allPredictions: parsed.allPredictions || [{ disease: parsed.disease || 'Unknown', confidence: parsed.confidence || 50 }],
      explanation: parsed.explanation || 'Based on the symptoms provided.',
    };
  } catch {
    return {
      disease: 'Unable to determine',
      confidence: 0,
      allPredictions: [],
      explanation: 'Unable to analyze symptoms. Please consult a healthcare provider.',
    };
  }
}

function generateFallbackExplanation(disease: string, symptoms: string[]): string {
  return `Based on the symptoms you reported (${symptoms.join(', ')}), "${disease}" has been identified as a possible condition.\n\n` +
    `What this means:\n` +
    `"${disease}" is a medical condition that can present with the symptoms you described. ` +
    `The analysis matched your symptom pattern against known disease profiles.\n\n` +
    `Important next steps:\n` +
    `• Consult a qualified healthcare provider for a proper diagnosis and treatment plan.\n` +
    `• Monitor your symptoms and seek emergency care if they worsen.\n` +
    `• Do not self-medicate based on this AI prediction alone.\n\n` +
    `Disclaimer: This information is generated for educational purposes only and does not replace professional medical advice.`;
}

export async function generateExplanation(
  disease: string,
  symptoms: string[]
): Promise<string> {
  const systemPrompt = `You are a medical explainer. Provide a clear, patient-friendly explanation of the diagnosis.

Rules:
- Use simple language
- Explain what the condition means
- Mention possible causes
- Keep it concise (2-3 paragraphs max)
- Include a disclaimer that this is not medical advice

Do not use technical jargon without explanation.`;

  try {
    const result = await callOllama(
      `Explain what "${disease}" means for a patient with symptoms: ${symptoms.join(', ')}`,
      systemPrompt
    );
    if (result && result.trim().length > 0) {
      return result.trim();
    }
    console.warn('Ollama returned empty explanation, using fallback');
    return generateFallbackExplanation(disease, symptoms);
  } catch (error) {
    console.error('Ollama explanation failed, using fallback:', error);
    return generateFallbackExplanation(disease, symptoms);
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_HOST}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}
