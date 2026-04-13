import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, 
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
  Phone
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
  const [communityCount, setCommunityCount] = useState(124);
  const [messages, setMessages] = useState<string[]>([]);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);

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
      setCommunityCount(c => c + (Math.random() > 0.8 ? 1 : 0));
    }, 800);

    const msgInterval = setInterval(() => {
       if (Math.random() > 0.6) {
          const newMsg = communityMessages[Math.floor(Math.random() * communityMessages.length)];
          setMessages(prev => [newMsg, ...prev.slice(0, 2)]);
       }
    }, 3000);
    
    setTimeout(() => setShowPath(true), 800);
    return () => { clearInterval(heartInterval); clearInterval(msgInterval); };
  }, [communityMessages]);

  const userIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="relative scale-75 md:scale-100">
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
    html: `<div class="relative scale-75 md:scale-100">
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
      className="fixed inset-0 z-[200] bg-[#F2F0E9] flex flex-col overflow-hidden font-sans"
    >
      <div className="relative flex-1">
        <MapContainer center={centerPos} zoom={15} zoomControl={false} className="absolute inset-0 w-full h-full">
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
          {showPath && <Polyline positions={[userPos, petPos]} color="#CC5833" weight={6} dashArray="10, 15" opacity={0.8} />}
          <Marker position={userPos} icon={userIcon} /><Marker position={petPos} icon={petIcon} />
        </MapContainer>

        {/* Header Superior (Minimalista) */}
        <div className="absolute top-6 left-6 right-6 z-[1000] flex justify-between items-start pointer-events-none">
           <div className="pointer-events-auto bg-white/70 backdrop-blur-xl px-5 py-3 rounded-3xl shadow-2xl border border-white/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#2E4036] text-white flex items-center justify-center">
                 <Navigation size={18} />
              </div>
              <div className="text-left">
                <p className="text-[9px] font-black uppercase opacity-40 leading-none mb-1">Status</p>
                <p className="text-sm font-black text-[#2E4036] leading-none">GPS Ativo</p>
              </div>
           </div>
           <button onClick={onClose} className="pointer-events-auto w-12 h-12 rounded-full bg-white/70 backdrop-blur-xl flex items-center justify-center shadow-2xl text-[#2E4036]">
              <X size={24} />
           </button>
        </div>

        {/* FEED COMUNIDADE (FLUTUANTE NO CANTO) */}
        <div className="absolute right-6 top-24 z-[1000] flex flex-col items-end gap-2 max-w-[200px]">
           <AnimatePresence>
              {messages.map((m, i) => (
                 <motion.div key={m+i} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1-i*0.3 }} exit={{ x: -20, opacity: 0 }}
                   className="bg-white/80 backdrop-blur-lg px-3 py-1.5 rounded-2xl shadow-sm border border-black/5"
                 >
                    <p className="text-[9px] font-black text-[#2E4036] uppercase tracking-tighter">{m}</p>
                 </motion.div>
              ))}
           </AnimatePresence>
        </div>

        {/* BOTTOM SHEET (ESTILO APPLE) */}
        <motion.div 
          initial={{ y: "100%" }}
          animate={{ y: isSheetExpanded ? "10%" : "60%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={`absolute inset-0 z-[1100] pointer-events-none`}
        >
          <div className="bg-white/80 backdrop-blur-3xl h-full rounded-t-[3.5rem] shadow-[0_-20px_60px_rgba(0,0,0,0.15)] border-t border-white/60 p-8 flex flex-col pointer-events-auto">
            {/* Puxador Físico */}
            <button 
              onClick={() => setIsSheetExpanded(!isSheetExpanded)}
              className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-8 flex-shrink-0" 
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
               <div className="flex-1">
                  <span className="px-3 py-1 bg-[#CC5833]/10 text-[#CC5833] rounded-full text-[9px] font-black uppercase tracking-widest mb-4 inline-block">
                    Mágica do Reencontro
                  </span>
                  <h2 className="text-4xl md:text-5xl font-black text-[#2E4036] tracking-tighter leading-[0.85] mb-2">
                     O abraço está <br/>
                     <span className="text-[#CC5833] italic font-serif font-light text-3xl md:text-5xl">logo ali.</span>
                  </h2>
               </div>

               <div className="flex gap-4 p-5 rounded-[2.5rem] bg-[#2E4036]/5 border border-black/5 items-center">
                  <div className="text-center px-4 border-r border-black/10">
                     <p className="text-[9px] font-black uppercase opacity-40 mb-1">Distância</p>
                     <p className="text-3xl font-black text-[#2E4036]">2.4<span className="text-sm opacity-50 ml-1">km</span></p>
                  </div>
                  <div className="text-center px-4">
                     <p className="text-[9px] font-black uppercase opacity-40 mb-1">Tempo</p>
                     <p className="text-3xl font-black text-[#CC5833]">8<span className="text-sm opacity-50 ml-1">min</span></p>
                  </div>
               </div>
            </div>

            {/* Conteúdo Expandido (Quem Acolheu) */}
            <div className={`space-y-6 flex-1 overflow-y-auto transition-opacity duration-300 ${!isSheetExpanded && 'md:opacity-100 opacity-80'}`}>
               <div className="p-6 rounded-[2.5rem] bg-white border border-black/5 shadow-sm flex items-center gap-6">
                  <div className="relative">
                    <img src="https://i.pravatar.cc/150?img=11" className="w-16 h-16 rounded-[1.2rem] object-cover" alt="Hero" />
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#06D6A0] rounded-full flex items-center justify-center border-4 border-white text-[#2E4036]">
                       <CheckCircle2 size={12} />
                    </div>
                  </div>
                  <div className="flex-1">
                     <p className="text-[9px] font-black uppercase opacity-40 mb-0.5">Ricardo Mendes</p>
                     <p className="text-sm font-medium text-[#2E4036]/70 leading-snug">"O {pet.name} está aqui comigo no jardim de Cedofeita. Já postei na comunidade!"</p>
                  </div>
                  <div className="flex gap-2">
                     <button className="w-12 h-12 rounded-full bg-[#F2F0E9] flex items-center justify-center text-[#CC5833] hover:scale-110 active:scale-95 transition-all">
                        <MessageCircle size={22} />
                     </button>
                     <button className="w-12 h-12 rounded-full bg-[#2E4036] flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all">
                        <Phone size={22} />
                     </button>
                  </div>
               </div>
            </div>

            <div className="pt-8 flex flex-col md:flex-row gap-4 flex-shrink-0">
               <button className="flex-1 py-6 rounded-[2rem] bg-[#2E4036] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                  Iniciar Navegação <CornerUpRight size={18} />
               </button>
               <div className="flex gap-4">
                  <button className="flex-1 py-6 px-8 rounded-[2rem] bg-white border border-black/10 text-[#2E4036] font-black text-xs uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center gap-2 transition-all">
                     <Share2 size={18} />
                  </button>
                  <button className="flex-1 py-6 px-8 rounded-[2rem] bg-white border border-black/10 text-[#2E4036] font-black text-xs uppercase tracking-widest hover:bg-gray-50 flex items-center justify-center gap-2 transition-all">
                     <Users size={18} />
                  </button>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Community Counter (Vibe AirPods) */}
        <div className="absolute left-6 bottom-[42%] md:bottom-32 z-[1050]">
           <div className="bg-[#2E4036] px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
              <div className="flex -space-x-3">
                 {[1,2,3].map(i => <img key={i} src={`https://i.pravatar.cc/100?img=${i+20}`} className="w-7 h-7 rounded-full border-2 border-[#2E4036]" alt="user" />)}
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">+{communityCount} Torcendo</span>
           </div>
        </div>
      </div>
    </motion.div>
  );
};
