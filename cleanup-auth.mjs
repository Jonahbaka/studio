import { Client, Users, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env.local') });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const users = new Users(client);
const databases = new Databases(client);

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const USERS_COLLECTION_ID = 'zumacollection';

async function deleteAllUsers() {
    console.log('--- Deleting All Users ---');
    try {
        let count = 0;
        let hasMore = true;

        while (hasMore) {
            const list = await users.list([Query.limit(100)]);
            if (list.users.length === 0) {
                hasMore = false;
                break;
            }

            for (const user of list.users) {
                try {
                    await users.delete(user.$id);
                    console.log(`Deleted user: ${user.email} (${user.$id})`);
                    count++;
                } catch (err) {
                    console.error(`Failed to delete user ${user.$id}:`, err.message);
                }
            }
        }
        console.log(`Total users deleted: ${count}`);
    } catch (error) {
        console.error('Error listing users:', error.message);
    }
}

async function deleteAllUserDocuments() {
    console.log('\n--- Deleting All User Documents ---');
    try {
        let count = 0;
        let hasMore = true;

        while (hasMore) {
            const list = await databases.listDocuments(
                DATABASE_ID,
                USERS_COLLECTION_ID,
                [Query.limit(100)]
            );

            if (list.documents.length === 0) {
                hasMore = false;
                break;
            }

            for (const doc of list.documents) {
                try {
                    await databases.deleteDocument(DATABASE_ID, USERS_COLLECTION_ID, doc.$id);
                    console.log(`Deleted document: ${doc.$id}`);
                    count++;
                } catch (err) {
                    console.error(`Failed to delete document ${doc.$id}:`, err.message);
                }
            }
        }
        console.log(`Total documents deleted: ${count}`);
    } catch (error) {
        console.error('Error listing documents:', error.message);
    }
}

async function main() {
    console.log('Starting Cleanup...');
    await deleteAllUsers();
    await deleteAllUserDocuments();
    console.log('\nCleanup Complete!');
}

main();
