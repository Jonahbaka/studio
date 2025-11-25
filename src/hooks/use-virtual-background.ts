import { useState, useEffect, useRef } from 'react';

export type EffectType = 'none' | 'blur' | 'image' | 'video';

interface UseVirtualBackgroundProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    effectType: EffectType;
    backgroundImage?: string;
    backgroundVideo?: string;
    isEnabled: boolean;
    videoSettings?: { brightness: number; contrast: number };
}

interface SegmentationResults {
    segmentationMask: ImageBitmap;
    image: ImageBitmap;
}

interface SelfieSegmentation {
    setOptions: (options: { modelSelection: number; selfieMode?: boolean }) => void;
    onResults: (callback: (results: SegmentationResults) => void) => void;
    send: (input: { image: HTMLVideoElement }) => Promise<void>;
    close: () => Promise<void>;
}

const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
    });
};

export function useVirtualBackground({
    videoRef: inputVideoRef,
    canvasRef,
    effectType,
    backgroundImage,
    backgroundVideo,
    isEnabled,
    videoSettings = { brightness: 100, contrast: 100 }
}: UseVirtualBackgroundProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const requestRef = useRef<number>();
    const segmenterRef = useRef<SelfieSegmentation | null>(null);
    const bgImageRef = useRef<HTMLImageElement | null>(null);
    const bgVideoRef = useRef<HTMLVideoElement | null>(null);

    // Refs for loop access to avoid stale closures
    const activeSettingsRef = useRef(videoSettings);
    const activeEffectRef = useRef({ type: effectType, img: backgroundImage, vid: backgroundVideo });

    // Update refs when props change
    useEffect(() => {
        activeSettingsRef.current = videoSettings;
    }, [videoSettings]);

    useEffect(() => {
        activeEffectRef.current = { type: effectType, img: backgroundImage, vid: backgroundVideo };

        // Load background assets
        if (effectType === 'image' && backgroundImage) {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = backgroundImage;
            img.onload = () => { bgImageRef.current = img; };
        } else if (effectType === 'video' && backgroundVideo) {
            const vid = document.createElement('video');
            vid.crossOrigin = "Anonymous";
            vid.src = backgroundVideo;
            vid.loop = true;
            vid.muted = true;
            vid.play().catch(e => console.error("BG Video play error", e));
            bgVideoRef.current = vid;
        }
    }, [effectType, backgroundImage, backgroundVideo]);

    // Initialize MediaPipe
    useEffect(() => {
        let isMounted = true;

        const initMediaPipe = async () => {
            try {
                await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/selfie_segmentation.js');

                if (!isMounted) return;

                // @ts-ignore - Loaded via script tag
                const selfieSegmentation = new window.SelfieSegmentation({
                    locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
                });

                selfieSegmentation.setOptions({
                    modelSelection: 1, // 1 = Landscape (faster)
                    selfieMode: false,
                });

                selfieSegmentation.onResults(onSegmentationResults);
                segmenterRef.current = selfieSegmentation;
                setIsLoaded(true);
            } catch (err) {
                console.error("Failed to load MediaPipe:", err);
            }
        };

        if (isEnabled && !segmenterRef.current) {
            initMediaPipe();
        }

        return () => {
            isMounted = false;
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            segmenterRef.current?.close();
            segmenterRef.current = null;
        };
    }, [isEnabled]);

    // Processing Loop
    useEffect(() => {
        const loop = async () => {
            if (
                inputVideoRef.current &&
                inputVideoRef.current.readyState === 4 &&
                !inputVideoRef.current.paused &&
                !inputVideoRef.current.ended
            ) {
                if (segmenterRef.current && isEnabled && effectType !== 'none') {
                    await segmenterRef.current.send({ image: inputVideoRef.current });
                } else {
                    // Fallback / Direct Draw when effects disabled or not loaded
                    drawDirectly();
                }
            }
            requestRef.current = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isEnabled, effectType, isLoaded]);

    const drawDirectly = () => {
        const canvas = canvasRef.current;
        const video = inputVideoRef.current;
        const ctx = canvas?.getContext('2d');

        if (!canvas || !ctx || !video) return;

        // Ensure dimensions match
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
        }

        const settings = activeSettingsRef.current;
        console.log("Drawing directly. Settings:", settings);

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        ctx.filter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();
    };

    const onSegmentationResults = (results: SegmentationResults) => {
        console.log("Segmentation results received");
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        // Ensure dimensions match
        if (canvas.width !== results.image.width || canvas.height !== results.image.height) {
            canvas.width = results.image.width;
            canvas.height = results.image.height;
        }

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);

        const settings = activeSettingsRef.current;
        const effect = activeEffectRef.current;
        const userFilter = `brightness(${settings.brightness}%) contrast(${settings.contrast}%)`;

        // 1. Draw Segmentation Mask (Optional debug)
        // ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

        // 2. Cut out the Human & Apply Video Filters
        ctx.globalCompositeOperation = 'source-over';

        // Draw mask first to clip
        ctx.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);

        // Keep only the person
        ctx.globalCompositeOperation = 'source-in';
        ctx.filter = userFilter;
        ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        // 3. Draw the Background Behind
        ctx.globalCompositeOperation = 'destination-over';

        if (effect.type === 'blur') {
            ctx.filter = 'blur(15px)';
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
            ctx.filter = 'none';
        } else if (effect.type === 'image' && bgImageRef.current) {
            ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
        } else if (effect.type === 'video' && bgVideoRef.current) {
            ctx.drawImage(bgVideoRef.current, 0, 0, canvas.width, canvas.height);
        } else {
            // Fallback to original if no background
            ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
        }

        ctx.restore();
    };

    return { isLoaded };
}
