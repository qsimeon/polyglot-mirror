"use client";
import { useEffect, useRef } from 'react';
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function PolyglotMirror() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const landmarkerRef = useRef<FaceLandmarker | null>(null);

    // ✅ We use a ref to hold the animation frame ID and the "impure" logic
    const requestRef = useRef<number>(null);

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
                    // ✅ Kick off the loop only once the video is ready
                    requestRef.current = requestAnimationFrame(predict);
                };
            }
        }

        // ✅ The "impure" loop is defined safely inside useEffect
        const predict = () => {

            if (!videoRef.current || !landmarkerRef.current) {
                requestRef.current = requestAnimationFrame(predict);
                return;
            }

            else if (videoRef.current && landmarkerRef.current) {
                // performance.now() is safe here because it's inside an async/callback context
                const nowInMs = performance.now();
                const results = landmarkerRef.current.detectForVideo(videoRef.current, nowInMs);

                if (results.faceLandmarks && results.faceLandmarks.length > 0) {
                    const mouthAnchor = results.faceLandmarks[0][13];
                    console.log("Mouth Position:", mouthAnchor.x.toFixed(2));
                    // TODO: Update your 3D bubble ref position here
                }
            }
            requestRef.current = requestAnimationFrame(predict);
        };

        setup();

        // Clean up to prevent memory leaks during the hackathon!
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    return (
        <div className="relative w-screen h-screen bg-black overflow-hidden">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1] opacity-60"
            />
            <div className="absolute top-10 left-10 text-cyan-400 font-mono text-xl animate-pulse">
                [ SYSTEM: TRACKING_LIVE ]
            </div>
        </div>
    );
}