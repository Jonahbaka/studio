import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { getMessaging } from 'firebase-admin/messaging';
import { getFirebaseAdminApp } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, userIds, topic, title, message, data, actionUrl } = body;

        if (!title || !message) {
            return NextResponse.json(
                { error: 'Title and message are required' },
                { status: 400 }
            );
        }

        const messaging = getMessaging(getFirebaseAdminApp());
        const results = [];

        // Send to a single user
        if (userId) {
            const tokens = await getUserFCMTokens(userId);
            if (tokens.length > 0) {
                const result = await messaging.sendEachForMulticast({
                    tokens,
                    notification: {
                        title,
                        body: message,
                    },
                    data: data || {},
                    webpush: actionUrl
                        ? {
                            fcmOptions: {
                                link: actionUrl,
                            },
                        }
                        : undefined,
                });
                results.push({ userId, success: result.successCount, failed: result.failureCount });
            }
        }

        // Send to multiple users
        if (userIds && Array.isArray(userIds)) {
            for (const uid of userIds) {
                const tokens = await getUserFCMTokens(uid);
                if (tokens.length > 0) {
                    const result = await messaging.sendEachForMulticast({
                        tokens,
                        notification: {
                            title,
                            body: message,
                        },
                        data: data || {},
                        webpush: actionUrl
                            ? {
                                fcmOptions: {
                                    link: actionUrl,
                                },
                            }
                            : undefined,
                    });
                    results.push({ userId: uid, success: result.successCount, failed: result.failureCount });
                }
            }
        }

        // Send to a topic
        if (topic) {
            const result = await messaging.send({
                topic,
                notification: {
                    title,
                    body: message,
                },
                data: data || {},
                webpush: actionUrl
                    ? {
                        fcmOptions: {
                            link: actionUrl,
                        },
                    }
                    : undefined,
            });
            results.push({ topic, messageId: result });
        }

        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error('Send notification error:', error);
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}

async function getUserFCMTokens(userId: string): Promise<string[]> {
    const tokensSnapshot = await adminDb
        .collection(`users/${userId}/tokens`)
        .get();

    return tokensSnapshot.docs.map((doc) => doc.data().token);
}
