import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ArrowRight, ArrowLeft, Camera, MapPin, Navigation,
  PenLine, Share2, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';
import { PetService } from '../lib/PetService';
import { BreedSelector } from './BreedSelector';

// --- TIPOS ---
interface FormData {
  nome: string;
  especie: 'cao' | 'gato' | 'outro' | '';
  raca: string;
  racaNaoSei: boolean;
  idade: string;
  sexo: 'macho' | 'femea' | 'nao_sei' | '';
  cores: string[];
  detalhesColeira: string;
  fotos: File[];
  comportamento: string;
  gpsLat: number | null;
  gpsLng: number | null;
  gpsEndereco: string;
  localizacaoTipo: 'gps' | 'manual';
  enderecoManual: string;
  abrigoTipo: 'comigo' | 'ong' | 'rua';
  abrigoDetalhes: string;
}

interface FoundPetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId?: string;
}

const CORES_OPCOES = ['Preto', 'Branco', 'Marrom', 'Amarelo', 'Caramelo', 'Cinza', 'Malhado', 'Ruivo'];
const THEME = { primary: '#06D6A0', accent: '#2E4036', bg: '#F2F0E9' };

const cap = (s: string) => {
  if (!s) return "";
  let res = s.charAt(0).toUpperCase() + s.slice(1);
  res = res.replace(/([.?!]|\n)\s*([a-z])/g, (match, sep, char) => {
    return sep + (match.includes('\n') ? '\n' : ' ') + char.toUpperCase();
  });
  return res;
};

// --- COMPONENTES AUXILIARES (FORA PARA EVITAR REMOUNT) ---

