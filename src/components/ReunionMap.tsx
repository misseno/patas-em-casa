import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Navigation, 
  Users, 
  Share2, 
  CornerUpRight, 
  MessageCircle, 
  X, 
  CheckCircle2,
  Clock,
  ShieldCheck,
  Phone,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface ReunionMapProps {
  pet: {
    id: number;
    name: string;
    img: string;
    loc: string;
    status: string;
  };
  onClose: () => void;
}

export const ReunionMap: React.FC<ReunionMapProps> = ({ pet, onClose }) => {
  const [showPath, setShowPath] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [communityCount, setCommunityCount] = useState(124);
  const [messages, setMessages] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Coordenadas simuladas para o reencontro (Porto, Portugal)
  const userPos: [number, number] = [41.1585, -8.6270];
  const petPos: [number, number] = [41.1620, -8.6220];
  const centerPos: [number, number] = [41.1600, -8.6245];

  const communityMessages = useMemo(() => [
    "Vamos lá, Tobias!", "Que alegria!", "A torcida está com você!", "Heróis em ação! ❤️",
    "Estou emocionado!", "O amor vence tudo."
  ], []);

  useEffect(() => {
    const heartInterval = setInterval(() => {
      setHearts(prev => [...prev.slice(-20), { id: Date.now(), x: Math.random() * 100 }]);
      setCommunityCount(c => c + (Math.random() > 0.8 ? 1 : 0));
    }, 600);

    const msgInterval = setInterval(() => {
       if (Math.random() > 0.6) {
          const newMsg = communityMessages[Math.floor(Math.random() * communityMessages.length)];
          setMessages(prev => [newMsg, ...prev.slice(0, 3)]);
       }
    }, 2500);
    
    setTimeout(() => setShowPath(true), 800);
    return () => { clearInterval(heartInterval); clearInterval(msgInterval); };
  }, [communityMessages]);

  const userIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="relative scale-90 md:scale-100">
             <div class="w-16 h-16 rounded-[1.5rem] border-[3px] border-white shadow-2xl overflow-hidden bg-[#2E4036] flex items-center justify-center">
                <span class="text-white font-black text-[10px] uppercase tracking-tighter">Você</span>
             </div>
             <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 shadow-lg"></div>
           </div>`,
    iconSize: [64, 64],
    iconAnchor: [32, 64],
  });

  const petIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="relative scale-90 md:scale-100">
             <div class="absolute inset-0 bg-[#CC5833]/20 rounded-full animate-ping scale-150"></div>
             <div class="w-24 h-24 rounded-[2rem] border-[4px] border-[#CC5833] shadow-2xl overflow-hidden bg-white ring-8 ring-white/30">
                <img src="${pet.img}" class="w-full h-full object-cover" alt="Pet" />
             </div>
             <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#CC5833] rotate-45 shadow-lg"></div>
           </div>`,
    iconSize: [96, 96],
    iconAnchor: [48, 96],
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-[#F2F0E9] flex flex-col md:flex-row overflow-hidden font-sans"
    >
      {/* MAPA (FUNDAÇÃO) */}
      <div className="relative flex-1 h-full bg-[#E5E2D9]">
        <MapContainer center={centerPos} zoom={15} zoomControl={false} className="absolute inset-0 w-full h-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {showPath && <Polyline positions={[userPos, petPos]} color="#CC5833" weight={6} dashArray="10, 15" opacity={0.6} />}
          <Marker position={userPos} icon={userIcon} /><Marker position={petPos} icon={petIcon} />
        </MapContainer>

        {/* FEED DE CORAÇÕES (MÁGICO) */}
        <div className="absolute inset-0 pointer-events-none z-[1000] overflow-hidden">
          <AnimatePresence>
            {hearts.map(h => (
              <motion.div
                key={h.id}
                initial={{ y: "100vh", opacity: 0, scale: 0.5, x: `${h.x}%` }}
                animate={{ y: "-10vh", opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1, 0.8], x: `${h.x + (Math.random() * 10 - 5)}%` }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4.5, ease: "easeOut" }}
                className="absolute text-[#CC5833]"
              >
                <Heart fill="currentColor" size={20 + Math.random() * 20} className="opacity-40" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* CONTROLES DO MAPA (SUPERIOR) */}
        <div className="absolute top-6 left-6 flex items-center gap-3 z-[1500]">
           <button 
             onClick={() => setIsSidebarOpen(!isSidebarOpen)}
             className="md:hidden w-12 h-12 rounded-full bg-white/80 backdrop-blur-xl flex items-center justify-center shadow-2xl text-[#2E4036] border border-white"
           >
              {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
           </button>
           <div className="bg-white/70 backdrop-blur-xl px-5 py-3 rounded-3xl shadow-2xl border border-white/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#2E4036] text-white flex items-center justify-center">
                 <Navigation size={18} />
              </div>
              <p className="text-sm font-black text-[#2E4036] uppercase tracking-tighter">GPS Ativo</p>
           </div>
        </div>

        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-[1500] w-12 h-12 rounded-full bg-white/70 backdrop-blur-xl flex items-center justify-center shadow-2xl text-[#2E4036] border border-white"
        >
           <X size={24} />
        </button>

        {/* COMUNIDADE VIVA (CANTO INFERIOR) */}
        <div className="absolute left-6 bottom-6 z-[1500]">
           <div className="bg-[#2E4036] px-6 py-4 rounded-[2rem] shadow-2xl flex items-center gap-4 border border-white/10">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-8 h-8 rounded-full border-2 border-[#2E4036]" alt="user" />)}
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">+{communityCount} Torcendo</span>
           </div>
        </div>

        {/* FEED DE MENSAGENS (MOBILE/DESKTOP FLUTUANTE) */}
        <div className={`absolute right-6 bottom-6 z-[1500] flex flex-col items-end gap-2 max-w-[240px] transition-transform duration-500 ${!isSidebarOpen && 'md:translate-x-0'}`}>
           <AnimatePresence>
              {messages.map((m, i) => (
                 <motion.div key={m+i} initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1-i*0.2 }} exit={{ x: -20, opacity: 0 }}
                   className="bg-white/80 backdrop-blur-lg px-4 py-2 rounded-2xl shadow-sm border border-white"
                 >
                    <p className="text-[10px] font-bold text-[#2E4036] leading-tight">{m}</p>
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>
      </div>

      {/* SIDEBAR DE INFORMAÇÕES (O CÉREBRO) */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="fixed md:relative inset-y-0 left-0 w-full md:w-[500px] z-[2000] md:z-10 bg-white shadow-[30px_0_60px_rgba(0,0,0,0.1)] flex flex-col"
          >
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
               {/* Mobile Close Button inside Sidebar */}
               <button onClick={() => setIsSidebarOpen(false)} className="md:hidden absolute top-8 right-8 text-[#2E4036]/20">
                  <X size={32} />
               </button>

               <div className="mb-12">
                  <span className="px-4 py-1.5 bg-[#CC5833]/10 text-[#CC5833] rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block">
                    O Encontro Final
                  </span>
                  <h2 className="text-5xl md:text-6xl font-black text-[#2E4036] tracking-tighter leading-[0.85] mb-6">
                     O abraço está <br/>
                     <span className="text-[#CC5833] italic font-serif font-light">logo ali.</span>
                  </h2>
               </div>

               {/* CARD DO HERÓI (FOCO TOTAL NA IMAGEM E MENSAGEM) */}
               <div className="p-8 rounded-[3rem] bg-[#F2F0E9] border border-black/5 mb-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Heart size={120} fill="currentColor" className="text-[#CC5833]" />
                  </div>
                  
                  <div className="flex items-center gap-6 mb-8 relative z-10">
                    <div className="relative">
                       <img src="https://i.pravatar.cc/150?img=11" className="w-20 h-20 rounded-[1.8rem] object-cover shadow-2xl border-4 border-white" alt="Hero" />
                       <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#06D6A0] rounded-full flex items-center justify-center text-[#2E4036] border-4 border-[#F2F0E9]">
                          <CheckCircle2 size={14} />
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase opacity-40 mb-1 leading-none tracking-widest">Herói da Vez</p>
                       <h4 className="text-2xl font-black text-[#2E4036]">Ricardo Mendes</h4>
                    </div>
                  </div>

                  <div className="bg-white/50 backdrop-blur px-6 py-5 rounded-[2rem] border border-white/50 relative z-10">
                     <p className="text-base font-medium text-[#2E4036] leading-relaxed italic">
                        "O {pet.name} está são e salvo aqui comigo. Tirei essa foto agora para você ficar tranquilo. Estamos te esperando!"
                     </p>
                  </div>
               </div>

               {/* DISTÂNCIA E TEMPO (GRANDE E IMPACTANTE) */}
               <div className="grid grid-cols-2 gap-4 mb-12">
                  <div className="p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-sm text-center">
                     <p className="text-[10px] font-black uppercase opacity-30 mb-2 tracking-widest leading-none">Distância</p>
                     <p className="text-5xl font-black text-[#2E4036] tracking-tighter leading-none">2.4<span className="text-xl opacity-30 ml-1">km</span></p>
                  </div>
                  <div className="p-8 rounded-[2.5rem] bg-white border border-black/5 shadow-sm text-center">
                     <p className="text-[10px] font-black uppercase opacity-30 mb-2 tracking-widest leading-none">Previsão</p>
                     <p className="text-5xl font-black text-[#CC5833] tracking-tighter leading-none">8<span className="text-xl opacity-30 ml-1">min</span></p>
                  </div>
               </div>

               {/* PROGRESSO DA MISSÃO */}
               <div className="px-4 mb-12">
                  <div className="flex justify-between items-center mb-3">
                     <p className="text-[10px] font-black uppercase text-[#2E4036]/40 tracking-widest">Missão de Reencontro</p>
                     <p className="text-[10px] font-black text-[#CC5833]">85%</p>
                  </div>
                  <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                     <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 2 }} className="h-full bg-gradient-to-r from-[#2E4036] to-[#CC5833]" />
                  </div>
               </div>
            </div>

            {/* BARRA DE AÇÕES (FIXA NA BASE DA SIDEBAR) */}
            <div className="p-8 md:p-12 bg-white/80 backdrop-blur-xl border-t border-black/5 grid grid-cols-4 gap-3">
               <button 
                 onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${userPos[0]},${userPos[1]}&destination=${petPos[0]},${petPos[1]}`, '_blank')}
                 className="col-span-2 py-6 rounded-[2rem] bg-[#2E4036] text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center gap-2"
               >
                  Traçar Rota <CornerUpRight size={16} />
               </button>
               <button 
                 onClick={() => window.open(`https://wa.me/5511999999999?text=Olá Ricardo, estou a caminho para buscar o ${pet.name}!`, '_blank')}
                 className="w-full py-6 rounded-[2rem] bg-[#F2F0E9] text-[#2E4036] flex items-center justify-center hover:bg-[#CC5833] hover:text-white transition-all shadow-sm"
               >
                  <MessageCircle size={20} />
               </button>
               <button 
                 onClick={() => window.open('tel:+5511999999999')}
                 className="w-full py-6 rounded-[2rem] bg-[#F2F0E9] text-[#2E4036] flex items-center justify-center hover:bg-[#CC5833] hover:text-white transition-all shadow-sm"
               >
                  <Phone size={20} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
