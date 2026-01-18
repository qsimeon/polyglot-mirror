"use client";
import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Canvas } from '@react-three/fiber';
import SpeechBubble from './SpeechBubble';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { useTranslation } from './hooks/useTranslation';
import ControlPanel from './components/ControlPanel';
import TranscriptDisplay from './components/TranscriptDisplay';

export default function PolyglotMirror() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const requestRef = useRef<number>(null);

    const [mouthPos, setMouthPos] = useState({ x: 0.5, y: 0.5 });
    const [transcript, setTranscript] = useState<string>("");
    const [targetLanguage, setTargetLanguage] = useState<string>("es");

    // Custom hooks for speech and translation
    const { translatedText, translate } = useTranslation(targetLanguage);
    const { isListening, toggleListening } = useSpeechRecognition((text) => {
        setTranscript(text);
        translate(text);
    });

    // Face tracking setup
    useEffect(() => {
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

    // Bubble shows translation when listening, default text otherwise
    const bubbleText = isListening && translatedText ? translatedText : "કેમ છો?";

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden">
            {/* Background Video */}
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-50"
            />

            {/* 3D Scene - Ensure this is absolute and covers everything */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.5} />
                    <SpeechBubble anchorPoint={mouthPos} text="કેમ છો?" />
                </Canvas>
            </div>

            {/* Control Panel */}
            <ControlPanel
                targetLanguage={targetLanguage}
                onLanguageChange={setTargetLanguage}
                isListening={isListening}
                onToggleListening={toggleListening}
            />

            {/* Transcript Display */}
            <TranscriptDisplay transcript={transcript} isListening={isListening} />
        </div>
    );
}