const StepBar = React.memo(({ step, total }: { step: number; total: number }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300"
          style={{
            backgroundColor: i < step ? THEME.primary : i === step ? THEME.accent : '#E8E4DD',
            color: i <= step ? 'white' : '#888',
          }}
        >
          {i < step ? <CheckCircle2 size={16} /> : i + 1}
        </div>
        {i < total - 1 && (
          <div
            className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{ backgroundColor: i < step ? THEME.primary : '#E8E4DD' }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
));

const Field = React.memo(({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 opacity-50">{label}</label>
    {children}
    {error && <p className="text-xs text-[#CC5833] mt-1 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
  </div>
));

// --- ETAPA 1 ---
function Step1Base({ data, setData, onNext }: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.especie) e.especie = 'Selecione a espécie';
    if (data.cores.length === 0) e.cores = 'Selecione pelo menos uma cor';
    if (!data.racaNaoSei && !data.raca) e.raca = 'Informe a raça ou marque "Não sei"';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const toggleCor = (cor: string) => {
    setData((d: any) => ({
      ...d,
      cores: d.cores.includes(cor) ? d.cores.filter((c: any) => c !== cor) : [...d.cores, cor]
    }));
  };

  return (
    <div className="space-y-5">
      <Field label="Nome provisório (opcional)">
        <input value={data.nome} onChange={e => setData((d: any) => ({ ...d, nome: cap(e.target.value) }))} placeholder="Ex: Corgi da Rua 5" className="w-full p-4 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-[#06D6A0]/30" style={{ backgroundColor: THEME.bg }} />
      </Field>

      <Field label="Espécie *" error={errors.especie}>
        <div className="flex gap-3">
          {[{ v: 'cao', l: '🐶 Cão' }, { v: 'gato', l: '🐱 Gato' }, { v: 'outro', l: '🐾 Outro' }].map(({ v, l }) => (
            <button key={v} type="button" onClick={() => setData((d: any) => ({ ...d, especie: v as any }))} className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all" style={{ backgroundColor: data.especie === v ? THEME.primary : THEME.bg, color: data.especie === v ? 'white' : 'inherit' }}>{l}</button>
          ))}
        </div>
      </Field>

      <Field label="Raça *" error={errors.raca}>
        <BreedSelector 
          especie={data.especie} 
          value={data.raca} 
          onChange={(val) => setData((d: any) => ({ ...d, raca: val, racaNaoSei: false }))} 
          disabled={data.racaNaoSei}
          themeColor={THEME.primary}
        />
        <label className="flex items-center gap-2 mt-3 cursor-pointer group">
          <input type="checkbox" className="w-4 h-4 rounded accent-[#06D6A0]" checked={data.racaNaoSei} onChange={e => setData((d: any) => ({ ...d, racaNaoSei: e.target.checked, raca: e.target.checked ? '' : data.raca }))} />
          <span className="text-xs font-bold opacity-50 group-hover:opacity-100 transition-opacity">Não sei a raça</span>
        </label>
      </Field>

      <Field label="Cores *" error={errors.cores}>
        <div className="flex flex-wrap gap-2">
          {CORES_OPCOES.map(cor => (
            <button key={cor} type="button" onClick={() => toggleCor(cor)} className="px-4 py-2 rounded-full text-xs font-bold transition-all" style={{ backgroundColor: data.cores.includes(cor) ? THEME.primary : THEME.bg, color: data.cores.includes(cor) ? 'white' : 'inherit' }}>{cor}</button>
          ))}
        </div>
      </Field>
      <button onClick={() => validate() && onNext()} className="w-full py-4 rounded-full text-white font-bold shadow-lg transition-transform hover:scale-[1.02]" style={{ backgroundColor: THEME.primary }}>Próximo: Fotos e Detalhes <ArrowRight size={18} className="inline ml-2" /></button>
    </div>
  );
}

const Step1 = React.memo(Step1Base);

// --- ETAPA 2 ---
function Step2Base({ data, setData, onNext, onBack }: any) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 6 - data.fotos.length);
    if (files.length > 0) {
      setData((d: any) => ({ ...d, fotos: [...d.fotos, ...files].slice(0, 6) }));
      
          // Simular Reconhecimento de IA
          setIsAiScanning(true);
          setTimeout(() => {
            const found = data.especie === 'cao' ? 'Golden Retriever' : 'Siamês';
            setData((d: any) => ({ ...d, raca: found, racaNaoSei: false }));
            setIsAiScanning(false);
          }, 1500);
    }
  };
  return (
    <div className="space-y-6">
       <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Fotos do Pet Encontrado</label>
        <div className="grid grid-cols-3 gap-3">
          {data.fotos.map((file: any, idx: number) => (
            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden"><img src={URL.createObjectURL(file)} className="w-full h-full object-cover" /><button onClick={() => setData((d: any) => ({ ...d, fotos: d.fotos.filter((_: any, i: any) => i !== idx) }))} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1"><X size={10} /></button></div>
          ))}
          {data.fotos.length < 6 && (
            <button 
              onClick={() => {
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) {
                  setShowSourceMenu(true);
                } else {
                  galleryInputRef.current?.click();
                }
              }} 
              className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 relative overflow-hidden" 
              style={{ borderColor: `${THEME.primary}40` }}
            >
              {isAiScanning ? (
                <div className="absolute inset-0 bg-[#06D6A0]/10 flex flex-col items-center justify-center animate-pulse">
                   <div className="w-full h-0.5 bg-[#06D6A0] absolute top-0 animate-[scan_1.5s_infinite]" />
                   <span className="text-[8px] font-black uppercase text-[#2E4036] mt-2">IA Scanning...</span>
                </div>
              ) : (
                <>
                  <Camera size={22} />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Adicionar</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Action Sheet de Fotos (Estilo Steve Jobs) */}
        <AnimatePresence>
          {showSourceMenu && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowSourceMenu(false)}
                className="fixed inset-0 z-[150] bg-black/20 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed bottom-0 left-0 right-0 z-[160] bg-white rounded-t-[2.5rem] p-8 pb-12 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
              >
                <div className="w-12 h-1.5 bg-black/5 rounded-full mx-auto mb-8" />
                <h4 className="text-xl font-black text-center mb-8 text-[#2E4036]">Como deseja adicionar?</h4>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => { cameraInputRef.current?.click(); setShowSourceMenu(false); }}
                    className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-[#F2F0E9] transition-all active:scale-95"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#06D6A0] text-white flex items-center justify-center">
                      <Camera size={24} />
                    </div>
                    <span className="text-sm font-bold">Tirar Foto</span>
                  </button>
                  <button 
                    onClick={() => { galleryInputRef.current?.click(); setShowSourceMenu(false); }}
                    className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-[#F2F0E9] transition-all active:scale-95"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#2E4036] text-white flex items-center justify-center">
                      <Share2 size={24} className="rotate-90" />
                    </div>
                    <span className="text-sm font-bold">Galeria</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFiles} className="hidden" />
        <input ref={galleryInputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
      </div>
      <Field label="Descreva como ele está">
        <textarea value={data.comportamento} onChange={e => setData((d: any) => ({ ...d, comportamento: cap(e.target.value) }))} rows={4} placeholder="Ex: Está assustado mas é dócil. Tem uma mancha branca no peito..." className="w-full p-4 rounded-2xl outline-none text-sm font-medium resize-none shadow-inner" style={{ backgroundColor: THEME.bg }} />
      </Field>
      <div className="flex gap-3">
        <button onClick={onBack} className="px-6 py-4 rounded-full font-bold text-sm bg-gray-100">Voltar</button>
        <button onClick={onNext} className="flex-1 py-4 rounded-full text-white font-bold shadow-lg transition-transform hover:scale-[1.02]" style={{ backgroundColor: THEME.primary }}>Próximo: Local e Abrigo <ArrowRight size={18} className="inline ml-2" /></button>
      </div>
    </div>
  );
}

const Step2 = React.memo(Step2Base);

// --- ETAPA 3 ---
function Step3Base({ data, setData, onNext, onBack, isSubmitting }: any) {
  const [isFetchingGps, setIsFetchingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const fetchGPS = () => {
    setIsFetchingGps(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setData((d: any) => ({ ...d, gpsLat: latitude, gpsLng: longitude, localizacaoTipo: 'gps' }));
        
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const json = await res.json();
          const addr = json.display_name || "Localização via GPS";
          setData((d: any) => ({ ...d, gpsEndereco: addr, enderecoManual: addr }));
        } catch {
          setData((d: any) => ({ ...d, gpsEndereco: "Localização capturada" }));
        } finally {
          setIsFetchingGps(false);
        }
      },
      (err) => {
        setIsFetchingGps(false);
        setGpsError("Não conseguimos acessar seu GPS. Por favor, digite o endereço abaixo.");
        setData((d: any) => ({ ...d, localizacaoTipo: 'manual' }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    if (!data.gpsLat && data.localizacaoTipo === 'gps') {
      fetchGPS();
    }
  }, []);

  return (
    <div className="space-y-6">
      <Field label="Onde o pet está agora?">
         <div className="flex p-1 bg-[#F2F0E9] rounded-2xl mb-4">
            <button 
              onClick={() => setData((d: any) => ({ ...d, localizacaoTipo: 'gps' }))}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${data.localizacaoTipo === 'gps' ? 'bg-white shadow-sm text-[#2E4036]' : 'opacity-40'}`}
            >
              <MapPin size={14} /> GPS Real
            </button>
            <button 
              onClick={() => setData((d: any) => ({ ...d, localizacaoTipo: 'manual' }))}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-2 ${data.localizacaoTipo === 'manual' ? 'bg-white shadow-sm text-[#2E4036]' : 'opacity-40'}`}
            >
              <PenLine size={14} /> Manual
            </button>
         </div>

        {data.localizacaoTipo === 'gps' ? (
          <div className="p-6 rounded-3xl bg-[#06D6A0]/5 border border-[#06D6A0]/20 text-center">
            {isFetchingGps ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={24} className="animate-spin text-[#06D6A0]" />
                <p className="text-xs font-bold text-[#2E4036]/60">Verificando sua posição...</p>
              </div>
            ) : data.gpsLat ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-[#06D6A0] text-white flex items-center justify-center shadow-lg animate-bounce">
                  <Navigation size={20} fill="currentColor" />
                </div>
                <p className="text-[10px] font-black uppercase text-[#06D6A0] tracking-widest">Localização Validada</p>
                <p className="text-xs font-medium opacity-60 leading-tight">{data.gpsEndereco}</p>
                <button onClick={fetchGPS} className="text-[10px] font-bold underline mt-2 opacity-40">Atualizar GPS</button>
              </div>
            ) : (
               <button onClick={fetchGPS} className="w-full py-4 rounded-2xl bg-[#06D6A0] text-white font-bold text-sm shadow-lg">Ativar GPS do Celular</button>
            )}
            {gpsError && <p className="text-[10px] text-red-500 font-bold mt-2">{gpsError}</p>}
          </div>
        ) : (
          <input 
            value={data.enderecoManual} 
            onChange={e => setData((d: any) => ({ ...d, enderecoManual: e.target.value }))} 
            placeholder="Ex: Av. Paulista, 1000 - Perto do MASP" 
            className="w-full p-4 rounded-2xl bg-[#F2F0E9] outline-none text-sm font-medium focus:ring-2 focus:ring-[#06D6A0]/30 transition-all shadow-inner" 
          />
        )}
      </Field>

      <Field label="Responsável atual">
         <div className="grid grid-cols-3 gap-2">
            {['comigo', 'ong', 'rua'].map(type => (
               <button key={type} onClick={() => setData((d: any) => ({ ...d, abrigoTipo: type as any }))} className="py-3 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all" style={{ backgroundColor: data.abrigoTipo === type ? THEME.primary : THEME.bg, color: data.abrigoTipo === type ? 'white' : 'inherit' }}>{type === 'comigo' ? 'Comigo' : type === 'ong' ? 'Na ONG' : 'Na Rua'}</button>
            ))}
         </div>
      </Field>

      <div className="flex gap-3 pt-4">
        <button onClick={onBack} className="px-6 py-4 rounded-full font-bold text-sm bg-[#F2F0E9] hover:bg-[#E8E4DD] transition-colors">Voltar</button>
        <button 
          onClick={onNext} 
          className="flex-1 py-4 rounded-full text-white font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95" 
          style={{ backgroundColor: THEME.primary }} 
          disabled={isSubmitting || (data.localizacaoTipo === 'gps' && !data.gpsLat && !data.enderecoManual)}
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Finalizar Reporte Heroico'}
        </button>
      </div>
    </div>
  );
}

const Step3 = React.memo(Step3Base);

// --- ETAPA 4 ---
function Step4({ onClose }: any) {
  return (
    <div className="text-center py-6">
      <div className="w-20 h-20 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-6"><CheckCircle2 size={40} /></div>
      <h3 className="text-2xl font-black mb-2">Reportado com sucesso!</h3>
      <p className="opacity-60 mb-8 text-sm">Nossa IA já está varrendo os bancos de pets perdidos para encontrar o dono.</p>
      <button onClick={onClose} className="w-full py-4 rounded-full text-white font-bold shadow-lg" style={{ backgroundColor: THEME.accent }}>Voltar ao Início</button>
    </div>
  );
}

// --- CONSTANTES ---
const STEP_TITLES = ['Quem você encontrou?', 'Fotos e Detalhes', 'Onde ele está?', 'Obrigado Herói!'];

// --- COMPONENTE PRINCIPAL ---
export function FoundPetModal({ isOpen, onClose, onSuccess, userId }: FoundPetModalProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<FormData>({ 
    nome: '', especie: '', raca: '', racaNaoSei: false, idade: '', sexo: '', cores: [], 
    detalhesColeira: '', fotos: [], comportamento: '', localizacaoTipo: 'gps', 
    enderecoManual: '', gpsLat: null, gpsLng: null, gpsEndereco: '', 
    abrigoTipo: 'comigo', abrigoDetalhes: '' 
  });

  const handleNext = async () => {
    if (step === 2) {
      setIsSubmitting(true);
      try {
        const { fotos, ...rest } = data;
        await PetService.create({ 
          owner_id: userId || '00000000-0000-0000-0000-000000000000', 
          type: 'found', 
          name: rest.nome || 'Pet Encontrado', 
          breed: rest.raca, 
          species: rest.especie as any, 
          description: rest.comportamento,
          location: { 
            lat: rest.gpsLat || 0, 
            lng: rest.gpsLng || 0, 
            address: rest.enderecoManual 
          }, 
          status: 'active' 
        }, fotos);
        if (onSuccess) onSuccess();
        setStep(3);
      } catch { alert('Erro ao salvar reporte.'); } finally { setIsSubmitting(false); }
    } else { setStep(step + 1); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8">
      <div className="absolute inset-0 bg-[#2E4036]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] shadow-2xl" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <style>{`
          @keyframes scan {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
          }
        `}</style>
        <div className="p-8 pb-4 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-black/5 flex items-center justify-between">
           <h2 className="text-xl font-black">{STEP_TITLES[step]}</h2>
           <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"><X size={16} /></button>
        </div>
        <div className="p-8">
          {step < 3 && <StepBar step={step} total={3} />}
          {step === 0 && <Step1 data={data} setData={setData} onNext={handleNext} />}
          {step === 1 && <Step2 data={data} setData={setData} onNext={handleNext} onBack={() => setStep(0)} />}
          {step === 2 && <Step3 data={data} setData={setData} onNext={handleNext} onBack={() => setStep(1)} isSubmitting={isSubmitting} />}
          {step === 3 && <Step4 onClose={onClose} />}
        </div>
      </div>
    </div>
  );
}
