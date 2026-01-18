"use client";
import { useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { Canvas } from '@react-three/fiber';
import SpeechBubble from './SpeechBubble';
import { translateText } from './translateService';

export default function PolyglotMirror() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);
    const requestRef = useRef<number>(null);
    const recognitionRef = useRef<any>(null);

    // State
    const [mouthPos, setMouthPos] = useState({ x: 0.5, y: 0.5 });
    const [transcript, setTranscript] = useState<string>("");
    const [translatedText, setTranslatedText] = useState<string>("");
    const [targetLanguage, setTargetLanguage] = useState<string>("es");
    const [isListening, setIsListening] = useState<boolean>(false);

    const defaultGreetings: Record<string, string> = {
        es: "¡Hola!",
        fr: "Bonjour!",
        de: "Hallo!",
        it: "Ciao!",
        pt: "Olá!",
        ja: "こんにちは！",
        ko: "안녕하세요!",
        zh: "你好！",
        ar: "مرحبا!",
        hi: "नमस्ते!",
        gu: "નમસ્તે!"
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

    // Speech Recognition Setup
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error("Speech recognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = async (event: any) => {
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const text = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += text;
                }
            }

            if (finalTranscript) {
                console.log("📝 Transcript:", finalTranscript);
                setTranscript(finalTranscript);

                // Translate
                try {
                    console.log(`🌐 Translating to ${targetLanguage}...`);
                    const result = await translateText({
                        text: finalTranscript,
                        sourceLanguage: 'en',
                        targetLanguage: targetLanguage,
                    });
                    console.log("✅ Translation:", result.translatedText);
                    setTranslatedText(result.translatedText);
                } catch (error) {
                    console.error("❌ Translation failed:", error);
                }
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [targetLanguage]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const bubbleText = isListening && translatedText
        ? translatedText
        : defaultGreetings[targetLanguage] || "Hello?";

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

            {/* 3D Scene - Speech Bubble */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                <Canvas camera={{ position: [0, 0, 5] }}>
                    <ambientLight intensity={0.5} />
                    <SpeechBubble anchorPoint={mouthPos} text={bubbleText} />
                </Canvas>
            </div>

            {/* UI Controls */}
            <div className="absolute top-6 left-6 z-30 space-y-4">
                {/* Status */}
                <div className="border-2 border-cyan-500/30 p-4 rounded-lg bg-black/60 backdrop-blur-sm">
                    <p className="text-cyan-400 font-mono text-sm uppercase tracking-widest animate-pulse">
                        • Neural Link Established
                    </p>
                </div>

                {/* Language Selector */}
                <div className="border-2 border-cyan-500/30 p-4 rounded-lg bg-black/60 backdrop-blur-sm">
                    <label className="text-cyan-400 font-mono text-xs uppercase tracking-wide block mb-2">
                        Target Language:
                    </label>
                    <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="bg-black/80 text-cyan-400 border border-cyan-500/50 rounded px-3 py-2 font-mono text-sm w-full"
                    >
                        <option value="es">Spanish (Español)</option>
                        <option value="fr">French (Français)</option>
                        <option value="de">German (Deutsch)</option>
                        <option value="it">Italian (Italiano)</option>
                        <option value="pt">Portuguese (Português)</option>
                        <option value="ja">Japanese (日本語)</option>
                        <option value="ko">Korean (한국어)</option>
                        <option value="zh">Chinese (中文)</option>
                        <option value="ar">Arabic (العربية)</option>
                        <option value="hi">Hindi (हिन्दी)</option>
                        <option value="gu">Gujarati (ગુજરાતી)</option>
                    </select>
                </div>

                {/* Listen Button */}
                <button
                    onClick={toggleListening}
                    className={`w-full border-2 p-4 rounded-lg font-mono text-sm uppercase tracking-wide transition-all ${
                        isListening
                            ? 'border-red-500 bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'border-cyan-500 bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                    }`}
                >
                    {isListening ? '⏸ Stop Listening' : '▶ Start Listening'}
                </button>
            </div>

            {/* Transcript Display at Bottom */}
            {isListening && transcript && (
                <div className="absolute bottom-6 left-6 right-6 z-30">
                    <div className="border-2 border-cyan-500/30 p-4 rounded-lg bg-black/70 backdrop-blur-sm">
                        <p className="text-cyan-400/60 font-mono text-xs uppercase mb-1">Original:</p>
                        <p className="text-white font-mono text-sm">{transcript}</p>
                    </div>
                </div>
            )}
        </div>
    );
}