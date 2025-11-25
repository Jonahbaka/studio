'use client';

import { useState, useEffect } from 'react';
import { Models } from 'appwrite';
import { getDatabases, APPWRITE_DATABASE_ID } from '../config';

interface UseDocumentsResult<T> {
    data: T[];
    isLoading: boolean;
    error: Error | null;
}

export function useDocuments<T = any>(
    collectionId: string,
    queries: string[] = []
): UseDocumentsResult<T> {
    const [data, setData] = useState<T[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const databases = getDatabases();
        let unsubscribed = false;

        async function fetchDocuments() {
            try {
                setIsLoading(true);
                const response = await databases.listDocuments(
                    APPWRITE_DATABASE_ID,
                    collectionId,
                    queries
                );

                if (!unsubscribed) {
                    setData(response.documents as unknown as T[]);
                    setError(null);
                }
            } catch (err) {
                if (!unsubscribed) {
                    setError(err as Error);
                    setData([]);
                }
            } finally {
                if (!unsubscribed) {
                    setIsLoading(false);
                }
            }
        }

        // Subscribe to realtime updates for the collection
        const client = getDatabases().client;
        const unsubscribe = client.subscribe(
            `databases.${APPWRITE_DATABASE_ID}.collections.${collectionId}.documents`,
            (response) => {
                // Re-fetch on any document change
                fetchDocuments();
            }
        );

        fetchDocuments();

        return () => {
            unsubscribed = true;
            unsubscribe();
        };
    }, [collectionId, JSON.stringify(queries)]);

    return { data, isLoading, error };
}
