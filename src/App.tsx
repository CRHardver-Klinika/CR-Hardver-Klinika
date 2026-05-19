/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { Cpu, Zap, Activity, HardDrive, Monitor, Phone, Mail, MapPin, Facebook, X, ChevronRight, Menu } from "lucide-react";
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { submitMessage } from "./lib/firestore";

const IMAGES = {
  hero: "/hero.png",
  cpu: "/cpu_detail.png",
  gpu: "/gpu_zoom.png",
  devices: "/devices.png",
  logo: "/logo.png",
  workshop: "https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=1920&auto=format&fit=crop",
};

/* 
  ELŐNÉZET (Preview) JAVÍTÁSA:
  1. A bal oldali fájlkezelőben kattints a 'public' mappára.
  2. Töltsd fel (Drag & Drop) a képeidet ide.
  3. FIGYELEM: A screenshotodon láttam, hogy a fájljaid neve 'hero.png.png'. 
     Nevezd át őket, hogy csak egyszer szerepeljen bennük a .png (pl. 'hero.png')!
*/

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', content: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await submitMessage(formData.name, formData.email, formData.content);
      setStatus('success');
      setFormData({ name: '', email: '', content: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  return (
    <section id="contact" className="py-32 bg-[#0a0a0a] px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="text-brand-teal font-bold tracking-[0.4em] uppercase text-xs">Kapcsolatfelvétel</span>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight">
                KÉRJEN <br /> <span className="text-brand-cyan">AJÁNLATOT</span>
              </h2>
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md">
                Írja meg nekünk, milyen problémát tapasztal, és kollégánk hamarosan felveszi Önnel a kapcsolatot a részletekkel.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-brand-teal/30 transition-all">
                <Phone className="w-6 h-6 text-brand-teal mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Hívjon minket</p>
                <a href="tel:+36303413836" className="text-white font-bold hover:text-brand-teal transition-colors">+36 30 341 3836</a>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-brand-cyan/30 transition-all">
                <Mail className="w-6 h-6 text-brand-cyan mb-4 group-hover:scale-110 transition-transform" />
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Írjon e-mailt</p>
                <a href="mailto:cimpianrobert@crhardverklinika.com" className="text-white font-bold hover:text-brand-cyan transition-colors text-xs break-all">cimpianrobert@crhardverklinika.com</a>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-teal/10 blur-3xl -mr-16 -mt-16" />
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-slate-500 text-[10px] uppercase font-bold tracking-widest ml-4">Teljes Név</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Kovács János" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-brand-teal/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 text-[10px] uppercase font-bold tracking-widest ml-4">E-mail Cím</label>
                <input 
                  required
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="janos@pelda.hu" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-brand-teal/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 text-[10px] uppercase font-bold tracking-widest ml-4">Hiba leírása / Üzenet</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Milyen eszközről van szó és mi a hibajelenség?" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:outline-none focus:border-brand-teal/50 transition-all resize-none"
                />
              </div>
              
              <button 
                type="submit"
                disabled={status === 'sending'}
                className="w-full bg-white text-black font-black uppercase tracking-widest p-5 rounded-2xl hover:bg-brand-teal transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {status === 'sending' ? 'Küldés...' : 'Üzenet Küldése'}
                <ChevronRight className="w-5 h-5" />
              </button>

              {status === 'success' && (
                <motion.p 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="text-brand-teal text-center font-bold text-xs uppercase tracking-widest"
                >
                  Köszönjük! Üzenetedet sikeresen fogadtuk.
                </motion.p>
              )}
              {status === 'error' && (
                <p className="text-red-500 text-center font-bold text-xs uppercase tracking-widest">
                  Hiba történt. Kérjük próbáld újra később.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function Portfolio() {
  const [activeFilter, setActiveFilter] = useState('Összes');
  
  const items = [
    { src: "/p1.jpg", title: "Custom Build: Brutális Gamer Teljesítmény", category: "PC Építés" },
    { src: "/p2.jpg", title: "Premium GPU Karbantartás", category: "Karbantartás" },
    { src: "/p3.jpg", title: "White Ghost Gamer Build", category: "PC Építés" },
    { src: "/p4.jpg", title: "ASUS ROG Strix Build processzor újrapasztázás", category: "Szerviz" },
    { src: "/p5.jpg", title: "ASUS Strix alaplap Optimalizálás", category: "Szerviz" },
    { src: "/p6.jpg", title: "Futurisztikus Toronyépítés", category: "PC Építés" },
    { src: "/p7.jpg", title: "High-End Memória Tuning", category: "Premium" },
    { src: "/p8.jpg", title: "TUF Gaming Hardveres Tisztítás", category: "Karbantartás" },
    { src: "/p9.jpg", title: "Vízhűtéses Rendszer-ellenőrzés", category: "Karbantartás" },
  ];

  const filteredItems = activeFilter === 'Összes' 
    ? items 
    : items.filter(item => item.category === activeFilter);

  const filters = ['Összes', 'PC Építés', 'Szerviz', 'Karbantartás', 'Konzol'];

  return (
    <section id="portfolio" className="py-32 bg-[#050505] px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div className="space-y-4">
            <span className="text-brand-teal font-bold tracking-[0.4em] uppercase text-xs">Dolgoztunk rajta</span>
            <h2 className="text-4xl md:text-7xl font-bold text-white tracking-tighter uppercase">Portfólió</h2>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                  activeFilter === filter 
                    ? 'bg-brand-teal text-black shadow-[0_0_20px_rgba(8,247,254,0.3)]' 
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => (
              <motion.div 
                layout
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="group relative aspect-[4/5] overflow-hidden rounded-2xl md:rounded-[2.5rem] bg-neutral-900 border border-white/5"
              >
                <img 
                  src={item.src} 
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-100"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <span className="text-brand-cyan text-[8px] md:text-[10px] font-bold uppercase tracking-[0.3em] mb-1 md:mb-2 block">{item.category}</span>
                  <h4 className="text-xs md:text-2xl font-bold text-white tracking-tight leading-tight line-clamp-2">{item.title}</h4>
                  <div className="w-12 h-1 bg-brand-teal mt-4 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 hidden md:block" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-20 p-12 bg-white/5 rounded-[3rem] border border-white/5 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-brand-teal/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className="relative z-10 space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-white uppercase italic">Szeretné itt látni saját gépét?</h3>
            <p className="text-slate-400 max-w-xl mx-auto font-light leading-relaxed">
              Minden nálunk járt eszközről kérésre profi fotókat készítünk, hogy Ön is büszke lehessen megújult vagy újonnan épített hardverére.
            </p>
            <div className="pt-4">
              <a 
                href="#contact"
                className="inline-flex items-center gap-3 bg-white text-black font-black px-10 py-5 rounded-2xl uppercase tracking-widest hover:bg-brand-teal transition-all shadow-2xl"
              >
                Kezdjük el a közös munkát
                <ChevronRight className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function LandingPage() {
  const [showPrices, setShowPrices] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
      <nav className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-7xl px-0 md:px-4">
        <div className="bg-white/95 backdrop-blur-xl rounded-none md:rounded-b-3xl py-4 md:py-8 px-6 md:px-12 flex items-center justify-between shadow-[0_40px_80px_rgba(0,0,0,0.6)] border-x border-b border-white/30">
          <div className="flex items-center gap-6">
            <Link to="/" className="relative group">
              <div className="absolute -inset-1 bg-black/20 rounded-xl blur-sm group-hover:bg-black/40 transition-all duration-500" />
              <div className="relative bg-black rounded-lg p-2 border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.8)] flex items-center justify-center">
                <img 
                  src={IMAGES.logo} 
                  alt="CR Logo" 
                  className="h-10 md:h-14 w-auto object-contain block"
                  referrerPolicy="no-referrer"
                />
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center gap-8">
            {[
              { label: 'Főoldal', id: 'top' },
              { label: 'Szolgáltatások', id: 'services' },
              { label: 'Portfólió', id: 'portfolio' },
              { label: 'Műhely', id: 'workshop' },
              { label: 'Kapcsolat', id: 'footer' }
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
            <li>
              <a 
                href="#contact" 
                className="bg-black text-white px-6 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-brand-teal hover:text-black transition-all shadow-xl shadow-black/10 active:scale-95"
              >
                Kérjen ajánlatot
              </a>
            </li>
          </ul>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-black"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 mt-2 mx-4 bg-white rounded-3xl p-8 shadow-2xl lg:hidden border border-white/20 z-[60]"
            >
              <ul className="space-y-6">
                {[
                  { label: 'Főoldal', id: 'top' },
                  { label: 'Szolgáltatások', id: 'services' },
                  { label: 'Portfólió', id: 'portfolio' },
                  { label: 'Műhely', id: 'workshop' },
                  { label: 'Kapcsolat', id: 'footer' }
                ].map((item) => (
                  <li key={item.id}>
                    <a 
                      href={`#${item.id}`} 
                      onClick={() => setIsMenuOpen(false)}
                      className={`text-black font-black text-2xl tracking-widest uppercase block`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
                <li>
                  <a 
                    href="#contact" 
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-black text-white px-8 py-5 rounded-3xl font-black text-lg tracking-widest uppercase block text-center mt-4"
                  >
                    Kérjen ajánlatot
                  </a>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
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
              <p className="text-xl md:text-2xl text-brand-cyan max-w-3xl font-bold tracking-tight mb-2">
                Lassú? Hangos? Melegszik? – Ne várja meg, amíg elfüstöl!
              </p>
              <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-light tracking-wide">
                Professzionális hardver szerviz és karbantartás, mielőtt késő lenne. 
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
            
            <div className="absolute bottom-12 md:bottom-24 left-1/2 -translate-x-1/2 w-full max-w-4xl px-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-brand-teal">
                  <Cpu className="w-5 h-5" />
                  <span className="text-sm font-bold tracking-[0.2em] uppercase">Processor Unit</span>
                </div>
                <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tight">PRECÍZIÓS <br /> HŰTÉS</h3>
              </div>
              <p className="text-slate-400 max-w-xs text-sm leading-relaxed">
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

            <div className="absolute top-32 md:top-48 left-6 md:left-12 right-6 md:right-auto space-y-6">
              <div className="flex items-center gap-2 text-brand-cyan">
                <Zap className="w-6 h-6 fill-brand-cyan" />
                <span className="text-xs font-bold tracking-[0.3em] uppercase">Graphics Performance</span>
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tighter uppercase leading-[0.9]">
                  GYÁRI TELJESÍTMÉNY, <br /> CHIP-RE RECEPTRE!
                </h3>
                <p className="text-slate-300 text-sm md:text-base font-light leading-relaxed max-w-xl">
                  A kiszáradt hővezető paszta és az elöregedett padek akár 15-20°C-os melegedést, ezáltal drasztikus teljesítménycsökkenést és végzetes hardverhibát okozhatnak. Ne várd meg, amíg a méregdrága videókártyád feladja a harcot! Időszakos prémium karbantartásunkkal visszaadjuk a hardvered gyári hűtési hatékonyságát és maximális FPS számait.
                </p>
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
            
            <div className="absolute bottom-12 md:bottom-24 left-6 right-6 md:right-12 md:left-auto text-left md:text-right">
              <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-4 text-left md:text-right">KLINIKAI <br /> SZINTŰ ELLÁTÁS</h3>
              <p className="text-slate-300 text-sm md:text-base max-w-md md:ml-auto font-light leading-relaxed mb-8">
                Legyen szó játékkonzolról, professzionális munkaállomásról, gamer pc-ről vagy laptopról, mi gondoskodunk eszközeid egészségéről.
              </p>
              <div className="flex justify-start md:justify-end gap-3">
                <a 
                  href="#contact"
                  className="bg-brand-teal text-black font-bold px-8 py-3 rounded-full text-sm uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(8,247,254,0.3)]"
                >
                  Érdekel a javítás
                </a>
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
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-20 gap-8">
            <div className="space-y-4">
              <span className="text-brand-cyan font-bold tracking-[0.4em] uppercase text-xs">Specializációk</span>
              <h2 className="text-4xl md:text-7xl font-bold text-white tracking-tighter uppercase">Szolgáltatásaink</h2>
            </div>
            <p className="text-slate-400 max-w-md font-light leading-relaxed text-sm md:text-base">
              Minden beavatkozásunkat garanciával és részletes dokumentációval végezzük el műhelyünkben.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: <Activity />, title: "Általános Diagnosztika", desc: "Teljes körű hardveres és szoftveres hiba feltárás speciális mérőeszközökkel." },
              { icon: <Cpu />, title: "Újrapasztázás", desc: "Prémium minőségű hővezető anyagok használata a hőmérséklet csökkentése érdekében." },
              { icon: <Monitor />, title: "PC Építés", desc: "Egyedi igényekre szabott, profi PC összeszerelés prémium kábelrendezéssel." },
              { icon: <HardDrive />, title: "Bővítés & Tuning", desc: "Tárolóhely növelés, RAM bővítés és egyedi alkatrész installációk." }
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group p-6 md:p-8 bg-white/5 rounded-3xl border border-white/10 hover:border-brand-teal/30 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-brand-teal group-hover:bg-brand-teal group-hover:text-black transition-colors duration-500">
                  {service.icon}
                </div>
                <h4 className="text-lg md:text-xl font-bold text-white mb-3">{service.title}</h4>
                <p className="text-slate-400 font-light leading-relaxed text-xs md:text-sm flex-grow">{service.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-12 md:mt-16"
          >
            <button 
              onClick={() => setShowPrices(true)}
              className="group relative px-8 py-4 md:px-12 md:py-5 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] md:text-xs rounded-full hover:bg-brand-teal transition-all duration-300 shadow-[0_20px_40px_rgba(255,255,255,0.1)] flex items-center gap-3"
            >
              Áraink megtekintése
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Price List Modal */}
        <AnimatePresence>
          {showPrices && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPrices(false)}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-sm cursor-pointer"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-neutral-900 border border-white/10 w-full max-w-4xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl cursor-default max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 md:p-12 space-y-8 md:space-y-10">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight italic uppercase">Árlista</h3>
                      <p className="text-brand-teal text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase">Klinikai Szolgáltatások</p>
                    </div>
                    <button 
                      onClick={() => setShowPrices(false)}
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                  </div>

                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full text-left min-w-[500px] md:min-w-0">
                      <thead>
                        <tr className="text-slate-500 text-[9px] md:text-[10px] uppercase font-bold tracking-widest border-b border-white/5">
                          <th className="pb-4 font-bold">Szolgáltatás</th>
                          <th className="pb-4 font-bold">Tartalom</th>
                          <th className="pb-4 font-bold text-right">Javasolt Ár</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {[
                          { service: "Klinikai Tisztítás", content: "Portalanítás + Prémium újrapasztázás", price: "12.000 - 15.000 Ft" },
                          { service: "Szoftveres Frissítés", content: "Op. rendszer telepítés + Driverek", price: "10.000 - 12.000 Ft" },
                          { service: "Adatmentés", content: "Törölt adatok visszaállítása / Mentés", price: "8.000 Ft-tól" },
                          { service: "Hardveres Upgrade", content: "SSD/RAM beszerelés és beüzemelés", price: "6.000 Ft + alkatrész" },
                          { service: "PC Építés", content: "Profi összeszerelés & OS telepítés", price: "15.000 - 35.000 Ft" }
                        ].map((item, i) => (
                          <tr key={i} className="group">
                            <td className="py-4 md:py-6 text-white font-bold text-xs md:text-sm">{item.service}</td>
                            <td className="py-4 md:py-6 text-slate-400 text-[10px] md:text-xs font-light">{item.content}</td>
                            <td className="py-4 md:py-6 text-brand-cyan font-bold text-xs md:text-sm text-right whitespace-nowrap">{item.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 pt-4 md:pt-10">
                    <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/5">
                      <h4 className="text-white font-bold text-xs md:text-sm mb-2 md:mb-3 flex items-center gap-2">
                        <MapPin className="w-3 h-3 md:w-4 md:h-4 text-brand-teal" />
                        Mosonmagyaróvár
                      </h4>
                      <p className="text-slate-400 text-[10px] md:text-xs font-light leading-relaxed">
                        A városhatáron belül a szállítás <span className="text-brand-teal font-bold uppercase tracking-wider">díjmentes</span>, az alapár tartalmazza.
                      </p>
                    </div>
                    <div className="p-4 md:p-6 bg-white/5 rounded-2xl border border-white/5">
                      <h4 className="text-white font-bold text-xs md:text-sm mb-2 md:mb-3 flex items-center gap-2">
                        <Zap className="w-3 h-3 md:w-4 md:h-4 text-brand-cyan" />
                        Környék & Falvak
                      </h4>
                      <p className="text-slate-400 text-[10px] md:text-xs font-light leading-relaxed">
                        Fix <span className="text-white font-bold">3-4e Ft</span> kiszállás. 
                        <span className="block mt-1 text-brand-cyan font-medium italic">25.000 Ft felett ingyenes!</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                    <p className="text-slate-500 text-[9px] md:text-[10px] uppercase tracking-widest">Az árak tájékoztató jellegűek.</p>
                    <a 
                      href="#contact" 
                      onClick={() => setShowPrices(false)}
                      className="w-full md:w-auto bg-brand-teal text-black font-bold px-8 py-3 rounded-full text-[10px] md:text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(8,247,254,0.3)]"
                    >
                      Kérek egy konkrét ajánlatot
                    </a>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <Portfolio />

      {/* Workshop Branding Section */}
      <section id="workshop" className="relative py-48 bg-black overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <img 
            src={IMAGES.workshop} 
            alt="Home Workshop" 
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black" />
          <div className="absolute inset-0 bg-brand-teal/10 mix-blend-overlay" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl px-6 space-y-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="text-brand-cyan font-bold tracking-[0.5em] uppercase text-xs">A Műhely</span>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight">
              KLINIKAI MINŐSÉG <br /> <span className="text-brand-teal">OTTHONI KÖRNYEZETBEN</span>
            </h2>
            <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl mx-auto">
              Nem egy rideg nagyüzem, hanem egy dedikált, professzionális szervizstúdió, 
              ahol minden egyes gépnek megadjuk a szükséges időt és precíziót. 
              Modern technológia, halk munkamenet, maximális odafigyelés.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-white/10">
            {[
              { label: "Nyitvatartás", val: "Hétfő - Szombat: 08:00 - 18:00" },
              { label: "Átfutási idő", val: "24-72 óra" },
              { label: "Garancia", val: "100% Bizalom" },
              { label: "Környezet", val: "Portalanított" }
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest">{stat.label}</p>
                <p className="text-white font-bold text-sm md:text-base">{stat.val}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ContactForm />

      {/* Footer / Contact */}
      <footer id="footer" className="bg-[#050505] pt-32 pb-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <img src={IMAGES.logo} alt="CR Logo" className="h-16 invert opacity-80" referrerPolicy="no-referrer" />
              <p className="text-slate-400 text-lg font-light leading-relaxed max-w-md">
                Önnek csak egy hívásába kerül: házhoz megyünk PC-jéért, laptopjáért vagy konzoljáért, 
                majd a szerviz után tökéletes állapotban vissza is szállítjuk Önnek. 
                Kényelem és szakértelem, közvetlenül az otthonába.
              </p>
              <div className="flex gap-4">
                <a 
                  href="https://www.facebook.com/profile.php?id=61589728020534" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-5 py-2 border border-white/10 rounded-full text-xs font-bold text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all flex items-center gap-2"
                >
                  <Facebook className="w-4 h-4" />
                  Facebook
                </a>
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
                  { label: 'Kapcsolat', id: 'footer' }
                ].map(link => (
                  <li key={link.id}><a href={`#${link.id}`} className="hover:text-brand-teal transition-colors">{link.label}</a></li>
                ))}
              </ul>
            </div>

            <div className="space-y-6">
              <h5 className="text-white font-bold tracking-widest text-sm uppercase">Elérhetőség</h5>
              <ul className="space-y-6 text-slate-400 text-sm font-light">
                <li className="flex items-start gap-4">
                  <div className="w-8 flex-shrink-0 flex justify-center text-brand-teal pt-1">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="leading-relaxed">Mosonmagyaróvár és környéke</span>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 flex-shrink-0 flex justify-center text-brand-teal pt-1">
                    <Phone className="w-5 h-5" />
                  </div>
                  <a href="tel:+36303413836" className="hover:text-brand-teal transition-colors leading-relaxed">+36 30 341 3836</a>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 flex-shrink-0 flex justify-center text-brand-teal pt-1">
                    <Mail className="w-5 h-5" />
                  </div>
                  <a href="mailto:cimpianrobert@crhardverklinika.com" className="hover:text-brand-teal transition-colors leading-relaxed break-all">cimpianrobert@crhardverklinika.com</a>
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

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}
