import { env } from './env';

const BASE_URL = env.apiBaseUrl;

function getToken(): string | null {
  return localStorage.getItem('medai_token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function safeFetch(url: string, options: RequestInit) {
  try {
    const res = await fetch(url, options);
    const data = await res.json();
    if (res.status === 401) {
      localStorage.removeItem('medai_token');
      localStorage.removeItem('medai_user');
      return { error: 'Session expired. Please sign in again.', unauthorized: true };
    }
    if (!res.ok) return { error: data.error || `Server error (${res.status})` };
    return data;
  } catch {
    return { error: 'Cannot connect to server. Make sure the backend is running.' };
  }
}

export async function registerUser(name: string, email: string, password: string) {
  return safeFetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
}

export async function loginUser(email: string, password: string) {
  const data = await safeFetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!data.error && data.token) {
    localStorage.setItem('medai_token', data.token);
    localStorage.setItem('medai_user', JSON.stringify(data.user));
  }
  return data;
}

export function logoutUser() {
  localStorage.removeItem('medai_token');
  localStorage.removeItem('medai_user');
}

export async function extractAndPredict(symptomText: string) {
  return safeFetch(`${BASE_URL}/predict/extract`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ symptoms: symptomText }),
  });
}

export async function getFollowUpQuestions(symptomsArray: string[]) {
  return safeFetch(`${BASE_URL}/predict/followup`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ symptoms: symptomsArray }),
  });
}

export async function submitFollowUpAnswers(symptomsArray: string[], answers: { question: string; answer: string }[]) {
  return safeFetch(`${BASE_URL}/predict/diagnose`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ symptoms: symptomsArray, answers }),
  });
}

export async function saveToHistory(predictionData: any) {
  return safeFetch(`${BASE_URL}/history`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      disease: predictionData.disease,
      confidence: predictionData.confidence,
      symptoms: predictionData.symptoms_found || predictionData.symptoms,
      explanation: predictionData.explanation,
      allPredictions: predictionData.allPredictions || [],
    }),
  });
}

export async function getUserHistory() {
  return safeFetch(`${BASE_URL}/history`, { method: 'GET', headers: authHeaders() });
}

export async function getReminders() {
  return safeFetch(`${BASE_URL}/reminders`, { method: 'GET', headers: authHeaders() });
}

export async function addReminder(reminderData: any) {
  return safeFetch(`${BASE_URL}/reminders/create`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      medicineName: reminderData.medicineName,
      dosage: reminderData.dosage,
      frequency: reminderData.frequency,
      startDate: reminderData.startDate,
      reminderTime: reminderData.reminderTime,
      notes: reminderData.notes,
    }),
  });
}

export async function updateReminder(reminderId: string | number, data: any) {
  return safeFetch(`${BASE_URL}/reminders/${reminderId}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({
      medicineName: data.medicineName,
      dosage: data.dosage,
      frequency: data.frequency,
      startDate: data.startDate,
      reminderTime: data.reminderTime,
      notes: data.notes,
    }),
  });
}

export async function deleteReminder(reminderId: string) {
  return safeFetch(`${BASE_URL}/reminders/${reminderId}`, { method: 'DELETE', headers: authHeaders() });
}

export async function markReminderDone(reminderId: string) {
  return safeFetch(`${BASE_URL}/reminders/${reminderId}/mark-done`, { method: 'PUT', headers: authHeaders() });
}
