import { useEffect, useRef, useState, useCallback } from 'react';

export function useSpeechRecognition(onTranscript: (text: string) => void) {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);
    const onTranscriptRef = useRef(onTranscript);

    // Keep the callback ref updated without causing re-renders
    useEffect(() => {
        onTranscriptRef.current = onTranscript;
    }, [onTranscript]);

    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error("Speech recognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const text = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += text;
                }
            }

            if (finalTranscript) {
                onTranscriptRef.current(finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("Speech recognition error:", event.error);
        };

        // Auto-restart if it stops unexpectedly while listening
        recognition.onend = () => {
            if (recognitionRef.current && isListening) {
                recognition.start();
            }
        };

        recognitionRef.current = recognition;

        // Don't cleanup on every render - only on unmount
    }, []); // Empty dependency array - only run once

    const toggleListening = useCallback(() => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    }, [isListening]);

    return { isListening, toggleListening };
}