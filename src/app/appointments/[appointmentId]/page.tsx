'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useFirestore, useUser } from '@/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function VideoRoomPage() {
    const { appointmentId } = useParams();
    const firestore = useFirestore();
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const [isMicOn, setIsMicOn] = useState(true);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [status, setStatus] = useState('connecting'); // connecting, connected, ended

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        // Mock connection logic
        const connect = async () => {
            setStatus('connecting');
            await new Promise(resolve => setTimeout(resolve, 1500));
            setStatus('connected');

            // Request media permissions (Mock)
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Media access denied:", err);
                toast({ variant: "destructive", title: "Camera/Mic Error", description: "Please allow access to devices." });
            }
        };
        connect();

        return () => {
            // Cleanup tracks
            if (localVideoRef.current?.srcObject) {
                (localVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const toggleMic = () => setIsMicOn(!isMicOn);
    const toggleVideo = () => setIsVideoOn(!isVideoOn);

    const endCall = async () => {
        if (firestore && appointmentId) {
            await updateDoc(doc(firestore, 'appointments', appointmentId as string), {
                status: 'completed'
            });
        }
        router.push('/appointments');
    };

    return (
        <div className="flex flex-col h-screen bg-neutral-950 text-white">
            <div className="flex-1 relative">
                {/* Remote Video (Full Screen) */}
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-900">
                    {status === 'connecting' ? (
                        <div className="text-center">
                            <div className="animate-pulse text-2xl font-light mb-2">Connecting...</div>
                            <p className="text-neutral-400">Waiting for provider to join</p>
                        </div>
                    ) : (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop"
                            alt="Doctor"
                            className="w-full h-full object-cover opacity-80"
                        />
                    )}
                </div>

                {/* Local Video (PIP) */}
                <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-xl border border-neutral-800">
                    <video ref={localVideoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!isVideoOn && 'hidden'}`} />
                    {!isVideoOn && <div className="flex items-center justify-center h-full bg-neutral-800"><VideoOff className="h-8 w-8 text-neutral-500" /></div>}
                </div>
            </div>

            {/* Controls */}
            <div className="h-20 bg-neutral-900/90 backdrop-blur flex items-center justify-center gap-6">
                <Button
                    variant={isMicOn ? "secondary" : "destructive"}
                    size="icon"
                    className="rounded-full h-12 w-12"
                    onClick={toggleMic}
                >
                    {isMicOn ? <Mic /> : <MicOff />}
                </Button>

                <Button
                    variant={isVideoOn ? "secondary" : "destructive"}
                    size="icon"
                    className="rounded-full h-12 w-12"
                    onClick={toggleVideo}
                >
                    {isVideoOn ? <Video /> : <VideoOff />}
                </Button>

                <Button
                    variant="destructive"
                    size="icon"
                    className="rounded-full h-14 w-14 bg-red-600 hover:bg-red-700"
                    onClick={endCall}
                >
                    <PhoneOff className="h-6 w-6" />
                </Button>

                <Button variant="secondary" size="icon" className="rounded-full h-12 w-12">
                    <MonitorUp />
                </Button>
            </div>
        </div>
    );
}
