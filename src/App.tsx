import React, { useRef, useLayoutEffect, useEffect, useState, useCallback, type JSX } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Icosahedron, Cylinder, Torus, Float } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import * as THREE from 'three';

gsap.registerPlugin(ScrollTrigger);

const globalStyles = `
  body { cursor: none; background: #030406; overflow-x: hidden; }
  
  .stroke-text {
    color: transparent;
    -webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.8);
  }
  
  .noise-overlay {
    position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
    pointer-events: none; z-index: 9999; opacity: 0.03;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  }

  .custom-cursor {
    position: fixed; top: 0; left: 0; width: 50px; height: 50px;
    background: #00f0ff; border-radius: 50%;
    pointer-events: none; z-index: 10000;
    transform: translate(-50%, -50%);
    transition: width 0.3s cubic-bezier(0.25, 1, 0.5, 1), height 0.3s cubic-bezier(0.25, 1, 0.5, 1), background 0.3s, mix-blend-mode 0.3s;
    mix-blend-mode: exclusion;
  }
  .custom-cursor.hovering {
    width: 60px; height: 60px;
    background: rgba(255, 255, 255, 1);
    mix-blend-mode: difference;
  }

  /* Animação Marquee contínua */
  @keyframes marquee {
    0% { transform: translateX(0%); }
    100% { transform: translateX(-100%); }
  }
  .animate-marquee { display: flex; white-space: nowrap; animation: marquee 20s linear infinite; }
`;

function MagneticCTA({ children, href, className }: { children: React.ReactNode, href?: string, className?: string }): JSX.Element {
  const ref = useRef<HTMLAnchorElement>(null);
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { height, width, left, top } = el.getBoundingClientRect();
      const x = clientX - (left + width / 2);
      const y = clientY - (top + height / 2);
      gsap.to(el, { x: x * 0.4, y: y * 0.4, duration: 1, ease: "power3.out" });
    };
    
    const handleMouseLeave = () => gsap.to(el, { x: 0, y: 0, duration: 1, ease: "elastic.out(1, 0.3)" });
    
    el.addEventListener("mousemove", handleMouseMove);
    el.addEventListener("mouseleave", handleMouseLeave);
    
    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      el.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);
  
  const isExternal = href?.startsWith('http');
  
  return (
    <a ref={ref} href={href} className={className} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined}>
      {children}
    </a>
  );
}

