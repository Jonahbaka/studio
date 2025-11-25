'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Models } from 'appwrite';
import { getAccount, getDatabases, getAppwriteClient } from './config';

interface AppwriteContextState {
    user: Models.User<Models.Preferences> | null;
    isLoading: boolean;
    error: Error | null;
}

const AppwriteContext = createContext<AppwriteContextState | undefined>(undefined);

interface AppwriteProviderProps {
    children: ReactNode;
}

export function AppwriteProvider({ children }: AppwriteProviderProps) {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const account = getAccount();
            const session = await account.get();
            setUser(session);
            setError(null);
        } catch (err) {
            setUser(null);
            // Don't set error for missing session - this is expected for logged out users
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <AppwriteContext.Provider value={{ user, isLoading, error }}>
            {children}
        </AppwriteContext.Provider>
    );
}

// Hook to access Appwrite context
export function useAppwrite() {
    const context = useContext(AppwriteContext);
    if (context === undefined) {
        throw new Error('useAppwrite must be used within AppwriteProvider');
    }
    return context;
}

// Hook to access account (user)  
export function useAccount() {
    const { user, isLoading, error } = useAppwrite();
    return { user, isUserLoading: isLoading, userError: error };
}

// Hook to access databases instance
export function useDatabase() {
    return getDatabases();
}

// Hook to access Appwrite client
export function useAppwriteClient() {
    return getAppwriteClient();
}
