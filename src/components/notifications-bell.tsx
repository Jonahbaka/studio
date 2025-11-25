'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { Notification } from '@/types/schema';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export function NotificationsBell() {
    const { user } = useUser();
    const firestore = useFirestore();
    const [notifications, setNotifications] = useState<(Notification & { id: string })[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!user || !firestore) return;

        const q = query(
            collection(firestore, 'notifications'),
            where('userId', '==', user.uid),
            orderBy('createdAt', 'desc'),
            limit(20)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
                createdAt: (doc.data().createdAt as any)?.toDate() || new Date(),
                expiresAt: (doc.data().expiresAt as any)?.toDate(),
            })) as (Notification & { id: string })[];

            setNotifications(notifs);
            setUnreadCount(notifs.filter((n) => !n.read).length);
        });

        return () => unsubscribe();
    }, [user, firestore]);

    const markAsRead = async (notificationId: string) => {
        if (!firestore) return;

        try {
            await updateDoc(doc(firestore, 'notifications', notificationId), {
                read: true,
            });
        } catch (err) {
            console.error('Failed to mark notification as read:', err);
        }
    };

    const markAllAsRead = async () => {
        const unreadNotifs = notifications.filter((n) => !n.read);
        await Promise.all(unreadNotifs.map((n) => markAsRead(n.id)));
    };

    if (!user) return null;

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className={"w-80 p-0"}>
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="font-semibold">Notifications</h3>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="text-xs"
                        >
                            Mark all as read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-50" />
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={() => markAsRead(notification.id)}
                                    onClick={() => setIsOpen(false)}
                                />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

function NotificationItem({
    notification,
    onMarkAsRead,
    onClick,
}: {
    notification: Notification & { id: string };
    onMarkAsRead: () => void;
    onClick: () => void;
}) {
    const handleClick = () => {
        if (!notification.read) {
            onMarkAsRead();
        }
        onClick();
    };

    const content = (
        <div
            className={`p-4 hover:bg-accent/50 transition-colors cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                }`}
            onClick={handleClick}
        >
            <div className="flex items-start gap-3">
                {!notification.read && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm leading-tight mb-1">
                        {notification.title}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                    </p>
                </div>
            </div>
        </div>
    );

    if (notification.actionUrl) {
        return (
            <Link href={notification.actionUrl} onClick={onClick}>
                {content}
            </Link>
        );
    }

    return content;
}
