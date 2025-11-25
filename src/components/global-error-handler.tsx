'use client';

import { useEffect } from 'react';

// Apply console override immediately at module load (before component mounts)
const originalConsoleError = console.error;

// Override console.error globally to suppress auth-related errors
console.error = (...args: any[]) => {
    const errorString = args.map(arg => String(arg)).join(' ').toLowerCase();

    // Suppress common auth errors
    const isAuthError =
        errorString.includes('invalid credentials') ||
        errorString.includes('appwriteexception') ||
        errorString.includes('401') ||
        errorString.includes('unauthorized') ||
        errorString.includes('check the email and password');

    if (!isAuthError) {
        originalConsoleError.apply(console, args);
    }
};

export function GlobalErrorHandler() {
    useEffect(() => {
        // Handle unhandled promise rejections
        const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
            const error = event.reason;
            const errorMessage = String(error?.message || error || '').toLowerCase();

            // Check if it's an auth error
            const isAuthError =
                error?.code === 401 ||
                errorMessage.includes('invalid credentials') ||
                errorMessage.includes('unauthorized') ||
                errorMessage.includes('authentication');

            if (isAuthError) {
                // Suppress auth errors completely
                event.preventDefault();
                return;
            }

            // For other errors, prevent default to avoid "Uncaught" but don't log
            event.preventDefault();
        };

        // Handle uncaught errors
        const handleError = (event: ErrorEvent) => {
            const errorMessage = String(event.error?.message || '').toLowerCase();

            const isAuthError =
                errorMessage.includes('invalid credentials') ||
                errorMessage.includes('unauthorized');

            if (isAuthError) {
                event.preventDefault();
                return;
            }

            // Prevent error from breaking the app
            event.preventDefault();
        };

        window.addEventListener('unhandledrejection', handleUnhandledRejection);
        window.addEventListener('error', handleError);

        return () => {
            window.removeEventListener('unhandledrejection', handleUnhandledRejection);
            window.removeEventListener('error', handleError);
        };
    }, []);

    return null;
}
