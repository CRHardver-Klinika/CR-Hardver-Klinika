/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";
import { Cpu, Zap, Activity, HardDrive, Monitor, Phone, Mail, MapPin } from "lucide-react";

const IMAGES = {
  hero: "/hero.png",
  cpu: "/cpu_detail.png",
  gpu: "/gpu_zoom.png",
  devices: "/devices.png",
  logo: "/logo.png",
};

/* 
  ELŐNÉZET (Preview) JAVÍTÁSA:
  1. A bal oldali fájlkezelőben kattints a 'public' mappára.
  2. Töltsd fel (Drag & Drop) a képeidet ide.
  3. FIGYELEM: A screenshotodon láttam, hogy a fájljaid neve 'hero.png.png'. 
     Nevezd át őket, hogy csak egyszer szerepeljen bennük a .png (pl. 'hero.png')!
*/

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Section 1: Hero to CPU (0 to 0.33)
  const heroScale = useTransform(smoothProgress, [0, 0.25], [1, 3.5]);
  const heroOpacity = useTransform(smoothProgress, [0.2, 0.3], [1, 0]);
  const heroX = useTransform(smoothProgress, [0, 0.25], ["0%", "5%"]);
  const heroY = useTransform(smoothProgress, [0, 0.25], ["0%", "-10%"]);

  // Section 2: CPU Detail (0.25 to 0.66)
  const cpuScale = useTransform(smoothProgress, [0.15, 0.3, 0.5, 0.6], [0.8, 1, 1.2, 2]);
  const cpuOpacity = useTransform(smoothProgress, [0.15, 0.25, 0.55, 0.65], [0, 1, 1, 0]);
  
  // Section 3: GPU Zoom (0.55 to 0.85)
  const gpuScale = useTransform(smoothProgress, [0.5, 0.65, 0.8, 0.9], [0.8, 1, 1.2, 2]);
  const gpuOpacity = useTransform(smoothProgress, [0.5, 0.6, 0.85, 0.95], [0, 1, 1, 0]);

  // Section 4: Devices (0.85 to 1)
  const devicesScale = useTransform(smoothProgress, [0.8, 0.95, 1], [1.2, 1, 1]);
  const devicesOpacity = useTransform(smoothProgress, [0.85, 0.95], [0, 1]);

  return (
    <div className="relative bg-black" id="top">
      {/* Navigation - Recreating the style from hero.png */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[96%] max-w-7xl">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl py-6 px-12 flex items-center justify-between shadow-[0_40px_80px_rgba(0,0,0,0.6)] border border-white/30">
          <div className="flex items-center gap-6">
            <img 
              src={IMAGES.logo} 
              alt="CR Logo" 
              className="h-16 w-auto object-contain block relative z-10"
              referrerPolicy="no-referrer"
            />
            <div className="hidden sm:block border-l border-gray-200 pl-6 relative z-10">
              <h1 className="text-black font-extrabold tracking-tighter text-xl uppercase leading-none">CR Hardver Klinika</h1>
              <p className="text-[11px] text-brand-cyan font-bold tracking-[0.3em] uppercase mt-1">Prémium Műszaki Szolgáltatás</p>
            </div>
          </div>
          <ul className="flex items-center gap-8">
            {[
              { label: 'Főoldal', id: 'top' },
              { label: 'Szolgáltatások', id: 'services' },
              { label: 'Portfólió', id: 'portfolio' },
              { label: 'Műhely', id: 'workshop' },
              { label: 'Kapcsolat', id: 'contact' }
            ].map((item) => (
              <li key={item.id}>
                <a 
                  href={`#${item.id}`} 
                  className="text-black/70 hover:text-black transition-colors font-bold text-xs tracking-widest uppercase flex items-center gap-2"
                >
                  <span className="opacity-30">[</span>
                  {item.label}
                  <span className="opacity-30">]</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Scroll Container */}
      <main ref={containerRef} className="relative h-[600vh]">
        {/* Sticky Visuals */}
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          
          {/* Layer 1: Hero (Workshop) */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-neutral-900"
            style={{ 
              scale: heroScale, 
              opacity: heroOpacity,
              x: heroX,
              y: heroY
            }}
          >
            <img 
              src={IMAGES.hero} 
              alt="Workshop" 
              className="w-full h-full object-cover opacity-80"
              referrerPolicy="no-referrer"
              loading="eager"
            />
            <div className="absolute inset-0 cinematic-vignette pointer-events-none" />
            <motion.div 
              className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-center px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <h2 className="text-5xl md:text-8xl font-bold text-white tracking-tighter mb-4">
                CR HARDVER <span className="text-brand-teal">KLINIKA</span>
              </h2>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light tracking-wide">
                Professzionális hardver szerviz, ahol a technológia életre kel. 
                Görgess lefelé a bepillantáshoz.
              </p>
              <div className="mt-12 animate-bounce">
                <div className="w-6 h-10 border-2 border-brand-cyan/50 rounded-full flex justify-center p-1">
                  <div className="w-1.5 h-1.5 bg-brand-cyan rounded-full" />
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Layer 2: CPU Detail */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center p-0 bg-neutral-900"
            style={{ scale: cpuScale, opacity: cpuOpacity }}
          >
            <img 
              src={IMAGES.cpu} 
              alt="CPU Detail" 
              className="w-full h-full object-cover opacity-90"
              referrerPolicy="no-referrer"
              loading="eager"
            />
            <div className="absolute inset-0 cinematic-vignette pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 flex justify-between items-end">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-teal">
                  <Cpu className="w-5 h-5" />
                  <span className="text-sm font-bold tracking-[0.2em] uppercase">Processor Unit</span>
                </div>
                <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tight">PRECÍZIÓS <br /> HŰTÉS</h3>
              </div>
              <p className="text-slate-400 max-w-xs text-sm leading-relaxed hidden md:block">
                A maximális teljesítmény alapja az optimális hőelvezetés. Minden szervizelésnél kiemelt figyelmet fordítunk a CPU hűtési hatékonyságára.
              </p>
            </div>
          </motion.div>

          {/* Layer 3: GPU Zoom */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ scale: gpuScale, opacity: gpuOpacity }}
          >
            <img 
              src={IMAGES.gpu} 
              alt="GPU" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 cinematic-vignette pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />

            <div className="absolute top-48 left-12 space-y-6">
              <div className="flex items-center gap-2 text-brand-cyan">
                <Zap className="w-6 h-6 fill-brand-cyan" />
                <span className="text-xs font-bold tracking-[0.3em] uppercase">Graphics Performance</span>
              </div>
              <div className="space-y-1">
                <h3 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">ULTRA <br /> GRAFIKA</h3>
                <p className="text-slate-400 text-sm font-medium tracking-widest">STABILITÁS TESZTELVE</p>
              </div>
              <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-12 h-1 bg-white/20 overflow-hidden">
                    <motion.div 
                      className="h-full bg-brand-cyan"
                      initial={{ x: "-100%" }}
                      animate={{ x: "0%" }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Layer 4: Devices */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center bg-black"
            style={{ scale: devicesScale, opacity: devicesOpacity }}
          >
            <img 
              src={IMAGES.devices} 
              alt="Console and Laptop" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 cinematic-vignette pointer-events-none opacity-40" />
            
            <div className="absolute bottom-24 right-12 text-right">
              <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4">KLINIKAI <br /> SZINTŰ ELLÁTÁS</h3>
              <p className="text-slate-300 text-base max-w-md ml-auto font-light leading-relaxed mb-8">
                Legyen szó játékkonzolról, professzionális munkaállomásról vagy laptopról, mi gondoskodunk eszközeid egészségéről.
              </p>
              <div className="flex justify-end gap-3">
                <button className="bg-brand-teal text-black font-bold px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(8,247,254,0.3)]">
                  Érdekel a javítás
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Content Overlay Info Cards */}
        <div className="relative z-10 pointer-events-none">
          {/* Just spacing out to allow scrolling */}
        </div>
      </main>

      {/* Services Section */}
      <section id="services" className="relative z-20 py-32 bg-black px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
            <div className="space-y-4">
              <span className="text-brand-cyan font-bold tracking-[0.4em] uppercase text-xs">Specializációk</span>
              <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">SZOLGÁLTATÁSAINK</h2>
            </div>
            <p className="text-slate-400 max-w-md font-light leading-relaxed">
              Minden beavatkozásunkat garanciával és részletes dokumentációval végezzük el műhelyünkben.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Activity />, title: "Általános Diagnosztika", desc: "Teljes körű hardveres és szoftveres hiba feltárás speciális mérőeszközökkel." },
              { icon: <Cpu />, title: "Újrapasztázás", desc: "Prémium minőségű hővezető anyagok használata a hőmérséklet csökkentése érdekében." },
              { icon: <HardDrive />, title: "Bővítés & Tuning", desc: "Tárolóhely növelés, RAM bővítés és egyedi alkatrész installációk." }
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="group p-10 bg-white/5 rounded-3xl border border-white/10 hover:border-brand-teal/30 transition-all duration-500 hover:-translate-y-2"
              >
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 text-brand-teal group-hover:bg-brand-teal group-hover:text-black transition-colors duration-500">
                  {service.icon}
                </div>
                <h4 className="text-2xl font-bold text-white mb-4">{service.title}</h4>
                <p className="text-slate-400 font-light leading-relaxed">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Workshop Branding Section */}
      <section id="workshop" className="relative h-screen bg-black overflow-hidden flex items-center justify-center">
        <div 
          className="absolute inset-0 opacity-20"
          style={{ 
            backgroundImage: `url(${IMAGES.logo})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(1) invert(1)'
          }}
        />
        <div className="relative z-10 text-center space-y-8 px-6">
          <motion.img 
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            src={IMAGES.logo} 
            alt="Main Logo"
            className="h-64 mx-auto object-contain mb-12 drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-widest uppercase">MŰHELYÜNK NYITVA ÁLL</h2>
            <p className="text-brand-cyan text-lg md:text-2xl font-medium tracking-[0.5em] uppercase">Hétfő - Péntek: 09:00 - 18:00</p>
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="bg-[#050505] pt-32 pb-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <img src={IMAGES.logo} alt="CR Logo" className="h-16 invert opacity-80" referrerPolicy="no-referrer" />
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md">
                A technológia bonyolult, mi egyszerűvé tesszük a kényelmet. 
                Várunk szeretettel modern klinikánkon.
              </p>
              <div className="flex gap-4">
                {['Instagram', 'Facebook', 'LinkedIn'].map(social => (
                  <a key={social} href="#" className="px-5 py-2 border border-white/10 rounded-full text-xs font-bold text-white hover:bg-white hover:text-black transition-all">
                    {social}
                  </a>
                ))}
              </div>
            </div>
            
            <div className="space-y-6">
              <h5 className="text-white font-bold tracking-widest text-sm uppercase">Gyorshivatkozások</h5>
              <ul className="space-y-4 text-slate-400 text-sm font-light">
                {[
                  { label: 'Főoldal', id: 'top' },
                  { label: 'Szolgáltatások', id: 'services' },
                  { label: 'Portfólió', id: 'portfolio' },
                  { label: 'Műhely', id: 'workshop' },
                  { label: 'Kapcsolat', id: 'contact' }
                ].map(link => (
                  <li key={link.id}><a href={`#${link.id}`} className="hover:text-brand-teal transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-white font-bold tracking-widest text-sm uppercase">Elérhetőség</h5>
              <ul className="space-y-6 text-slate-400 text-sm font-light">
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-teal">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span>1051 Budapest, Szent István tér</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-teal">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>+36 20 123 4567</span>
                </li>
                <li className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-brand-teal">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>szerviz@crhardver.hu</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase font-bold tracking-[0.2em] text-slate-600">
            <p>&copy; 2024 CR HARDVER KLINIKA. MINDEN JOG FENNTARTVA.</p>
            <p>MAXIMÁLIS TELJESÍTMÉNYRE TERVEZVE</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
