
'use server';
/**
 * @fileOverview This file defines the prescription dispensing flow.
 *
 * - dispensePrescription - Main flow to handle e-prescribing via DoseSpot.
 * - DispenseInput - The input type for the dispensePrescription function.
 * - DispenseOutput - The return type for the dispensePrescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Mock patient data for simulation
const mockPatientDatabase: Record<string, any> = {
  patient1: { uid: 'patient1', name: 'John Doe', country: 'US', phone: '+15551234567', email: 'john.doe@example.com', dosespotPatientId: 'abc123' },
};

const DispenseInputSchema = z.object({
    visitId: z.string(),
    patientUid: z.string(),
    ndc: z.string(),
    sig: z.string(),
    quantity: z.number(),
    daysSupply: z.number(),
    pharmacy: z.object({
        id: z.string().optional(),
        npi: z.string().optional(), // For USA
    }),
});
export type DispenseInput = z.infer<typeof DispenseInputSchema>;

const DispenseOutputSchema = z.object({
    status: z.string(),
    method: z.string(),
    pdfUrl: z.string().optional(),
});
export type DispenseOutput = z.infer<typeof DispenseOutputSchema>;

export async function dispensePrescription(input: DispenseInput): Promise<DispenseOutput> {
  return dispensePrescriptionFlow(input);
}

const dispensePrescriptionFlow = ai.defineFlow(
  {
    name: 'dispensePrescriptionFlow',
    inputSchema: DispenseInputSchema,
    outputSchema: DispenseOutputSchema,
  },
  async (input) => {
    const patient = mockPatientDatabase[input.patientUid];
    if (!patient) {
      throw new Error('Patient not found');
    }

    // USA PATH (DoseSpot ePrescribe)
    console.log(`Dispensing for US patient via DoseSpot: ${patient.name}`);
    // Simulate API call to DoseSpot
    const dosespotPayload = {
        clinicId: process.env.DOSESPOT_CLINIC_ID || 'MOCK_CLINIC_ID',
        userId: 'PROVIDER_UID_HERE', // This would be context.auth.uid in a real scenario
        patientId: patient.dosespotPatientId,
        pharmacyNpi: input.pharmacy.npi,
        ndc: input.ndc,
        sig: input.sig,
        quantity: input.quantity,
        daysSupply: input.daysSupply
    };

    console.log('Calling DoseSpot API with data:', dosespotPayload);

    // In a real scenario, this ID would come from the DoseSpot API response
    const dosespotPrescriptionId = `ds_${Date.now()}`;
    
    const status = 'sent_us';
    const method = 'DoseSpot';
    const pdfUrl = dosespotPrescriptionId; // Use the DoseSpot ID as a reference
    

    // Log dispense event (Simulated)
    console.log('--- DISPENSE EVENT LOG ---');
    console.log(JSON.stringify({
        visitId: input.visitId,
        patientCountry: patient.country,
        pharmacy: input.pharmacy,
        status: status,
        method: method,
        timestamp: new Date().toISOString()
    }, null, 2));
    
    console.log("🚀 DISPENSE ENGINE CALLED – SINGLE PATH LOGIC EXECUTED");

    return { status, method, pdfUrl };
  }
);
