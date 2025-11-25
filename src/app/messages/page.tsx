'use client';

import { useEffect, useState } from 'react';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, where, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Chat } from '@/types/schema';
import { formatDistanceToNow } from 'date-fns';
import { Loader2, MessageSquare } from 'lucide-react';

interface ChatWithParticipant extends Chat {
    otherParticipant?: {
        displayName: string;
        photoURL?: string;
    };
}

export default function MessagesPage() {
    const firestore = useFirestore();
    const { user } = useUser();
    const [chats, setChats] = useState<ChatWithParticipant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!firestore || !user) return;

        const q = query(
            collection(firestore, 'chats'),
            where('participants', 'array-contains', user.uid),
            orderBy('updatedAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const fetchedChats = await Promise.all(snapshot.docs.map(async (chatDoc) => {
                const chatData = chatDoc.data() as Chat;
                const otherId = chatData.participants.find(id => id !== user.uid);

                let otherParticipant = { displayName: 'Unknown User', photoURL: undefined };
                if (otherId) {
                    const userDoc = await getDoc(doc(firestore, 'users', otherId));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        otherParticipant = {
                            displayName: userData.displayName,
                            photoURL: userData.photoURL
                        };
                    }
                }

                return {
                    ...chatData,
                    id: chatDoc.id,
                    updatedAt: chatData.updatedAt ? (chatData.updatedAt as any).toDate() : new Date(),
                    otherParticipant
                };
            }));
            setChats(fetchedChats);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [firestore, user]);

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Messages</h1>

            {chats.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mb-4" />
                        <p>No messages yet.</p>
                        <Button variant="link" asChild className="mt-2">
                            <Link href="/appointments/book">Book an appointment to start chatting</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {chats.map(chat => (
                        <Link key={chat.id} href={`/messages/${chat.id}`}>
                            <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={chat.otherParticipant?.photoURL} />
                                        <AvatarFallback>{chat.otherParticipant?.displayName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 overflow-hidden">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-semibold">{chat.otherParticipant?.displayName}</h3>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                {formatDistanceToNow(chat.updatedAt, { addSuffix: true })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {chat.lastMessage?.senderId === user?.uid ? 'You: ' : ''}
                                            {chat.lastMessage?.content || 'No messages yet'}
                                        </p>
                                    </div>
                                    {chat.lastMessage && !chat.lastMessage.readBy.includes(user!.uid) && (
                                        <div className="h-3 w-3 bg-blue-500 rounded-full" />
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
