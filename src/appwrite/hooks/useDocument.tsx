'use client';

import { useState, useEffect } from 'react';
import { Models } from 'appwrite';
import { getDatabases, APPWRITE_DATABASE_ID } from '../config';

interface UseDocumentResult<T> {
    data: T | null;
    isLoading: boolean;
    error: Error | null;
}

export function useDocument<T = any>(
    collectionId: string,
    documentId: string | null | undefined
): UseDocumentResult<T> {
    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!documentId || typeof documentId !== 'string') {
            setData(null);
            setIsLoading(false);
            setError(null);
            return;
        }

        const databases = getDatabases();
        let unsubscribed = false;

        async function fetchDocument() {
            try {
                setIsLoading(true);
                const response = await databases.getDocument(
                    APPWRITE_DATABASE_ID,
                    collectionId,
                    documentId
                );

                if (!unsubscribed) {
                    setData(response as unknown as T);
                    setError(null);
                }
            } catch (err) {
                if (!unsubscribed) {
                    setError(err as Error);
                    setData(null);
                }
            } finally {
                if (!unsubscribed) {
                    setIsLoading(false);
                }
            }
        }

        // Subscribe to realtime updates
        const client = getDatabases().client;
        const unsubscribe = client.subscribe(
            `databases.${APPWRITE_DATABASE_ID}.collections.${collectionId}.documents.${documentId}`,
            (response) => {
                if (response.events.includes('databases.*.collections.*.documents.*.update')) {
                    setData(response.payload as unknown as T);
                } else if (response.events.includes('databases.*.collections.*.documents.*.delete')) {
                    setData(null);
                }
            }
        );

        fetchDocument();

        return () => {
            unsubscribed = true;
            unsubscribe();
        };
    }, [collectionId, documentId]);

    return { data, isLoading, error };
}
