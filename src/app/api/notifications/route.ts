import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Notification } from '@/types/schema';

// GET - Fetch notifications for a user
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const userId = searchParams.get('userId');
        const unreadOnly = searchParams.get('unreadOnly') === 'true';

        if (!userId) {
            return NextResponse.json(
                { error: 'userId is required' },
                { status: 400 }
            );
        }

        let query = adminDb
            .collection('notifications')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .limit(50);

        if (unreadOnly) {
            query = query.where('read', '==', false) as any;
        }

        const snapshot = await query.get();
        const notifications = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate(),
            expiresAt: doc.data().expiresAt?.toDate(),
        }));

        return NextResponse.json({ notifications });
    } catch (error) {
        console.error('Fetch notifications error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
    try {
        const notification: Omit<Notification, 'id'> = await request.json();

        if (!notification.userId || !notification.title || !notification.message) {
            return NextResponse.json(
                { error: 'userId, title, and message are required' },
                { status: 400 }
            );
        }

        const docRef = await adminDb.collection('notifications').add({
            ...notification,
            createdAt: new Date(),
            read: false,
        });

        return NextResponse.json({ id: docRef.id, ...notification });
    } catch (error) {
        console.error('Create notification error:', error);
        return NextResponse.json(
            { error: 'Failed to create notification' },
            { status: 500 }
        );
    }
}

// PATCH - Mark notification as read/unread
export async function PATCH(request: NextRequest) {
    try {
        const { notificationId, read } = await request.json();

        if (!notificationId) {
            return NextResponse.json(
                { error: 'notificationId is required' },
                { status: 400 }
            );
        }

        await adminDb
            .collection('notifications')
            .doc(notificationId)
            .update({ read: read !== undefined ? read : true });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update notification error:', error);
        return NextResponse.json(
            { error: 'Failed to update notification' },
            { status: 500 }
        );
    }
}

// DELETE -Delete a notification
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const notificationId = searchParams.get('notificationId');

        if (!notificationId) {
            return NextResponse.json(
                { error: 'notificationId is required' },
                { status: 400 }
            );
        }

        await adminDb.collection('notifications').doc(notificationId).delete();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete notification error:', error);
        return NextResponse.json(
            { error: 'Failed to delete notification' },
            { status: 500 }
        );
    }
}
