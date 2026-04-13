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
  ShieldCheck
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Polyline, ZoomControl } from 'react-leaflet';
import L from 'leaflet';

// Fix para ícones do Leaflet (necessário no React)
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

  // Coordenadas simuladas para o reencontro (Porto, Portugal)
  const userPos: [number, number] = [41.1585, -8.6270];
  const petPos: [number, number] = [41.1620, -8.6220];
  const centerPos: [number, number] = [41.1600, -8.6245];

  const communityMessages = useMemo(() => [
    "Vamos lá, Tobias!",
    "Que alegria!",
    "A torcida está com você!",
    "Heróis em ação! ❤️",
    "Estou emocionado!",
    "Queria estar aí pra abraçar!",
    "Exemplo de comunidade!",
    "O amor vence tudo."
  ], []);

  // Simular corações e mensagens da comunidade
  useEffect(() => {
    const heartInterval = setInterval(() => {
      setHearts(prev => [...prev.slice(-15), { id: Date.now(), x: Math.random() * 100 }]);
      setCommunityCount(c => c + (Math.random() > 0.8 ? 1 : 0));
    }, 800);

    const msgInterval = setInterval(() => {
       if (Math.random() > 0.6) {
          const newMsg = communityMessages[Math.floor(Math.random() * communityMessages.length)];
          setMessages(prev => [newMsg, ...prev.slice(0, 2)]);
       }
    }, 3000);
    
    setTimeout(() => setShowPath(true), 800);
    
    return () => {
      clearInterval(heartInterval);
      clearInterval(msgInterval);
    };
  }, [communityMessages]);

  const userIcon = L.divIcon({
    className: 'custom-icon',
    html: `<div class="relative">
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
    html: `<div class="relative">
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
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[200] bg-[#F2F0E9] flex flex-col md:flex-row overflow-hidden font-sans"
    >
      {/* MAP SIDE */}
      <div className="relative flex-1 bg-[#E5E2D9] overflow-hidden">
        
        <MapContainer 
          center={centerPos} 
          zoom={15} 
          zoomControl={false}
          className="absolute inset-0 w-full h-full"
          style={{ background: '#F2F0E9' }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          />
          
          <ZoomControl position="bottomleft" />

          {showPath && (
            <Polyline 
              positions={[userPos, petPos]} 
              color="#CC5833" 
              weight={6} 
              dashArray="10, 15"
              opacity={0.8}
            />
          )}

          <Marker position={userPos} icon={userIcon} />
          <Marker position={petPos} icon={petIcon} />
        </MapContainer>

        {/* Marcador flutuante de nome (sobre o mapa) */}
        <div className="absolute right-[220px] top-[220px] pointer-events-none z-[500]">
           <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#CC5833] text-white px-6 py-2.5 rounded-full shadow-2xl whitespace-nowrap">
              <p className="text-[10px] font-black uppercase mb-0.5 flex items-center gap-2">
                <ShieldCheck size={12} /> {pet.name} PROTEGIDO
              </p>
           </div>
        </div>

        {/* COMMUNITY VIBE (FLOATING) */}
        <div className="absolute bottom-10 right-10 flex flex-col items-center">
           <div className="relative h-[400px] w-48 pointer-events-none flex flex-col justify-end items-center pb-20">
             <AnimatePresence>
               {hearts.map(h => (
                 <motion.div
                   key={h.id}
                   initial={{ y: 0, opacity: 0, scale: 0.5, x: h.x - 100 }}
                   animate={{ y: -300, opacity: [0, 1, 1, 0], scale: [0.5, 1.2, 1], x: h.x - 100 + (Math.random() * 40 - 20) }}
                   exit={{ opacity: 0 }}
                   transition={{ duration: 3.5, ease: "easeOut" }}
                   className="absolute text-[#CC5833]"
                 >
                   <Heart fill="currentColor" size={20 + Math.random() * 15} />
                 </motion.div>
               ))}
             </AnimatePresence>
             
             {/* Feed de Comentários em Tempo Real */}
             <div className="flex flex-col gap-2 items-end w-full pr-4">
                <AnimatePresence mode="popLayout">
                   {messages.map((m, i) => (
                      <motion.div
                        key={m + i}
                        initial={{ opacity: 0, x: 20, scale: 0.8 }}
                        animate={{ opacity: 1 - i * 0.3, x: 0, scale: 1 - i * 0.05 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white/90 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-black/5"
                      >
                         <p className="text-[10px] font-bold text-[#2E4036]">{m}</p>
                      </motion.div>
                   ))}
                </AnimatePresence>
             </div>
           </div>

           <div className="bg-[#2E4036] px-8 py-5 rounded-[2rem] shadow-[0_25px_50px_rgba(0,0,0,0.3)] border border-white/10 flex items-center gap-5 transition-all hover:scale-105">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <img 
                    key={i} 
                    src={`https://i.pravatar.cc/100?img=${i+10}`} 
                    className="w-10 h-10 rounded-full border-2 border-[#2E4036] object-cover" 
                    alt="user"
                  />
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-[#2E4036] bg-[#CC5833] flex items-center justify-center text-[10px] text-white font-black">
                  +{communityCount - 4}
                </div>
              </div>
              <div>
                <span className="text-[11px] font-black uppercase text-white tracking-widest block leading-none mb-1">
                  Comunidade Viva
                </span>
                <span className="text-[10px] font-bold text-[#06D6A0] uppercase flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-[#06D6A0] animate-pulse" /> Acompanhando Agora
                </span>
              </div>
           </div>
        </div>

        {/* NAVIGATION OVERLAY */}
        <div className="absolute top-10 left-10 w-[380px]">
           <motion.div 
             initial={{ x: -100, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             transition={{ delay: 1.5 }}
             className="bg-white/70 backdrop-blur-3xl rounded-[3rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-white"
           >
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-[1.2rem] bg-[#2E4036] flex items-center justify-center text-white shadow-xl">
                       <Navigation size={22} />
                    </div>
                    <div>
                       <h4 className="text-sm font-black uppercase tracking-widest leading-none mb-1">Reencontro</h4>
                       <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#06D6A0] animate-pulse" />
                          <span className="text-[10px] font-bold text-[#2E4036]/40 uppercase">GPS Ativo</span>
                       </div>
                    </div>
                 </div>
                 <button onClick={onClose} className="p-3 rounded-full bg-[#F2F0E9] hover:bg-white transition-all hover:rotate-90">
                    <X size={20} />
                 </button>
              </div>
              
              <div className="space-y-6">
                 <div className="p-6 rounded-[2rem] bg-gradient-to-br from-white to-[#F2F0E9] border border-black/5 shadow-inner">
                    <div className="flex justify-between items-end mb-4">
                       <div>
                          <p className="text-[9px] font-black uppercase opacity-30 mb-2">Distância Estimada</p>
                          <p className="text-4xl font-black text-[#2E4036] tracking-tighter">2.4 <span className="text-lg opacity-40">km</span></p>
                       </div>
                       <div className="text-right">
                          <p className="text-[9px] font-black uppercase opacity-30 mb-2">Tempo</p>
                          <p className="text-2xl font-black text-[#CC5833] tracking-tighter">~8 min</p>
                       </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-black/5 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: '40%' }}
                         transition={{ duration: 2, delay: 2 }}
                         className="h-full bg-[#2E4036]" 
                       />
                    </div>
                 </div>

                 <div className="flex items-center gap-4 px-2">
                    <Clock size={16} className="text-[#2E4036]/30" />
                    <p className="text-[10px] font-bold text-[#2E4036]/60 leading-tight">
                       O herói Ricardo Mendes está esperando por você em <span className="text-[#2E4036] font-black">Cedofeita, Porto</span>.
                    </p>
                 </div>
              </div>
           </motion.div>
        </div>
      </div>

      {/* INFO SIDE (CONTENT) */}
      <div className="md:w-[480px] bg-white border-l border-black/5 p-16 flex flex-col justify-between">
         <div className="space-y-12">
            <div>
               <motion.span 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="px-4 py-1.5 bg-[#CC5833]/10 text-[#CC5833] rounded-full text-[10px] font-black uppercase tracking-widest mb-8 inline-block"
               >
                 Magia do Reencontro
               </motion.span>
               <h2 className="text-5xl font-black text-[#2E4036] tracking-tighter leading-[0.9] mb-6">
                 O abraço está <br/>
                 <span className="text-[#CC5833] italic font-serif font-light">logo ali.</span>
               </h2>
               <p className="text-base text-[#2E4036]/70 leading-relaxed font-medium">
                 Não existe tecnologia maior que o amor. Estamos conectando você diretamente com quem acolheu o {pet.name}.
               </p>
            </div>

            <div className="space-y-4">
               <div className="p-8 rounded-[2.5rem] bg-[#F2F0E9] border border-black/5 hover:border-[#2E4036]/20 transition-colors group cursor-pointer">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative">
                       <img src="https://i.pravatar.cc/150?img=11" className="w-16 h-16 rounded-[1.5rem] object-cover shadow-lg" alt="Hero" />
                       <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-[#06D6A0] rounded-full flex items-center justify-center text-[#2E4036] border-4 border-[#F2F0E9]">
                          <CheckCircle2 size={12} />
                       </div>
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase opacity-40 mb-1">Quem acolheu</p>
                       <h4 className="text-xl font-bold text-[#2E4036]">Ricardo Mendes</h4>
                    </div>
                    <button className="ml-auto w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-md text-[#CC5833] group-hover:scale-110 transition-transform">
                       <MessageCircle size={22} fill="currentColor" className="text-[#CC5833]/10" />
                    </button>
                  </div>
                  <div className="h-[1px] bg-black/10 my-6 opacity-30" />
                  <p className="text-sm font-medium text-[#2E4036]/60 italic leading-relaxed">
                    "Ele está calmo, tirei a foto agora mesmo. Já postei na comunidade pra todos saberem que ele está bem!"
                  </p>
               </div>
            </div>
         </div>

         <div className="space-y-4 pt-8">
            <button className="w-full py-6 rounded-[2.5rem] bg-[#2E4036] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
               Iniciar Navegação <CornerUpRight size={18} />
            </button>
            <div className="flex gap-4">
              <button className="flex-1 py-5 rounded-[2rem] bg-white border-2 border-black/5 text-[#2E4036] font-black text-[10px] uppercase tracking-widest hover:bg-[#F2F0E9] transition-all flex items-center justify-center gap-2">
                 <Share2 size={16} /> Compartilhar
              </button>
              <button className="flex-1 py-5 rounded-[2rem] bg-white border-2 border-black/5 text-[#2E4036] font-black text-[10px] uppercase tracking-widest hover:bg-[#F2F0E9] transition-all flex items-center justify-center gap-2">
                 <Users size={16} /> Ver Rede
              </button>
            </div>
         </div>
      </div>
    </motion.div>
  );
};
