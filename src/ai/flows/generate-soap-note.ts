'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a SOAP note from patient history.
 *
 * - generateSoapNote - A function that generates a SOAP note from patient history.
 * - GenerateSoapNoteInput - The input type for the generateSoapNote function.
 * - GenerateSoapNoteOutput - The return type for the generateSoapNote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSoapNoteInputSchema = z.object({
  patientHistory: z
    .string()
    .describe('The patient history, including past visits, medications, and lab results.'),
});
export type GenerateSoapNoteInput = z.infer<typeof GenerateSoapNoteInputSchema>;

const GenerateSoapNoteOutputSchema = z.object({
  soapNote: z.string().describe('The generated SOAP note.'),
});
export type GenerateSoapNoteOutput = z.infer<typeof GenerateSoapNoteOutputSchema>;

export async function generateSoapNote(input: GenerateSoapNoteInput): Promise<GenerateSoapNoteOutput> {
  return generateSoapNoteFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSoapNotePrompt',
  input: {schema: GenerateSoapNoteInputSchema},
  output: {schema: GenerateSoapNoteOutputSchema},
  prompt: `You are an AI assistant specialized in generating SOAP (Subjective, Objective, Assessment, Plan) notes for doctors.

  Given the patient's history, create a preliminary SOAP note that the doctor can review and edit. The note should be comprehensive and well-structured.

  Patient History: {{{patientHistory}}}
  SOAP Note:`,
});

const generateSoapNoteFlow = ai.defineFlow(
  {
    name: 'generateSoapNoteFlow',
    inputSchema: GenerateSoapNoteInputSchema,
    outputSchema: GenerateSoapNoteOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {soapNote: output!.soapNote!};
  }
);
