# **App Name**: ZumaTeledocAI

## Core Features:

- HIPAA Compliant Telehealth Platform: Provides a secure telehealth platform that adheres to HIPAA regulations for patient data protection, integrating DoseSpot ePrescribing, Stripe payments, and a robust back office.
- User Role Management: Implements a secure user role system (patient, doctor, nurse, pharmacist, staff, admin, superadmin) with Firebase Auth, custom claims, MFA, and license approval workflows.
- Unified Patient Chart: Provides a secure PHI view with client-side encryption using WebCrypto API. Includes demographics, visit history, messaging, prescriptions, lab results, treatment plans, allergies, insurance, and consent forms.
- Provider Dashboard: A dashboard for doctors and nurses featuring today's schedule with Google Calendar sync, virtual waiting room queue, video room button, DoseSpot ePrescribe iframe with SSO, an AI-generated SOAP note tool (accept/edit), and quick Rx templates. The AI generates a SOAP note tool from the patient history to allow the doctor to accept or edit it.
- Admin and Staff Tools: Provides real-time revenue dashboard, Gold Membership management, refund processor, license approval queue, compliance monitor, user impersonation (with audit log), broadcast notification tool, and HIPAA-compliant CSV export of patient data.
- AI-Powered Diagnosis: Uses Gemini 2.0 Flash + Med-PaLM to provide AI-assisted diagnoses during patient visits, helping clinicians make more informed decisions as a diagnostic tool.
- Real-time Patient Chart Search: Offers instant, secure, HIPAA-safe search across all patients. Enables search by full name, phone, email, DOB, MRN. The search is Firestore-powered instant search using Algolia Firebase Extension, ensuring comprehensive and compliant data retrieval.
- Google Calendar Two-Way Sync: Integrates real-time calendar sync for doctors & nurses, managing schedules between ZumaTeledoc and their Google Calendar, minimizing conflicts, and enhancing schedule management.
- Secure Sign-up/Login Logic: Robust and secure sign-up/login logic using Email/password, Phone OTP, and Google/Apple authentication. Clinical roles (doctor/nurse/pharmacist) require email verification and MFA. Includes license number + NPI upload (stored encrypted in Storage), admin manual approval workflow (/licenseRequests), and auto custom claim assignment only after approval.
- Robust Back Office: Restricted access to doctor, nurse, staff, admin, superadmin roles. Features a Unified Patient Chart with encrypted PHI decrypted client-side (WebCrypto API). Tabs include Demographics, Visit History (all past visits + recordings), Messages (E2EE), Prescriptions (DoseSpot status), Lab Results (upload PDF/image), Treatment Plans (AI + clinician co-created), Allergies & Conditions, Insurance Card (encrypted Storage), and Consent Forms (DocuSign or built-in signature pad).
- Arbitrage Engine: Automatically routes prescriptions to the cheapest compliant pharmacy, optimizing cost savings for patients.
- DoseSpot ePrescribing Integration: Fully integrated DoseSpot ePrescribing with Secret Manager keys. Includes /api/dosespot/sso for iframe in back office, auto-population of pharmacy NPI from arbitrage engine, and webhook for real-time Rx status in patient chart.
- Stripe Payment Integration: Fully integrated Stripe payment system supporting cards, ACH, Apple/Google Pay. Includes Gold $99/yr recurring billing and manual bank transfer fallback (details shown post-checkout).
- Homepage: Engaging homepage with ED hero section, Gold banner, treatments carousel, and robust footer to attract and inform users.
- Contact Page: Contact page featuring a form and live chat for user support and inquiries.
- Patient Portal: Patient Portal (/app) for managing visits, orders, treatment plans, and account settings.
- Provider Portal: Provider Portal (/provider) for managing queue, video consultations, and ePrescribing.
- Back Office: Back Office (/backoffice) providing full PHI access and admin tools for comprehensive management.
- Video + E2EE Messaging: Secure video consultations and end-to-end encrypted messaging using 100ms + encrypted Firestore for secure communication.
- Audit and Activity Log: Every PHI access logged in immutable /auditLog. “Last accessed by Dr. Smith at 14:32” displayed on patient chart.

## Style Guidelines:

- Primary color: Deep blue (#293B5F), chosen for its association with trust and professionalism, essential in healthcare.
- Background color: Light gray (#E5E7EB), provides a clean, modern backdrop that is easy on the eyes for extended use.
- Accent color: Teal (#3D9480), a subtle complementary color which invokes feelings of healing, and provides necessary contrast without overwhelming the user. This color would be appropriate for elements such as the active video button.
- Headline font: 'Belleza', a sans-serif typeface lending an artful, modern aesthetic suitable for the fields of fashion and design.
- Body font: 'Alegreya', a serif font which conveys both intellectual sophistication and legibility, an ideal pairing to the title font for use in paragraph form.
- Use flat, minimalist icons in the teal accent color for a modern and professional feel.
- Clean, card-based layout with ample whitespace for readability and easy navigation.
- Subtle transitions and animations to guide users through the platform without being intrusive.