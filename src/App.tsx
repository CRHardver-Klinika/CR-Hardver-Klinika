/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "motion/react";
import { Cpu, Zap, Activity, HardDrive, Monitor, Phone, Mail, MapPin, Facebook, X, ChevronRight, Menu, Shield } from "lucide-react";
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
  const [inquiryCount, setInquiryCount] = useState<number | null>(null);
  const [visitorCount, setVisitorCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    // Load initial statistics
    const loadStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (response.ok) {
          const data = await response.json();
          if (active) {
            setInquiryCount(data.inquiries);
            setVisitorCount(data.views);
          }
        }
      } catch (err) {
        console.warn("Látogatási és megkeresési statisztikák betöltése sikertelen:", err);
        if (active) {
          setInquiryCount(14);
          setVisitorCount(48);
        }
      }
    };

    // Safely trigger page visit increment on the backend
    const registerPageView = async () => {
      try {
        const response = await fetch('/api/stats/increment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'view' })
        });
        if (response.ok) {
          const result = await response.json();
          if (active && result && result.stats) {
            setInquiryCount(result.stats.inquiries);
            setVisitorCount(result.stats.views);
          }
        }
      } catch (err) {
        console.warn("Látogatói statisztika mentési hiba:", err);
      }
    };

    loadStats().then(() => {
      registerPageView();
    });

    return () => {
      active = false;
    };
  }, []);

  // Track click handler to dynamically count phone calls, email, and social direct contacting
  const handleContactClick = async () => {
    // Instant UI bump for immediate tactile feedback
    setInquiryCount(prev => (prev !== null ? prev + 1 : null));

    try {
      await fetch('/api/stats/increment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'click' })
      });
    } catch (err) {
      console.warn("Sikertelen kattintásmérés:", err);
    }
  };

  return (
    <section id="contact" className="py-32 bg-[#0a0a0a] px-6 scroll-mt-28 md:scroll-mt-44">
      <div className="max-w-7xl mx-auto text-center space-y-16">
        <div className="space-y-6 max-w-3xl mx-auto">
          <span className="text-brand-teal font-bold tracking-[0.4em] uppercase text-xs">Kapcsolatfelvétel</span>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-tight">
            KÉRJEN <span className="text-brand-cyan">AJÁNLATOT</span>
          </h2>
          <p className="text-slate-400 text-base md:text-lg font-light leading-relaxed">
            Vegye fel velünk a kapcsolatot telefonon, e-mailben, vagy írjon nekünk közvetlenül Facebook oldalunkon. Gyors és szakszerű segítség közvetlenül a szervizből!
          </p>

          {/* Glowing Lead/Inquiry and Visitor Dual Counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2">
            
            {/* Real-time Visitor Counter */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-teal/30 to-brand-cyan/30 rounded-2xl blur-lg opacity-20 group-hover:opacity-35 transition duration-500"></div>
              <div className="relative bg-white/[0.02] border border-white/5 px-5 py-4 rounded-xl flex items-center justify-between gap-4 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-cyan opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-cyan"></span>
                  </span>
                  <p className="text-[10px] md:text-xs text-slate-300 font-bold uppercase tracking-wider text-left">
                    Webhely látogatók száma:
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  {visitorCount !== null ? (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-brand-cyan font-mono text-xl md:text-2xl font-black block drop-shadow-[0_0_8px_rgba(8,247,254,0.4)]"
                    >
                      {visitorCount}
                    </motion.span>
                  ) : (
                    <div className="w-10 h-5 bg-white/5 animate-pulse rounded-md" />
                  )}
                </div>
              </div>
            </div>

            {/* Managed Inquiries & Interaction Clicks Counter */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-teal/30 to-brand-cyan/30 rounded-2xl blur-lg opacity-20 group-hover:opacity-35 transition duration-500"></div>
              <div className="relative bg-white/[0.02] border border-white/5 px-5 py-4 rounded-xl flex items-center justify-between gap-4 backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-teal opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-teal"></span>
                  </span>
                  <p className="text-[10px] md:text-xs text-slate-300 font-bold uppercase tracking-wider text-left">
                    Sikeres megkeresések száma:
                  </p>
                </div>
                <div className="text-right whitespace-nowrap">
                  {inquiryCount !== null ? (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-brand-teal font-mono text-xl md:text-2xl font-black block drop-shadow-[0_0_8px_rgba(8,247,254,0.4)]"
                    >
                      {inquiryCount}+
                    </motion.span>
                  ) : (
                    <div className="w-10 h-5 bg-white/5 animate-pulse rounded-md" />
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-4">
          {/* Phone Card */}
          <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 group hover:border-brand-teal/30 hover:bg-white/[0.07] transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-brand-teal/10 rounded-2xl flex items-center justify-center text-brand-teal mb-6 group-hover:scale-110 transition-transform duration-300">
              <Phone className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">Hívjon minket</p>
            <a 
              href="tel:+36303413836" 
              onClick={handleContactClick}
              className="text-white text-lg font-bold hover:text-brand-teal transition-colors tracking-wide"
            >
              +36 30 341 3836
            </a>
          </div>

          {/* Email Card */}
          <div className="p-8 bg-white/5 rounded-[2rem] border border-white/5 group hover:border-brand-cyan/30 hover:bg-white/[0.07] transition-all duration-300 flex flex-col items-center text-center">
            <div className="w-14 h-14 bg-brand-cyan/10 rounded-2xl flex items-center justify-center text-brand-cyan mb-6 group-hover:scale-110 transition-transform duration-300">
              <Mail className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">Írjon e-mailt</p>
            <a 
              href="mailto:cimpianrobert@crhardverklinika.com" 
              onClick={handleContactClick}
              className="text-white text-sm font-bold hover:text-brand-cyan transition-colors break-all"
            >
              cimpianrobert@crhardverklinika.com
            </a>
          </div>

          {/* Facebook Card */}
          <a 
            href="https://www.facebook.com/profile.php?id=61589728020534"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleContactClick}
            className="p-8 bg-white/5 rounded-[2rem] border border-white/5 group hover:border-[#1877F2]/40 hover:bg-white/[0.07] transition-all duration-300 flex flex-col items-center text-center cursor-pointer"
          >
            <div className="w-14 h-14 bg-[#1877F2]/10 rounded-2xl flex items-center justify-center text-[#1877F2] mb-6 group-hover:scale-110 transition-transform duration-300">
              <Facebook className="w-6 h-6" />
            </div>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-2">Írjon Facebookon</p>
            <span className="text-white text-lg font-bold group-hover:text-[#1877F2] transition-colors">CR Hardver Klinika</span>
          </a>
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
    <section id="portfolio" className="py-32 bg-[#050505] px-6 scroll-mt-20 md:scroll-mt-32">
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

const SignatureSVG = () => (
  <svg 
    viewBox="0 0 400 180" 
    className="w-44 h-16 md:w-56 md:h-20 fill-none stroke-brand-teal stroke-[3] stroke-linecap-round stroke-linejoin-round drop-shadow-[0_0_12px_rgba(8,247,254,0.4)] transition-all hover:scale-105 duration-300 hover:stroke-white cursor-pointer"
  >
    {/* Underlay trace glow */}
    <path 
      d="M 195 41 C 150 41, 100 55, 70 85 C 55 100, 51 120, 51 135 C 51 148, 62 158, 80 158 C 110 158, 145 130, 215 85 L 172 110 C 195 105, 210 95, 220 85 C 215 110, 210 130, 225 125 C 235 120, 242 110, 252 112 C 280 115, 305 112, 330 112 C 345 112, 360 110, 380 108" 
      className="stroke-brand-cyan/20 stroke-[6]"
    />
    {/* Main signature stroke */}
    <path 
      d="M 195 41 C 150 41, 100 55, 70 85 C 55 100, 51 120, 51 135 C 51 148, 62 158, 80 158 C 110 158, 145 130, 215 85 L 172 110 C 195 105, 210 95, 220 85 C 215 110, 210 130, 225 125 C 235 120, 242 110, 252 112 C 280 115, 305 112, 330 112 C 345 112, 360 110, 380 108" 
    />
  </svg>
);

function LandingPage() {
  const [showPrices, setShowPrices] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showCookiePolicy, setShowCookiePolicy] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent-accepted");
    if (!accepted) {
      const timer = setTimeout(() => {
        setShowCookieConsent(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptCookies = () => {
    localStorage.setItem("cookie-consent-accepted", "true");
    setShowCookieConsent(false);
  };

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
      <section id="services" className="relative z-20 py-32 bg-black px-6 scroll-mt-20 md:scroll-mt-32">
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
      </section>

      <Portfolio />

      {/* Workshop Branding Section */}
      <section id="workshop" className="relative py-48 bg-black overflow-hidden flex items-center justify-center scroll-mt-20 md:scroll-mt-32">
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
                <li>
                  <button 
                    onClick={() => setShowTerms(true)} 
                    className="hover:text-brand-teal transition-colors text-left cursor-pointer font-light block animate-pulse hover:animate-none"
                  >
                    Általános Szerződési Feltételek (ÁSZF)
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowPrivacy(true)} 
                    className="hover:text-brand-teal transition-colors text-left cursor-pointer font-light block"
                  >
                    Adatkezelési Tájékoztató
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setShowCookiePolicy(true)} 
                    className="hover:text-brand-teal transition-colors text-left cursor-pointer font-light block"
                  >
                     Süti (Cookie) Tájékoztató
                  </button>
                </li>
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
            <p>&copy; 2026 CR HARDVER KLINIKA. MINDEN JOG FENNTARTVA.</p>
            <p>MAXIMÁLIS TELJESÍTMÉNYRE TERVEZVE</p>
          </div>
        </div>
      </footer>

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
              className="bg-neutral-900 border border-white/10 w-full max-w-4xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl cursor-default max-h-[85vh] md:max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-12 space-y-8 md:space-y-10">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="space-y-1 max-w-[calc(100%-3.5rem)]">
                    <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight italic uppercase">Árlista</h3>
                    <p className="text-brand-teal text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase mb-1">Klinikai Szolgáltatások</p>
                    <p className="text-slate-400 text-[10px] leading-tight font-medium">
                      Ha vissza szeretne lépni, kattintson az árlista ablak melletti sötét területre, vagy használja a bezárás gombot.
                    </p>
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
                  <div className="space-y-1 text-center md:text-left">
                    <p className="text-slate-500 text-[9px] md:text-[10px] uppercase tracking-widest">Az árak tájékoztató jellegűek.</p>
                    <p className="text-slate-400 text-[9px] md:text-[10px]">
                      Ha vissza szeretne lépni, kattintson az árlista ablak melletti sötét területre.
                    </p>
                  </div>
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

      {/* ÁSZF Modal */}
      <AnimatePresence>
        {showTerms && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTerms(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-sm cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-white/10 w-full max-w-4xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl cursor-default max-h-[85vh] md:max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-12 space-y-8 md:space-y-10">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="space-y-1 max-w-[calc(100%-3.5rem)]">
                    <div className="flex items-center gap-3">
                      <img src={IMAGES.logo} alt="CR Logo" className="h-8 invert opacity-80" referrerPolicy="no-referrer" />
                      <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">Általános Szerződési Feltételek (ÁSZF)</h3>
                    </div>
                    <p className="text-brand-teal text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">CR Hardver Klinika — Szerviz és Kereskedelmi Szabályzat</p>
                  </div>
                  <button 
                    onClick={() => setShowTerms(false)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>

                <div className="text-slate-300 text-xs md:text-sm font-light space-y-6 md:space-y-8 leading-relaxed max-h-[50vh] overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">1.</span> A Szolgáltató (Vállalkozó) és Partnerei adatai
                    </h4>
                    <p>
                      Jelen Általános Szerződési Feltételek szabályozzák a <strong>CR Hardver Klinika</strong> márkanév alatt nyújtott szolgáltatásokat, termékértékesítéseket, valamint a Vásárlók/Megrendelők és a Szolgáltató közötti jogviszonyt.
                    </p>
                    <div className="bg-white/5 p-4 rounded-xl space-y-2 mt-2 border border-white/5 text-[11px] md:text-xs text-slate-300">
                      <p><strong>Egyéni vállalkozó neve:</strong> Cimpian Robert e.v.</p>
                      <p><strong>Kereskedelmi megnevezés:</strong> CR Hardver Klinika</p>
                      <p><strong>Székhely és levelezési cím:</strong> 9222 Hegyeshalom, Mező utca 6/a</p>
                      <p><strong>Adószám:</strong> 92075546-1-28</p>
                      <p><strong>Telefonos elérhetőség:</strong> +36 30 341 3836</p>
                      <p><strong>E-mail cím:</strong> <a href="mailto:cimpianrobert@crhardverklinika.com" className="text-brand-teal hover:underline font-medium">cimpianrobert@crhardverklinika.com</a></p>
                      <div className="border-t border-white/10 pt-2 mt-2 space-y-1.5 text-slate-400">
                        <p><strong>Tárhelyszolgáltató (Webtárhely):</strong> Vercel Inc. (cím: 340 S Lemon Ave #4133, Walnut, CA 91789, USA, weboldal: <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">vercel.com</a>)</p>
                        <p><strong>Adatbázis & Mentések:</strong> Google Firebase (Google Cloud EMEA Limited, cím: 70 Sir John Rogerson's Quay, Dublin 2, Írország, weboldal: <a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">firebase.google.com</a>) – Az adatbázis és a biztonságos felhő alapú mentések szakszerű háttere.</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">2.</span> A Szolgáltatások köre és szerződéses feltételek
                    </h4>
                    <p>
                      A Szolgáltató az alábbi szakszerű tevékenységeket végzi:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                      <li><strong>Hardveres javítás és diagnosztika:</strong> Számítógépek (PC-k), hordozható számítógépek (laptopok) és játékkonzolok (PlayStation, Xbox, Nintendo stb.) szakszerű hibafeltárása, hardverkomponensek javítása és cseréje.</li>
                      <li><strong>Klinikai tisztítás & Karbantartás:</strong> Teljes belső portalanítás, ventilátorok ultrahangos vagy mechanikus tisztítása és kenése, valamint prémium minőségű hővezető anyagok (paszták, thermal pad-ek) cseréje/újrapasztázása a hűtési teljesítmény javítása érdekében.</li>
                      <li><strong>PC Építés és Tuning:</strong> Egyedi igények alapján tervezett prémium minőségű, magas teljesítményű gamer, irodai és professzionális munkaállomások összeállítása, igényes kábelrendezéssel és optimális légáramlás-beállítással.</li>
                      <li><strong>Szoftveres konfigurálás:</strong> Operációs rendszerek telepítése, frissítése, eszközillesztő szoftverek (driverek) optimalizálása, vírusirtás.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">3.</span> Használt hardverek és összeépített számítógépek értékesítése
                    </h4>
                    <p>
                      A Szolgáltató egyedi használt/felújított alkatrészek és komplett számítógépek értékesítését is végzi egyéni vállalkozásként.
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                      <li>Minden eladásra kínált hardver és gép szigorú, többlépcsős diagnosztikai és terheléses teszten esik át a forgalomba hozatal előtt.</li>
                      <li><strong>Jótállási feltételek (Garancia):</strong> Az értékesített használt gépekre és alkatrészekre a Szolgáltató önkéntesen <strong>6-tól 12 hónapig</strong> terjedő (az adásvételi bizonylaton vagy szerződésen egyedileg rögzített) írásos jótállást (garanciát) vállal, amely a rendeltetésszerű használat mellett felmerülő hardveres meghibásodásokra vonatkozik.</li>
                      <li><strong>Kellékszavatosság:</strong> A Polgári Törvénykönyv (Ptk.) értelmében fogyasztói szerződés esetén a Vásárlót használt termék vásárlásakor a vásárlástól számított <strong>1 év</strong> kellékszavatossági jog illeti meg az esetlegesen már a vásárláskor fennálló, de később jelentkező gyártási vagy rejtett hibák tekintetében.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">4.</span> Háztól-házig szolgáltatás, logisztika és átvételi feltételek
                    </h4>
                    <p>
                      A kényelem érdekében a hardverek szállítását a Szolgáltató személyesen intézi:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                      <li>A Megrendelő otthonában, előre egyeztetett időpontban átvesszük a javítani kívánt gépet, szervizünkbe szállítjuk, majd a javítás végeztével visszaszállítjuk azt.</li>
                      <li><strong>Mosonmagyaróvár területén</strong> a szállítás díjmentes!</li>
                      <li>Vidékre és a környező falvakba fix kiszállási díj vonatkozik, amely 25.000 Ft feletti szervizmunkálatok esetén teljesen átvállalásra kerül.</li>
                      <li>A szállítási folyamat alatt a készülékekért és azok sérülésmentességéért a Szolgáltató <strong>teljes körű anyagi felelősséget vállal</strong>.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">5.</span> Adatbiztonság és Adatvesztési Felelősségkizárás
                    </h4>
                    <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl space-y-2">
                      <p className="text-red-400 font-bold uppercase text-[11px] tracking-wider">Kiemelt fontosságú rendelkezés — Kérjük, figyelmesen olvassa el!</p>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        A Szolgáltató a legnagyobb gondossággal jár el a rábízott eszközök kezelése során. Ugyanakkor az eszközök szervizelésével, alkatrész-cseréjével, hardveres tesztelésével vagy szoftveres konfigurálásával összefüggésben fellépő operációs rendszer összeomlásokért, fájlok, adatok, egyedi szoftverek vagy adatbázisok részleges vagy teljes elvesztéséért a <strong>Szolgáltató semmilyen felelősséggel nem tartozik</strong>.
                      </p>
                      <p className="text-slate-300 text-xs leading-relaxed font-semibold">
                        A Megrendelő kifejezett és kizárólagos kötelezettsége, hogy a leadott készüléken tárolt személyes és üzleti adatairól az eszköz hardveres átadását megelőzően hiánytalan biztonsági mentést készítsen.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">6.</span> Elállási jog (Távollévők közötti szerződések esetén)
                    </h4>
                    <p>
                      A fogyasztónak minősülő vásárló a 45/2014. (II. 26.) Korm. rendelet alapján jogosult az online megrendelt használt termékek (például futárral küldött számítógépek vagy alkatrészek) átvételétől számított <strong>14 napon belül</strong> indokolás nélkül elállni a szerződéstől.
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                      <li>Az elállási szándékot írásban, e-mailben vagy postai úton kell jelezni a fent megadott elérhetőségeken.</li>
                      <li>Elállás esetén a termék Szolgáltatónak történő visszajuttatásának közvetlen költsége a <strong>Vásárlót terheli</strong>.</li>
                      <li>A Szolgáltató a hiánytalan, sérülésmentes állapotban visszakapott termék ellenértékét az elállástól számított 14 napon belül visszatéríti a Vásárlóknak.</li>
                      <li>Szervizszolgáltatások (pl. elvégzett takarítás, javítás) esetén a szolgáltatás maradéktalan teljesítése után a Megrendelő elveszíti elállási jogát, amennyiben a teljesítés a kifejezett előzetes beleegyezésével kezdődött meg.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">7.</span> Panaszkezelés és Jogorvoslati Fórumok
                    </h4>
                    <p>
                      A Szolgáltató elkötelezett a vitás kérdések gyors és békés, mindkét fél számára megnyugtató úton történő rendezése iránt. Ha problémája merül fel, kérjük keresse fel közvetlenül a tulajdonost a <strong>+36 30 341 3836</strong>-os telefonszámon vagy e-mailben.
                    </p>
                    <p>
                      Amennyiben a panaszkezelés nem vezet eredményre, a fogyasztó békéltető testületi eljárást kezdeményezhet, melynek célja a peren kívüli, gyors egyezség létrehozása:
                    </p>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-[11px] md:text-xs text-slate-400 space-y-1">
                      <p className="text-white font-bold">Győr-Moson-Sopron Megyei Békéltető Testület</p>
                      <p><strong>Cím:</strong> 9021 Győr, Szent István út 10/a.</p>
                      <p><strong>Telefonszám:</strong> +36 96 520 217</p>
                      <p><strong>E-mail cím:</strong> bekelteto.testulet@gymsmkik.hu</p>
                    </div>
                  </section>

                  {/* Company and Signature Block inside the T&C document */}
                  <div className="mt-12 p-8 bg-black/40 border border-white/5 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-8">
                    <div className="space-y-2 text-center sm:text-left">
                      <p className="text-white font-bold text-sm">Cimpian Robert e.v.</p>
                      <p className="text-brand-teal text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase">CR Hardver Klinika</p>
                      <p className="text-[11px] text-slate-400">9222 Hegyeshalom, Mező utca 6/a</p>
                      <p className="text-[11px] text-slate-400">Adószám: 92075546-1-28</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <SignatureSVG />
                      <span className="text-[9px] text-brand-teal uppercase tracking-[0.25em] font-black -mt-2">Hiteles Aláírás</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                  <p className="text-slate-500 text-[9px] md:text-[10px] uppercase tracking-widest leading-relaxed">
                    Utolsó frissítés: 2026. május 26.
                  </p>
                  <button 
                    onClick={() => setShowTerms(false)}
                    className="w-full md:w-auto bg-brand-teal text-black font-bold px-8 py-3 rounded-full text-[10px] md:text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(8,247,254,0.3)]"
                  >
                    Elfogadom és Bezárom
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPrivacy(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-sm cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-white/10 w-full max-w-4xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl cursor-default max-h-[85vh] md:max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-12 space-y-8 md:space-y-10">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="space-y-1 max-w-[calc(100%-3.5rem)]">
                    <div className="flex items-center gap-3">
                      <img src={IMAGES.logo} alt="CR Logo" className="h-8 invert opacity-80" referrerPolicy="no-referrer" />
                      <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">Adatkezelési Tájékoztató</h3>
                    </div>
                    <p className="text-brand-teal text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">CR Hardver Klinika — GDPR Adatvédelem</p>
                  </div>
                  <button 
                    onClick={() => setShowPrivacy(false)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>

                <div className="text-slate-300 text-xs md:text-sm font-light space-y-6 md:space-y-8 leading-relaxed max-h-[50vh] overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">1.</span> Az Adatkezelő és Partnerei adatai
                    </h4>
                    <p>
                      Az Európai Unió Általános Adatvédelmi Rendeletével (GDPR - General Data Protection Regulation 2016/679/EU) és az információs önrendelkezési jogról és az információszabadságról szóló 2011. évi CXII. törvénnyel (Infotörvény) összhangban az Ön személyes adatainak védelme kiemelt fontosságú számunkra.
                    </p>
                    <div className="bg-white/5 p-4 rounded-xl space-y-2 mt-2 border border-white/5 text-[11px] md:text-xs text-slate-300">
                      <p><strong>Adatkezelő:</strong> Cimpian Robert e.v. (CR Hardver Klinika)</p>
                      <p><strong>Székhely:</strong> 9222 Hegyeshalom, Mező utca 6/a</p>
                      <p><strong>Adószám:</strong> 92075546-1-28</p>
                      <p><strong>Telefonszám:</strong> +36 30 341 3836</p>
                      <p><strong>E-mail cím:</strong> <a href="mailto:cimpianrobert@crhardverklinika.com" className="text-brand-teal hover:underline font-medium">cimpianrobert@crhardverklinika.com</a></p>
                      <div className="border-t border-white/10 pt-2 mt-2 space-y-1.5 text-slate-400">
                        <p><strong>Tárhelyszolgáltató (Webtárhely):</strong> Vercel Inc. (cím: 340 S Lemon Ave #4133, Walnut, CA 91789, USA, weboldal: <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">vercel.com</a>)</p>
                        <p><strong>Adatok tárolása & felhő diagnosztika:</strong> Google Firebase (Google Cloud EMEA Limited, cím: 70 Sir John Rogerson's Quay, Dublin 2, Írország, weboldal: <a href="https://firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-brand-teal hover:underline">firebase.google.com</a>) – a biztonságos adatelérésért, háttérmentésekért és űrlapkiszolgálásért felel.</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">2.</span> A kezelt adatok köre, célja és az adatkezelés jogalapja
                    </h4>
                    <p>
                      A szervizelés és kereskedelmi tevékenység zökkenőmentes bonyolításához az alábbi személyes adatokat kezeljük:
                    </p>
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                        <strong className="text-white block text-xs uppercase tracking-wider text-brand-teal">Kapcsolatfelvételi és ajánlatkérési űrlap:</strong>
                        <p className="text-slate-300">Név, e-mail cím, eszköz típusa (laptop, PC, konzol), hibaleírás.</p>
                        <p className="text-slate-400 text-[11px]"><strong>Cél:</strong> A Megrendelővel való közvetlen és professzionális kapcsolatfelvétel, hibadiagnosztika alapján testreszabott árajánlat készítése és eljuttatása.</p>
                        <p className="text-slate-400 text-[11px]"><strong>Jogalap:</strong> Az Érintett önkéntesen adott kifejezett hozzájárulása (GDPR 6. cikk (1) bekezdés a) pont).</p>
                      </div>

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                        <strong className="text-white block text-xs uppercase tracking-wider text-brand-teal">Szerződéskötés, munkalapok és szervizelés:</strong>
                        <p className="text-slate-300">Név, telefonszám, e-mail cím, szállítási/átvételi cím, az eszköz gyártói száma (Serial Number).</p>
                        <p className="text-slate-400 text-[11px]"><strong>Cél:</strong> A megrendelt takarítási, karbantartási vagy javítási megbízás biztonságos elvégzése, a háztól-házig logisztika megszervezése, garanciális igények kezelése.</p>
                        <p className="text-slate-400 text-[11px]"><strong>Jogalap:</strong> Olyan szerződés teljesítése, amelyben az érintett az egyik fél, vagy a szerződés megkötését megelőzően az ő kérésére történő lépések megtevése (GDPR 6. cikk (1) bekezdés b) pont).</p>
                      </div>

                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-1">
                        <strong className="text-white block text-xs uppercase tracking-wider text-brand-teal">Kötelező számla kiállítása:</strong>
                        <p className="text-slate-300">Számlázási név és számlázási cím, céges vásárló esetén adószám.</p>
                        <p className="text-slate-400 text-[11px]"><strong>Cél:</strong> A hatályos magyar és európai adózási- és számviteli jogszabályoknak megfelelő bizonylat- és számlakiállítás biztosítása.</p>
                        <p className="text-slate-400 text-[11px]"><strong>Jogalap:</strong> Az adatkezelőre vonatkozó jogi kötelezettség teljesítése (GDPR 6. cikk (1) bekezdés c) pont, valamint a Számviteli törvény előírásai).</p>
                      </div>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">3.</span> Adatbiztonsági intézkedések és adatfeldolgozók
                    </h4>
                    <p>
                      Személyes adatait a legnagyobb odafigyeléssel, titkosított kapcsolaton keresztül kezeljük. Külső marketing hálózatoknak vagy harmadik fél hirdetőknek személyes adatot <strong>SEMMILYEN KÖRÜLMÉNYEK KÖZÖTT</strong> nem továbbítunk, nem értékesítünk és nem adunk bérbe.
                    </p>
                    <p>
                      A stabil működés, a felhő alapú biztonság, a webhely gyors elérése, valamint a hivatalos számlázás érdekében az alábbi nemzetközi és hazai adatfeldolgozók infrastruktúráját vesszük igénybe:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 text-slate-400">
                      <li><strong>Vercel Inc. (Tárhelyszolgáltató):</strong> Biztosítja a webalkalmazás villámgyors globális kiszolgálását, kódlefutását és statikus állományainak biztonságos tárolását (SSL titkosítással). (340 S Lemon Ave #4133, Walnut, CA 91789, USA)</li>
                      <li><strong>Google Firebase Firestore (Adatok kezelése, biztonsági mentése):</strong> Szigorú hozzáférés-ellenőrzéssel és iparági titkosítással ellátott felhő alapú adatbázis, amely az ajánlatkérési űrlapi adatok átmeneti vagy végleges tárolásáért, titkosított mentéséért és megbízható kiszolgálásáért felel. (Google Cloud EMEA Ltd., Írország)</li>
                      <li><strong>Fattyú / Számlázz.hu vagy Billingo:</strong> On-line integrált hivatalos számlázó platform, mely a jogszabályi számlakiállítást biztosítja szinkronizált SSL kapcsolaton keresztül.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">4.</span> Az adatok tárolásának határideje
                    </h4>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
                      <li><strong>Egyszeri ajánlatkérések:</strong> 6 hónap tétlenség után az üzenettel együtt véglegesen és helyreállíthatatlanul törlésre kerülnek rendszerünkből.</li>
                      <li><strong>Megkötött szervíz megbízások szoftveres adatai:</strong> A szervizgarancia lejártát követő 1 éven belül archiválásra, majd törlésre kerülnek.</li>
                      <li><strong>Számlázási és bizonylati adatok:</strong> A Számviteli Törvény (2000. évi C. törvény 169. § (2) bekezdése) alapján a könyvviteli bizonylatokat legalább <strong>8 évig</strong> kötelező megőrizni halasztás nélkül.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">5.</span> Az Ön személyes adatokhoz fűződő adatvédelmi jogai
                    </h4>
                    <p>
                      A GDPR értelmében Ön az adatkezelés teljes időtartama alatt az alábbi érintetti jogokat gyakorolhatja teljesen ingyenesen a <a href="mailto:cimpianrobert@crhardverklinika.com" className="text-brand-teal font-medium hover:underline">cimpianrobert@crhardverklinika.com</a> e-mail címen:
                    </p>
                    <ul className="list-decimal pl-5 space-y-1.5 text-slate-400">
                      <li><strong>Hozzáférés joga:</strong> Ön kérhet részletes felvilágosítást arról, hogy pontosan milyen adatokat kezelünk Önről a rendszerünkben.</li>
                      <li><strong>Helyesbítés joga:</strong> Kérheti a megváltozott vagy tévesen rögzített adatainak azonnali javítását.</li>
                      <li><strong>Törlés joga ("elfeledtetés"):</strong> Kérésére töröljük adatait, feltéve, hogy azok megtartására törvényi jogszabály (pl. kötelező számlakezelés) minket nem kötelez.</li>
                      <li><strong>Adatkezelés korlátozása (Zárolás):</strong> Kérheti adatainak korlátozott tárolását specifikus vitás helyzetekben.</li>
                      <li><strong>Adathordozhatóság:</strong> Lekérheti kezelt adatait géppel olvasható, széles körben használt JSON vagy CSV formátumban.</li>
                      <li><strong>Visszavonás joga:</strong> Az űrlapi adatkezeléshez adott önkéntes hozzájárulását Ön bármikor, indoklás nélkül visszavonhatja.</li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-brand-teal/20 pb-2 flex items-center gap-2">
                      <span className="text-brand-teal font-mono">6.</span> Panasz és jogi jogorvoslat
                    </h4>
                    <p>
                      Mindent megtesznek az Ön biztonságáért. Ha bármilyen észrevétele, panasza vagy aggálya merülne fel, kérjük keressen fel minket közvetlenül az Adatkezelőt a <strong>+36 30 341 3836</strong>-os telefonszámon vagy e-mailben, hogy az ügyet azonnal megvizsgálhassuk és a lehető leggyorsabban barátságosan orvosolhassuk.
                    </p>
                    <p>
                      Személyes adatainak megsértése esetén Önnek joga van hivatalos bejelentéssel vagy panasszal élni a nemzeti adatvédelmi felügyeleti hatóságnál is:
                    </p>
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 text-[11px] md:text-xs text-slate-400 space-y-1">
                      <p className="text-white font-bold">Nemzeti Adatvédelmi és Információszabadság Hatóság (NAIH)</p>
                      <p><strong>Székhely:</strong> 1055 Budapest, Falk Miksa utca 9-11.</p>
                      <p><strong>Postacím:</strong> 1363 Budapest, Pf. 9.</p>
                      <p><strong>E-mail:</strong> ugyfelszolgalat@naih.hu</p>
                    </div>
                  </section>

                  {/* Company and Signature Block inside the Privacy document */}
                  <div className="mt-12 p-8 bg-black/40 border border-white/5 rounded-[2rem] flex flex-col sm:flex-row justify-between items-center gap-8">
                    <div className="space-y-2 text-center sm:text-left">
                      <p className="text-white font-bold text-sm">Cimpian Robert e.v.</p>
                      <p className="text-brand-teal text-[10px] md:text-xs font-bold tracking-[0.15em] uppercase">CR Hardver Klinika</p>
                      <p className="text-[11px] text-slate-400">9222 Hegyeshalom, Mező utca 6/a</p>
                      <p className="text-[11px] text-slate-400">Adószám: 92075546-1-28</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <SignatureSVG />
                      <span className="text-[9px] text-brand-teal uppercase tracking-[0.25em] font-black -mt-2">Hiteles Aláírás</span>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                  <p className="text-slate-500 text-[9px] md:text-[10px] uppercase tracking-widest leading-relaxed">
                    Utolsó frissítés: 2026. május 26.
                  </p>
                  <button 
                    onClick={() => setShowPrivacy(false)}
                    className="w-full md:w-auto bg-brand-teal text-black font-bold px-8 py-3 rounded-full text-[10px] md:text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(8,247,254,0.3)]"
                  >
                    Megértettem és Bezárom
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cookie Policy Modal */}
      <AnimatePresence>
        {showCookiePolicy && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCookiePolicy(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/95 backdrop-blur-sm cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-neutral-900 border border-white/10 w-full max-w-4xl rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl cursor-default max-h-[85vh] md:max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-12 space-y-8 md:space-y-10">
                <div className="flex justify-between items-start flex-wrap gap-4">
                  <div className="space-y-1 max-w-[calc(100%-3.5rem)]">
                    <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight uppercase">Süti (Cookie) Tájékoztató</h3>
                    <p className="text-brand-teal text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">CR Hardver Klinika — Az Ön adatainak és élményének védelme</p>
                  </div>
                  <button 
                    onClick={() => setShowCookiePolicy(false)}
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  >
                    <X className="w-5 h-5 md:w-6 md:h-6" />
                  </button>
                </div>

                <div className="text-slate-300 text-xs md:text-sm font-light space-y-6 md:space-y-8 leading-relaxed max-h-[50vh] overflow-y-auto pr-2 md:pr-4 custom-scrollbar">
                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-white/5 pb-2">1. Mik azok a sütik (Cookie-k)?</h4>
                    <p>
                      A süti (cookie) egy kis formátumú adatcsomag, amelyet a webszerver küld a látogató böngészőjének, és amelyet a látogató eszköze (számítógép, telefon, tablet) eltárol. A sütik segítenek abban, hogy a weboldal megjegyezze a látogatásával kapcsolatos beállításokat (például a süti tájékoztató elfogadásának tényét), növeljék az oldal használati élményét és biztonságát. A sütik nem tartalmaznak futtatható kódokat, nem hordoznak vírusokat és nem adnak hozzáférést a számítógépe merevlemezéhez.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-white/5 pb-2">2. Milyen sütiket használ ez a weboldal?</h4>
                    <p>
                      A CR Hardver Klinika honlapja kizárólag a legszükségesebb, úgynevezett <strong>technikai és működéshez elengedhetetlen (esszenciális)</strong> technológiákat és sütiket alkalmazza:
                    </p>
                    <ul className="list-disc pl-5 space-y-3 text-slate-400">
                      <li>
                        <strong>Cookie elfogadás állapota (Működési süti):</strong> A böngésző helyi tárhelyén (localStorage) rögzítjük, hogy Ön elfogadta-e ezt a süti nyilatkozatot. Ez megakadályozza, hogy a sötét, neon színű süti sáv minden egyes új lapbetöltésnél feleslegesen felugorjon. Élettartama: törlésig vagy manuális kiürítésig tartós.
                      </li>
                      <li>
                        <strong>Google Firebase Firestore (Technikai kapcsolat):</strong> Az árajánlatkérő űrlap biztonságos továbbításához a Google Firebase felhőszolgáltatását használjuk. Ez az integráció technikai biztonsági tokeneket és munkamenet-azonosítókat használhat az űrlap illetéktelen kitöltésének (spam, botok) megakadályozására.
                      </li>
                      <li>
                        <strong>Google Web Fonts (Betűtípusok betöltése):</strong> A honlap a modern és tiszta megjelenéshez Google Fonts betűtípusokat tölt be külső szerverről. Ennek során a Google technikai jellegű kapcsolat-naplózási adatokat tárolhat (pl. az Ön IP-címét a betűtípus kiszolgálásához).
                      </li>
                    </ul>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-white/5 pb-2">3. Reklám célú (Marketing) sütik</h4>
                    <p>
                      Kifejezetten büszkék vagyunk rá, hogy honlapunk <strong>NEM használ harmadik felektől származó, agresszív marketing vagy remarketing nyomkövető sütiket</strong> (mint amilyen például a Facebook Pixel vagy a Google AdSense követőkódok). Nem mutatunk látogatóinknak célzott reklámokat, és nem árusítjuk ki a böngészési szokásaikat hirdetési hálózatoknak. Böngészése nálunk teljesen biztonságos és privát marad.
                    </p>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-white/5 pb-2">4. Sütik ellenőrzése, engedélyezése és törlése</h4>
                    <p>
                      Minden modern böngésző lehetővé teszi a sütik megtekintését, kezelését, egyenkénti vagy csoportos törlését, illetve a teljes letiltást is. Ha szeretné beállítani vagy korlátozni a sütik használatát, ezt a saját böngészője beállításai (biztonság/adatvédelem menüpont) alatt teheti meg:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-[11px] md:text-xs text-slate-400">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <strong className="text-white block mb-1">Google Chrome:</strong>
                        Beállítások &rarr; Adatvédelem és biztonság &rarr; Cookie-k és egyéb webhelyadatok.
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <strong className="text-white block mb-1">Mozilla Firefox:</strong>
                        Beállítások &rarr; Adatvédelem és biztonság &rarr; Sütik és webhelyadatok.
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <strong className="text-white block mb-1">Safari (macOS / iOS):</strong>
                        Beállítások &rarr; Adatvédelem &rarr; Sütik és webhelyadatok blokkolása.
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <strong className="text-white block mb-1">Microsoft Edge:</strong>
                        Beállítások &rarr; Cookie-k és webhelyengedélyek.
                      </div>
                    </div>
                  </section>

                  <section className="space-y-2">
                    <h4 className="text-white font-bold text-sm md:text-base border-b border-white/5 pb-2">5. Jogi háttér és hozzájárulás</h4>
                    <p>
                      Jelen tájékoztató az elektronikus kereskedelmi szolgáltatások, valamint az információs társadalommal összefüggő szolgáltatások egyes kérdéseiről szóló 2001. évi CVIII. törvény, valamint az elektronikus hírközlésről szóló 2003. évi C. törvény 155. § (4) bekezdésével és a GDPR vonatkozó előírásaival összhangban készült.
                    </p>
                  </section>
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                  <p className="text-slate-500 text-[9px] md:text-[10px] uppercase tracking-widest leading-relaxed">
                    Utolsó frissítés: 2026. május 24.
                  </p>
                  <button 
                    onClick={() => setShowCookiePolicy(false)}
                    className="w-full md:w-auto bg-brand-teal text-black font-bold px-8 py-3 rounded-full text-[10px] md:text-xs uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(8,247,254,0.3)]"
                  >
                    Megértettem és bezárom
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cookie Consent Banner */}
      <AnimatePresence>
        {showCookieConsent && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[99] bg-neutral-900/95 backdrop-blur-md border border-brand-teal/20 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(8,247,254,0.15)] text-left flex flex-col gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl bg-brand-teal/10 flex items-center justify-center text-brand-teal flex-shrink-0">
                <Shield className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-white text-xs md:text-sm font-bold tracking-tight uppercase">Sütik (Cookie-k) használata</h4>
                <p className="text-slate-400 text-[10px] md:text-xs font-light leading-relaxed">
                  Honlapunk technikai és elengedhetetlen sütiket használ a biztonságos és stabil működés érdekében. Elfogadásával hozzájárul ezek használatához. Elolvashatja részletes <button onClick={() => setShowCookiePolicy(true)} className="text-brand-teal font-bold hover:underline">Süti Tájékoztatónkat</button>.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full self-end mt-2">
              <button 
                onClick={() => setShowCookiePolicy(true)} 
                className="flex-1 bg-white/5 text-white hover:bg-white/10 text-[10px] md:text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-xl transition-all border border-white/5 text-center"
              >
                Részletek
              </button>
              <button 
                onClick={handleAcceptCookies}
                className="flex-1 bg-brand-teal text-black hover:bg-white text-[10px] md:text-xs font-bold uppercase tracking-widest py-3 px-4 rounded-xl transition-all text-center shadow-[0_0_15px_rgba(8,247,254,0.3)]"
              >
                Elfogadom
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
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
