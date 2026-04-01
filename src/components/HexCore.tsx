import { useRef, useLayoutEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron, Cylinder, Torus, Float } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

export default function HexCore() {
  const gsapGroupRef = useRef<THREE.Group>(null);
  const mouseGroupRef = useRef<THREE.Group>(null);

  const coreRef = useRef<THREE.Mesh>(null);
  const innerRingRef = useRef<THREE.Group>(null);
  const outerHexRef = useRef<THREE.Group>(null);
  const dataParticlesRef = useRef<THREE.Group>(null);

  const upperHexRef = useRef<THREE.Mesh>(null);
  const lowerHexRef = useRef<THREE.Mesh>(null);
  const innerLightRef = useRef<THREE.PointLight>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#main-scroll-container",
          start: "top top",
          end: "bottom bottom",
          scrub: 1.2,
        }
      });

      if (upperHexRef.current) {
        tl.to(upperHexRef.current.position, { y: 3.5 }, 0);
        tl.to(upperHexRef.current.scale, { x: 1.3, z: 1.3 }, 0);
      }
      if (lowerHexRef.current) {
        tl.to(lowerHexRef.current.position, { y: -3.5 }, 0);
        tl.to(lowerHexRef.current.scale, { x: 1.3, z: 1.3 }, 0);
      }
      if (innerLightRef.current) {
        tl.to(innerLightRef.current, { intensity: 80, distance: 25 }, 0);
      }

      if (gsapGroupRef.current) {
        tl.to(gsapGroupRef.current.position, { x: -4, y: 0, z: -2 }, 0);
        tl.to(gsapGroupRef.current.rotation, { y: Math.PI / 2, x: 0.5 }, 0);
        
        tl.to(gsapGroupRef.current.position, { x: 4, y: 1, z: -4 }, 0.5);
        tl.to(gsapGroupRef.current.rotation, { y: Math.PI, x: -0.2 }, 0.5);

        tl.to(gsapGroupRef.current.position, { x: 0, y: 3, z: -6 }, 0.8);
        tl.to(gsapGroupRef.current.rotation, { y: Math.PI * 1.5, x: 0.2 }, 0.8);
      }
    });

    return () => ctx.revert();
  }, []);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.5;
      coreRef.current.rotation.x += delta * 0.2;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * 0.8;
      innerRingRef.current.rotation.y += delta * 0.1;
    }
    if (outerHexRef.current) {
      outerHexRef.current.rotation.y += delta * 0.2;
    }
    if (dataParticlesRef.current) {
      dataParticlesRef.current.rotation.y -= delta * 0.1;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      dataParticlesRef.current.scale.set(scale, scale, scale);
    }

    if (mouseGroupRef.current) {
      const targetX = (state.pointer.x * 0.5);
      const targetY = (state.pointer.y * 0.5);
      mouseGroupRef.current.position.x += (targetX - mouseGroupRef.current.position.x) * delta * 2;
      mouseGroupRef.current.position.y += (targetY - mouseGroupRef.current.position.y) * delta * 2;
      mouseGroupRef.current.rotation.x = -state.pointer.y * 0.2;
      mouseGroupRef.current.rotation.y = state.pointer.x * 0.2;
    }
  });

  return (
    <group ref={gsapGroupRef} position={[2, 0, 0]}>
      <group ref={mouseGroupRef}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <group rotation={[0.4, 0, 0]}>
            
            <pointLight ref={innerLightRef} color="#00f0ff" intensity={20} distance={10} />
            <pointLight color="#0088ff" intensity={5} distance={6} />

            <Icosahedron ref={coreRef} args={[0.8, 0]}>
              <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2.5} wireframe={true} />
            </Icosahedron>
            <Icosahedron args={[0.75, 0]}>
              <meshStandardMaterial color="#02040a" metalness={1} roughness={0.2} />
            </Icosahedron>

            <group ref={innerRingRef}>
              <Torus args={[1.4, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#5e7a96" metalness={0.8} roughness={0.2} />
              </Torus>
              <Torus args={[1.6, 0.01, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
                <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={1.5} />
              </Torus>
            </group>

            <group ref={outerHexRef}>
              <Cylinder ref={upperHexRef} args={[2.2, 2.2, 0.1, 6]} position={[0, 1.2, 0]}>
                <meshStandardMaterial color="#0a0a0c" metalness={0.9} roughness={0.1} wireframe={true} />
              </Cylinder>
              <Cylinder args={[2, 2, 2, 6]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#00f0ff" transparent opacity={0.03} metalness={1} roughness={0} side={THREE.DoubleSide} />
              </Cylinder>
              <Cylinder ref={lowerHexRef} args={[2.2, 2.2, 0.1, 6]} position={[0, -1.2, 0]}>
                <meshStandardMaterial color="#0a0a0c" metalness={0.9} roughness={0.1} wireframe={true} />
              </Cylinder>
            </group>

            <group ref={dataParticlesRef}>
              {[...Array(6)].map((_, i) => {
                const angle = (i / 6) * Math.PI * 2;
                const radius = 3;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                return (
                  <group key={i} position={[x, Math.sin(i) * 0.5, z]}>
                    <mesh>
                      <boxGeometry args={[0.2, 0.2, 0.2]} />
                      <meshStandardMaterial color="#ffffff" emissive="#00f0ff" emissiveIntensity={1.5} />
                    </mesh>
                    <Cylinder args={[0.01, 0.01, radius - 0.5, 3]} position={[-x/2, 0, -z/2]} rotation={[0, -angle, Math.PI / 2]}>
                      <meshBasicMaterial color="#00f0ff" transparent opacity={0.2} />
                    </Cylinder>
                  </group>
                );
              })}
            </group>

          </group>
        </Float>
      </group>
    </group>
  );
}