
'use server';

/**
 * @fileOverview This file defines a Genkit flow for AI-assisted diagnosis.
 *
 * - assistWithDiagnosis - A function that takes patient symptoms and history and provides potential diagnoses.
 * - AssistWithDiagnosisInput - The input type for the assistWithDiagnosis function.
 * - AssistWithDiagnosisOutput - The return type for the assistWithDiagnosis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssistWithDiagnosisInputSchema = z.object({
  symptoms: z.string().describe('The symptoms presented by the patient.'),
  patientHistory: z.string().describe('The medical history of the patient.'),
});
export type AssistWithDiagnosisInput = z.infer<typeof AssistWithDiagnosisInputSchema>;

const AssistWithDiagnosisOutputSchema = z.object({
  potentialDiagnoses: z
    .string()
    .describe('A list of potential diagnoses based on the provided symptoms and history, formatted for a medical professional.'),
});
export type AssistWithDiagnosisOutput = z.infer<typeof AssistWithDiagnosisOutputSchema>;

export async function assistWithDiagnosis(input: AssistWithDiagnosisInput): Promise<AssistWithDiagnosisOutput> {
  return assistWithDiagnosisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'assistWithDiagnosisPrompt',
  input: {schema: AssistWithDiagnosisInputSchema},
  output: {schema: AssistWithDiagnosisOutputSchema},
  prompt: `You are an AI medical assistant for a licensed healthcare provider. Your purpose is to provide a differential diagnosis based on the provided clinical information. The output should be a concise, structured list suitable for a clinical setting.

  **DO NOT** include conversational text, apologies, or disclaimers like "I am not a doctor." The user is a medical professional.

  **Patient History:**
  {{{patientHistory}}}
  
  **Presenting Symptoms:**
  "{{{symptoms}}}"

  **Your Task:**
  Based on the information above, generate a list of potential diagnoses, ordered from most to least likely. For each diagnosis, provide a brief (1-2 sentence) rationale. Format it clearly.

  **Example Output Format:**
  1.  **Pneumonia:** Rationale based on cough, shortness of breath, and potential for infection.
  2.  **Acute Bronchitis:** Rationale based on persistent cough, often viral in origin.
  3.  **Congestive Heart Failure (CHF) Exacerbation:** Rationale considering history of HTN and shortness of breath.
  `,
  model: 'googleai/gemini-1.5-pro',
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const assistWithDiagnosisFlow = ai.defineFlow(
  {
    name: 'assistWithDiagnosisFlow',
    inputSchema: AssistWithDiagnosisInputSchema,
    outputSchema: AssistWithDiagnosisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
