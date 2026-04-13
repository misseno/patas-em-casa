import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ArrowRight, ArrowLeft, Camera, Heart, Search, CheckCircle2, AlertCircle, Syringe, Sparkles, Loader2, Share2
} from 'lucide-react';
import { PetService } from '../lib/PetService';
import { BreedSelector } from './BreedSelector';

// --- THEME ---
const THEME = { primary: '#CC5833', accent: '#2E4036', bg: '#F2F0E9', radar: '#F3A183' };

// --- TIPOS ---
type FlowType = 'none' | 'adopt' | 'donate';

interface DonateFormData {
  nome: string;
  especie: 'cao' | 'gato' | 'outro' | '';
  porte: 'Pequeno' | 'Médio' | 'Grande' | '';
  idade: string;
  raca: string;
  castrado: boolean;
  vacinado: boolean;
  especial: boolean;
  temperamento: string[];
  historia: string;
  fotos: File[];
}

interface AdoptFormData {
  especie: 'cao' | 'gato' | 'qualquer' | '';
  porte: string[];
  racas: string;
  aceitaSRD: boolean;
  apartamento: boolean;
}

interface AdoptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPERAMENTOS = ['Brincalhão', 'Calmo', 'Carente', 'Independente', 'Protetor', 'Sociável', 'Assustado'];
const PORTES = ['Pequeno', 'Médio', 'Grande'];

const cap = (s: string) => {
  if (!s) return "";
  let res = s.charAt(0).toUpperCase() + s.slice(1);
  // Capitaliza após . ? ! seguido de espaço ou quebra de linha
  res = res.replace(/([.?!]|\n)\s*([a-z])/g, (match, sep, char) => {
    return sep + (match.includes('\n') ? '\n' : ' ') + char.toUpperCase();
  });
  return res;
};

// --- COMPONENTES AUXILIARES ---
const StepBar = React.memo(({ step, total, color }: { step: number; total: number; color: string }) => (
  <div className="flex items-center gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div
          className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300"
          style={{
            backgroundColor: i < step ? color : i === step ? THEME.accent : '#E8E4DD',
            color: i <= step ? 'white' : '#888',
          }}
        >
          {i < step ? <CheckCircle2 size={16} /> : i + 1}
        </div>
        {i < total - 1 && (
          <div
            className="flex-1 h-1 rounded-full transition-all duration-500"
            style={{ backgroundColor: i < step ? color : '#E8E4DD' }}
          />
        )}
      </React.Fragment>
    ))}
  </div>
));

const Field = React.memo(({ label, error, children, color = THEME.primary }: { label: string; error?: string; children: React.ReactNode; color?: string }) => (
  <div className="mb-5">
    <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 opacity-50">{label}</label>
    {children}
    {error && <p className="text-xs mt-1 flex items-center gap-1" style={{ color }}><AlertCircle size={12} />{error}</p>}
  </div>
));

// --- SUB-COMPONENTES DE FLUXO (FORA PARA EVITAR REMOUNT) ---

const DonateStep1 = React.memo(({ data, setData, setStep, THEME }: any) => {
  const error = (!data.nome || !data.especie || !data.porte) ? 'Preencha os campos obrigatórios' : '';
  return (
    <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
      <Field label="Nome do Pet *">
        <input value={data.nome} onChange={e => setData((d: any) => ({ ...d, nome: cap(e.target.value) }))} className="w-full p-4 rounded-2xl outline-none text-sm font-medium focus:ring-2" style={{ backgroundColor: THEME.bg }} placeholder="Ex: Mel" />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Espécie *">
          <select value={data.especie} onChange={e => setData((d: any) => ({ ...d, especie: e.target.value as any }))} className="w-full p-4 rounded-2xl outline-none text-sm font-medium appearance-none" style={{ backgroundColor: THEME.bg }}>
            <option value="">Selecione</option>
            <option value="cao">🐶 Cachorro</option>
            <option value="gato">🐱 Gato</option>
          </select>
        </Field>
        <Field label="Porte *">
          <select value={data.porte} onChange={e => setData((d: any) => ({ ...d, porte: e.target.value as any }))} className="w-full p-4 rounded-2xl outline-none text-sm font-medium appearance-none" style={{ backgroundColor: THEME.bg }}>
            <option value="">Selecione</option>
            <option value="Pequeno">Pequeno (até 10kg)</option>
            <option value="Médio">Médio (11kg a 25kg)</option>
            <option value="Grande">Grande (acima 25kg)</option>
          </select>
        </Field>
      </div>
      <Field label="Raça (opcional)">
        <BreedSelector 
          especie={data.especie} 
          value={data.raca} 
          onChange={(val) => setData((d: any) => ({ ...d, raca: val }))} 
          themeColor={THEME.primary}
        />
      </Field>
      <button onClick={() => !error && setStep(1)} className="w-full py-4 mt-4 rounded-full text-white font-bold text-base shadow-lg transition-transform hover:scale-[1.02] disabled:opacity-50" style={{ backgroundColor: THEME.primary }} disabled={!!error}>
        Saúde e Personalidade <ArrowRight size={18} className="inline ml-2" />
      </button>
    </div>
  );
});

