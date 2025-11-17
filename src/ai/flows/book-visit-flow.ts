
'use server';

/**
 * @fileOverview A server-side Genkit flow for booking a patient visit.
 * This flow now writes to a top-level `/visits` collection to allow for
 * easier querying by providers in the waiting room. It also differentiates
 * between AI and human consultations.
 *
 * THIS FLOW IS DEPRECATED AND NO LONGER USED.
 * Visit creation is now handled on the client-side in `/app/book-visit/page.tsx`
 * and `/app/app/visit/ai/[visitId]/page.tsx`.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';


// Define the input schema for booking a visit
const BookVisitInputSchema = z.object({
  patientId: z.string().describe('The UID of the patient booking the visit.'),
  patientName: z.string().describe('The display name of the patient.'),
  reason: z.string().describe('The primary reason for the visit.'),
  details: z.string().optional().describe('Any additional details provided by the patient.'),
  questionnaireAnswers: z.record(z.string()).optional().describe('Answers to the visit-specific questionnaire.'),
  isAiVisit: z.boolean().optional().describe('Whether this is an AI-only consultation.'),
});
export type BookVisitInput = z.infer<typeof BookVisitInputSchema>;

// Define the output schema
const BookVisitOutputSchema = z.object({
  visitId: z.string().describe('The ID of the newly created visit document.'),
});
export type BookVisitOutput = z.infer<typeof BookVisitOutputSchema>;


// Exported wrapper function to be called from the client
export async function bookVisit(input: BookVisitInput): Promise<BookVisitOutput> {
  // This flow is deprecated.
  throw new Error("This function is deprecated and should not be called.");
}

// Define the Genkit flow
const bookVisitFlow = ai.defineFlow(
  {
    name: 'bookVisitFlow',
    inputSchema: BookVisitInputSchema,
    outputSchema: BookVisitOutputSchema,
  },
  async (input) => {
    // This flow is deprecated and its logic has been moved to the client.
    throw new Error("The bookVisitFlow is deprecated.");
  }
);
