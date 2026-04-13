import React, { useState, useEffect } from 'react';
import './index.css';
import { LostPetModal } from './components/LostPetModal';
import { FoundPetModal } from './components/FoundPetModal';
import { AdoptPetModal } from './components/AdoptPetModal';
import { AuthModal } from './components/AuthModal';
import { HeroesCarousel } from './components/HeroesCarousel';
import { GateModal } from './components/GateModal';
import { ReunionMap } from './components/ReunionMap';
import { NotificationToast, type Notification } from './components/NotificationToast';
import { 
  Heart, 
  Search, 
  MapPin, 
  Camera, 
  MessageCircle, 
  X, 
  Award, 
  PawPrint, 
  ArrowRight, 
  Bell, 
  Phone,
  User,
  LogOut,
  CheckCircle2,
  Share2,
  Settings,
  LayoutGrid,
  Zap,
  Map as MapIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- CONFIGURAÇÕES DE CORES ---
const THEME = {
  bg: '#F2F0E9',
  primary: '#2E4036', 
  accent: '#CC5833',  
  text: '#1A1A1A',    
  glass: 'rgba(242, 240, 233, 0.8)'
};

// --- DADOS FICTÍCIOS ---
const MOCK_PETS = [
  { id: 1, name: "Tobias", status: "lost", breed: "Golden Retriever", loc: "Sintra, Lisboa", time: "Há 2h", img: "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&q=80&w=800", desc: "O Tobias é muito dócil mas está assustado. Fugiu durante o passeio perto do Palácio da Pena.", especie: 'cao', porte: 'Grande' },
  { id: 2, name: "Luna", status: "found", breed: "Siamês", loc: "Cedofeita, Porto", time: "Há 5h", img: "https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=800", desc: "Encontrada no jardim do prédio. Estava com muita fome.", especie: 'gato', porte: 'Pequeno' },
  { id: 3, name: "Milo", status: "adopt", breed: "Corgi SRD", loc: "Benfica, Lisboa", time: "Hoje", img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800", desc: "O Milo precisa de um lar amoroso! Estava abandonado, mas agora está castrado e cheio de amor.", especie: 'cao', porte: 'Pequeno' },
  { id: 4, name: "Max", status: "lost", breed: "SRD", loc: "Campinas, SP", time: "Há 1 dia", img: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=800", desc: "Porte médio, castanho. Fugiu de casa assustado com trovões.", especie: 'cao', porte: 'Médio' }
];

async function handleGpsAddr(lat: number, lng: number) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
    const json = await res.json();
    return json.display_name || `${lat}, ${lng}`;
  } catch {
    return `${lat}, ${lng}`;
  }
}

// --- COMPONENTES AUXILIARES ---


const App: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [view, setView] = useState('home'); 
  const [selectedPet, setSelectedPet] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [showFoundModal, setShowFoundModal] = useState(false);
  const [showAdoptModal, setShowAdoptModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [hasPassedGate, setHasPassedGate] = useState(false);
  const [filter, setFilter] = useState('all');
  const [filterEspecie, setFilterEspecie] = useState('all');
  const [profileTab, setProfileTab] = useState('alertas');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showSimPanel, setShowSimPanel] = useState(false);
  const [showReunionMap, setShowReunionMap] = useState(false);
  const [isMapView, setIsMapView] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const isLoggedIn = !!currentUser;

  const addNotification = (notif: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notif, id }]);
    setTimeout(() => removeNotification(id), notif.duration || 6000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- HANDLERS ---
  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setShowAuth(false);
    setIsGuestMode(false);
    setHasPassedGate(true);
    addNotification({ 
      title: `Olá, ${user.full_name.split(' ')[0]}!`, 
      message: 'Seu login foi validado com sucesso.', 
      type: 'success' 
    });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsGuestMode(false);
    setView('home');
  };

  const handleGuestEntry = () => {
    setIsGuestMode(true);
    setShowAuth(false);
    setHasPassedGate(true);
    addNotification({ 
      title: 'Modo Convidado', 
      message: 'Você está explorando como visitante.', 
      type: 'info' 
    });
  };

  return (
    <div className="min-h-screen text-[#1A1A1A] font-sans selection:bg-[#CC5833] selection:text-white" style={{ backgroundColor: THEME.bg }}>
      
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)} 
        onLoginSuccess={handleLoginSuccess} 
        onGuestSuccess={handleGuestEntry}
      />
      <NotificationToast notifications={notifications} removeNotification={removeNotification} />
      
      {/* Botão flutuante de Simulação (DEBUG) */}
      {/* BOTÃO PULSE LAB (CRITÉRIO JOBS: MAIS ORGÂNICO) */}
      <button 
        onClick={() => setShowSimPanel(!showSimPanel)}
        className="fixed bottom-6 left-6 z-[150] w-12 h-12 bg-gradient-to-br from-[#2E4036] to-[#405c4d] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(46,64,54,0.3)] hover:scale-110 active:scale-95 transition-all group"
      >
        <div className="relative">
          <Zap size={20} className={showSimPanel ? 'text-[#CC5833]' : 'text-white'} />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CC5833] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#CC5833]"></span>
          </span>
        </div>
      </button>

      {/* PAINEL DE SIMULAÇÃO (PULSE HUB) */}
      <AnimatePresence>
        {showSimPanel && (
          <motion.div 
            initial={{ opacity: 0, y: 20, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, x: -10, scale: 0.95 }}
            className="fixed bottom-20 left-6 z-[150] w-[280px] bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/50 p-7 space-y-4"
          >
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#2E4036]/40">
                Pulse Hub
              </h3>
              <Zap size={14} className="text-[#CC5833]" />
            </div>
            
            <button 
              onClick={() => {
                addNotification({ title: 'Novo Registro', message: 'Você reportou: Tobias está perdido. Buscando Matches...', type: 'info' });
                setShowSimPanel(false);
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#F2F0E9] text-[10px] font-bold text-left hover:bg-[#CC5833] hover:text-white transition-all uppercase tracking-tight"
            >
              1. Simular Perdi meu Pet
            </button>

            <button 
              onClick={() => {
                addNotification({ title: 'Ação Heroica', message: 'Obrigado! Reportamos que você deixou o Corgi na ONG Paws.', type: 'success' });
                setShowSimPanel(false);
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#F2F0E9] text-[10px] font-bold text-left hover:bg-[#06D6A0] hover:text-[#2E4036] transition-all uppercase tracking-tight"
            >
              2. Simular Achei um Pet (ONG)
            </button>

            <button 
              onClick={() => {
                addNotification({ title: 'MATCH ENCONTRADO! 🚨', message: 'IA detectou 94% de semelhança com o Tobias em Sintra!', type: 'match', duration: 10000 });
                setShowSimPanel(false);
                setSelectedPet(MOCK_PETS[0]); // Seleciona o Tobias
                setTimeout(() => setShowReunionMap(true), 1500); // Abre o mapa após a emoção da notificação
              }}
              className="w-full py-3 px-4 rounded-xl bg-[#CC5833] text-[10px] font-bold text-left text-white shadow-lg shadow-[#CC5833]/20 hover:scale-[1.02] transition-all uppercase tracking-tight"
            >
              3. Simular Match IA (Owner)
            </button>

            <button 
              onClick={() => {
                addNotification({ title: 'Radar Ativo', message: 'Um Golden Retriever para adoção acaba de ser listado!', type: 'match' });
                setShowSimPanel(false);
              }}
              className="w-full py-4 px-4 rounded-2xl bg-[#2E4036] text-[10px] font-bold text-left text-white hover:-translate-y-1 transition-all uppercase tracking-tight"
            >
              4. Simular Notificação Radar
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <GateModal 
        isOpen={!hasPassedGate && !isLoggedIn && !showAuth} 
        onClose={() => setHasPassedGate(true)} 
        onLogin={() => setShowAuth(true)} 
        onGuest={handleGuestEntry}
      />
      <LostPetModal isOpen={showLostModal} onClose={() => setShowLostModal(false)} />
      <FoundPetModal isOpen={showFoundModal} onClose={() => setShowFoundModal(false)} />
      <AdoptPetModal isOpen={showAdoptModal} onClose={() => setShowAdoptModal(false)} />

      <AnimatePresence>
        {showReunionMap && selectedPet && (
          <ReunionMap pet={selectedPet} onClose={() => setShowReunionMap(false)} />
        )}
      </AnimatePresence>

      {/* NAVBAR */}
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 flex items-center justify-between px-6 py-3 rounded-full border border-white/20 shadow-2xl ${isScrolled ? 'w-[90%] md:w-[600px]' : 'w-[95%] md:w-[800px]'} `} style={{ backgroundColor: THEME.glass, backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setView('home'); setSelectedPet(null); }}>
          <div className="w-8 h-8 rounded-full bg-[#2E4036] flex items-center justify-center">
            <Heart size={16} color="white" fill="white" />
          </div>
          <span className="font-bold tracking-tighter text-lg hidden sm:block">Patas em Casa</span>
        </div>
        
        <div className="flex items-center gap-8 text-sm font-bold opacity-60">
          <button onClick={() => { setView('explore'); setIsMapView(false); setSelectedPet(null); }} className={`hover:opacity-100 transition-opacity flex items-center gap-2 ${view === 'explore' && !isMapView ? 'text-[#CC5833] opacity-100' : ''}`}>
             <LayoutGrid size={16} /> Explorar
          </button>
          <button onClick={() => { setView('explore'); setIsMapView(true); setSelectedPet(null); }} className={`hover:opacity-100 transition-opacity flex items-center gap-2 ${view === 'explore' && isMapView ? 'text-[#CC5833] opacity-100' : ''}`}>
             <MapIcon size={16} /> Mapa
          </button>
        </div>

        <div className="flex items-center gap-4">
          {!isLoggedIn ? (
            <button 
              onClick={() => setShowAuth(true)} 
              className="flex items-center gap-2 pl-2 pr-4 py-1.5 rounded-full bg-[#F2F0E9] border border-black/5 hover:bg-white shadow-sm transition-all group"
            >
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#CC5833] shadow-sm group-hover:scale-105 transition-transform">
                <User size={14} />
              </div>
              <span className="text-[10px] font-black uppercase text-[#1A1A1A] tracking-wider">
                {isGuestMode ? 'Convidado' : 'Entrar'}
              </span>
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-500">
              <button 
                onClick={() => setView('profile')} 
                className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full bg-white border border-[#2E4036]/5 hover:shadow-xl transition-all group"
              >
                <div className="relative">
                  {currentUser.avatar_url ? (
                    <img src={currentUser.avatar_url} className="w-8 h-8 rounded-full object-cover shadow-sm ring-2 ring-white" alt="" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#2E4036] flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-white">
                      {currentUser.full_name.charAt(0)}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#06D6A0] border-2 border-white rounded-full"></span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-black uppercase text-[#2E4036] leading-none mb-1 truncate max-w-[70px]">
                    {currentUser.full_name.split(' ')[0]}
                  </span>
                  <span className="text-[9px] font-bold text-[#CC5833] leading-none">
                    {currentUser.points} pts
                  </span>
                </div>
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-10 h-10 rounded-full bg-[#F2F0E9] flex items-center justify-center text-[#2E4036]/40 hover:bg-red-50 hover:text-red-500 transition-all group"
                title="Sair"
              >
                <LogOut size={16} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="pt-44 pb-20 px-6">
        
        {view === 'home' && (
          <header className="text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-top-4 duration-1000">
            <h1 className="text-6xl md:text-[7rem] font-bold tracking-tighter leading-[0.85] mb-12">
              Onde a espera <br />
              <span className="italic font-serif font-light text-[#CC5833]">Encontra o abraço.</span>
            </h1>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-4xl mx-auto px-4 mt-8">
              <button 
                onClick={() => setShowLostModal(true)} 
                className="group flex flex-col items-center justify-center gap-4 p-8 rounded-[3rem] bg-[#2E4036] text-white transition-all hover:scale-[1.02] active:scale-95 shadow-2xl"
              >
                <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#CC5833] transition-colors">
                  <ArrowRight size={24} />
                </div>
                <span className="text-xl font-black tracking-tight">Perdi meu Pet</span>
              </button>

              <button 
                onClick={() => setShowFoundModal(true)} 
                className="group flex flex-col items-center justify-center gap-4 p-8 rounded-[3rem] bg-white border-2 border-black/5 text-[#2E4036] transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
              >
                <div className="w-14 h-14 rounded-full bg-[#F2F0E9] flex items-center justify-center group-hover:bg-[#06D6A0]/20 transition-colors">
                  <Camera size={24} />
                </div>
                <span className="text-xl font-black tracking-tight">Encontrei um Pet</span>
              </button>

              <button 
                onClick={() => setShowAdoptModal(true)} 
                className="group flex flex-col items-center justify-center gap-4 p-8 rounded-[3rem] bg-white border-2 border-[#CC5833]/20 text-[#CC5833] transition-all hover:scale-[1.02] active:scale-95 shadow-xl"
              >
                <div className="w-14 h-14 rounded-full bg-[#CC5833]/10 flex items-center justify-center group-hover:bg-[#CC5833] group-hover:text-white transition-colors">
                  <Heart size={24} />
                </div>
                <span className="text-xl font-black tracking-tight">Quero Adotar</span>
              </button>
            </div>
          </header>
        )}

        {view === 'home' && <HeroesCarousel />}

        {/* EXPLORAR */}
        {view === 'explore' && !selectedPet && (
          <div className="max-w-7xl mx-auto animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
              <div>
                <h2 className="text-6xl font-black tracking-tighter mb-2">Explorar</h2>
                <p className="text-sm font-medium opacity-40 uppercase tracking-widest italic">A comunidade em ação</p>
              </div>
              <div className="flex flex-col items-end gap-5">
                {/* Toggle Grid/Map */}
                <div className="flex p-1 bg-white rounded-2xl border border-black/5 shadow-sm">
                   <button 
                     onClick={() => setIsMapView(false)}
                     className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase transition-all ${!isMapView ? 'bg-[#2E4036] text-white' : 'opacity-40 hover:opacity-100'}`}
                   >
                     <LayoutGrid size={14} /> Galeria
                   </button>
                   <button 
                     onClick={() => setIsMapView(true)}
                     className={`px-4 py-2 rounded-xl flex items-center gap-2 text-[10px] font-black uppercase transition-all ${isMapView ? 'bg-[#2E4036] text-white' : 'opacity-40 hover:opacity-100'}`}
                   >
                     <MapIcon size={14} /> Mapa
                   </button>
                </div>

                <div className="flex flex-col items-end gap-3">
                   <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-black/5 shadow-sm">
                     {['all', 'lost', 'found', 'adopt'].map(s => (
                       <button key={s} onClick={() => setFilter(s)} className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${filter === s ? 'bg-[#2E4036] text-white shadow-lg' : 'opacity-40 hover:opacity-100'}`}>
                         {s === 'all' ? 'Tudo' : s === 'lost' ? 'Perdidos' : s === 'found' ? 'Achados' : 'Adoção'}
                       </button>
                     ))}
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => setFilterEspecie('all')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filterEspecie === 'all' ? 'bg-[#CC5833]/10 text-[#CC5833] border border-[#CC5833]/20' : 'bg-white border border-black/10 opacity-60 hover:opacity-100'}`}>🐾 Todos</button>
                     <button onClick={() => setFilterEspecie('cao')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filterEspecie === 'cao' ? 'bg-[#CC5833]/10 text-[#CC5833] border border-[#CC5833]/20' : 'bg-white border border-black/10 opacity-60 hover:opacity-100'}`}>🐶 Cães</button>
                     <button onClick={() => setFilterEspecie('gato')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${filterEspecie === 'gato' ? 'bg-[#CC5833]/10 text-[#CC5833] border border-[#CC5833]/20' : 'bg-white border border-black/10 opacity-60 hover:opacity-100'}`}>🐱 Gatos</button>
                   </div>
                </div>
              </div>
            </div>
            
            {!isMapView ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {MOCK_PETS
                  .filter(p => filter === 'all' || p.status === filter)
                  .filter(p => filterEspecie === 'all' || p.especie === filterEspecie)
                  .map(pet => (
                  <div key={pet.id} onClick={() => setSelectedPet(pet)} className="group bg-white rounded-[3rem] overflow-hidden border border-black/5 cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 relative flex flex-col">
                    
                    {/* Pílulas de Status */}
                    <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
                      {pet.status === 'lost' && <span className="px-3 py-1.5 bg-red-500 text-white text-[9px] font-black tracking-widest uppercase rounded-full shadow-lg">Perdido</span>}
                      {pet.status === 'found' && <span className="px-3 py-1.5 bg-[#06D6A0] text-[#2E4036] text-[9px] font-black tracking-widest uppercase rounded-full shadow-lg">Encontrado</span>}
                      {pet.status === 'adopt' && <span className="px-3 py-1.5 bg-[#CC5833] text-white text-[9px] font-black tracking-widest uppercase rounded-full shadow-lg">Adoção</span>}
                      <span className="px-3 py-1 bg-white/90 backdrop-blur text-[#2E4036] text-[9px] font-bold rounded-full shadow-sm w-fit">{pet.time}</span>
                    </div>

                    <div className="h-72 overflow-hidden relative">
                      <img src={pet.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={pet.name} />
                      {/* Hover reveal bottom */}
                      <div className="absolute opacity-0 group-hover:opacity-100 bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                        <p className="text-white text-xs font-bold flex items-center gap-1"><MapPin size={12}/> {pet.loc}</p>
                      </div>
                    </div>
                    <div className="p-8 pt-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-2xl font-black tracking-tight text-[#2E4036]">{pet.name}</h4>
                        <span className="text-[#CC5833] opacity-60"><PawPrint size={18} /></span>
                      </div>
                      <p className="text-xs font-bold uppercase tracking-wider opacity-40 mb-3">{pet.breed}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[600px] w-full bg-white rounded-[3rem] overflow-hidden border border-black/5 relative shadow-inner">
                 <div 
                  className="absolute inset-0 opacity-20 grayscale"
                  style={{ 
                    backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/light-v10/static/auto/1200x800?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}')`,
                    backgroundSize: 'cover'
                  }}
                 />
                 <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-12">
                    <div className="w-20 h-20 rounded-full bg-[#CC5833] flex items-center justify-center text-white mb-6 animate-pulse">
                       <MapPin size={40} />
                    </div>
                    <h3 className="text-3xl font-black tracking-tighter mb-4">Mapa de Heróis Ativo</h3>
                    <p className="max-w-md text-sm opacity-50 font-bold uppercase leading-relaxed mb-8">
                       Clique em um pet para ver a rota mágica de reencontro com trilha da comunidade.
                    </p>
                    <div className="flex gap-4">
                       {MOCK_PETS.slice(0, 3).map(p => (
                          <button 
                            key={p.id}
                            onClick={() => { setSelectedPet(p); setShowReunionMap(true); }}
                            className="group relative"
                          >
                             <div className="w-16 h-16 rounded-2xl border-4 border-white shadow-xl overflow-hidden group-hover:scale-110 transition-transform">
                                <img src={p.img} className="w-full h-full object-cover" />
                             </div>
                             <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#2E4036] text-white text-[8px] font-black uppercase px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Ver {p.name}
                             </div>
                          </button>
                       ))}
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}

        {/* DETALHE DO PET */}
        {selectedPet && (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <button onClick={() => setSelectedPet(null)} className="mb-6 flex items-center gap-2 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity bg-white/50 px-4 py-2 rounded-full w-fit">
              <ArrowRight size={16} className="rotate-180" /> Voltar para Explorar
            </button>
            
            <div className="bg-white rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row">
              {/* Imagem Cover */}
              <div className="md:w-1/2 h-[600px] relative">
                <img src={selectedPet.img} alt={selectedPet.name} className="w-full h-full object-cover" />
                <div className="absolute top-6 left-6 flex gap-2">
                    {selectedPet.status === 'lost' && <span className="px-4 py-2 bg-red-500 text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg">PET PERDIDO</span>}
                    {selectedPet.status === 'found' && <span className="px-4 py-2 bg-[#06D6A0] text-[#2E4036] text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg">PET ENCONTRADO</span>}
                    {selectedPet.status === 'adopt' && <span className="px-4 py-2 bg-[#CC5833] text-white text-[10px] font-black tracking-widest uppercase rounded-full shadow-lg">PARA ADOÇÃO</span>}
                </div>
                <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-10 pt-20">
                  <h2 className="text-6xl font-black text-white tracking-tighter mb-2">{selectedPet.name}</h2>
                  <p className="text-white/80 text-xl flex items-center gap-2"><MapPin size={20}/> {selectedPet.loc}</p>
                </div>
              </div>
              
              {/* Info Column */}
              <div className="md:w-1/2 p-12 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-[#CC5833] mb-4">Sobre {selectedPet.name}</h3>
                  <p className="text-lg text-[#2E4036]/70 leading-relaxed mb-8">{selectedPet.desc}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="p-4 rounded-2xl bg-[#F2F0E9]">
                      <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Raça</p>
                      <p className="font-black text-[#2E4036] truncate">{selectedPet.breed}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#F2F0E9]">
                      <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Porte</p>
                      <p className="font-black text-[#2E4036]">{selectedPet.porte}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-[#F2F0E9]">
                      <p className="text-[10px] uppercase font-bold opacity-40 mb-1">Tempo</p>
                      <p className="font-black text-[#2E4036]">{selectedPet.time}</p>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div>
                  {selectedPet.status === 'lost' && (
                    <button 
                      onClick={() => setShowReunionMap(true)}
                      className="w-full py-5 rounded-[2rem] bg-red-500 text-white font-black text-lg shadow-xl shadow-red-500/20 hover:scale-[1.02] transition-transform"
                    >
                      🟢 Eu vi este pet!
                    </button>
                  )}
                  {selectedPet.status === 'found' && (
                    <button 
                      onClick={() => setShowReunionMap(true)}
                      className="w-full py-5 rounded-[2rem] bg-[#06D6A0] text-[#2E4036] font-black text-lg shadow-xl shadow-[#06D6A0]/20 hover:scale-[1.02] transition-transform"
                    >
                      Esse pet é meu!
                    </button>
                  )}
                  {selectedPet.status === 'adopt' && (
                    <button className="w-full py-5 rounded-[2rem] bg-[#CC5833] text-white font-black text-lg shadow-xl shadow-[#CC5833]/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                      <Heart fill="white" size={20} /> Quero Adotar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PERFIL DO USUÁRIO */}
        {view === 'profile' && isLoggedIn && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-8">
              
              {/* Coluna Esquerda: Status do Herói */}
              <div className="lg:w-1/3 bg-white rounded-[3rem] p-10 shadow-xl border border-black/5 h-fit relative">
                <button 
                   onClick={handleLogout} 
                  className="absolute top-6 right-6 p-4 rounded-full bg-[#F2F0E9] text-[#2E4036] hover:bg-[#E8E4DD] transition-colors shadow-sm"
                  title="Sair"
                >
                  <LogOut size={16} />
                </button>

                <div className="flex flex-col items-center text-center mt-4">
                  <div className="w-32 h-32 rounded-[2rem] bg-[#2E4036] flex items-center justify-center text-white mb-6 shadow-xl shadow-[#2E4036]/20 overflow-hidden">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User size={50} />
                    )}
                  </div>
                  <h2 className="text-3xl font-black mb-2 tracking-tight text-[#1A1A1A]">{currentUser.full_name}</h2>
                  <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-8">Membro desde 2024</p>
                  
                  <div className="w-full space-y-3 mb-8">
                    <div className="flex justify-between items-center p-5 bg-[#F2F0E9] rounded-2xl">
                      <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Award size={16} className="text-[#CC5833]" /> Nível</span>
                      <span className="font-black text-[#2E4036]">{Math.floor(currentUser.points / 200) + 1}</span>
                    </div>
                    <div className="flex justify-between items-center p-5 bg-[#F2F0E9] rounded-2xl">
                      <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><PawPrint size={16} className="text-[#CC5833]" /> Pontos</span>
                      <span className="font-black text-[#2E4036]">{currentUser.points}</span>
                    </div>
                    <div className="flex justify-between items-center p-5 bg-[#F2F0E9] rounded-2xl">
                      <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2"><Heart size={16} className="text-[#CC5833]" /> Ajudou</span>
                      <span className="font-black text-[#2E4036]">3 Famílias</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Coluna Direita: Dashboard */}
              <div className="lg:w-2/3 bg-white rounded-[3rem] shadow-xl border border-black/5 overflow-hidden flex flex-col">
                {/* Abas */}
                <div className="flex border-b border-black/5 p-4 gap-2 bg-[#F2F0E9]/50">
                  <button onClick={() => setProfileTab('alertas')} className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${profileTab === 'alertas' ? 'bg-white shadow-sm text-[#CC5833]' : 'text-[#1A1A1A]/40 hover:bg-white/50'}`}>Meus Alertas</button>
                  <button onClick={() => setProfileTab('radar')} className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${profileTab === 'radar' ? 'bg-white shadow-sm text-[#CC5833]' : 'text-[#1A1A1A]/40 hover:bg-white/50'}`}>Meu Radar</button>
                  <button onClick={() => setProfileTab('historico')} className={`flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${profileTab === 'historico' ? 'bg-white shadow-sm text-[#CC5833]' : 'text-[#1A1A1A]/40 hover:bg-white/50'}`}>Histórico</button>
                </div>

                {/* Conteúdo das Abas */}
                <div className="p-10 flex-1 bg-white">
                  
                  {/* ALERTAS */}
                  {profileTab === 'alertas' && (
                    <div className="animate-in fade-in duration-500">
                      <h3 className="text-2xl font-black mb-6 text-[#2E4036]">Pets Cadastrados por Mim</h3>
                      {/* Fake Item */}
                      <div className="border border-black/5 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between shadow-sm gap-4">
                        <div className="flex items-center gap-6 text-center md:text-left">
                           <img src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=200&h=200&fit=crop" className="w-20 h-20 rounded-2xl object-cover" alt="Tobias" />
                           <div>
                              <span className="px-3 py-1 bg-red-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest mb-2 inline-block">Meu Pet Perdido</span>
                              <h4 className="text-xl font-bold">Tobias</h4>
                              <p className="text-xs opacity-50 font-bold uppercase mt-1">Sintra, Lisboa</p>
                           </div>
                        </div>
                        <button className="px-6 py-4 rounded-full bg-[#06D6A0] text-[#2E4036] font-bold text-xs shadow-lg shadow-[#06D6A0]/20 hover:scale-105 transition-transform flex items-center gap-2">
                           <CheckCircle2 size={16} /> Marcar como Reencontrado
                        </button>
                      </div>
                    </div>
                  )}

                  {/* RADAR */}
                  {profileTab === 'radar' && (
                    <div className="animate-in fade-in duration-500">
                      <div className="flex justify-between items-end mb-6">
                        <h3 className="text-2xl font-black text-[#2E4036]">Radar de Adoção</h3>
                        <span className="px-4 py-1.5 bg-[#06D6A0]/20 text-[#2E4036] rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#06D6A0] animate-pulse"></span> Radar Ativo
                        </span>
                      </div>
                      
                      <div className="bg-[#F2F0E9] rounded-3xl p-8 mb-6">
                        <p className="text-sm font-bold opacity-60 mb-4 uppercase tracking-widest">Buscando por:</p>
                        <div className="flex flex-wrap gap-4">
                          <span className="px-5 py-2.5 bg-white rounded-xl text-sm font-bold shadow-sm">Espécie: <span className="text-[#CC5833]">Cachorro</span></span>
                          <span className="px-5 py-2.5 bg-white rounded-xl text-sm font-bold shadow-sm">Porte: <span className="text-[#CC5833]">Pequeno</span></span>
                        </div>
                      </div>
                      <p className="text-xs font-medium opacity-40 text-center leading-relaxed max-w-sm mx-auto">
                        Avisaremos no seu celular ou e-mail assim que um pet com estas características entrar para adoção.
                      </p>
                    </div>
                  )}

                  {/* HISTORICO */}
                  {profileTab === 'historico' && (
                    <div className="animate-in fade-in duration-500">
                      <h3 className="text-2xl font-black mb-6 text-[#2E4036]">Seu Legado de Herói</h3>
                      <div className="space-y-4">
                        <div className="flex gap-4 items-center p-5 rounded-2xl bg-white border border-black/5 shadow-sm">
                           <div className="w-12 h-12 rounded-xl bg-[#06D6A0]/20 flex items-center justify-center text-[#2E4036]"><CheckCircle2 size={20} /></div>
                           <div>
                             <p className="text-sm font-bold text-[#1A1A1A]">Você resgatou a Luna (Gato Siamês)</p>
                             <p className="text-[10px] uppercase opacity-50 font-bold mt-1 text-[#2E4036]">Há 1 mês</p>
                           </div>
                           <span className="ml-auto text-xs font-black text-[#CC5833] bg-[#CC5833]/10 px-3 py-1 rounded-full">+300 pts</span>
                        </div>
                        <div className="flex gap-4 items-center p-5 rounded-2xl bg-white border border-black/5 shadow-sm">
                           <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600"><Share2 size={20} /></div>
                           <div>
                             <p className="text-sm font-bold text-[#1A1A1A]">Compartilhou o poster do Milo</p>
                             <p className="text-[10px] uppercase opacity-50 font-bold mt-1 text-[#2E4036]">Há 2 meses</p>
                           </div>
                           <span className="ml-auto text-xs font-black text-[#CC5833] bg-[#CC5833]/10 px-3 py-1 rounded-full">+50 pts</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        )}



      </main>

      <footer className="py-20 text-center opacity-20 text-[10px] font-bold uppercase tracking-[0.5em]">
        Patas em Casa — O Reencontro começa aqui.
      </footer>
    </div>
  );
};

export default App;