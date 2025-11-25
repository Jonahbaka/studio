'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/shared/header';
import {
    Mic, MicOff, Video, VideoOff, PhoneOff,
    Settings, MoreVertical, MessageSquare,
    Users, LayoutGrid, Maximize2, AlertCircle,
    CheckCircle2, Volume2, Wand2, X, Image as ImageIcon,
    Bot, Sparkles, Coffee, ListChecks,
    Sliders, RefreshCw, Ban, Sun, Briefcase, PartyPopper, Send
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';

import { useVirtualBackground, EffectType } from '@/hooks/use-virtual-background';
import { useUser } from '@/firebase';

// --- Types ---
type RoomState = 'LOBBY' | 'JOINING' | 'CONNECTED';

interface MediaState {
    stream: MediaStream | null;
    audioEnabled: boolean;
    videoEnabled: boolean;
    hasPermissions: boolean | null;
    devices: {
        audio: MediaDeviceInfo[];
        video: MediaDeviceInfo[];
    };
    selectedAudioId: string;
    selectedVideoId: string;
    audioLevel: number;
    // Effects State
    effectType: EffectType;
    backgroundImage?: string;
    backgroundVideo?: string;
    videoSettings: { brightness: number; contrast: number };
}

// --- Main Component ---
export default function ConsultationRoom() {
    const router = useRouter();
    const { toast } = useToast();
    const [roomState, setRoomState] = useState<RoomState>('LOBBY');
    const [effectsOpen, setEffectsOpen] = useState(false);

    // Media State
    const [mediaState, setMediaState] = useState<MediaState>({
        stream: null,
        audioEnabled: true,
        videoEnabled: true,
        hasPermissions: null,
        devices: { audio: [], video: [] },
        selectedAudioId: '',
        selectedVideoId: '',
        audioLevel: 0,
        effectType: 'none',
        videoSettings: { brightness: 100, contrast: 100 }
    });

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // --- Virtual Background Hook ---
    const { isLoaded: isVBLoaded } = useVirtualBackground({
        videoRef: videoRef,
        canvasRef: canvasRef,
        effectType: mediaState.effectType,
        backgroundImage: mediaState.backgroundImage,
        backgroundVideo: mediaState.backgroundVideo,
        isEnabled: mediaState.videoEnabled,
        videoSettings: mediaState.videoSettings
    });

    // --- Media Logic ---

    // 1. Initialize Permissions & Devices
    useEffect(() => {
        const init = async () => {
            try {
                // Request initial permissions
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

                // Stop initial stream tracks immediately, we just wanted permissions
                stream.getTracks().forEach(t => t.stop());

                const devices = await navigator.mediaDevices.enumerateDevices();
                const audioInputs = devices.filter(d => d.kind === 'audioinput');
                const videoInputs = devices.filter(d => d.kind === 'videoinput');

                setMediaState(prev => ({
                    ...prev,
                    hasPermissions: true,
                    devices: { audio: audioInputs, video: videoInputs },
                    selectedAudioId: audioInputs[0]?.deviceId || '',
                    selectedVideoId: videoInputs[0]?.deviceId || ''
                }));

            } catch (err: any) {
                console.debug("Permission error:", err);
                setMediaState(prev => ({ ...prev, hasPermissions: false }));

                if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    toast({ variant: "destructive", title: "Camera In Use", description: "Your camera may be used by another app. Please close other apps and reload." });
                } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    toast({ variant: "destructive", title: "Permissions Denied", description: "Please enable camera and microphone access in your browser." });
                } else {
                    toast({ variant: "destructive", title: "Device Error", description: "Could not access camera or microphone." });
                }
            }
        };
        init();
    }, [toast]);

    // 2. Manage Active Stream
    useEffect(() => {
        if (!mediaState.hasPermissions || !mediaState.selectedAudioId || !mediaState.selectedVideoId) return;

        let activeStream: MediaStream | null = null;

        const startStream = async () => {
            try {
                if (mediaState.stream) {
                    mediaState.stream.getTracks().forEach(t => t.stop());
                }

                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: { deviceId: { exact: mediaState.selectedAudioId } },
                    video: { deviceId: { exact: mediaState.selectedVideoId }, width: { ideal: 1280 }, height: { ideal: 720 } }
                });

                activeStream = stream;

                // Apply initial toggle states
                stream.getAudioTracks().forEach(t => t.enabled = mediaState.audioEnabled);
                // We keep video track enabled for processing, but handle visibility via canvas

                setMediaState(prev => ({ ...prev, stream }));

                // Attach to hidden video element for processing
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // Explicitly start playback
                    videoRef.current.play().catch(e => console.error("Video play error:", e));
                }

                // Setup Audio Analysis
                setupAudioAnalysis(stream);

            } catch (err) {
                console.error("Stream start error:", err);
                toast({ variant: "destructive", title: "Device Error", description: "Could not access selected device." });
            }
        };

        startStream();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(t => t.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mediaState.selectedAudioId, mediaState.selectedVideoId, mediaState.hasPermissions]);

    // 3. Re-attach stream when switching views (lobby <-> active call)
    useEffect(() => {
        if (mediaState.stream && videoRef.current) {
            videoRef.current.srcObject = mediaState.stream;
            videoRef.current.play().catch(e => console.error("Video play error:", e));
        }
    }, [roomState, mediaState.stream]);

    // 3. Handle Toggles
    useEffect(() => {
        if (mediaState.stream) {
            mediaState.stream.getAudioTracks().forEach(t => t.enabled = mediaState.audioEnabled);
            // We don't disable video track here to keep the camera active for effects processing,
            // unless we want to completely stop the camera light. 
            // For now, let's keep it running but handle "off" state in the hook/canvas.
        }
    }, [mediaState.audioEnabled, mediaState.videoEnabled, mediaState.stream]);


    // Audio Analysis Helper
    const setupAudioAnalysis = (stream: MediaStream) => {
        if (audioContextRef.current) audioContextRef.current.close();

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

        analyser.smoothingTimeConstant = 0.8;
        analyser.fftSize = 1024;

        microphone.connect(analyser);
        analyser.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);

        scriptProcessor.onaudioprocess = () => {
            const array = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(array);
            const average = array.reduce((a, b) => a + b, 0) / array.length;
            setMediaState(prev => ({ ...prev, audioLevel: average }));
        };

        audioContextRef.current = audioContext;
        analyserRef.current = analyser;
    };

    // --- Actions ---
    const toggleAudio = () => setMediaState(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }));
    const toggleVideo = () => setMediaState(prev => ({ ...prev, videoEnabled: !prev.videoEnabled }));

    const handleJoin = () => {
        setRoomState('JOINING');
        setTimeout(() => setRoomState('CONNECTED'), 1500); // Simulate connection delay
    };

    // --- Auth Protection ---
    const { user, isUserLoading } = useUser();

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.push('/login');
        }
    }, [user, isUserLoading, router]);

    const handleLeave = () => {
        if (mediaState.stream) {
            mediaState.stream.getTracks().forEach(t => t.stop());
        }
        router.push('/app');
    };

    if (isUserLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-950 text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    <p className="text-gray-400">Verifying access...</p>
                </div>
            </div>
        );
    }

    if (!user) return null; // Prevent flash of content before redirect

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white overflow-hidden">
            {roomState === 'LOBBY' && <Header className="bg-transparent border-b border-gray-800 text-white" />}

            <main className="flex-grow flex relative overflow-hidden">
                <div className={`flex-grow flex flex-col transition-all duration-300 ${effectsOpen ? 'mr-96' : ''}`}>
                    {roomState === 'LOBBY' ? (
                        <LobbyView
                            mediaState={mediaState}
                            setMediaState={setMediaState}
                            onJoin={handleJoin}
                            videoRef={videoRef}
                            canvasRef={canvasRef}
                            toggleAudio={toggleAudio}
                            toggleVideo={toggleVideo}
                            toggleEffects={() => setEffectsOpen(!effectsOpen)}
                        />
                    ) : (
                        <ActiveCallView
                            mediaState={mediaState}
                            onLeave={handleLeave}
                            videoRef={videoRef}
                            canvasRef={canvasRef}
                            toggleAudio={toggleAudio}
                            toggleVideo={toggleVideo}
                            isConnecting={roomState === 'JOINING'}
                            toggleEffects={() => setEffectsOpen(!effectsOpen)}
                        />
                    )}
                </div>

                {/* Effects Sidebar */}
                <EffectsSidebar
                    isOpen={effectsOpen}
                    onClose={() => setEffectsOpen(false)}
                    mediaState={mediaState}
                    setMediaState={setMediaState}
                />
            </main>
        </div>
    );
}