function LoadingScreen(): JSX.Element | null {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 2000);
    return () => clearTimeout(timer);
  }, []);
  
  if (loaded) return null;
  
  return (
    <div className={`fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#030406] transition-opacity duration-1000 ${loaded ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="w-16 h-16 border-t-2 border-[#00f0ff] border-solid rounded-full animate-spin mb-8"></div>
      <p className="text-xs font-mono text-[#00f0ff]/80 tracking-[0.3em] uppercase animate-pulse">Iniciando Núcleo</p>
    </div>
  );
}

function MarqueeText(): JSX.Element {
  return (
    <div className="w-full overflow-hidden bg-[#00f0ff]/5 py-4 border-y border-[#00f0ff]/20 relative z-20">
      <div className="animate-marquee flex gap-8 items-center text-[#00f0ff]/60 font-mono text-xs md:text-sm tracking-widest uppercase">
        {[...Array(6)].map((_, i) => (
          <React.Fragment key={i}>
            <span>Engenharia de Software</span> <span className="text-white/30">///</span>
            <span>Microserviços</span> <span className="text-white/30">///</span>
            <span>IoT Industrial</span> <span className="text-white/30">///</span>
            <span>Arquitetura Hexagonal</span> <span className="text-white/30">///</span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: 'hero', label: 'Início' },
  { id: 'about', label: 'Sobre' },
  { id: 'trajectory', label: 'Trajetória' },
  { id: 'projects', label: 'Projetos' },
  { id: 'contact', label: 'Contato' },
];

function Navbar(): JSX.Element {
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useLayoutEffect(() => {
    const triggers: ScrollTrigger[] = [];
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => { if (self.isActive) setActiveSection(id); },
        })
      );
    });
    return () => triggers.forEach((t) => t.kill());
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-[#030406]/80 backdrop-blur-xl border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-8 md:px-[10%] flex items-center justify-between">
        <button onClick={() => scrollTo('hero')} className="text-lg font-bold tracking-tight text-white hover-trigger transition-colors cursor-none">
          LS<span className="text-[#00f0ff]">.</span>
        </button>
        <div className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ id, label }) => (
            <button key={id} onClick={() => scrollTo(id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 hover-trigger cursor-none ${activeSection === id ? 'text-[#00f0ff] bg-[#00f0ff]/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}>
              {label}
            </button>
          ))}
        </div>
        <a href="mailto:lucas3sabino@gmail.com" className="hidden md:block px-4 py-2 text-sm font-semibold border border-[#00f0ff]/30 text-[#00f0ff] rounded-lg hover:bg-[#00f0ff]/10 transition-all hover-trigger cursor-none">
          Contato
        </a>
      </div>
    </nav>
  );
}

// ==========================================
// COMPONENTE 3D: HexCore 
// ==========================================
function HexCore(): JSX.Element {
  const { camera } = useThree();
  
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
          scrub: 1.5,
        }
      });

      if (upperHexRef.current && lowerHexRef.current && innerLightRef.current) {
        tl.to(upperHexRef.current.position, { y: 4.5, duration: 1, ease: "power1.inOut" }, 0); 
        tl.to(lowerHexRef.current.position, { y: -4.5, duration: 1, ease: "power1.inOut" }, 0);
        tl.to(innerLightRef.current, { intensity: 100, distance: 30, duration: 1, ease: "power1.inOut" }, 0);
      }
      if (gsapGroupRef.current) {
        tl.to(gsapGroupRef.current.position, { x: 3.5, y: 0, z: -1, duration: 1, ease: "sine.inOut" }, 0);
        tl.to(gsapGroupRef.current.rotation, { y: Math.PI / 1.5, x: 0.3, duration: 1, ease: "sine.inOut" }, 0);
        
        tl.to(gsapGroupRef.current.position, { x: -4, y: 0, z: -2, duration: 1, ease: "sine.inOut" }, 1);
        tl.to(gsapGroupRef.current.rotation, { y: Math.PI * 1.2, x: -0.4, duration: 1, ease: "sine.inOut" }, 1);

        tl.to(gsapGroupRef.current.position, { x: 0, y: 2, z: 0, duration: 1, ease: "sine.inOut" }, 2);
        tl.to(gsapGroupRef.current.rotation, { y: Math.PI * 2.5, x: 0.1, duration: 1, ease: "sine.inOut" }, 2);
      }

      tl.to(camera.position, { z: 6, duration: 1, ease: "sine.inOut" }, 0); 
      tl.to(camera.position, { z: 9, duration: 1, ease: "sine.inOut" }, 2); 
    });
    
    return () => ctx.revert();
  }, [camera]);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.4;
      coreRef.current.rotation.x += delta * 0.2;
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z -= delta * 0.5;
      innerRingRef.current.rotation.y += delta * 0.1;
    }
    if (outerHexRef.current) {
      outerHexRef.current.rotation.y += delta * 0.15;
    }
    if (dataParticlesRef.current) {
      dataParticlesRef.current.rotation.y -= delta * 0.08;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 3) * 0.1;
      dataParticlesRef.current.scale.set(scale, scale, scale);
    }

    if (mouseGroupRef.current) {
      const targetX = (state.pointer.x * 0.8);
      const targetY = (state.pointer.y * 0.8);
      mouseGroupRef.current.position.x += (targetX - mouseGroupRef.current.position.x) * delta * 3;
      mouseGroupRef.current.position.y += (targetY - mouseGroupRef.current.position.y) * delta * 3;
      mouseGroupRef.current.rotation.x = -state.pointer.y * 0.3;
      mouseGroupRef.current.rotation.y = state.pointer.x * 0.3;
    }
  });

  return (
    <group ref={gsapGroupRef} position={[0, 0, 0]}>
      <group ref={mouseGroupRef}>
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
          <group rotation={[0.4, 0, 0]}>
            
            <pointLight ref={innerLightRef} color="#00f0ff" intensity={10} distance={15} />
            <pointLight color="#0044ff" intensity={5} distance={8} />

            <Icosahedron ref={coreRef} args={[0.8, 0]}>
              <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={3} wireframe={true} />
            </Icosahedron>
            <Icosahedron args={[0.75, 0]}>
              <meshStandardMaterial color="#02040a" metalness={1} roughness={0.1} />
            </Icosahedron>

            <group ref={innerRingRef}>
              <Torus args={[1.5, 0.015, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                <meshStandardMaterial color="#5e7a96" metalness={0.9} roughness={0.1} />
              </Torus>
              <Torus args={[1.7, 0.008, 16, 100]} rotation={[Math.PI / 3, 0, 0]}>
                <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={2} />
              </Torus>
            </group>

            <group ref={outerHexRef}>
              <Cylinder ref={upperHexRef} args={[2.4, 2.4, 0.05, 6]} position={[0, 1.2, 0]}>
                <meshStandardMaterial color="#0a0a0c" metalness={1} roughness={0.2} wireframe={true} />
              </Cylinder>
              <Cylinder args={[2.2, 2.2, 2, 6]} position={[0, 0, 0]}>
                <meshStandardMaterial color="#00f0ff" transparent opacity={0.02} metalness={1} roughness={0} side={THREE.DoubleSide} />
              </Cylinder>
              <Cylinder ref={lowerHexRef} args={[2.4, 2.4, 0.05, 6]} position={[0, -1.2, 0]}>
                <meshStandardMaterial color="#0a0a0c" metalness={1} roughness={0.2} wireframe={true} />
              </Cylinder>
            </group>

            <group ref={dataParticlesRef}>
              {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 3.5;
                const x = Math.cos(angle) * radius;
                const z = Math.sin(angle) * radius;
                return (
                  <group key={i} position={[x, Math.sin(i * 2) * 0.8, z]}>
                    <mesh>
                      <boxGeometry args={[0.15, 0.15, 0.15]} />
                      <meshStandardMaterial color="#ffffff" emissive="#00f0ff" emissiveIntensity={2} />
                    </mesh>
                    <Cylinder args={[0.005, 0.005, radius - 0.5, 3]} position={[-x/2, 0, -z/2]} rotation={[0, -angle, Math.PI / 2]}>
                       <meshBasicMaterial color="#00f0ff" transparent opacity={0.3} />
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

export default function App(): JSX.Element {
  const mainRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const elements = document.querySelectorAll('.gsap-reveal');
      elements.forEach((el) => {
        gsap.fromTo(el, 
          { autoAlpha: 0, y: 50, filter: 'blur(5px)', scale: 0.98 }, 
          { autoAlpha: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 1.2, ease: 'power3.out', 
            scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' } 
          }
        );
      });
    }, mainRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    
    const xTo = gsap.quickTo(cursor, "left", { duration: 0.1, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "top", { duration: 0.1, ease: "power3" });
    
    const moveCursor = (e: MouseEvent) => { 
      xTo(e.clientX); 
      yTo(e.clientY); 
    };
    
    const hoverStart = () => cursor.classList.add('hovering');
    const hoverEnd = () => cursor.classList.remove('hovering');
    
    window.addEventListener('mousemove', moveCursor);
    setTimeout(() => {
      const links = document.querySelectorAll('a, button, .hover-trigger');
      links.forEach(l => {
        l.addEventListener('mouseenter', hoverStart);
        l.addEventListener('mouseleave', hoverEnd);
      });
    }, 1000);
    
    return () => {
      window.removeEventListener('mousemove', moveCursor);
    };
  }, []);

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, lerp: 0.08, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    return () => lenis.destroy();
  }, []);

  return (
    <>
      <style>{globalStyles}</style>
      <LoadingScreen />
      <Navbar />
      <div className="noise-overlay" />
      <div className="custom-cursor hidden md:block" ref={cursorRef} />

      <div className="relative w-full bg-[#030406] font-sans text-white overflow-x-hidden selection:bg-[#00f0ff] selection:text-black">
        
        <div className="fixed top-0 left-0 w-full h-screen z-0 pointer-events-auto">
          <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
            <Stars radius={100} depth={50} count={3000} factor={1.5} saturation={0} fade speed={0.5} />
            <ambientLight intensity={0.1} />
            <directionalLight position={[10, 10, 5]} intensity={0.5} />
            
            <HexCore />

            <EffectComposer enableNormalPass>
              <Bloom luminanceThreshold={0.5} mipmapBlur intensity={1.5} />
              <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.002, 0.002)} />
              <Noise opacity={0.03} />
            </EffectComposer>
          </Canvas>
        </div>

        <main id="main-scroll-container" ref={mainRef} className="relative z-10 w-full pointer-events-none">
          
          <section id="hero" className="min-h-screen flex flex-col items-center justify-center px-4 pt-20 relative">
            <div className="text-center relative z-10 w-full hover-trigger">
              <h1 className="text-[15vw] leading-[0.8] font-black tracking-tighter uppercase stroke-text mix-blend-screen opacity-50 absolute top-[-5vw] left-1/2 -translate-x-1/2 w-full text-center">
                Lucas Sabino
              </h1>
              <h1 className="text-[10vw] md:text-[8rem] leading-[0.85] font-black tracking-tighter uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)] relative z-10">
                Lucas<br/>Sabino
              </h1>
            </div>
            
            <p className="gsap-reveal text-lg md:text-2xl font-bold text-white tracking-[0.2em] uppercase mt-8 mb-8 bg-[#030406]/70 px-8 py-3 rounded-full border border-white/10 backdrop-blur-lg shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              Engenharia de Software
            </p>
            
            <div className="gsap-reveal flex flex-wrap justify-center gap-4 pointer-events-auto">
              <span className="px-5 py-2 rounded-full border border-white/20 bg-black/40 text-white text-xs font-mono backdrop-blur-md">Java / Spring Boot</span>
              <span className="px-5 py-2 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-[#00f0ff] text-xs font-mono backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.2)]">Microserviços</span>
              <span className="px-5 py-2 rounded-full border border-yellow-500/30 text-yellow-500 bg-yellow-500/10 text-xs font-mono backdrop-blur-md shadow-[0_0_15px_rgba(234,179,8,0.2)]">1º Lugar SENAI</span>
            </div>
          </section>
          
          <MarqueeText />

          <section id="about" className="min-h-screen flex flex-col items-start justify-center px-8 md:px-[10%] pointer-events-none max-w-7xl mx-auto py-32">
            <div className="w-full pointer-events-auto bg-[#030406]/70 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <h2 className="gsap-reveal text-5xl md:text-7xl font-black tracking-tighter mb-8 leading-[0.9] hover-trigger">
                Soluções reais <br/> para desafios <br/> <span className="stroke-text text-[1.1em]">Complexos.</span>
              </h2>
              <div className="gsap-reveal w-16 h-1 bg-[#00f0ff] mb-8 shadow-[0_0_10px_rgba(0,240,255,0.8)]"></div>
              
              <div className="gsap-reveal max-w-2xl text-lg md:text-xl text-zinc-300 font-light leading-relaxed mb-12">
                Desenvolvedor Full Stack premiado por inovação industrial. Tenho experiência prática em criar pontes entre a engenharia de software sólida e a inovação — desde sistemas de gestão <strong className="text-white">WMS</strong> a <strong className="text-white">IoT (LoRaWAN)</strong> e integrações com <strong className="text-white">Inteligência Artificial</strong>.
              </div>

              <div className="gsap-reveal grid grid-cols-1 md:grid-cols-3 gap-6 pointer-events-auto">
                <div className="p-6 md:p-8 border border-white/10 rounded-2xl backdrop-blur-xl bg-[#030406]/60 hover:border-[#00f0ff]/40 transition-colors duration-500">
                  <h3 className="text-[#00f0ff] font-mono text-sm mb-4 tracking-widest">01 // BACKEND</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Java', 'Spring Boot', 'PostgreSQL', 'SQL Server', 'API RESTful', 'Microsserviços', 'C# & .NET'].map(skill => (
                      <span key={skill} className="px-3 py-1.5 rounded-lg border border-[#00f0ff]/20 bg-[#00f0ff]/5 text-zinc-200 text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
                
                <div className="p-6 md:p-8 border border-white/10 rounded-2xl backdrop-blur-xl bg-[#030406]/60 hover:border-[#00f0ff]/40 transition-colors duration-500">
                  <h3 className="text-[#00f0ff] font-mono text-sm mb-4 tracking-widest">02 // FRONTEND</h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS'].map(skill => (
                      <span key={skill} className="px-3 py-1.5 rounded-lg border border-[#00f0ff]/20 bg-[#00f0ff]/5 text-zinc-200 text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="p-6 md:p-8 border border-white/10 rounded-2xl backdrop-blur-xl bg-[#030406]/60 hover:border-[#00f0ff]/40 transition-colors duration-500">
                  <h3 className="text-[#00f0ff] font-mono text-sm mb-4 tracking-widest">03 // SOFT SKILLS</h3>
                  <div className="flex flex-wrap gap-2">
                    {['Git / GitHub', 'Visual Studio', 'Scrum / Ágil', 'Figma', 'Inglês (B2)'].map(skill => (
                      <span key={skill} className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-300 text-xs font-medium">{skill}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section id="trajectory" className="min-h-screen flex flex-col justify-center px-8 md:px-[10%] py-32 pointer-events-none max-w-7xl mx-auto items-end">
            <div className="w-full max-w-3xl pointer-events-auto text-right bg-[#030406]/70 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <h2 className="gsap-reveal text-5xl md:text-7xl font-black tracking-tighter mb-16 hover-trigger">
                Trajetória &amp; <br/> <span className="text-yellow-500 stroke-text text-[1.1em]">Prêmios</span>
              </h2>
              
              <div className="space-y-12">
                <div className="gsap-reveal group border-r-2 border-[#00f0ff]/30 pr-8 hover:border-[#00f0ff] transition-colors duration-500">
                  <p className="text-xs font-mono text-[#00f0ff] mb-2 tracking-widest">CURSANDO (2027)</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:-translate-x-2 transition-transform">Engenharia de Software</h3>
                  <p className="text-zinc-400 font-light text-sm md:text-base">UniSENAI PR - Formação com forte base em arquitetura de sistemas, metodologias ágeis e resolução de problemas complexos.</p>
                </div>

                <div className="gsap-reveal group border-r-2 border-yellow-500/30 pr-8 hover:border-yellow-500 transition-colors duration-500">
                  <p className="text-xs font-mono text-yellow-500 mb-2 tracking-widest">🏆 FINALISTA JORNADA FIEP (2026)</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:-translate-x-2 transition-transform">Grandes Indústrias (Valmet)</h3>
                  <p className="text-zinc-400 font-light text-sm md:text-base">Desenvolvimento do projeto Valmet Day@Shop. Sistema de planejamento de manutenção com Gantt interativos e alertas em tempo real.</p>
                </div>

                <div className="gsap-reveal group border-r-2 border-yellow-500/30 pr-8 hover:border-yellow-500 transition-colors duration-500">
                  <p className="text-xs font-mono text-yellow-500 mb-2 tracking-widest">🏆 1º LUGAR JORNADA FIEP (2025)</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:-translate-x-2 transition-transform">Inovação Industrial Renault</h3>
                  <p className="text-zinc-400 font-light text-sm md:text-base">Criação de uma solução de melhoria acústica sustentável desenvolvida exclusivamente para atender às demandas de linha da Renault.</p>
                </div>

                <div className="gsap-reveal group border-r-2 border-yellow-500/30 pr-8 hover:border-yellow-500 transition-colors duration-500">
                  <p className="text-xs font-mono text-yellow-500 mb-2 tracking-widest">🏆 1º LUGAR GRAND PRIX SENAI</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:-translate-x-2 transition-transform">Projeto Delta WAN (IoT)</h3>
                  <p className="text-zinc-400 font-light text-sm md:text-base">Solução de comunicação offline via LoRaWAN focada em mineradoras, garantindo fluxo de dados crítico e segurança do trabalho em tempo real.</p>
                </div>

                <div className="gsap-reveal group border-r-2 border-white/20 pr-8 hover:border-white transition-colors duration-500">
                  <p className="text-xs font-mono text-zinc-400 mb-2 tracking-widest">FEV 2022 - MAI 2022</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:-translate-x-2 transition-transform">Suporte Técnico</h3>
                  <p className="text-zinc-400 font-light text-sm md:text-base">Radiante Engenharia - Manutenção de hardware, montagem de infraestrutura e suporte técnico local como Jovem Aprendiz.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="projects" className="min-h-screen flex flex-col items-start justify-center px-8 md:px-[10%] py-32 pointer-events-none max-w-7xl mx-auto relative z-20">
            <h2 className="gsap-reveal text-5xl md:text-7xl font-black tracking-tighter mb-16 hover-trigger">
              Projetos em <br/> <span className="stroke-text text-[1.1em]">Destaque.</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full pointer-events-auto">
              
              <a href="#" className="gsap-reveal group relative w-full h-auto min-h-[16rem] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl bg-[#030406]/60 transition-all hover:bg-white/5 hover:border-[#00f0ff]/50 p-8 flex flex-col justify-end shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="relative z-10">
                  <p className="text-xs font-mono text-[#00f0ff] mb-2">FULL STACK LEAD</p>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:translate-x-2 transition-transform text-white group-hover:text-[#00f0ff]">Valmet Day@Shop</h3>
                  <p className="text-sm md:text-base text-zinc-400 mb-6 font-light">Sistema de planejamento de manutenção industrial com gráficos de Gantt interativos e notificações em tempo real.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-black/40">Java</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-black/40">Spring Boot</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-black/40">React</span>
                  </div>
                </div>
              </a>

              <a href="#" className="gsap-reveal group relative w-full h-auto min-h-[16rem] border border-yellow-500/20 rounded-2xl overflow-hidden backdrop-blur-xl bg-[#030406]/60 transition-all hover:bg-yellow-500/5 hover:border-yellow-500/40 p-8 flex flex-col justify-end shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="relative z-10">
                  <p className="text-xs font-mono text-yellow-500 mb-2">🏆 1º LUGAR GRAND PRIX SENAI</p>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:translate-x-2 transition-transform text-white group-hover:text-yellow-400">Delta WAN (IoT)</h3>
                  <p className="text-sm md:text-base text-zinc-400 mb-6 font-light">Solução de comunicação offline via LoRaWAN para mineradoras, garantindo o fluxo de dados críticos e de segurança.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-black/40">IoT</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-black/40">LoRaWAN</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-black/40">Hardware</span>
                  </div>
                </div>
              </a>

              <a href="#" className="gsap-reveal group relative w-full h-auto min-h-[16rem] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl bg-[#030406]/60 transition-all hover:bg-white/5 hover:border-[#00f0ff]/50 p-8 flex flex-col justify-end shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="relative z-10">
                  <p className="text-xs font-mono text-[#00f0ff] mb-2">FRONT-END LEAD</p>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:translate-x-2 transition-transform text-white group-hover:text-[#00f0ff]">Sistema ALFA</h3>
                  <p className="text-sm md:text-base text-zinc-400 mb-6 font-light">WMS focado em UX para chão de fábrica, substituindo planilhas físicas e otimizando processos de fluxo fabril.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-black/40">React</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-black/40">TypeScript</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-black/40">Tailwind</span>
                  </div>
                </div>
              </a>

              <a href="#" className="gsap-reveal group relative w-full h-auto min-h-[16rem] border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl bg-[#030406]/60 transition-all hover:bg-white/5 hover:border-emerald-400/50 p-8 flex flex-col justify-end shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                <div className="relative z-10">
                  <p className="text-xs font-mono text-emerald-400 mb-2">PROJETO PESSOAL</p>
                  <h3 className="text-2xl md:text-3xl font-bold mb-3 group-hover:translate-x-2 transition-transform text-white group-hover:text-emerald-400">Assistente Gemini AI</h3>
                  <p className="text-sm md:text-base text-zinc-400 mb-6 font-light">Chatbot de atendimento humanizado focado em engenharia de prompts para lidar com contextos de negócios.</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-black/40">LLM</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-black/40">Gemini 3.0</span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono border border-white/20 bg-black/40">Prompt Eng.</span>
                  </div>
                </div>
              </a>

            </div>
          </section>

          <section id="contact" className="h-screen flex flex-col items-center justify-center px-8 text-center pointer-events-auto relative overflow-hidden">
            <h2 className="gsap-reveal text-[10vw] md:text-[8rem] font-black tracking-tighter leading-[0.8] mb-12 hover-trigger opacity-20 stroke-text absolute top-1/2 -translate-y-1/2 pointer-events-none">
              START PROJECT
            </h2>
            <div className="gsap-reveal z-10 flex flex-col items-center">
              <MagneticCTA href="mailto:lucas3sabino@gmail.com" className="hover-trigger group relative px-12 py-6 rounded-full bg-white text-black font-bold text-xl overflow-hidden mb-8">
                <span className="relative z-10 uppercase tracking-widest cursor-none">Vamos Conversar</span>
                <div className="absolute inset-0 bg-[#00f0ff] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out z-0"></div>
              </MagneticCTA>
              <div className="flex gap-4 font-mono text-sm text-zinc-400">
                <a href="https://www.linkedin.com/in/lucas-sabino-492571355" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold transition-colors uppercase cursor-none hover-trigger shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md">LinkedIn</a>
                <a href="https://github.com/Lucas-Sabino01" target="_blank" rel="noopener noreferrer" className="px-6 py-3 rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold transition-colors uppercase cursor-none hover-trigger shadow-[0_0_20px_rgba(0,0,0,0.5)] backdrop-blur-md">GitHub</a>
              </div>
            </div>
            <p className="absolute bottom-8 text-xs text-zinc-600 font-mono pointer-events-none">
              &copy; {new Date().getFullYear()} Lucas Sabino. Desenvolvido com React, Three.js &amp; Tailwind.
            </p>
          </section>

        </main>
      </div>
    </>
  );
}