const DonateStep2 = React.memo(({ data, setData, setStep, toggleTemp, THEME }: any) => (
  <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
    <Field label="Condição de Saúde">
      <div className="flex flex-col gap-2">
        {[
          { key: 'castrado', label: '✂️ Já é Castrado(a)' },
          { key: 'vacinado', label: '💉 Vacinado(a) e Vermifugado(a)' },
          { key: 'especial', label: '❤️ Possui necessidades especiais' }
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-3 p-4 rounded-2xl cursor-pointer transition-colors" style={{ backgroundColor: data[key] ? `${THEME.primary}20` : THEME.bg }}>
            <input type="checkbox" className="w-5 h-5 rounded accent-[#CC5833]" checked={!!data[key]} onChange={e => setData((d: any) => ({ ...d, [key]: e.target.checked }))} />
            <span className="text-sm font-bold opacity-80">{label}</span>
          </label>
        ))}
      </div>
    </Field>
    <Field label="Personalidade (Máximo 3)">
      <div className="flex flex-wrap gap-2">
        {TEMPERAMENTOS.map(t => (
          <button key={t} onClick={() => toggleTemp(t)} className="px-4 py-2 rounded-full text-xs font-bold transition-all" style={{ backgroundColor: data.temperamento.includes(t) ? THEME.primary : THEME.bg, color: data.temperamento.includes(t) ? 'white' : 'inherit' }}>
            {t}
          </button>
        ))}
      </div>
    </Field>
    <div className="flex gap-3">
      <button onClick={() => setStep(0)} className="px-6 py-4 rounded-full font-bold text-sm" style={{ backgroundColor: THEME.bg }}>Voltar</button>
      <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-full text-white font-bold shadow-lg transition-transform hover:scale-[1.02]" style={{ backgroundColor: THEME.primary }}>
        Fotos & História <ArrowRight size={18} className="inline ml-2" />
      </button>
    </div>
  </div>
));

const DonateStep3 = React.memo(({ data, setData, setStep, handlePublish, isSubmitting, THEME }: any) => {
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const error = (!data.historia || data.fotos.length === 0) ? 'Adicione fotos e uma história' : '';
  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 3 - data.fotos.length);
    setData((d: any) => ({ ...d, fotos: [...d.fotos, ...files].slice(0, 3) }));
  };
  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div>
         <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-50">Fotos Estilo Instagram (Máx 3) *</label>
         <div className="grid grid-cols-3 gap-3">
          {data.fotos.map((file: any, idx: number) => (
            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden shadow-inner">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setData((d: any) => ({ ...d, fotos: d.fotos.filter((_: any, i: any) => i !== idx) }))} className="absolute top-1 right-1 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white"><X size={12} /></button>
            </div>
          ))}
          {data.fotos.length < 3 && (
            <button 
              onClick={() => {
                const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                if (isMobile) {
                  setShowSourceMenu(true);
                } else {
                  galleryInputRef.current?.click();
                }
              }} 
              className="aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1" 
              style={{ borderColor: `${THEME.primary}40` }}
            >
              <Camera size={20} style={{ color: THEME.primary }} />
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Adicionar</span>
            </button>
          )}

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
                      <div className="w-12 h-12 rounded-full bg-[#CC5833] text-white flex items-center justify-center">
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
      </div>
      <Field label="Conheça a Minha História *">
        <textarea value={data.historia} onChange={e => setData((d: any) => ({ ...d, historia: cap(e.target.value) }))} rows={4} placeholder="Pense como se o animal falasse. 'Oi! Eu sou a Mel, sou muito dócil...'" className="w-full p-4 rounded-2xl outline-none text-sm font-medium resize-none shadow-inner" style={{ backgroundColor: THEME.bg }} maxLength={400} />
        <p className="text-right text-[10px] opacity-40 font-mono mt-1">{data.historia.length}/400</p>
      </Field>
      <div className="flex gap-3">
        <button onClick={() => setStep(1)} className="px-6 py-4 rounded-full font-bold text-sm" style={{ backgroundColor: THEME.bg }}>Voltar</button>
        <button onClick={() => !error && handlePublish()} className="flex-1 py-4 rounded-full text-white font-bold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2" style={{ backgroundColor: THEME.primary }} disabled={!!error || isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <>Publicar Perfil <Heart fill="white" size={16} /></>}
        </button>
      </div>
    </div>
  );
});

