'use client';

import { Client, Account, Databases, Storage } from 'appwrite';

// Appwrite configuration
export const APPWRITE_ENDPOINT = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://sfo.cloud.appwrite.io/v1';
export const APPWRITE_PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '6924d2650008d5581c14';
export const APPWRITE_DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '6924d4010005c14d03b7';

// Collection IDs (must match exactly in Appwrite console)
export const COLLECTION_IDS = {
    USERS: 'users',
    APPOINTMENTS: 'appointments',
    MEDICAL_RECORDS: 'medicalRecords',
    CHATS: 'chats',
    MESSAGES: 'messages',
    NOTIFICATIONS: 'notifications',
    VISITS: 'visits',
};

// Initialize Appwrite client
let client: Client | null = null;
let account: Account | null = null;
let databases: Databases | null = null;
let storage: Storage | null = null;

export function getAppwriteClient(): Client {
    if (!client) {
        client = new Client()
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID);
    }
    return client;
}

export function getAccount(): Account {
    if (!account) {
        account = new Account(getAppwriteClient());
    }
    return account;
}

export function getDatabases(): Databases {
    if (!databases) {
        databases = new Databases(getAppwriteClient());
    }
    return databases;
}

export function getStorage(): Storage {
    if (!storage) {
        storage = new Storage(getAppwriteClient());
    }
    return storage;
}

// Export instances
export { client, account, databases, storage };
