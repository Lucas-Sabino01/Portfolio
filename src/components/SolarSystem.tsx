import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import {  useFrame } from '@react-three/fiber';
import { Sphere, Torus, Float } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

interface PlanetProps {
  distance: number;
  radius: number;
  color: string;
  speed: number;
  speedRef: React.MutableRefObject<number>;
  metalness?: number;
  roughness?: number;
  emissiveIntensity?: number;
  atmosphereColor?: string;
  hasRing?: boolean;
  ringColor?: string;
  hasBands?: boolean;
  bandColor?: string;
  tilt?: number;
}

function Planet({
  distance, radius, color, speed, speedRef,
  metalness = 0.3, roughness = 0.6, emissiveIntensity = 0.1,
  atmosphereColor, hasRing = false, ringColor,
  hasBands = false, bandColor, tilt = 0,
}: PlanetProps) {
  const orbitRef = useRef<THREE.Group>(null);
  const nodeRef = useRef<THREE.Mesh>(null);

  useFrame((_state, delta) => {
    if (orbitRef.current) {
      orbitRef.current.rotation.y += delta * speed * speedRef.current;
    }
    if (nodeRef.current) {
      nodeRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={orbitRef}>
      <Torus args={[distance, 0.001, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#445566" transparent opacity={0.15} />
      </Torus>
      
      <group position={[distance, 0, 0]} rotation={[tilt, 0, 0]}>
        <Sphere ref={nodeRef} args={[radius, 32, 32]}>
          <meshStandardMaterial 
            color={color}
            emissive={color}
            emissiveIntensity={emissiveIntensity}
            metalness={metalness}
            roughness={roughness}
          />
        </Sphere>

        {atmosphereColor && (
          <Sphere args={[radius * 1.2, 32, 32]}>
            <meshBasicMaterial 
              color={atmosphereColor} 
              transparent 
              opacity={0.12} 
              side={THREE.BackSide}
            />
          </Sphere>
        )}

        {hasBands && (
          <>
            <Torus args={[radius * 0.85, radius * 0.02, 8, 48]} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color={bandColor || '#ffffff'} transparent opacity={0.25} />
            </Torus>
            <Torus args={[radius * 0.6, radius * 0.015, 8, 48]} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color={bandColor || '#ffffff'} transparent opacity={0.15} />
            </Torus>
            <Torus args={[radius * 0.4, radius * 0.01, 8, 48]} rotation={[Math.PI / 2, 0, 0]}>
              <meshBasicMaterial color={bandColor || '#ffffff'} transparent opacity={0.1} />
            </Torus>
          </>
        )}

        {hasRing && (
          <>
            <Torus args={[radius * 1.6, radius * 0.15, 2, 64]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial 
                color={ringColor || color} 
                transparent opacity={0.5} 
                metalness={0.6} roughness={0.4}
                side={THREE.DoubleSide}
              />
            </Torus>
            <Torus args={[radius * 2.0, radius * 0.08, 2, 64]} rotation={[Math.PI / 2, 0, 0]}>
              <meshStandardMaterial 
                color={ringColor || color} 
                transparent opacity={0.25} 
                metalness={0.6} roughness={0.4}
                side={THREE.DoubleSide}
              />
            </Torus>
          </>
        )}
      </group>
    </group>
  );
}

function CoreSystem() {
  const systemRef = useRef<THREE.Group>(null);
  const sunCoreRef = useRef<THREE.Mesh>(null);
  const sunShellRef = useRef<THREE.Mesh>(null);
  
  const [hovered, setHovered] = useState(false);
  const speedRef = useRef(1);

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto';
  }, [hovered]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#main-scroll-container",
          start: "top top",
          end: "bottom bottom",
          scrub: 1, 
        }
      });

      if (systemRef.current) {
        tl.to(systemRef.current.position, { x: -2, y: -1, z: 0 }, 0);
        tl.to(systemRef.current.rotation, { x: 0.2, y: Math.PI * 0.2 }, 0);
        tl.to(systemRef.current.scale, { x: 1.2, y: 1.2, z: 1.2 }, 0);
        tl.to(systemRef.current.position, { x: 2, y: 2, z: -8 }, 1);
        tl.to(systemRef.current.rotation, { x: -0.1, y: Math.PI * 0.8 }, 1);
        tl.to(systemRef.current.scale, { x: 0.6, y: 0.6, z: 0.6 }, 1);
      }
    });
    return () => ctx.revert();
  }, []);

  useFrame((_state, delta) => {
    const targetSpeed = hovered ? 6 : 1; 
    speedRef.current = THREE.MathUtils.lerp(speedRef.current, targetSpeed, delta * 4);
    
    if (sunCoreRef.current) sunCoreRef.current.rotation.y += delta * 0.1 * speedRef.current;
    if (sunShellRef.current) {
      sunShellRef.current.rotation.y -= delta * 0.15 * speedRef.current;
      sunShellRef.current.rotation.x += delta * 0.05 * speedRef.current;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={systemRef} rotation={[0.2, 0, 0]} position={[1.5, 0, 0]}>
        
        <pointLight intensity={hovered ? 60 : 15} color="#00f0ff" distance={20} decay={1.5} />

        <group 
          onPointerOver={() => setHovered(true)} 
          onPointerOut={() => setHovered(false)}
          scale={hovered ? 1.05 : 1}
        >
          <Sphere ref={sunCoreRef} args={[0.7, 32, 32]}>
            <meshStandardMaterial 
              color="#020202" 
              emissive="#00f0ff" 
              emissiveIntensity={hovered ? 1.5 : 0.3} 
              metalness={1} 
              roughness={0.15} 
            />
          </Sphere>
          <Sphere ref={sunShellRef} args={[0.9, 16, 16]}>
             <meshBasicMaterial 
               color="#00f0ff" 
               wireframe 
               transparent 
               opacity={hovered ? 0.6 : 0.2} 
             />
          </Sphere>
        </group>


        {/* Mercúrio — pequeno, rochoso, cinza metálico */}
        <Planet speedRef={speedRef} distance={1.3} radius={0.05} speed={0.8}
          color="#b0b0b0" metalness={0.7} roughness={0.8} emissiveIntensity={0.05}
        />

        {/* Vénus — bege dourado, atmosfera densa amarelada */}
        <Planet speedRef={speedRef} distance={1.8} radius={0.08} speed={0.6}
          color="#e8cda0" metalness={0.2} roughness={0.7} emissiveIntensity={0.1}
          atmosphereColor="#ffe0a0"
        />

        {/* Terra — azul com atmosfera ciana */}
        <Planet speedRef={speedRef} distance={2.4} radius={0.12} speed={0.4}
          color="#4da6ff" metalness={0.15} roughness={0.55} emissiveIntensity={0.12}
          atmosphereColor="#88ccff" tilt={0.41}
        />

        {/* Marte — vermelho rochoso, seco */}
        <Planet speedRef={speedRef} distance={3.0} radius={0.06} speed={0.3}
          color="#c1440e" metalness={0.1} roughness={0.9} emissiveIntensity={0.08}
          tilt={0.44}
        />

        {/* Júpiter — gigante gasoso com faixas */}
        <Planet speedRef={speedRef} distance={4.0} radius={0.25} speed={0.15}
          color="#d4a574" metalness={0.05} roughness={0.45} emissiveIntensity={0.08}
          hasBands bandColor="#c4956a" atmosphereColor="#e8c8a0"
        />

        {/* Saturno — dourado com anéis icónicos */}
        <Planet speedRef={speedRef} distance={5.2} radius={0.20} speed={0.1}
          color="#e8d191" metalness={0.1} roughness={0.5} emissiveIntensity={0.08}
          hasRing ringColor="#d4c090" hasBands bandColor="#d4bf80"
          atmosphereColor="#f0e0b0" tilt={0.47}
        />

        {/* Urano — azul claro gelado, inclinação extrema */}
        <Planet speedRef={speedRef} distance={6.5} radius={0.15} speed={0.07}
          color="#7ec8e3" metalness={0.3} roughness={0.35} emissiveIntensity={0.1}
          atmosphereColor="#a0e0f0" tilt={1.71}
        />

        {/* Neptuno — azul profundo, atmosfera intensa */}
        <Planet speedRef={speedRef} distance={7.8} radius={0.12} speed={0.05}
          color="#4169e1" metalness={0.25} roughness={0.4} emissiveIntensity={0.12}
          atmosphereColor="#6090ff"
        />

      </group>
    </Float>
  );
}

export default CoreSystem;