const DonateStep4 = React.memo(({ data, onClose, THEME }: any) => (
  <div className="text-center py-6 animate-in zoom-in-95 duration-500">
    <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-green-100 text-green-600">
      <Heart fill="currentColor" size={40} />
    </div>
    <h3 className="text-3xl font-black mb-2 text-[#2E4036]">Perfil Criado!</h3>
    <p className="opacity-60 mb-8 max-w-sm mx-auto text-sm">
      O perfil <strong>{data.nome}</strong> está no ar! Já avisamos os adotantes que procuravam um amigo assim pelo radar.
    </p>
    <button onClick={onClose} className="w-full py-4 rounded-full text-white font-bold text-lg" style={{ backgroundColor: THEME.accent }}>
      Voltar à Tela Inicial
    </button>
  </div>
));

// ==========================================
// FLUXO: DOAR (CADASTRAR PET)
// ==========================================
function FlowDonate({ setFlow, onClose }: { setFlow: (f: FlowType) => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<DonateFormData>({
    nome: '', especie: '', porte: '', idade: '', raca: '',
    castrado: false, vacinado: false, especial: false,
    temperamento: [], historia: '', fotos: []
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      const { fotos, ...rest } = data;
      await PetService.create({
        owner_id: 'donor-id-mock',
        type: 'adopt',
        name: rest.nome,
        breed: rest.raca,
        species: rest.especie as any,
        description: rest.historia,
        location: { lat: 0, lng: 0, address: 'Doador' },
        status: 'active'
      }, fotos);
      setStep(3);
    } catch (err) {
      alert('Erro ao publicar perfil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTemp = (t: string) => {
    setData(d => ({
      ...d,
      temperamento: d.temperamento.includes(t) ? d.temperamento.filter(x => x !== t) : [...d.temperamento, t]
    }));
  };

  return (
    <>
      {step < 3 && <StepBar step={step} total={3} color={THEME.primary} />}
      {step === 0 && <DonateStep1 data={data} setData={setData} setStep={setStep} THEME={THEME} />}
      {step === 1 && <DonateStep2 data={data} setData={setData} setStep={setStep} toggleTemp={toggleTemp} THEME={THEME} />}
      {step === 2 && <DonateStep3 data={data} setData={setData} setStep={setStep} handlePublish={handlePublish} isSubmitting={isSubmitting} inputRef={inputRef} THEME={THEME} />}
      {step === 3 && <DonateStep4 data={data} onClose={onClose} THEME={THEME} />}
    </>
  );
}


const AdoptStep1 = React.memo(({ data, setData, setStep, THEME }: any) => (
  <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
    <div className="p-5 rounded-2xl mb-2 flex items-start gap-4" style={{ backgroundColor: `${THEME.primary}15` }}>
        <Sparkles className="text-[#CC5833] flex-shrink-0 mt-1" size={24} />
        <div>
          <p className="font-black text-[#CC5833] mb-1">Bem-vindo ao Radar Ativo</p>
          <p className="text-xs text-[#2E4036]/80 leading-relaxed">Em vez de ficar rolando o feed infinitamente, conte para nós como é o seu amigo ideal. Quando alguém for doar um pet assim, você é notificado imediatamente no celular!</p>
        </div>
    </div>
    <Field label="Espécie Desejada">
      <div className="flex gap-3">
         <button onClick={() => setData((d: any) => ({ ...d, especie: 'cao' }))} className={`flex-1 py-4 border-2 rounded-2xl font-bold transition-all ${data.especie === 'cao' ? 'border-[#CC5833] bg-[#CC5833]/10 text-[#CC5833]' : 'border-transparent bg-[#F2F0E9] opacity-60'}`}>🐶 Cão</button>
         <button onClick={() => setData((d: any) => ({ ...d, especie: 'gato' }))} className={`flex-1 py-4 border-2 rounded-2xl font-bold transition-all ${data.especie === 'gato' ? 'border-[#CC5833] bg-[#CC5833]/10 text-[#CC5833]' : 'border-transparent bg-[#F2F0E9] opacity-60'}`}>🐱 Gato</button>
      </div>
    </Field>
    <button onClick={() => data.especie && setStep(1)} className="w-full py-4 mt-6 rounded-full text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:grayscale disabled:scale-100" style={{ backgroundColor: THEME.primary }} disabled={!data.especie}>
      Configurar Filtros
    </button>
  </div>
));

const AdoptStep2 = React.memo(({ data, setData, setStep, handleRadar, isSubmitting, THEME }: any) => {
  const togglePorte = (p: string) => setData((d: any) => ({ ...d, porte: d.porte.includes(p) ? d.porte.filter((x: any) => x !== p) : [...d.porte, p] }));
  
  const OPCOES_PORTE = data.especie === 'cao' ? PORTES : ['Filhote', 'Adulto', 'Sênior'];
  const LABEL_PORTE = data.especie === 'cao' ? 'Porte' : 'Idade/Fase';

  return (
    <div className="flex flex-col min-h-[400px]">
      <div className="space-y-6 flex-1">
        <Field label={`${LABEL_PORTE} (Pode marcar vários)`}>
          <div className="flex gap-2">
            {OPCOES_PORTE.map(p => (
              <button key={p} onClick={() => togglePorte(p)} className="flex-1 py-3 rounded-xl font-bold text-sm transition-all" style={{ backgroundColor: data.porte.includes(p) ? THEME.primary : THEME.bg, color: data.porte.includes(p) ? 'white' : 'inherit' }}>{p}</button>
            ))}
          </div>
        </Field>
        <Field label="Raças Específicas?">
          <BreedSelector 
            especie={data.especie} 
            value={data.racas} 
            onChange={(val) => setData((d: any) => ({ ...d, racas: val }))} 
            themeColor={THEME.primary}
          />
        </Field>
        <Field label="Abertura">
          <label className="flex items-center gap-3 p-4 rounded-2xl bg-[#CC5833]/5 cursor-pointer">
              <input type="checkbox" className="w-5 h-5 accent-[#CC5833]" checked={data.aceitaSRD} onChange={e => setData((d: any) => ({ ...d, aceitaSRD: e.target.checked }))} />
              <div>
                <p className="text-sm font-bold text-[#CC5833]">Eu aceito Vira-Lata (SRD)</p>
                <p className="text-[10px] opacity-60">Recomendado! Aumenta suas chances.</p>
              </div>
          </label>
        </Field>
      </div>

      <div className="flex gap-3 mt-8">
        <button onClick={() => setStep(0)} className="px-6 py-4 rounded-full font-bold text-sm bg-gray-100">Voltar</button>
        <button onClick={handleRadar} className="flex-1 py-4 rounded-full text-white font-bold shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95" style={{ backgroundColor: THEME.primary }} disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Ligar Radar'}
        </button>
      </div>
    </div>
  );
});

const AdoptStep3 = React.memo(({ onClose, THEME }: any) => (
  <div className="text-center py-6 animate-in zoom-in-95 duration-500">
    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse" style={{ backgroundColor: `${THEME.primary}20` }}>
      <Search className="text-[#CC5833]" size={40} />
    </div>
    <h3 className="text-3xl font-black mb-2 text-[#CC5833]">Radar Ativado!</h3>
    <p className="opacity-60 mb-8 max-w-sm mx-auto text-sm leading-relaxed">
      Você preencheu seus desejos na fila. Fique de olho no seu celular. Quando alguém quiser doar um peludinho como o que você procura, nós te avisaremos por e-mail e push notification!
    </p>
    <button onClick={onClose} className="w-full py-4 rounded-full text-white font-bold text-lg" style={{ backgroundColor: THEME.accent }}>
      Voltar à Tela Inicial
    </button>
  </div>
));

// ==========================================
// FLUXO: ADOTAR (RADAR / FILA DE ESPERA)
// ==========================================
function FlowAdopt({ setFlow, onClose }: { setFlow: (f: FlowType) => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<AdoptFormData>({ especie: '', porte: [], racas: '', aceitaSRD: true, apartamento: false });

  const handleRadar = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      setStep(2);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {step < 2 && <StepBar step={step} total={2} color={THEME.primary} />}
      {step === 0 && <AdoptStep1 data={data} setData={setData} setStep={setStep} THEME={THEME} />}
      {step === 1 && <AdoptStep2 data={data} setData={setData} setStep={setStep} handleRadar={handleRadar} isSubmitting={isSubmitting} THEME={THEME} />}
      {step === 2 && <AdoptStep3 onClose={onClose} THEME={THEME} />}
    </>
  );
}

// ==========================================
// MODAL PRINCIPAL ROOT
// ==========================================
export function AdoptPetModal({ isOpen, onClose }: AdoptModalProps) {
  const [flow, setFlow] = useState<FlowType>('none');

  const handleClose = () => {
    onClose();
    setTimeout(() => setFlow('none'), 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4 py-8 overflow-hidden">
      <div className="absolute inset-0 bg-[#2E4036]/60 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-[2.5rem] shadow-2xl flex flex-col" style={{ animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        
        {/* Header Base */}
        <div className="px-8 pt-6 pb-4 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-black/5">
           <div className="flex items-center gap-2">
             {flow !== 'none' && (
                <button onClick={() => setFlow('none')} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors mr-2">
                  <ArrowLeft size={16} />
                </button>
             )}
             <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#CC5833] text-white"><Heart size={14} fill="currentColor" /></div>
             <span className="font-black text-sm text-[#2E4036]">Adotar é amar</span>
           </div>
           <button onClick={handleClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors">
             <X size={16} />
           </button>
        </div>

        {/* Content */}
        <div className="p-8 pt-4 flex-1">
          {flow === 'none' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 py-4">
               <div>
                  <h2 className="text-3xl font-black tracking-tight text-[#2E4036] mb-2">Qual sua missão hoje?</h2>
                  <p className="text-sm opacity-60">Conectando lares cheios de amor.</p>
               </div>
               <div className="space-y-4">
                  <button onClick={() => setFlow('donate')} className="w-full p-6 bg-[#F2F0E9] hover:bg-[#E8E4DD] rounded-3xl flex items-center justify-between group transition-colors">
                     <div className="text-left">
                        <p className="font-bold text-lg text-[#2E4036] mb-1">Quero Doar um Pet</p>
                        <p className="text-xs opacity-60">Criar um perfil estilo instagram para doação responsável.</p>
                     </div>
                     <ArrowRight className="text-[#CC5833] transform group-hover:translate-x-2 transition-transform" />
                  </button>
                  <button onClick={() => setFlow('adopt')} className="w-full p-6 bg-[#CC5833]/10 hover:bg-[#CC5833]/20 rounded-3xl flex items-center justify-between group transition-colors border border-[#CC5833]/20">
                     <div className="text-left">
                        <p className="font-bold text-lg text-[#CC5833] mb-1">Quero Adotar</p>
                        <p className="text-xs text-[#CC5833]/70">Ligar o radar para vagas e entrar na Fila de Espera.</p>
                     </div>
                     <Search className="text-[#CC5833] transform group-hover:scale-110 transition-transform" />
                  </button>
               </div>
            </div>
          )}

          {flow === 'donate' && <FlowDonate setFlow={setFlow} onClose={handleClose} />}
          {flow === 'adopt' && <FlowAdopt setFlow={setFlow} onClose={handleClose} />}
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
    </div>
  );
}
