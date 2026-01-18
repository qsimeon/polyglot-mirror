import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

export default function SpeechBubble({ anchorPoint, text }: { anchorPoint: { x: number, y: number }, text: string }) {
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!meshRef.current) return;
        const { width, height } = state.viewport;
        const targetX = -(anchorPoint.x - 0.5) * width; // Negative to match mirrored video
        const targetY = -(anchorPoint.y - 0.5) * height;

        // Smoothly follow the mouth with a small offset (y + 0.6)
        meshRef.current.position.lerp(new THREE.Vector3(targetX, targetY + 0.6, 0), 0.15);
    });

    return (
        <group ref={meshRef}>
            <Html center>
                <div className="relative flex flex-col items-center">
                    {/* Main Bubble */}
                    <div className="bg-cyan-500/20 border-2 border-cyan-400 backdrop-blur-md px-4 py-2 rounded-2xl shadow-[0_0_15px_rgba(34,211,238,0.5)] whitespace-nowrap">
            <span className="text-cyan-100 font-bold text-lg tracking-wide">
              {text}
            </span>
                    </div>
                    {/* Tail */}
                    <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-cyan-400"></div>
                </div>
            </Html>
        </group>
    );
}