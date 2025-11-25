'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Paperclip, Image as ImageIcon, File } from 'lucide-react';
import { Message } from '@/types/schema';
import { format } from 'date-fns';

export default function ChatPage() {
    const { chatId } = useParams();
    const firestore = useFirestore();
    const { user } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [otherParticipant, setOtherParticipant] = useState<{ displayName: string; photoURL?: string } | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!firestore || !user || !chatId) return;

        // Fetch chat metadata to get other participant
        const fetchChatMetadata = async () => {
            const chatDoc = await getDoc(doc(firestore, 'chats', chatId as string));
            if (chatDoc.exists()) {
                const chatData = chatDoc.data();
                const otherId = chatData.participants.find((id: string) => id !== user.uid);
                if (otherId) {
                    const userDoc = await getDoc(doc(firestore, 'users', otherId));
                    if (userDoc.exists()) {
                        setOtherParticipant(userDoc.data() as any);
                    }
                }
            }
        };
        fetchChatMetadata();

        // Subscribe to messages
        const q = query(
            collection(firestore, 'chats', chatId as string, 'messages'),
            orderBy('timestamp', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp?.toDate() || new Date(),
            } as Message));
            setMessages(fetchedMessages);

            // Mark as read
            // This should ideally be debounced or handled more carefully to avoid write spam
        });

        return () => unsubscribe();
    }, [firestore, user, chatId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newMessage.trim() || !firestore || !user || !chatId) return;

        const messageContent = newMessage.trim();
        setNewMessage('');

        try {
            // Add message to subcollection
            await addDoc(collection(firestore, 'chats', chatId as string, 'messages'), {
                senderId: user.uid,
                content: messageContent,
                type: 'text',
                timestamp: serverTimestamp(),
                readBy: [user.uid]
            });

            // Update chat metadata
            await updateDoc(doc(firestore, 'chats', chatId as string), {
                lastMessage: {
                    content: messageContent,
                    senderId: user.uid,
                    timestamp: serverTimestamp(),
                    readBy: [user.uid]
                },
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <header className="border-b p-4 flex items-center gap-4 bg-background z-10">
                <Avatar>
                    <AvatarImage src={otherParticipant?.photoURL} />
                    <AvatarFallback>{otherParticipant?.displayName?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="font-semibold">{otherParticipant?.displayName || 'Chat'}</h2>
                    <p className="text-xs text-muted-foreground">Active now</p>
                </div>
            </header>

            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map((msg) => {
                        const isMe = msg.senderId === user?.uid;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] rounded-lg p-3 ${isMe ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                    {msg.type === 'text' && <p>{msg.content}</p>}
                                    {msg.type === 'image' && (
                                        <div className="space-y-2">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={msg.attachmentUrl} alt="Attachment" className="rounded-md max-h-48 object-cover" />
                                            <p>{msg.content}</p>
                                        </div>
                                    )}
                                    <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                        {format(msg.timestamp, 'p')}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={scrollRef} />
                </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Button type="button" variant="ghost" size="icon">
                        <Paperclip className="h-5 w-5" />
                    </Button>
                    <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        className="flex-1"
                    />
                    <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                        <Send className="h-5 w-5" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
