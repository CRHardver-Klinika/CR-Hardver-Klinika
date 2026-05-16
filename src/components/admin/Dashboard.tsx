import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Box, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Database,
  Mail,
  Calendar,
  ChevronRight,
  Activity,
  X
} from 'lucide-react';
import { auth, logout, db } from '../../lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, limit, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_EMAIL = "Cimpian.Robert.88@gmail.com";

interface Message {
  id: string;
  name: string;
  email: string;
  content: string;
  status: string;
  createdAt: any;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  joinedAt: any;
}

function StatsCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-neutral-900 border border-white/5 rounded-[2rem] p-8 hover:border-brand-teal/20 transition-all group shadow-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/2 blur-[80px] -mr-12 -mt-12 group-hover:bg-brand-teal/10 transition-colors" />
      <div className={`w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 ${color} group-hover:scale-110 transition-transform duration-500`}>
        <Icon className="w-7 h-7" />
      </div>
      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.25em] mb-2">{label}</p>
      <h3 className="text-5xl font-black tracking-tighter">{value}</h3>
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'inventory' | 'messages'>('overview');
  const [messages, setMessages] = useState<Message[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  // Form states
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '', address: '' });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      if (u && u.email === ADMIN_EMAIL) {
        setUser(u);
      } else {
        navigate('/');
      }
      setLoading(false);
    });

    // Fetch messages (Real-time)
    const qMsg = query(collection(db, 'messages'), orderBy('createdAt', 'desc'), limit(50));
    const unsubscribeMessages = onSnapshot(qMsg, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs.filter(m => m.status !== 'archived'));
    });

    // Fetch customers (Real-time)
    const qCust = query(collection(db, 'customers'), orderBy('joinedAt', 'desc'));
    const unsubscribeCustomers = onSnapshot(qCust, (snapshot) => {
      const custs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      setCustomers(custs);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMessages();
      unsubscribeCustomers();
    };
  }, [navigate]);

  const handleArchiveMessage = async (id: string) => {
    try {
      await updateDoc(doc(db, 'messages', id), { status: 'archived' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'customers'), {
        ...newCustomer,
        joinedAt: serverTimestamp()
      });
      setShowAddModal(false);
      setNewCustomer({ name: '', email: '', phone: '', address: '' });
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
      <motion.div 
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 border-t-4 border-l-4 border-brand-teal rounded-full"
      />
      <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-xs animate-pulse">Rendszer betöltése...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col md:flex-row font-sans">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-80 bg-neutral-900 border-r border-white/5 flex-col p-8 fixed h-full z-20">
        <div className="flex items-center gap-4 mb-16 px-2">
          <div className="w-12 h-12 bg-brand-teal rounded-2xl flex items-center justify-center text-black shadow-[0_0_30px_rgba(8,247,254,0.3)]">
            <Database className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-black tracking-tighter text-xl italic uppercase leading-none">Hardver<br/><span className="text-brand-teal">Klinika</span></h1>
            <p className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-black mt-1">Management App</p>
          </div>
        </div>

        <nav className="flex-grow space-y-3">
          {[
            { id: 'overview', label: 'Irányítópult', icon: Database },
            { id: 'customers', label: 'Ügyféltár', icon: Users },
            { id: 'inventory', label: 'Raktárkészlet', icon: Box },
            { id: 'messages', label: 'Üzenetek', icon: MessageSquare },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-500 group ${
                activeTab === item.id 
                  ? 'bg-white text-black shadow-2xl scale-[1.02]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-black' : 'group-hover:text-brand-teal transition-colors'}`} />
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              {item.id === 'messages' && messages.length > 0 && activeTab !== 'messages' && (
                <span className="ml-auto w-5 h-5 bg-brand-cyan text-black text-[10px] font-black rounded-full flex items-center justify-center">
                  {messages.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 mb-6">
            <img src={user?.photoURL || ''} alt="" className="w-10 h-10 rounded-xl border border-white/10" />
            <div className="overflow-hidden">
              <p className="text-xs font-bold truncate">{user?.displayName}</p>
              <p className="text-[10px] text-slate-500 truncate">Adminisztrátor</p>
            </div>
          </div>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            Kijelentkezés
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="md:hidden bg-neutral-900 border-b border-white/5 p-5 flex justify-between items-center sticky top-0 z-30 backdrop-blur-xl bg-opacity-90">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-brand-teal" />
          <span className="font-black uppercase tracking-tighter italic">KLINIKA ADMIN</span>
        </div>
        <button onClick={() => logout()} className="p-2 bg-red-500/10 rounded-xl">
          <LogOut className="w-5 h-5 text-red-500" />
        </button>
      </div>

      {/* Main Content */}
      <main className="md:ml-80 flex-grow p-6 md:p-12 pb-32 md:pb-12 text-white">
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 text-white">
          <div className="space-y-1">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-white">
              {activeTab === 'overview' && 'Rendszer Állapot'}
              {activeTab === 'customers' && 'Ügyfelek Adatbázisa'}
              {activeTab === 'inventory' && 'Raktárkészlet'}
              {activeTab === 'messages' && 'Ügyfél Üzenetek'}
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                Minden rendszer üzemkész <span className="text-slate-700 mx-2">|</span> 
                Helyszín: <span className="text-white">Hardver Klinika Labor</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="relative flex-grow lg:flex-grow-0">
              <Search className="w-4 h-4 absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Gyors keresés..." 
                className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-brand-teal/50 w-full lg:w-80 transition-all font-medium"
              />
            </div>
            {(activeTab === 'customers' || activeTab === 'inventory') && (
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-brand-teal text-black p-4 rounded-2xl hover:bg-white transition-all group shadow-xl shadow-brand-teal/10 active:scale-95"
              >
                <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
              </button>
            )}
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  <StatsCard label="Aktív Megkeresések" value={messages.length} icon={MessageSquare} color="text-brand-cyan" />
                  <StatsCard label="Összes Ügyfél" value={customers.length} icon={Users} color="text-brand-teal" />
                  <StatsCard label="Szerviz Folyamatban" value="8" icon={Activity} color="text-white" />
                </div>
                
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  <div className="xl:col-span-2 bg-neutral-900 border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10">
                       <Database className="w-20 h-20 text-white/2" />
                    </div>
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3 italic uppercase tracking-tighter">
                      <Clock className="w-6 h-6 text-brand-teal" />
                      Gyorsműveletek
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                      {[ 
                        { title: 'Üzenetek kezelése', desc: 'Válaszolj a beérkező megkeresésekre', tab: 'messages', count: messages.length, color: 'brand-cyan' },
                        { title: 'Ügyfél regisztráció', desc: 'Új partner hozzáadása a rendszerhez', tab: 'customers', count: customers.length, color: 'brand-teal' }
                      ].map((action, i) => (
                        <button 
                          key={i}
                          onClick={() => setActiveTab(action.tab as any)}
                          className="p-8 bg-black/40 rounded-3xl border border-white/5 hover:border-white/20 transition-all text-left group flex flex-col justify-between h-48"
                        >
                          <div>
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4">
                              <ChevronRight className={`w-5 h-5 text-white/50`} />
                            </div>
                            <p className="text-xl font-bold text-white mb-2">{action.title}</p>
                            <p className="text-slate-500 text-sm font-light leading-relaxed">{action.desc}</p>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Összesen: {action.count}</span>
                            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white group-hover:translate-x-2 transition-all" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden">
                    <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-brand-cyan italic uppercase tracking-tighter">
                      <Activity className="w-6 h-6" />
                      Élő Napló
                    </h3>
                    <div className="space-y-6 text-white">
                      <div className="flex justify-between text-[10px] uppercase font-black tracking-[0.2em] text-slate-600 border-b border-white/5 pb-2">
                        <span>Esemény</span>
                        <span>Státusz</span>
                      </div>
                      {[
                        { event: 'Firebase Kapcsolat', status: 'Online', time: 'Most', color: 'text-green-500' },
                        { event: 'Adat szinkronizáció', status: 'Kész', time: '2 perce', color: 'text-brand-teal' },
                        { event: 'Biztonsági mentés', status: 'Aktív', time: 'Ma 04:00', color: 'text-brand-cyan' },
                        { event: 'Szerver válaszidő', status: '12ms', time: 'Folyamatos', color: 'text-slate-400' }
                      ].map((log, i) => (
                        <div key={i} className="flex justify-between items-center group">
                          <div>
                            <p className="text-sm font-bold text-slate-300 group-hover:text-white transition-colors">{log.event}</p>
                            <p className="text-[10px] text-slate-600 font-medium uppercase tracking-widest mt-1">{log.time}</p>
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${log.color}`}>{log.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="bg-neutral-900 border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl">
                {customers.length === 0 ? (
                  <div className="p-32 text-center space-y-6">
                    <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                       <Users className="w-12 h-12 text-white/10" />
                    </div>
                    <div>
                      <p className="text-slate-500 font-black uppercase tracking-[0.3em] text-sm">Üres az ügyféllista</p>
                      <p className="text-slate-700 text-xs mt-2">Kezdd el felépíteni a Hardver Klinika ügyfélkörét.</p>
                    </div>
                    <button 
                      onClick={() => setShowAddModal(true)}
                      className="bg-white text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-teal transition-all shadow-xl"
                    >
                      Új Ügyfél Hozzáadása
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto text-white">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-black/50 text-[10px] uppercase font-black tracking-[0.3em] text-slate-500">
                          <th className="px-10 py-8">Név & Kontakt</th>
                          <th className="px-10 py-8">Elérhetőség</th>
                          <th className="px-10 py-8">Helyszín</th>
                          <th className="px-10 py-8">Regisztráció</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {customers.map((c) => (
                          <tr key={c.id} className="hover:bg-brand-teal/5 transition-all group">
                            <td className="px-10 py-8">
                               <p className="font-black text-xl text-white group-hover:text-brand-teal transition-colors tracking-tight">{c.name}</p>
                               <p className="text-xs text-slate-500 mt-1">{c.email}</p>
                            </td>
                            <td className="px-10 py-8">
                               <span className="bg-white/5 px-4 py-2 rounded-lg text-slate-300 font-mono text-xs border border-white/5">{c.phone || 'Nincs megadva'}</span>
                            </td>
                            <td className="px-10 py-8">
                               <p className="text-slate-400 text-sm max-w-[200px] truncate">{c.address || 'Helyszíni szerviz'}</p>
                            </td>
                            <td className="px-10 py-8">
                               <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">
                                 {c.joinedAt?.toDate ? c.joinedAt.toDate().toLocaleDateString('hu-HU') : 'Most'}
                               </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {messages.length === 0 ? (
                  <div className="lg:col-span-2 bg-neutral-900 border border-white/5 rounded-[3rem] flex flex-col items-center justify-center p-32 gap-6 text-center">
                    <div className="w-24 h-24 bg-brand-teal/10 rounded-3xl flex items-center justify-center animate-bounce">
                      <CheckCircle className="w-12 h-12 text-brand-teal" />
                    </div>
                    <div>
                        <p className="text-white font-black uppercase tracking-[0.4em] text-xl italic">Tiszta asztal!</p>
                        <p className="text-slate-500 text-sm mt-2 font-light">Minden üzenetet elolvastál és megválaszoltál.</p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg, i) => (
                    <motion.div 
                      key={msg.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-neutral-900 border border-white/5 rounded-[2.5rem] p-10 hover:border-brand-teal/30 transition-all group flex flex-col justify-between min-h-[400px] shadow-2xl relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-cyan/5 blur-3xl -mr-16 -mt-16" />
                      
                      <div className="space-y-8 relative z-10">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-brand-teal/10 rounded-2xl flex items-center justify-center text-brand-teal shadow-lg shadow-brand-teal/5">
                              <MessageSquare className="w-7 h-7" />
                            </div>
                            <div>
                              <h4 className="font-black text-2xl text-white tracking-tighter uppercase italic leading-none">{msg.name}</h4>
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                {msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleString('hu-HU') : 'Most'}
                              </p>
                            </div>
                          </div>
                          <span className="px-3 py-1 bg-brand-cyan/10 text-brand-cyan text-[9px] font-black uppercase tracking-widest rounded-full border border-brand-cyan/20">Új üzenet</span>
                        </div>

                        <div className="bg-black/40 p-8 rounded-[2rem] border border-white/5 leading-relaxed text-slate-300 font-light text-lg italic shadow-inner">
                          "{msg.content}"
                        </div>
                      </div>

                      <div className="pt-10 flex flex-col sm:flex-row gap-4 relative z-10">
                        <a 
                          href={`mailto:${msg.email}`}
                          className="flex-grow bg-white text-black px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-brand-teal transition-all flex items-center justify-center gap-3 shadow-xl"
                        >
                          <Mail className="w-4 h-4" />
                          Válasz küldése
                        </a>
                        <button 
                          onClick={() => handleArchiveMessage(msg.id)}
                          className="bg-white/5 border border-white/10 text-slate-500 px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-neutral-800 hover:text-white transition-all flex items-center justify-center gap-3"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Készre jelöl
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'inventory' && (
              <div className="bg-neutral-900 border border-white/5 rounded-[3rem] flex flex-col items-center justify-center p-32 text-center gap-8">
                <div className="relative">
                    <Box className="w-32 h-32 text-white/5" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Settings className="w-12 h-12 text-brand-teal animate-spin-slow opacity-20" />
                    </div>
                </div>
                <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic text-white">Alkatrészmodul <br/> <span className="text-brand-teal">beállítása...</span></h3>
                  <p className="text-slate-600 text-sm mt-4 font-light max-w-sm mx-auto tracking-wide">
                    A leltár és raktárkészlet kezelő felület jelenleg kalibrálás alatt áll. Hamarosan kezelheted a hűtőpasztákat, ventilátorokat és egyéb kiegészítőket.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Mobile Nav Button (Floating) */}
        <div className="md:hidden fixed bottom-8 left-0 right-0 px-6 z-40">
            <nav className="bg-neutral-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl p-3 flex justify-between shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              {[ 
                { id: 'overview', icon: Database },
                { id: 'customers', icon: Users },
                { id: 'inventory', icon: Box },
                { id: 'messages', icon: MessageSquare },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`p-4 rounded-2xl transition-all duration-300 ${
                    activeTab === item.id ? 'bg-white text-black scale-110 shadow-lg' : 'text-slate-500'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                </button>
              ))}
            </nav>
        </div>

        {/* Add Customer Modal */}
        <AnimatePresence>
          {showAddModal && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-6 text-white">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-neutral-900 border border-white/10 rounded-[3rem] w-full max-w-xl p-10 md:p-16 relative shadow-[0_50px_100px_rgba(0,0,0,0.8)]"
              >
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors p-2"
                >
                  <X className="w-8 h-8" />
                </button>
                <div className="mb-12">
                    <h3 className="text-4xl font-black uppercase tracking-tighter italic text-white">Új Ügyfél</h3>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Partner regisztráció a rendszerbe</p>
                </div>
                <form onSubmit={handleAddCustomer} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-4 italic">Név</label>
                        <input 
                        required
                        type="text" 
                        value={newCustomer.name}
                        onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:outline-none focus:border-brand-teal text-white font-medium transition-all" 
                        placeholder="Kovács János"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-4 italic">E-mail</label>
                        <input 
                        required
                        type="email" 
                        value={newCustomer.email}
                        onChange={e => setNewCustomer({...newCustomer, email: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:outline-none focus:border-brand-teal text-white font-medium transition-all" 
                        placeholder="janos@pelda.hu"
                        />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-4 italic">Telefon</label>
                    <input 
                      type="tel" 
                      value={newCustomer.phone}
                      onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:outline-none focus:border-brand-teal text-white font-medium transition-all font-mono" 
                      placeholder="+36 30 XX XX XXX"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 uppercase font-black tracking-widest ml-4 italic">Cím / Megjegyzés</label>
                    <input 
                      type="text" 
                      value={newCustomer.address}
                      onChange={e => setNewCustomer({...newCustomer, address: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl focus:outline-none focus:border-brand-teal text-white font-medium transition-all" 
                      placeholder="Bp. 10. kerület, vagy teljes cím"
                    />
                  </div>
                  <div className="pt-8">
                    <button 
                        type="submit"
                        className="w-full bg-white text-black py-6 rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-brand-teal transition-all shadow-2xl active:scale-95"
                    >
                        Ügyfél Mentése
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
