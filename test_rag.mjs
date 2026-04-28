import { validateSymptomMatches, findDiseaseInKB } from './backend/services/rag.service.ts';

const symptoms = ['severe headache', 'neck stiffness', 'photophobia', 'fever', 'confusion'];
const disease = 'Migraine';

console.log('Testing validateSymptomMatches for Migraine with Meningitis symptoms:');
const matches = validateSymptomMatches(symptoms, disease);
console.log(`Matches: ${matches}`);

const kbEntry = findDiseaseInKB(disease);
console.log(`KB entry found: ${!!kbEntry}`);
if (kbEntry) {
  console.log(`KB symptoms: ${kbEntry.symptoms}`);
}

