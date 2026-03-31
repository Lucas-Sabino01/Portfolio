import { useRef, useEffect } from 'react';
import { Box } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedCube() {
  const cubeRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#main-scroll-container",
          start: "top top",
          end: "bottom bottom",
          scrub: 1, 
        }
      });

      if (cubeRef.current) {
        tl.to(cubeRef.current.position, { x: -2, y: 1 }, 0);
        tl.to(cubeRef.current.rotation, { x: Math.PI, y: Math.PI }, 0);

        tl.to(cubeRef.current.position, { x: 2, y: -1 }, 1);
        tl.to(cubeRef.current.scale, { x: 2, y: 2, z: 2 }, 1);
        tl.to(cubeRef.current.rotation, { x: Math.PI * 2, y: Math.PI * 3 }, 1);
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <Box ref={cubeRef} args={[1.5, 1.5, 1.5]} position={[2, 0, 0]}>
      <meshStandardMaterial color="#4f46e5" wireframe={true} />
    </Box>
  );
}