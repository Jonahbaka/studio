
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDoc, useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Loader2, Sparkles, Send, ArrowLeft, Bot, Video, CreditCard, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { assistWithDiagnosis } from '@/ai/flows/assist-with-diagnosis';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';


type Message = {
    id?: string;
    sender: 'user' | 'ai';
    text: string;
    timestamp?: any;
};

export default function AiVisitPage() {
    const params = useParams();
    const router = useRouter();
    const firestore = useFirestore();
    const { user } = useUser();
    const { toast } = useToast();

    const visitId = params.visitId as string;

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

    const [messageInput, setMessageInput] = useState('');
    const [isAiThinking, setIsAiThinking] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);
    
    const [showPaymentDialog, setShowPaymentDialog] = useState(false);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);


    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
    
    const handleSendMessage = async () => {
        if (messageInput.trim() === '' || !user || !firestore || !visitId) return;
        
        const userMessageText = messageInput.trim();
        setMessageInput('');

        const messagesCollection = collection(firestore, 'visits', visitId, 'messages');
        const userMessage: Omit<Message, 'id'> = {
            sender: 'user',
            text: userMessageText,
            timestamp: serverTimestamp()
        };
        await addDoc(messagesCollection, userMessage);

        setIsAiThinking(true);

        try {
            const history = messages?.map(m => `${m.sender === 'user' ? 'User' : 'Zuma'}: ${m.text}`).join('\n') || '';
            const aiResult = await assistWithDiagnosis({
                symptoms: userMessageText,
                patientHistory: `Previous conversation: ${history}\nReason for visit: ${visit?.reason}\nPatient notes: ${visit?.details}`
            });

            if (aiResult.potentialDiagnoses) {
                const aiMessage: Omit<Message, 'id'> = {
                    sender: 'ai',
                    text: aiResult.potentialDiagnoses,
                    timestamp: serverTimestamp()
                };
                await addDoc(messagesCollection, aiMessage);
            } else {
                throw new Error("AI did not return a valid response.");
            }

        } catch(error: any) {
            console.error("Error with AI diagnosis:", error);
            const errorMessage: Omit<Message, 'id'> = {
                sender: 'ai',
                text: "I'm sorry, but I encountered an error and can't provide a response right now. Please try again later.",
                timestamp: serverTimestamp()
            };
            await addDoc(messagesCollection, errorMessage);
            toast({
                variant: 'destructive',
                title: "AI Error",
                description: "Could not get a response from the AI assistant."
            })
        } finally {
            setIsAiThinking(false);
        }
    };
    
    const handleConfirmPaymentAndBook = async () => {
        if (!user || !visit || !visitRef) {
            toast({ variant: 'destructive', title: 'Authentication Error' });
            return;
        }
        
        setIsProcessingPayment(true);

        try {
            // Redirect to our new checkout page, passing the visitId
            router.push(`/checkout?visitId=${visitId}`);

        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Booking Failed',
                description: error.message || 'Could not start the payment process. Please try again.',
            });
            setIsProcessingPayment(false);
            setShowPaymentDialog(false);
        }
    };
    
    const isLoading = isVisitLoading || areMessagesLoading;

    if (isLoading && !visit) {
        return (
            <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center p-4">
                <Loader2 className="animate-spin h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Loading your AI consultation...</p>
            </div>
        );
    }

    if (visitError) {
        return (
             <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center p-4">
                <Alert variant="destructive" className="max-w-md">
                    <AlertTitle>Error Loading Visit</AlertTitle>
                    <AlertDescription>{visitError.message}</AlertDescription>
                </Alert>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center h-[calc(100vh-4rem)] bg-secondary p-4">
            <Card className="w-full max-w-2xl h-full flex flex-col">
                <CardHeader className="flex-shrink-0 flex-row items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2"><Sparkles className="text-accent"/> AI Symptom Checker</CardTitle>
                        <p className="text-sm text-muted-foreground">This is an AI assistant and does not provide medical advice.</p>
                    </div>
                    <Button variant="ghost" asChild>
                        <Link href="/app/visits"><ArrowLeft className="mr-2"/> End Session</Link>
                    </Button>
                </CardHeader>
                <Separator />
                <CardContent className="flex-1 p-4 overflow-y-auto space-y-4">
                    {messages && messages.map((msg, index) => {
                        const isUser = msg.sender === 'user';
                        const timestamp = msg.timestamp?.toDate ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';
                        return isUser ? (
                             <div key={index} className="flex items-start gap-2.5 justify-end">
                                <div className="flex flex-col gap-1 items-end">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-semibold">You</span>
                                        <span className="text-xs text-muted-foreground">{timestamp}</span>
                                    </div>
                                    <div className="leading-1.5 p-3 border-gray-200 bg-primary text-primary-foreground rounded-s-xl rounded-ee-xl">
                                        <p className="text-sm font-normal whitespace-pre-wrap">{msg.text}</p>
                                    </div>
                                </div>
                                <Avatar className="w-8 h-8">
                                    <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
                                </Avatar>
                            </div>
                        ) : (
                            <div key={index} className="flex items-start gap-2.5">
                                <Avatar className="w-8 h-8 bg-accent text-accent-foreground flex items-center justify-center">
                                    <Bot className="h-5 w-5"/>
                                </Avatar>
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm font-semibold">AI Assistant</span>
                                        <span className="text-xs text-muted-foreground">{timestamp}</span>
                                    </div>
                                    <div className="leading-1.5 p-3 border-gray-200 bg-secondary rounded-e-xl rounded-es-xl">
                                        <pre className="text-sm font-body font-normal whitespace-pre-wrap bg-transparent p-0 m-0">{msg.text}</pre>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    {isAiThinking && (
                         <div className="flex items-start gap-2.5">
                            <Avatar className="w-8 h-8 bg-accent text-accent-foreground flex items-center justify-center">
                                <Bot className="h-5 w-5"/>
                            </Avatar>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-semibold">AI Assistant</span>
                                </div>
                                <div className="leading-1.5 p-3 border-gray-200 bg-secondary rounded-e-xl rounded-es-xl">
                                    <p className="text-sm font-normal flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4"/> Thinking...</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </CardContent>
                 <div className="p-4 border-t">
                    <Button onClick={() => setShowPaymentDialog(true)} className="w-full">
                        <Video className="mr-2" />
                        Book Video Visit with a Doctor Now
                    </Button>
                </div>
                <CardFooter className="p-2 border-t">
                    <form onSubmit={(e) => {e.preventDefault(); handleSendMessage();}} className="relative w-full">
                        <Textarea 
                            placeholder="Describe your symptoms..." 
                            className="pr-12" 
                            rows={2}
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                            disabled={isAiThinking}
                         />
                        <Button type="submit" size="icon" className="absolute top-1/2 right-2 -translate-y-1/2 h-8 w-8" disabled={isAiThinking || !messageInput}>
                            <Send className="h-4 w-4"/>
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </CardFooter>
            </Card>

            <AlertDialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Ready to See a Doctor?</AlertDialogTitle>
                  <AlertDialogDescription>
                    To speak with a provider, please complete your profile and add a payment method for the $49.00 consultation fee.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="p-6 my-4 bg-secondary rounded-lg flex items-center justify-between">
                    <span className="font-medium text-lg">Consultation Fee</span>
                    <span className="font-bold text-2xl text-primary">$49.00</span>
                </div>
                <AlertDialogFooter className='sm:justify-between sm:gap-2'>
                    <AlertDialogCancel asChild>
                         <Button variant='outline' disabled={isProcessingPayment}>Cancel</Button>
                    </AlertDialogCancel>
                    <div className='flex flex-col-reverse sm:flex-row gap-2 mt-2 sm:mt-0'>
                        <Button variant='outline' asChild>
                            <Link href="/app/account">
                                <UserCircle className="mr-2 h-4 w-4" />
                                Complete Profile
                            </Link>
                        </Button>
                        <Button onClick={handleConfirmPaymentAndBook} disabled={isProcessingPayment}>
                            {isProcessingPayment ? <Loader2 className="animate-spin" /> : (
                                <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                 Add Payment Method
                                </>
                            )}
                        </Button>
                    </div>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
