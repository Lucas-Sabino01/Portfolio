import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import Lenis from 'lenis';
import CoreSystem from './components/SolarSystem';

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    return () => lenis.destroy();
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-[#030406] font-sans text-white overflow-x-hidden selection:bg-[#00f0ff] selection:text-black">
      
      <div className="fixed top-0 left-0 w-full h-full z-0 pointer-events-auto">
        <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
          <Stars radius={100} depth={50} count={2000} factor={1.5} saturation={0} fade speed={0.5} />
          
          <ambientLight intensity={0.05} />
          <directionalLight position={[10, 10, 5]} intensity={0.1} />
          
          <CoreSystem />
        </Canvas>
      </div>

      <main id="main-scroll-container" className="relative z-10 w-full pointer-events-none">
        
        <section className="h-screen flex flex-col items-start justify-center px-8 md:px-[10%] max-w-7xl mx-auto">
          <h1 className="text-[4rem] md:text-[7rem] font-black tracking-tighter leading-none mb-4">
            LUCAS SABINO
          </h1>
          <p className="text-xl md:text-3xl font-light text-[#5e7a96] tracking-wide mb-6">
            Engenharia de Software & Full-Stack
          </p>
          <div className="flex gap-4 pointer-events-auto">
             <span className="px-4 py-1.5 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-[#00f0ff] text-sm font-mono backdrop-blur-sm shadow-[0_0_15px_rgba(0,240,255,0.1)]">.NET / C#</span>
             <span className="px-4 py-1.5 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-[#00f0ff] text-sm font-mono backdrop-blur-sm shadow-[0_0_15px_rgba(0,240,255,0.1)]">React</span>
             <span className="px-4 py-1.5 rounded-full border border-yellow-500/30 text-yellow-500 bg-yellow-500/10 text-sm font-mono backdrop-blur-sm">1º Lugar SENAI</span>
          </div>
        </section>
        
        <section className="h-screen flex flex-col items-end justify-center px-8 md:px-[10%] text-right pointer-events-none max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Soluções que resolvem <br/> <span className="text-[#00f0ff]">problemas reais.</span>
          </h2>
          <p className="max-w-xl text-lg text-zinc-400 font-light leading-relaxed">
            Desenvolvedor focado em impacto industrial. Tenho experiência prática em criar pontes entre a engenharia de software sólida e a inovação — desde sistemas de gestão <strong>WMS</strong> a <strong>IoT (LoRaWAN)</strong> e <strong>Inteligência Artificial (LLMs)</strong>.
          </p>
        </section>
        
        <section className="min-h-screen flex flex-col items-start justify-center px-8 md:px-[10%] py-24 pointer-events-auto max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-12">Projetos de Destaque</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            
            <a href="#" className="group relative w-full h-56 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md bg-[#030406]/60 transition-all hover:bg-white/5 hover:border-[#00f0ff]/50 p-8 flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="relative z-10">
                <p className="text-xs font-mono text-[#00f0ff] mb-2">FULL STACK LEAD</p>
                <h3 className="text-2xl font-bold mb-2 group-hover:translate-x-2 transition-transform text-white group-hover:text-[#00f0ff]">Valmet Day@Shop</h3>
                <p className="text-sm text-zinc-400 mb-3">Sistema de planejamento de manutenção industrial com Gantt Charts interativos e notificações (SignalR).</p>
                <p className="text-xs font-mono text-[#5e7a96]">.NET Core • SQL Server • React</p>
              </div>
            </a>

            <a href="#" className="group relative w-full h-56 border border-yellow-500/20 rounded-xl overflow-hidden backdrop-blur-md bg-[#030406]/60 transition-all hover:bg-yellow-500/10 hover:border-yellow-500/40 p-8 flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="relative z-10">
                <p className="text-xs font-mono text-yellow-500 mb-2">🏆 1º LUGAR GRAND PRIX SENAI</p>
                <h3 className="text-2xl font-bold mb-2 group-hover:translate-x-2 transition-transform text-white group-hover:text-yellow-400">Delta WAN (IoT)</h3>
                <p className="text-sm text-zinc-400 mb-3">Solução de comunicação offline via LoRaWAN para mineradoras, garantindo fluxo de dados crítico.</p>
                <p className="text-xs font-mono text-[#5e7a96]">IoT • LoRaWAN • Hardware</p>
              </div>
            </a>

            <a href="#" className="group relative w-full h-56 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md bg-[#030406]/60 transition-all hover:bg-white/5 hover:border-[#00f0ff]/50 p-8 flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="relative z-10">
                <p className="text-xs font-mono text-[#00f0ff] mb-2">FRONT-END LEAD</p>
                <h3 className="text-2xl font-bold mb-2 group-hover:translate-x-2 transition-transform text-white group-hover:text-[#00f0ff]">Sistema ALFA</h3>
                <p className="text-sm text-zinc-400 mb-3">WMS focado em UX para chão de fábrica, substituindo planilhas físicas e otimizando o fluxo fabril.</p>
                <p className="text-xs font-mono text-[#5e7a96]">React • TypeScript • Tailwind</p>
              </div>
            </a>

            <a href="#" className="group relative w-full h-56 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md bg-[#030406]/60 transition-all hover:bg-white/5 hover:border-[#00f0ff]/50 p-8 flex flex-col justify-end">
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
              <div className="relative z-10">
                <p className="text-xs font-mono text-emerald-400 mb-2">PROJETO PESSOAL</p>
                <h3 className="text-2xl font-bold mb-2 group-hover:translate-x-2 transition-transform text-white group-hover:text-emerald-400">Assistente Gemini AI</h3>
                <p className="text-sm text-zinc-400 mb-3">Chatbot de atendimento humanizado com engenharia de prompt para contextos de negócio.</p>
                <p className="text-xs font-mono text-[#5e7a96]">LLM • Gemini 3.0 • Prompt Engineering</p>
              </div>
            </a>

          </div>
        </section>

      </main>
    </div>
  );
}