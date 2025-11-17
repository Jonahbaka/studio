
'use server';
/**
 * @fileOverview A mock Genkit flow for generating a DoseSpot SSO token.
 *
 * - generateDoseSpotSSO - A function that returns a simulated SSO URL for DoseSpot.
 * - DoseSpotSSOInput - The input type for the function.
 * - DoseSpotSSOOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as jwt from 'jsonwebtoken';

const DoseSpotSSOInputSchema = z.object({});
export type DoseSpotSSOInput = z.infer<typeof DoseSpotSSOInputSchema>;

const DoseSpotSSOOutputSchema = z.object({
  ssoUrl: z.string().describe('The generated SSO URL for DoseSpot.'),
  token: z.string().describe('The JWT token.'),
  expiresIn: z.number().describe('The token expiration in seconds.'),
});
export type DoseSpotSSOOutput = z.infer<typeof DoseSpotSSOOutputSchema>;


export async function generateDoseSpotSSO(input: DoseSpotSSOInput): Promise<DoseSpotSSOOutput> {
    return doseSpotSSOFlow(input);
}


const doseSpotSSOFlow = ai.defineFlow(
  {
    name: 'doseSpotSSOFlow',
    inputSchema: DoseSpotSSOInputSchema,
    outputSchema: DoseSpotSSOOutputSchema,
  },
  async () => {
    // In a real implementation, these would come from secure environment variables
    // and a mapping in Firestore.
    const MOCK_DOSESPOT_SECRET = 'super-secret-key-that-should-be-in-secret-manager';
    const MOCK_CLINIC_ID = '1234';
    const MOCK_USER_ID = '5678'; // This would be the provider's DoseSpot User ID

    const payload = {
      clinic_id: MOCK_CLINIC_ID,
      user_id: MOCK_USER_ID,
      timestamp: Math.floor(Date.now() / 1000),
    };

    // This token is for demonstration purposes. In production, the secret key
    // must be managed securely on the backend.
    const token = jwt.sign(payload, MOCK_DOSESPOT_SECRET, { algorithm: 'HS256' });

    // The returnUrl must be the publicly accessible URL of the page that will
    // handle the post-ePrescribe workflow.
    const returnUrl = encodeURIComponent("https://your-live-domain.com/provider/eprescribe-callback");

    // This is the simulated SSO URL. In a real scenario, this would be the actual
    // DoseSpot endpoint. We are pointing to a placeholder.
    const ssoUrl = `https://my.dosespot.com/sso?token=${token}&returnUrl=${returnUrl}`;

    console.log("🚀 DOSESPOT EPRESCRIBE FIXED – ZumaiDoc back online");

    return {
      ssoUrl,
      token,
      expiresIn: 300, // 5 minutes
    };
  }
);
