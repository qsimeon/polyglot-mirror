"use client";
import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Canvas } from '@react-three/fiber';
import SpeechBubble from './SpeechBubble';

export default function PolyglotMirror() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const requestRef = useRef<number>(null);
    const DEFAULT_GREETINGS: Record<string, string> = {
        hi: "कैसे हो?", // Hindi
        es: "¿Cómo estás?", // Spanish
        fr: "Comment ça va?", // French
        ja: "元気ですか？" // Japanese
    };
    const [targetLang, setTargetLang] = useState('hi'); // Default to Gujarati
    const [translatedText, setTranslatedText] = useState(DEFAULT_GREETINGS['hi']);
    // 1. THE HYDRATION SHIELD
    //const [hasMounted, setHasMounted] = useState(false);
    const [mouthPos, setMouthPos] = useState({ x: 0.5, y: 0.5 });


// Function to handle language change
    const handleLanguageChange = (newLang: string) => {
        setTargetLang(newLang);
        // Instantly update the bubble text to the new language's greeting
        setTranslatedText(DEFAULT_GREETINGS[newLang] || "...");
    };

    useEffect(() => {
        //setHasMounted(true); // Tell React we are now safely on the client

        async function setup() {
            const vision = await FilesetResolver.forVisionTasks(
                "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
            );

            landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
                baseOptions: {
                    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
                    delegate: "GPU"
                },
                runningMode: "VIDEO",
                numFaces: 1
            });

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadeddata = () => {
                    requestRef.current = requestAnimationFrame(predict);
                };
            }
        }

        const predict = () => {
            if (videoRef.current && landmarkerRef.current) {
                const results = landmarkerRef.current.detectForVideo(videoRef.current, performance.now());
                if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                    const mouth = results.faceLandmarks[0][13];
                    setMouthPos({ x: mouth.x, y: mouth.y });
                }
            }
            requestRef.current = requestAnimationFrame(predict);
        };

        setup();
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    // 2. ONLY RENDER ON CLIENT
    //if (!hasMounted) return <div className="w-screen h-screen bg-black" />;

    return (

        <div className="relative w-screen h-screen bg-black overflow-hidden">
            {/* LANGUAGE SELECTOR */}
            <div className="absolute top-6 right-6 z-50">
                <select
                    value={targetLang}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-black/80 text-cyan-400 border border-cyan-500 p-2 rounded-lg font-mono outline-none cursor-pointer"
                >
                    <option value="hi">Hindi</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="ja">Japanese</option>
                </select>
            </div>
            {/* Background Video */}
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-50"
            />

            {/* 3D SCENE */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.5} />
                    {/* Pass the dynamic state here! */}
                    <SpeechBubble anchorPoint={mouthPos} text={translatedText} />
                </Canvas>
            </div>
        </div>
    );
}