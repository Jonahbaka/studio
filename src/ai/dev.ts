
import { config } from 'dotenv';
config({ path: '.env.local' });


import '@/ai/flows/generate-soap-note.ts';
import '@/ai/flows/assist-with-diagnosis.ts';
import '@/ai/flows/dosespot-sso.ts';
import '@/ai/flows/dispense-prescription.ts';
import '@/ai/flows/book-visit-flow.ts';
