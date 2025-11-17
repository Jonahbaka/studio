
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, updateDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Loader2, Video, Mic, MessageSquare, PhoneOff, AlertTriangle, VideoOff, MicOff, Send, X, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';


type Message = {
    id?: string;
    senderId: string;
    senderName: string;
    text: string;
    timestamp: any;
};

// This page now handles the dynamic route `/app/visit/[userId]/[visitId]`
// Note: userId in the path is now mainly for URL consistency, the visitId is the source of truth.
export default function VisitPage() {
    const params = useParams();
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const visitId = Array.isArray(params.visitDetails) ? params.visitDetails[1] : null;

    const visitRef = useMemoFirebase(() => 
        firestore && visitId ? doc(firestore, 'visits', visitId) : null,
        [firestore, visitId]
    );
    const { data: visit, isLoading: isVisitLoading, error: visitError } = useDoc(visitRef);

    const messagesRef = useMemoFirebase(() =>
        firestore && visitId ? query(collection(firestore, 'visits', visitId, 'messages'), orderBy('timestamp', 'asc')) : null,
        [firestore, visitId]
    );
    const { data: messages, isLoading: areMessagesLoading } = useCollection<Omit<Message, 'id'>>(messagesRef);

    const [hasCameraPermission, setHasCameraPermission] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [isMicMuted, setIsMicMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [visitEnded, setVisitEnded] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    // Effect to handle joining logic for providers
    useEffect(() => {
        const joinVisitAsProvider = async () => {
          // Ensure we have all necessary data and the user object
          if (!visit || !user || !firestore || !visitRef) {
            return;
          }

          // Check if user is already a participant
          if (visit.participants && visit.participants[user.uid]) {
            return;
          }

          // Fetch user's role to confirm they are a provider
          const userDocRef = doc(firestore, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const isProvider = ['doctor', 'nurse', 'admin'].includes(userData.role);

            // Check if the current user is a provider and the visit is waiting
            if (isProvider && visit.status === 'Waiting') {
              console.log(`Provider ${user.uid} attempting to join visit ${visitId}.`);
              try {
                // Add the provider to the participants list and update status
                await updateDoc(visitRef, {
                    [`participants.${user.uid}`]: true,
                    status: 'In Progress',
                    providerId: user.uid,
                    providerName: user.displayName || userData.firstName || 'Provider'
                });
                toast({
                    title: "You've joined the visit",
                    description: `Connecting you with ${visit.patientName}.`
                })
              } catch (e: any) {
                console.error("Failed to update visit document:", e);
                toast({
                    variant: 'destructive',
                    title: 'Failed to Join',
                    description: 'Could not update visit status. Please try again.'
                });
              }
            }
          }
        };

        joinVisitAsProvider();
    }, [visit, user, visitRef, firestore, toast, visitId]);


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const getCameraPermission = async () => {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            setHasCameraPermission(true);
    
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
            }
          } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
              variant: 'destructive',
              title: 'Camera Access Denied',
              description: 'Please enable camera permissions in your browser to join the visit.',
            });
          }
        };
    
        getCameraPermission();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        }
      }, [toast]);

    const handleHangUp = async () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setVisitEnded(true);

        // If the current user is a provider, mark the visit as completed.
        if (visit?.providerId === user?.uid && visitRef) {
            try {
                await updateDoc(visitRef, { status: 'Completed' });
            } catch (error) {
                console.error("Error updating visit status:", error);
            }
        }
    };
    
    const handleReturnToDashboard = () => {
        // Redirect based on role
        if (visit?.providerId === user?.uid) {
            router.push('/provider/queue');
        } else {
            router.push('/app/visits');
        }
    };

    const toggleAudio = () => {
        if (streamRef.current) {
            streamRef.current.getAudioTracks().forEach(track => {
                track.enabled = !track.enabled;
                setIsMicMuted(!track.enabled);
            });
        }
    };

    const toggleVideo = () => {
        if (streamRef.current) {
            streamRef.current.getVideoTracks().forEach(track => {
                track.enabled = !track.enabled;
                setIsCameraOff(!track.enabled);
            });
        }
    };
    
    const handleSendMessage = async () => {
        if (messageInput.trim() === '' || !user || !firestore || !visitId) return;
        
        const newMessage: Omit<Message, 'id'> = {
            senderId: user.uid,
            senderName: user.displayName || 'User',
            text: messageInput.trim(),
            timestamp: serverTimestamp()
        };

        const messagesCollection = collection(firestore, 'visits', visitId, 'messages');

        try {
            await addDoc(messagesCollection, newMessage);
            setMessageInput('');
        } catch(error: any) {
            console.error("Error sending message:", error);
            toast({
                variant: 'destructive',
                title: "Message Failed",
                description: "Could not send your message. Please try again."
            })
        }
    };
    
    const isLoading = isVisitLoading || areMessagesLoading;
    const isWaiting = visit?.status === 'Waiting';

    if (isLoading && !visit) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin" /></div>;
    }

    if (visitError) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{visitError.message}</AlertDescription>
            </Alert>
        );
    }
    
    const providerAvatar = PlaceHolderImages.find(p => p.id === 'doctor2');

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)] bg-background relative overflow-hidden">
            <div className="flex-1 flex flex-col relative">
                {/* Header for Visit Info */}
                 <header className="flex-shrink-0 p-2 sm:p-4 bg-primary text-primary-foreground">
                    <div className="flex flex-row items-center gap-4">
                         <Button variant="ghost" size="icon" className="shrink-0 hover:bg-primary-foreground/10" onClick={handleReturnToDashboard}>
                            <ArrowLeft />
                        </Button>
                        <div className="flex-grow">
                            <h1 className="text-lg font-semibold">Your Visit</h1>
                            <p className="text-sm text-primary-foreground/80">Reason: {visit?.reason || 'Loading...'}</p>
                        </div>
                         <div className="hidden md:flex items-center gap-4 text-sm">
                            <div>
                                <span className="font-semibold">Patient:</span> {visit?.patientName || '...'}
                            </div>
                             <div className="flex items-center gap-2">
                                 <span className="font-semibold">Provider:</span>
                                 <Avatar className="h-6 w-6">
                                    {providerAvatar && <AvatarImage src={providerAvatar.imageUrl} />}
                                    <AvatarFallback>DR</AvatarFallback>
                                </Avatar>
                                <span>{visit?.providerName || 'Waiting...'}</span>
                            </div>
                            {visit?.status && <Badge variant={visit.status === 'In Progress' ? "destructive" : "secondary"}>{visit.status}</Badge>}
                        </div>
                    </div>
                 </header>


                {/* Main Video Content */}
                <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative">
                    <div className="w-full max-w-4xl aspect-video bg-black rounded-lg shadow-2xl relative overflow-hidden">
                        <video ref={videoRef} className="w-full h-full object-contain" autoPlay muted playsInline />
                        
                        {(isLoading || isWaiting || visitEnded) && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                                <div className="text-center text-white p-4">
                                   {visitEnded ? (
                                       <>
                                        <h2 className="text-2xl font-headline mb-4">Visit Ended</h2>
                                        <Button onClick={handleReturnToDashboard}>
                                            <ArrowLeft className="mr-2"/>
                                            Return to Dashboard
                                        </Button>
                                       </>
                                   ) : (
                                       <>
                                        <Loader2 className="h-12 w-12 animate-spin mb-4" />
                                        <h2 className="text-2xl font-headline">{isWaiting ? 'Waiting for provider to join...' : 'Connecting...'}</h2>
                                       </>
                                   )}
                                </div>
                            </div>
                        )}

                        {!hasCameraPermission && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-10">
                                <Alert variant="destructive" className="max-w-md">
                                    <AlertTriangle />
                                    <AlertTitle>Camera Access Required</AlertTitle>
                                    <AlertDescription>
                                        Please enable camera and microphone permissions in your browser to start the visit.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </div>
                    
                     <div className={cn(
                        "flex w-full max-w-sm items-center justify-center gap-2 sm:gap-4 p-3 z-10",
                        visitEnded && "hidden"
                    )}>
                        <Button variant={isCameraOff ? "destructive" : "secondary"} size="icon" className="rounded-full h-12 w-12" onClick={toggleVideo}>
                            {isCameraOff ? <VideoOff className="h-6 w-6" /> : <Video className="h-6 w-6" />}
                        </Button>
                        <Button variant={isMicMuted ? "destructive" : "secondary"} size="icon" className="rounded-full h-12 w-12" onClick={toggleAudio}>
                            {isMicMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                        </Button>
                        <Button variant={isChatOpen ? "default" : "secondary"} size="icon" className="rounded-full h-12 w-12" onClick={() => setIsChatOpen(!isChatOpen)}>
                            <MessageSquare className="h-6 w-6" />
                        </Button>
                        <Button variant="destructive" size="icon" className="rounded-full h-14 w-14" onClick={handleHangUp}>
                            <PhoneOff className="h-7 w-7" />
                        </Button>
                    </div>
                </main>
            </div>
            
            <div className={cn(
                "fixed inset-0 z-30 bg-background/80 backdrop-blur-sm lg:hidden",
                isChatOpen ? "block" : "hidden"
            )} onClick={() => setIsChatOpen(false)} />
            
            <div className={cn(
                "fixed bottom-0 left-0 right-0 z-40 h-[75vh] transform-gpu transition-transform duration-300 ease-in-out lg:relative lg:h-full lg:w-96 lg:translate-y-0 lg:transition-none lg:border-l",
                isChatOpen ? "translate-y-0" : "translate-y-full lg:translate-y-0",
                !visitEnded && "lg:flex"
            )}>
                <Card className="w-full h-full flex flex-col rounded-t-lg lg:rounded-none shadow-none border-none">
                    <CardHeader className="flex-shrink-0 flex-row items-center justify-between">
                        <CardTitle>In-call Messages</CardTitle>
                        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsChatOpen(false)}>
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close chat</span>
                        </Button>
                    </CardHeader>
                    <Separator />
                    <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages && messages.map((msg) => {
                            const isUserSender = msg.senderId === user?.uid;
                            const timestamp = msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Sending...';

                            return isUserSender ? (
                                <div key={msg.id} className="flex items-start gap-2.5 justify-end">
                                    <div className="flex flex-col gap-1 items-end">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-semibold">You</span>
                                            <span className="text-xs text-muted-foreground">{timestamp}</span>
                                        </div>
                                        <div className="leading-1.5 p-3 border-gray-200 bg-primary text-primary-foreground rounded-s-xl rounded-ee-xl">
                                            <p className="text-sm font-normal">{msg.text}</p>
                                        </div>
                                    </div>
                                    <Avatar className="w-8 h-8">
                                        <AvatarImage src={user?.photoURL ?? ''} />
                                        <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                    </Avatar>
                                </div>
                            ) : (
                                <div key={msg.id} className="flex items-start gap-2.5">
                                    <Avatar className="w-8 h-8">
                                        {providerAvatar && <AvatarImage src={providerAvatar.imageUrl} />}
                                        <AvatarFallback>{msg.senderName?.charAt(0) || 'P'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-semibold">{msg.senderName}</span>
                                            <span className="text-xs text-muted-foreground">{timestamp}</span>
                                        </div>
                                        <div className="leading-1.5 p-3 border-gray-200 bg-secondary rounded-e-xl rounded-es-xl">
                                            <p className="text-sm font-normal">{msg.text}</p>

                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                        <div ref={chatEndRef} />
                    </CardContent>
                    <CardFooter className="p-2 border-t">
                        <form onSubmit={(e) => {e.preventDefault(); handleSendMessage();}} className="relative w-full">
                            <Textarea 
                                placeholder="Type a message..." 
                                className="pr-12" 
                                rows={1}
                                value={messageInput}
                                onChange={(e) => setMessageInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                             />
                            <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8">
                                <Send className="h-4 w-4"/>
                                <span className="sr-only">Send</span>
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}


    