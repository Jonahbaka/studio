
import { cookies } from 'next/headers';
import { initializeApp, getApp, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

import { firebaseConfig } from './config';

/**
 * Gets the Firebase Admin App instance for the currently signed-in user.
 * This is used for server-side operations.
 */
export async function getAuthenticatedAppForUser() {
  const session = (await cookies()).get('firebase-session')?.value;
  if (!session) {
    return { app: null, auth: null };
  }
  
  const appName = `firebase-auth-node:${session}`;
  
  // Check if the app is already initialized
  const alreadyCreated = getApps().some(
    (app) => app.name === appName
  );

  if (alreadyCreated) {
    const app = getApp(appName);
    const auth = getAuth(app);
    return { app, auth };
  }
  
  // Initialize the Admin SDK
  const app = initializeApp({
    projectId: firebaseConfig.projectId,
    // No credentials needed in App Hosting environment.
    // It automatically uses Application Default Credentials.
  }, appName);

  const auth = getAuth(app);
  
  // You might want to do more here like verifying the token if needed
  
  return { app, auth };
}
