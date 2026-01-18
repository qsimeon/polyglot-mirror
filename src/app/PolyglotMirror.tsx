"use client";
import { useEffect, useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function PolyglotMirror() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const requestRef = useRef<number>(null);
    const lastTimestampRef = useRef<number>(-1);

    useEffect(() => {
        // Temporarily suppress MediaPipe's internal WASM stderr output
        const originalConsoleError = console.error;
        console.error = (...args) => {
            const msg = args[0]?.toString?.() || '';
            // Filter out MediaPipe WASM internal messages
            if (msg.includes('vision_wasm_internal') ||
                msg.includes('finishProcessing') ||
                msg.includes('@mediapipe')) {
                return;
            }
            originalConsoleError.apply(console, args);
        };

        async function setup() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
                );

                landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                        delegate: "GPU"
                    },
                    runningMode: "VIDEO",
                    numFaces: 1,
                    outputFaceBlendshapes: false,
                    outputFacialTransformationMatrixes: false
                });

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720 }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current?.play().then(() => {
                            setTimeout(() => {
                                requestRef.current = requestAnimationFrame(predict);
                            }, 200);
                        });
                    };
                }
            } catch (err) {
                originalConsoleError("Setup failed:", err);
            }
        }

        const predict = () => {
            const video = videoRef.current;
            const landmarker = landmarkerRef.current;

            if (video && landmarker && video.readyState >= 2 && video.videoWidth > 0) {
                const timestamp = performance.now();

                if (timestamp > lastTimestampRef.current) {
                    lastTimestampRef.current = timestamp;

                    const results = landmarker.detectForVideo(video, timestamp);

                    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                        const mouthAnchor = results.faceLandmarks[0][13];
                        console.log("Mouth Y:", mouthAnchor.y.toFixed(2));
                    }
                }
            }
            requestRef.current = requestAnimationFrame(predict);
        };

        setup();

        return () => {
            // Restore original console.error
            console.error = originalConsoleError;

            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(track => track.stop());
            }
            if (landmarkerRef.current) landmarkerRef.current.close();
        };
    }, []);

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-70"
            />
            <div className="z-10 pointer-events-none border-2 border-cyan-500/30 p-4 rounded-lg bg-black/40 backdrop-blur-sm">
                <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest animate-pulse">
                    • Neural Link Established
                </p>
            </div>
        </div>
    );
}