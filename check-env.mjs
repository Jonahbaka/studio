import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

console.log('Checking Environment Variables...');
console.log('NEXT_PUBLIC_APPWRITE_ENDPOINT:', process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT);
console.log('NEXT_PUBLIC_APPWRITE_PROJECT_ID:', process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);
console.log('NEXT_PUBLIC_APPWRITE_DATABASE_ID:', process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID);
console.log('APPWRITE_API_KEY Present:', !!process.env.APPWRITE_API_KEY);
if (process.env.APPWRITE_API_KEY) {
    console.log('APPWRITE_API_KEY Length:', process.env.APPWRITE_API_KEY.length);
} else {
    console.log('WARNING: APPWRITE_API_KEY is missing. Cannot perform server-side cleanup.');
}
