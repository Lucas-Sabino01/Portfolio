import { useRef, useLayoutEffect } from 'react';
import { TorusKnot, Float } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

export default function AbstractCore() {
  const coreRef = useRef<THREE.Mesh>(null);

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

      if (coreRef.current) {
        tl.to(coreRef.current.position, { x: -3, y: -1 }, 0);
        tl.to(coreRef.current.rotation, { x: Math.PI * 1.5, y: Math.PI * 0.5 }, 0);
        tl.to(coreRef.current.scale, { x: 0.8, y: 0.8, z: 0.8 }, 0);

        tl.to(coreRef.current.position, { x: 3, y: 1 }, 1);
        tl.to(coreRef.current.rotation, { x: Math.PI * 3, y: Math.PI * 2 }, 1);
        tl.to(coreRef.current.scale, { x: 1.5, y: 1.5, z: 1.5 }, 1);
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <TorusKnot ref={coreRef} args={[1.2, 0.4, 128, 32]} position={[2, 0, 0]}>
        <meshStandardMaterial 
          color="#ffffff" 
          wireframe={true} 
          transparent={true}
          opacity={0.3}
        />
      </TorusKnot>
    </Float>
  );
}