// --- Sub-Components ---

function LobbyView({ mediaState, setMediaState, onJoin, videoRef, canvasRef, toggleAudio, toggleVideo, toggleEffects }: any) {
    return (
        <div className="flex-grow flex items-center justify-center p-6">
            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left: Preview */}
                <div className="space-y-4">
                    <div className="relative aspect-video bg-gray-800 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
                        {mediaState.hasPermissions === false ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                                <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
                                <h3 className="text-xl font-semibold text-white mb-2">Camera access denied</h3>
                                <p>Please allow camera and microphone access in your browser settings to join the call.</p>
                            </div>
                        ) : (
                            <>
                                {/* Hidden Input Video */}
                                <video ref={videoRef} autoPlay muted playsInline className="hidden" />

                                {/* Output Canvas */}
                                <canvas
                                    ref={canvasRef}
                                    className={`w-full h-full transition-opacity duration-300 ${mediaState.videoEnabled ? 'opacity-100' : 'opacity-0'}`}
                                />

                                {!mediaState.videoEnabled && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                        <Avatar className="w-32 h-32">
                                            <AvatarFallback className="text-4xl bg-indigo-600 text-white">YOU</AvatarFallback>
                                        </Avatar>
                                    </div>
                                )}

                                {/* Audio Visualizer Overlay */}
                                <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full">
                                    <div className={`p-1.5 rounded-full ${mediaState.audioEnabled ? 'bg-indigo-500/20 text-indigo-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {mediaState.audioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                    </div>
                                    <div className="flex gap-1 h-4 items-center">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div
                                                key={i}
                                                className={`w-1 rounded-full transition-all duration-75 ${mediaState.audioLevel > i * 10 ? 'bg-green-400 h-full' : 'bg-gray-600 h-1.5'}`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Quick Toggles Overlay */}
                                <div className="absolute bottom-6 right-6 flex gap-3">
                                    <Button
                                        type="button"
                                        variant={mediaState.audioEnabled ? "secondary" : "destructive"}
                                        size="icon"
                                        className="rounded-full h-12 w-12 shadow-lg"
                                        onClick={toggleAudio}
                                    >
                                        {mediaState.audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant={mediaState.videoEnabled ? "secondary" : "destructive"}
                                        size="icon"
                                        className="rounded-full h-12 w-12 shadow-lg"
                                        onClick={toggleVideo}
                                    >
                                        {mediaState.videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        size="icon"
                                        className="rounded-full h-12 w-12 shadow-lg bg-gray-700 hover:bg-indigo-600 text-white"
                                        onClick={toggleEffects}
                                        title="Visual Effects"
                                    >
                                        <Wand2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Device Settings Trigger */}
                    <div className="flex justify-end">
                        <DeviceSettingsDialog mediaState={mediaState} setMediaState={setMediaState} />
                    </div>
                </div>

                {/* Right: Join Controls */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-3 tracking-tight">Ready to join?</h1>
                        <p className="text-gray-400 text-lg">Dr. Smith is in the call.</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                        <Button
                            type="button"
                            size="lg"
                            className="flex-1 rounded-full text-lg h-14 bg-indigo-600 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                            onClick={onJoin}
                            disabled={!mediaState.hasPermissions}
                        >
                            Join now
                        </Button>
                        <Button
                            type="button"
                            size="lg"
                            variant="secondary"
                            className="flex-1 rounded-full text-lg h-14 bg-gray-800 hover:bg-gray-700 text-white border-0"
                        >
                            Present
                        </Button>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span>Your connection is stable</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ActiveCallView({ mediaState, onLeave, videoRef, canvasRef, toggleAudio, toggleVideo, isConnecting, toggleEffects }: any) {
    return (
        <div className="flex-grow flex flex-col h-full bg-gray-950">
            {/* Main Stage */}
            <div className="flex-grow relative p-4 flex items-center justify-center">
                {isConnecting ? (
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <Avatar className="w-32 h-32 border-4 border-gray-800">
                            <AvatarFallback className="bg-gray-800 text-gray-400 text-4xl">DR</AvatarFallback>
                        </Avatar>
                        <p className="text-gray-400">Connecting...</p>
                    </div>
                ) : (
                    <div className="w-full h-full max-w-6xl bg-gray-900 rounded-2xl overflow-hidden relative shadow-2xl ring-1 ring-white/5">
                        {/* Remote Video Placeholder */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <Avatar className="w-40 h-40 mx-auto mb-6 border-4 border-gray-800 shadow-xl">
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-5xl">DS</AvatarFallback>
                                </Avatar>
                                <h3 className="text-2xl font-semibold text-white">Dr. Sarah Smith</h3>
                                <Badge variant="secondary" className="mt-3 bg-gray-800 text-gray-300">Waiting for video...</Badge>
                            </div>
                        </div>

                        {/* Self View (Floating) */}
                        <div className="absolute bottom-6 right-6 w-64 aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 hover:scale-105 transition-transform cursor-move">
                            {/* Hidden Input Video */}
                            <video ref={videoRef} autoPlay muted playsInline className="invisible absolute w-full h-full object-cover scale-x-[-1]" />

                            {/* Output Canvas */}
                            <canvas
                                ref={canvasRef}
                                className={`w-full h-full ${mediaState.videoEnabled ? 'opacity-100' : 'opacity-0'}`}
                            />

                            {!mediaState.videoEnabled && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                                    <Avatar className="w-16 h-16">
                                        <AvatarFallback className="bg-indigo-600 text-white">YOU</AvatarFallback>
                                    </Avatar>
                                </div>
                            )}
                            <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-xs font-medium">You</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Control Bar */}
            <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-4 w-1/3">
                    <div className="text-left hidden sm:block">
                        <h3 className="font-semibold text-sm">Consultation #8492</h3>
                        <p className="text-xs text-gray-400">10:30 AM - 11:00 AM</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 justify-center w-1/3">
                    <Button
                        type="button"
                        variant={mediaState.audioEnabled ? "secondary" : "destructive"}
                        size="icon"
                        className={`rounded-full h-12 w-12 ${mediaState.audioEnabled ? 'bg-gray-700 hover:bg-gray-600 border-0' : ''}`}
                        onClick={toggleAudio}
                    >
                        {mediaState.audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                    <Button
                        type="button"
                        variant={mediaState.videoEnabled ? "secondary" : "destructive"}
                        size="icon"
                        className={`rounded-full h-12 w-12 ${mediaState.videoEnabled ? 'bg-gray-700 hover:bg-gray-600 border-0' : ''}`}
                        onClick={toggleVideo}
                    >
                        {mediaState.videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={`rounded-full h-12 w-12 bg-gray-700 hover:bg-indigo-600 text-white border-0`}
                        onClick={toggleEffects}
                        title="Visual Effects"
                    >
                        <Wand2 className="w-5 h-5" />
                    </Button>
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="rounded-full h-12 w-16 px-8 bg-red-600 hover:bg-red-700"
                        onClick={onLeave}
                    >
                        <PhoneOff className="w-6 h-6" />
                    </Button>
                </div>

                <div className="flex items-center gap-3 justify-end w-1/3">
                    <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full">
                        <MessageSquare className="w-5 h-5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full">
                        <Users className="w-5 h-5" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-full">
                        <MoreVertical className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function DeviceSettingsDialog({ mediaState, setMediaState }: any) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button type="button" variant="outline" className="rounded-full border-gray-700 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-800 text-white">
                <DialogHeader>
                    <DialogTitle>Audio & Video Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label>Microphone</Label>
                        <Select
                            value={mediaState.selectedAudioId}
                            onValueChange={(val) => setMediaState((prev: any) => ({ ...prev, selectedAudioId: val }))}
                        >
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                <SelectValue placeholder="Select microphone" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                {mediaState.devices.audio.map((d: any) => (
                                    <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || `Mic ${d.deviceId.slice(0, 5)}`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Camera</Label>
                        <Select
                            value={mediaState.selectedVideoId}
                            onValueChange={(val) => setMediaState((prev: any) => ({ ...prev, selectedVideoId: val }))}
                        >
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                <SelectValue placeholder="Select camera" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                {mediaState.devices.video.map((d: any) => (
                                    <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || `Cam ${d.deviceId.slice(0, 5)}`}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

const BACKGROUND_PRESETS = {
    blur: 'BLUR',
    office: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1280&q=80',
    home: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=1280&q=80',
    party: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1280&q=80',
    beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1280&q=80',
    space: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1280&q=80',
};

function EffectsSidebar({ isOpen, onClose, mediaState, setMediaState }: any) {
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
        { role: 'ai', text: "Welcome to The Wellness Booth! Tell me where you want to be." }
    ]);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleEffectChange = (type: EffectType, src?: string) => {
        setMediaState((prev: any) => ({
            ...prev,
            effectType: type,
            backgroundImage: src || prev.backgroundImage,
            backgroundVideo: src || prev.backgroundVideo
        }));
    };

    const processGeminiCommand = (text: string) => {
        const lower = text.toLowerCase();
        let responseText = "I've updated your background.";
        let action: EffectType = 'none';
        let url = '';

        if (lower.includes('office') || lower.includes('work')) {
            action = 'image';
            url = BACKGROUND_PRESETS.office;
            responseText = "Switching to a professional office setting.";
        } else if (lower.includes('party') || lower.includes('fun')) {
            action = 'image';
            url = BACKGROUND_PRESETS.party;
            responseText = "Let's get this party started!";
        } else if (lower.includes('beach') || lower.includes('vacation')) {
            action = 'image';
            url = BACKGROUND_PRESETS.beach;
            responseText = "Transporting you to a sunny beach.";
        } else if (lower.includes('space') || lower.includes('galaxy')) {
            action = 'image';
            url = BACKGROUND_PRESETS.space;
            responseText = "3... 2... 1... Blast off!";
        } else if (lower.includes('home') || lower.includes('cozy')) {
            action = 'image';
            url = BACKGROUND_PRESETS.home;
            responseText = "Setting a cozy home atmosphere.";
        } else if (lower.includes('blur')) {
            action = 'blur';
            responseText = "Blurring your background.";
        } else if (lower.includes('clear') || lower.includes('remove')) {
            action = 'none';
            responseText = "Background effects cleared.";
        } else {
            action = 'image';
            // Use a safe random endpoint
            url = `https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=1280&q=80`;
            responseText = `I've generated a scene based on "${text}".`;
        }

        setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
        handleEffectChange(action, url);
    };

    const handleGeminiSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        const userMsg = chatInput;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setChatInput('');

        // Mock AI Delay
        setTimeout(() => {
            processGeminiCommand(userMsg);
        }, 800);
    };

    return (
        <div className={`absolute top-4 right-4 bottom-24 w-96 bg-gray-800 rounded-2xl shadow-2xl transform transition-transform duration-300 z-50 flex flex-col overflow-hidden border border-gray-700 ${isOpen ? 'translate-x-0' : 'translate-x-[120%]'}`}>
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gray-900/50">
                <div className="flex items-center gap-2 text-blue-400">
                    <Sparkles size={24} />
                    <h2 className="text-lg font-semibold text-white">The Wellness Booth</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900/30" ref={scrollRef}>
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-br-none'
                            : 'bg-gray-700 text-gray-200 rounded-bl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
            </div>

            {/* Lighting & Contrast Controls */}
            <div className="px-6 py-4 border-t border-white/5 bg-gray-800/50">
                <div className="flex items-center gap-2 mb-4 text-blue-300">
                    <Sliders size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Studio Lighting</span>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Brightness</span>
                            <span>{mediaState.videoSettings.brightness}%</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="150"
                            value={mediaState.videoSettings.brightness}
                            onChange={(e) => setMediaState((prev: any) => ({ ...prev, videoSettings: { ...prev.videoSettings, brightness: Number(e.target.value) } }))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Contrast</span>
                            <span>{mediaState.videoSettings.contrast}%</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="150"
                            value={mediaState.videoSettings.contrast}
                            onChange={(e) => setMediaState((prev: any) => ({ ...prev, videoSettings: { ...prev.videoSettings, contrast: Number(e.target.value) } }))}
                            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                        />
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={() => setMediaState((prev: any) => ({ ...prev, videoSettings: { brightness: 100, contrast: 100 } }))}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mx-auto"
                    >
                        <RefreshCw size={10} />
                        Reset
                    </button>
                </div>
            </div>

            {/* Presets Grid */}
            <div className="px-4 py-4 border-t border-white/5 bg-gray-900/30">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Presets</p>
                <div className="grid grid-cols-4 gap-2">
                    <button onClick={() => handleEffectChange('none')} className="flex flex-col items-center gap-1 p-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors text-xs text-gray-300">
                        <Ban size={16} className="text-gray-400" />
                        None
                    </button>
                    <button onClick={() => handleEffectChange('image', BACKGROUND_PRESETS.office)} className="flex flex-col items-center gap-1 p-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors text-xs text-gray-300">
                        <Briefcase size={16} className="text-orange-300" />
                        Office
                    </button>
                    <button onClick={() => handleEffectChange('image', BACKGROUND_PRESETS.home)} className="flex flex-col items-center gap-1 p-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors text-xs text-gray-300">
                        <Sun size={16} className="text-yellow-300" />
                        Home
                    </button>
                    <button onClick={() => handleEffectChange('image', BACKGROUND_PRESETS.party)} className="flex flex-col items-center gap-1 p-2 bg-gray-700/50 hover:bg-gray-700 rounded-xl transition-colors text-xs text-gray-300">
                        <PartyPopper size={16} className="text-purple-300" />
                        Party
                    </button>
                </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-gray-800">
                <form onSubmit={handleGeminiSubmit} className="relative">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Describe a scene (e.g. 'Sunset in Bali')..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </form>
                <p className="text-[10px] text-center text-gray-500 mt-2">
                    AI can make mistakes. Review generated backgrounds.
                </p>
            </div>
        </div>
    );
}

