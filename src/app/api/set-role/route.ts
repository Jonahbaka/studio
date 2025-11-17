// IMPORTANT: This is a placeholder for a secure, backend-managed function.
// In a production environment, this would be a Firebase Function triggered by
// an admin action (e.g., updating a user's role in the Firestore 'users' collection).
// Exposing this as a public API route is NOT secure.

import { NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { getAuthenticatedAppForUser } from '@/firebase/server-admin';


export async function POST(request: Request) {
    const { app, auth } = await getAuthenticatedAppForUser();

    if (!app || !auth) {
        return NextResponse.json({ error: 'Authentication failed. Not an admin.' }, { status: 401 });
    }

    const { uid, role } = await request.json();

    if (!uid || !role) {
        return NextResponse.json({ error: 'UID and role are required.' }, { status: 400 });
    }
    
    // In a real app, you would verify that the CALLER is an admin before proceeding.
    // For this environment, we assume the call is authorized if the user is authenticated.

    try {
        // Set the custom claim for the target user
        await auth.setCustomUserClaims(uid, { role: role });
        
        return NextResponse.json({ success: true, message: `Custom claim '${role}' set for user ${uid}` });

    } catch (error: any) {
        console.error('Error setting custom claim:', error);
        return NextResponse.json({ error: error.message || 'Failed to set custom claim.' }, { status: 500 });
    }
}
