# Authentication Flow for ZumaiDoc

This document outlines the authentication and user profile creation process for the ZumaiDoc application. The system uses Firebase Authentication and Firestore to manage users.

## Key Concepts

- **Firebase Authentication**: Handles the core user sign-up and sign-in processes (Email/Password, Social, Anonymous).
- **Firestore `users` Collection**: A top-level collection where a document is created for each user. This document stores the user's `role` (e.g., `patient`, `doctor`) and other profile information.
- **Role-Based Redirects**: After login, the application checks the user's role from their Firestore document and redirects them to the appropriate portal (`/app` for patients, `/provider` for providers).

## Signup Flow

1.  **User Enters Information**: The user provides their name, email, and password on the `/signup` page.
2.  **Select Role**:
    *   **Patient**: The default role.
    *   **Doctor/Clinical Role**: If a clinical role is selected, additional fields for License Number and NPI Number are required.
3.  **Account Creation**:
    *   `createUserWithEmailAndPassword` is called to create a user in Firebase Authentication.
    *   The user's display name is updated using `updateProfile`.
4.  **Firestore Profile Creation**:
    *   **Crucially, a new document is created in the `/users/{userId}` collection.**
    *   This document is populated with the user's name, email, and the selected `role`.
    *   For clinical roles, a `licenseStatus` of `pending` is set, and a corresponding request is logged in the `/licenseRequests` collection for admin approval.
5.  **Redirect**: Once the Firestore profile is successfully created, the user is redirected. The application's layout files then read the user's role and direct them to the correct portal.

## Login Flow

1.  **User Enters Credentials**: User provides email and password on the `/login` page.
2.  **Authentication**: `signInWithEmailAndPassword` is called.
3.  **Redirect Logic**:
    *   Upon successful login, an auth state listener triggers.
    *   The application fetches the user's document from the `/users/{userId}` collection.
    *   Based on the `role` field in the document, the user is redirected to `/app` (patient) or `/provider` (provider/admin).

## Test Provider Login (Anonymous Auth)

For ease of development, a "Log In as Provider (No Credentials)" button is available on the login page.

1.  **Button Click**: Triggers the `handleTestProviderLogin` function.
2.  **Anonymous Sign-In**: `signInAnonymously` from Firebase Auth is called.
3.  **Profile Creation & Redirect**:
    *   The function **waits** (`await`) to create a user profile document in `/users/{userId}` with `role: 'doctor'`.
    *   **Only after the profile is successfully created**, the function programmatically redirects the user to the `/provider` dashboard.
    *   This two-step process (create profile, then redirect) is critical to prevent race conditions where the dashboard queries for data before the user's role has been established in Firestore.

## Security Rules for Testing

For development and testing, the `firestore.rules` file is set to be completely permissive for any authenticated user.

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This rule allows any logged-in user (including anonymous test providers) to read and write any document in the database, eliminating permission-denied errors during development. **This is not secure and must be replaced with proper role-based rules before deploying to production.**
