'use client';

import { useEffect, useState } from 'react';
import { useFirebase, useUser } from '@/firebase';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { getToken, onMessage, Messaging } from 'firebase/messaging';

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function useNotifications() {
    const { firestore, messaging } = useFirebase();
    const { user } = useUser();
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [fcmToken, setFcmToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Request notification permission
    const requestPermission = async () => {
        try {
            if (!('Notification' in window)) {
                throw new Error('This browser does not support notifications');
            }

            if (!messaging) {
                throw new Error('Firebase Messaging not initialized');
            }

            const permission = await Notification.requestPermission();
            setPermission(permission);

            if (permission === 'granted') {
                await registerFCMToken();
            }

            return permission;
        } catch (err: any) {
            setError(err.message);
            console.error('Failed to request notification permission:', err);
            throw err;
        }
    };

    // Register FCM token
    const registerFCMToken = async () => {
        if (!user || !messaging || !firestore || !VAPID_KEY) return;

        try {
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            setFcmToken(token);

            // Store token in Firestore
            const tokenRef = doc(firestore, `users/${user.uid}/tokens`, token);
            const tokenDoc = await getDoc(tokenRef);

            await setDoc(
                tokenRef,
                {
                    token,
                    device: getDeviceInfo(),
                    createdAt: tokenDoc.exists() ? tokenDoc.data()?.createdAt : serverTimestamp(),
                    lastUsed: serverTimestamp(),
                },
                { merge: true }
            );

            console.log('FCM token registered:', token);
        } catch (err) {
            console.error('Failed to register FCM token:', err);
            setError('Failed to register for notifications');
        }
    };

    // Listen for foreground messages
    useEffect(() => {
        if (!messaging) return;

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log('Foreground message received:', payload);

            // Show notification using Notification API
            if (payload.notification) {
                const { title, body, icon } = payload.notification;
                new Notification(title || 'New Notification', {
                    body: body || '',
                    icon: icon || '/logo.png',
                    tag: payload.messageId,
                    data: payload.data,
                });
            }
        });

        return () => unsubscribe();
    }, [messaging]);

    // Auto-request permission on mount if user is logged in
    useEffect(() => {
        if (user && permission === 'default') {
            // Don't auto-request, let user click a button
            // requestPermission();
        }
    }, [user, permission]);

    // Update permission state
    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    return {
        permission,
        fcmToken,
        error,
        requestPermission,
        isSupported: !!messaging && 'Notification' in window,
    };
}

function getDeviceInfo(): string {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'mobile';
    if (/tablet/i.test(ua)) return 'tablet';
    return 'desktop';
}
