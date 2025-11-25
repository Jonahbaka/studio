'use client';

import { useState } from 'react';
import { ID, Permission, Role } from 'appwrite';
import { getAccount, getDatabases, APPWRITE_DATABASE_ID, COLLECTION_IDS } from '../config';
import { Models } from 'appwrite';

export interface SignupData {
    email: string;
    password: string;
    name: string;
    role?: 'patient' | 'provider' | 'admin';
    additionalData?: Record<string, any>;
}

export function useAuth() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const signup = async ({ email, password, name, role = 'patient', additionalData = {} }: SignupData) => {
        setIsLoading(true);
        setError(null);

        try {
            const account = getAccount();
            const databases = getDatabases();

            // Create account
            const user = await account.create(ID.unique(), email, password, name);

            // Create session immediately after signup
            await account.createEmailPasswordSession(email, password);

            // Create user document in database
            await databases.createDocument(
                APPWRITE_DATABASE_ID,
                COLLECTION_IDS.USERS,
                user.$id,
                {
                    email,
                    displayName: name,
                    role,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    isVerified: false,
                    ...additionalData,
                },
                [
                    Permission.read(Role.user(user.$id)),
                    Permission.update(Role.user(user.$id)),
                ]
            );

            return user;
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const account = getAccount();
            const session = await account.createEmailPasswordSession(email, password);
            return session;
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const account = getAccount();
            await account.deleteSession('current');
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const resetPassword = async (email: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const account = getAccount();
            await account.createRecovery(
                email,
                `${window.location.origin}/reset-password`
            );
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const updatePassword = async (newPassword: string, oldPassword: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const account = getAccount();
            await account.updatePassword(newPassword, oldPassword);
        } catch (err: any) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        signup,
        login,
        logout,
        resetPassword,
        updatePassword,
        isLoading,
        error,
    };
}
