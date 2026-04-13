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
  // Etapa 1
  nome: string;
  especie: 'cao' | 'gato' | 'outro' | '';
  raca: string;
  idade: string;
  sexo: 'macho' | 'femea' | 'nao_sei' | '';
  cores: string[];
  descEmocional: string;
  // Etapa 2
  fotos: File[];
  // Etapa 3
  localizacaoTipo: 'gps' | 'manual';
  enderecoManual: string;
  gpsLat: number | null;
  gpsLng: number | null;
  gpsEndereco: string;
}

interface LostPetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CORES_OPCOES = ['Preto', 'Branco', 'Marrom', 'Amarelo', 'Caramelo', 'Cinza', 'Malhado', 'Ruivo'];
const THEME = { primary: '#2E4036', accent: '#CC5833', bg: '#F2F0E9' };

const cap = (s: string) => {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
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

// --- ETAPA 1: DADOS DO PET ---
function Step1Base({ data, setData, onNext }: {
  data: FormData;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!data.nome.trim()) e.nome = 'Nome é obrigatório';
    if (!data.especie) e.especie = 'Selecione a espécie';
    if (!data.sexo) e.sexo = 'Selecione o sexo';
    if (data.cores.length === 0) e.cores = 'Selecione pelo menos uma cor';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNext = () => {
    if (validate()) onNext();
  };

  const toggleCor = (cor: string) => {
    setData(d => ({
      ...d,
      cores: d.cores.includes(cor) ? d.cores.filter(c => c !== cor) : [...d.cores, cor]
    }));
  };

  return (
    <div className="space-y-5">
      {/* Nome */}
      <Field label="Nome do Pet" error={errors.nome}>
        <input
          value={data.nome}
          onChange={e => setData(d => ({ ...d, nome: cap(e.target.value) }))}
          placeholder="Ex: Tobias, Luna, Milo..."
          className={`w-full p-4 rounded-2xl outline-none text-sm font-medium transition-all ${errors.nome ? 'ring-2 ring-[#CC5833]/50' : 'focus:ring-2 focus:ring-[#2E4036]/30'}`}
          style={{ backgroundColor: THEME.bg }}
        />
      </Field>

      {/* Espécie */}
      <Field label="Espécie" error={errors.especie}>
        <div className="flex gap-3">
          {[{ v: 'cao', l: '🐶 Cachorro' }, { v: 'gato', l: '🐱 Gato' }, { v: 'outro', l: '🐾 Outro' }].map(({ v, l }) => (
            <button
              key={v}
              type="button"
              onClick={() => setData(d => ({ ...d, especie: v as FormData['especie'] }))}
              className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all duration-200"
              style={{
                backgroundColor: data.especie === v ? THEME.primary : THEME.bg,
                color: data.especie === v ? 'white' : '#1A1A1A',
              }}
            >
              {l}
            </button>
          ))}
        </div>
      </Field>

      {/* Raça */}
      <Field label="Raça (opcional)" error={errors.raca}>
        <BreedSelector 
          especie={data.especie} 
          value={data.raca} 
          onChange={(val) => setData(d => ({ ...d, raca: val }))} 
          themeColor={THEME.primary}
        />
      </Field>

      {/* Idade + Sexo */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Idade aproximada">
          <select
            value={data.idade}
            onChange={e => setData(d => ({ ...d, idade: e.target.value }))}
            className="w-full p-4 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-[#2E4036]/30 transition-all appearance-none"
            style={{ backgroundColor: THEME.bg }}
          >
            <option value="">Selecione</option>
            <option value="filhote">Filhote (0-1 ano)</option>
            <option value="jovem">Jovem (1-3 anos)</option>
            <option value="adulto">Adulto (3-8 anos)</option>
            <option value="idoso">Idoso (8+ anos)</option>
          </select>
        </Field>

        <Field label="Sexo" error={errors.sexo}>
          <select
            value={data.sexo}
            onChange={e => setData(d => ({ ...d, sexo: e.target.value as FormData['sexo'] }))}
            className="w-full p-4 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-[#2E4036]/30 transition-all appearance-none"
            style={{ backgroundColor: THEME.bg }}
          >
            <option value="">Selecione</option>
            <option value="macho">Macho</option>
            <option value="femea">Fêmea</option>
            <option value="nao_sei">Não sei</option>
          </select>
        </Field>
      </div>

      {/* Cores */}
      <Field label="Cores do pelo" error={errors.cores}>
        <div className="flex flex-wrap gap-2">
          {CORES_OPCOES.map(cor => (
            <button
              key={cor}
              type="button"
              onClick={() => toggleCor(cor)}
              className="px-4 py-2 rounded-full text-xs font-bold transition-all duration-200"
              style={{
                backgroundColor: data.cores.includes(cor) ? THEME.primary : THEME.bg,
                color: data.cores.includes(cor) ? 'white' : '#1A1A1A',
              }}
            >
              {cor}
            </button>
          ))}
        </div>
      </Field>

      {/* Botão */}
      <button
        onClick={handleNext}
        className="w-full py-4 rounded-full text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
        style={{ backgroundColor: THEME.accent }}
      >
        Próximo: Fotos <ArrowRight size={18} />
      </button>
    </div>
  );
}

const Step1 = React.memo(Step1Base);

// --- ETAPA 2: FOTOS + CAMPO EMOCIONAL ---
function Step2Base({ data, setData, onNext, onBack }: {
  data: FormData;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSourceMenu, setShowSourceMenu] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const validate = () => {
    const e: Record<string, string> = {};
    if (data.fotos.length === 0) e.fotos = 'Adicione pelo menos 1 foto';
    if (!data.descEmocional.trim()) e.descEmocional = 'Este campo nos ajuda muito — conte sobre ele';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 6 - data.fotos.length);
    setData(d => ({ ...d, fotos: [...d.fotos, ...files].slice(0, 6) }));
  };

  const removePhoto = (idx: number) => {
    setData(d => ({ ...d, fotos: d.fotos.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="space-y-6">
      {/* Aviso de importância da foto */}
      <div className="p-4 rounded-2xl border-l-4 text-sm" style={{ backgroundColor: THEME.bg, borderColor: THEME.accent }}>
        <p className="font-bold mb-1" style={{ color: THEME.accent }}>📸 Fotos são essenciais!</p>
        <p className="opacity-60 text-xs leading-relaxed">
          Quanto mais fotos melhor. Nosso sistema de IA vai cruzar as suas fotos com as de quem encontrar um pet parecido. Adicione até 6 fotos de ângulos diferentes.
        </p>
      </div>

      {/* Upload */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-50">
          Fotos do pet {data.fotos.length > 0 && <span style={{ color: THEME.primary }}>({data.fotos.length}/6)</span>}
        </label>
        <div className="grid grid-cols-3 gap-3">
          {data.fotos.map((file, idx) => (
            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden">
              <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors"
              >
                <X size={12} />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-bold">Principal</span>
              )}
            </div>
          ))}
          {data.fotos.length < 6 && (
            <div className="relative">
              <button
                onClick={() => {
                  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
                  if (isMobile) {
                    setShowSourceMenu(true);
                  } else {
                    galleryInputRef.current?.click();
                  }
                }}
                className="w-full aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all hover:scale-105"
                style={{ borderColor: errors.fotos ? '#CC5833' : `${THEME.primary}40` }}
              >
                <Camera size={22} style={{ color: THEME.primary }} className="opacity-50" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Adicionar</span>
              </button>
            </div>
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
                    <div className="w-12 h-12 rounded-full bg-[#2E4036] text-white flex items-center justify-center">
                      <Camera size={24} />
                    </div>
                    <span className="text-sm font-bold">Tirar Foto</span>
                  </button>
                  <button 
                    onClick={() => { galleryInputRef.current?.click(); setShowSourceMenu(false); }}
                    className="flex flex-col items-center gap-4 p-6 rounded-3xl bg-[#F2F0E9] transition-all active:scale-95"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#CC5833] text-white flex items-center justify-center">
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
        {errors.fotos && <p className="text-xs text-[#CC5833] mt-1 flex items-center gap-1"><AlertCircle size={12} />{errors.fotos}</p>}
      </div>

      {/* Campo emocional */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest mb-1.5 opacity-50">
          O que ele significa pra você? <PenLine size={12} className="inline" />
        </label>
        <textarea
          value={data.descEmocional}
          onChange={e => setData(d => ({ ...d, descEmocional: cap(e.target.value) }))}
          rows={4}
          placeholder="Ele é como um filho e dorme comigo todos os dias. Desapareceu durante o passeio e estou desesperado..."
          className="w-full p-4 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-[#2E4036]/30 transition-all resize-none"
          style={{ backgroundColor: THEME.bg }}
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          {errors.descEmocional && <p className="text-xs text-[#CC5833] flex items-center gap-1"><AlertCircle size={12} />{errors.descEmocional}</p>}
          <span className="text-xs opacity-30 ml-auto">{data.descEmocional.length}/500</span>
        </div>
        <p className="text-[11px] opacity-40 mt-1 italic leading-relaxed">
          "Textos sinceros ajudam as pessoas nas ruas a sentirem a urgência." — equipe Patas em Casa
        </p>
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-4 rounded-full font-bold text-sm transition-all hover:opacity-70"
          style={{ backgroundColor: THEME.bg }}
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <button
          onClick={() => { if (validate()) onNext(); }}
          className="flex-1 py-4 rounded-full text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
          style={{ backgroundColor: THEME.accent }}
        >
          Próximo: Localização <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

const Step2 = React.memo(Step2Base);

// --- ETAPA 3: LOCALIZAÇÃO ---
function Step3Base({ data, setData, onNext, onBack }: {
  data: FormData;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
  onNext: () => void;
  onBack: () => void;
}) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');

  const buscarGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Seu navegador não suporta geolocalização.');
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        let endereco = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const json = await res.json();
          endereco = json.display_name || endereco;
        } catch {
          // usa coordenadas brutas se API falhar
        }
        setData(d => ({ ...d, gpsLat: latitude, gpsLng: longitude, gpsEndereco: endereco }));
        setGpsLoading(false);
      },
      (err) => {
        setGpsError('Não foi possível obter sua localização. Verifique as permissões.');
        setGpsLoading(false);
        console.error(err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (data.localizacaoTipo === 'gps' && !data.gpsLat) {
      e.loc = 'Clique em "Usar minha localização" para capturar o GPS';
    }
    if (data.localizacaoTipo === 'manual' && !data.enderecoManual.trim()) {
      e.loc = 'Digite o endereço ou ponto de referência';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm opacity-60 leading-relaxed mb-4">
          Indique o local onde seu pet foi visto pela última vez. Quanto mais preciso, maior a chance de encontrá-lo.
        </p>

        {/* Abas */}
        <div className="flex p-1 rounded-2xl mb-5" style={{ backgroundColor: THEME.bg }}>
          <button
            onClick={() => setData(d => ({ ...d, localizacaoTipo: 'gps' }))}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300"
            style={{
              backgroundColor: data.localizacaoTipo === 'gps' ? 'white' : 'transparent',
              color: data.localizacaoTipo === 'gps' ? THEME.primary : '#888',
              boxShadow: data.localizacaoTipo === 'gps' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Navigation size={15} /> GPS Automático
          </button>
          <button
            onClick={() => setData(d => ({ ...d, localizacaoTipo: 'manual' }))}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300"
            style={{
              backgroundColor: data.localizacaoTipo === 'manual' ? 'white' : 'transparent',
              color: data.localizacaoTipo === 'manual' ? THEME.primary : '#888',
              boxShadow: data.localizacaoTipo === 'manual' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <PenLine size={15} /> Digitar Endereço
          </button>
        </div>

        {/* Conteúdo da aba GPS */}
        {data.localizacaoTipo === 'gps' && (
          <div className="space-y-3">
            {!data.gpsLat ? (
              <button
                onClick={buscarGPS}
                disabled={gpsLoading}
                className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-3 transition-transform hover:scale-[1.01] active:scale-95 disabled:opacity-60"
                style={{ backgroundColor: THEME.primary }}
              >
                {gpsLoading ? <Loader2 size={20} className="animate-spin" /> : <Navigation size={20} />}
                {gpsLoading ? 'Buscando sua localização...' : 'Usar minha localização atual'}
              </button>
            ) : (
              <div className="p-4 rounded-2xl border-2 border-green-500/30 bg-green-50">
                <div className="flex items-start gap-3">
                  <CheckCircle2 size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-green-700 mb-1">Localização capturada ✓</p>
                    <p className="text-xs text-green-600/80 leading-relaxed">{data.gpsEndereco}</p>
                  </div>
                </div>
                <button
                  onClick={() => setData(d => ({ ...d, gpsLat: null, gpsLng: null, gpsEndereco: '' }))}
                  className="mt-3 text-xs font-bold opacity-40 hover:opacity-80 transition-opacity"
                >
                  Recapturar
                </button>
              </div>
            )}
            {gpsError && (
              <p className="text-xs text-[#CC5833] flex items-center gap-1 p-3 rounded-xl" style={{ backgroundColor: '#FEF2F0' }}>
                <AlertCircle size={14} className="flex-shrink-0" />{gpsError}
              </p>
            )}
          </div>
        )}

        {/* Conteúdo da aba Manual */}
        {data.localizacaoTipo === 'manual' && (
          <div className="space-y-3">
            <div className="relative">
              <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
              <input
                value={data.enderecoManual}
                onChange={e => setData(d => ({ ...d, enderecoManual: cap(e.target.value) }))}
                placeholder="Ex: Rua das Flores, 120 — Perto do Parque Ibirapuera"
                className="w-full pl-11 pr-4 py-4 rounded-2xl outline-none text-sm font-medium focus:ring-2 focus:ring-[#2E4036]/30 transition-all"
                style={{ backgroundColor: THEME.bg }}
              />
            </div>
          </div>
        )}

        {errors.loc && (
          <p className="text-xs text-[#CC5833] mt-2 flex items-center gap-1">
            <AlertCircle size={12} />{errors.loc}
          </p>
        )}
      </div>

      {/* Botões */}
      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-6 py-4 rounded-full font-bold text-sm transition-all hover:opacity-70"
          style={{ backgroundColor: THEME.bg }}
        >
          <ArrowLeft size={16} /> Voltar
        </button>
        <button
          onClick={() => { if (validate()) onNext(); }}
          className="flex-1 py-4 rounded-full text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
          style={{ backgroundColor: THEME.accent }}
        >
          Ativar Alerta de Busca <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

const Step3 = React.memo(Step3Base);

// --- ETAPA 4: SUCESSO + COMPARTILHAR ---
function Step4({ data, onClose }: { data: FormData; onClose: () => void }) {
  const shareUrl = `https://patasemcasa.com/busca/${data.nome.toLowerCase().replace(/\s/g, '-')}-${Date.now()}`;
  const shareMsg = encodeURIComponent(
    `🐾 AJUDA! MEU PET ${data.nome.toUpperCase()} DESAPARECEU!\n\n` +
    `${data.descEmocional.slice(0, 120)}...\n\n📍 Última localização: ${data.gpsEndereco || data.enderecoManual}\n\n🔗 ${shareUrl}\n\nPor favor compartilhe! ❤️`
  );

  const links = [
    { label: 'WhatsApp', color: '#25D366', url: `https://wa.me/?text=${shareMsg}`, icon: '📲' },
    { label: 'Facebook', color: '#1877F2', url: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, icon: '👍' },
    { label: 'Telegram', color: '#229ED9', url: `https://t.me/share/url?url=${shareUrl}&text=${shareMsg}`, icon: '✈️' },
    { label: 'Copiar Link', color: '#2E4036', url: null, icon: '🔗' },
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    alert('Link copiado! Cole nos seus grupos e redes sociais.');
  };

  return (
    <div className="text-center space-y-6">
      {/* Animação de sucesso */}
      <div className="py-4">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl"
          style={{ backgroundColor: `${THEME.primary}15` }}
        >
          🐾
        </div>
        <h3 className="text-2xl font-black tracking-tight mb-2" style={{ color: THEME.primary }}>
          Alerta ativado!
        </h3>
        <p className="text-base font-bold opacity-60 mb-1">
          O alerta foi espalhado no nosso radar local.
        </p>
        <p className="text-sm opacity-40 leading-relaxed max-w-xs mx-auto">
          Compartilhe o link abaixo nos seus grupos. Fique forte, estamos juntos. ❤️
        </p>
      </div>

      {/* Alerta Resumo */}
      <div className="p-4 rounded-2xl text-left space-y-1" style={{ backgroundColor: THEME.bg }}>
        <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-2">Resumo do alerta</p>
        <p className="text-sm font-bold">{data.nome} — {data.especie === 'cao' ? '🐶 Cachorro' : data.especie === 'gato' ? '🐱 Gato' : '🐾 Outro'}</p>
        {data.fotos[0] && (
          <img src={URL.createObjectURL(data.fotos[0])} alt="" className="w-full h-28 object-cover rounded-xl mt-2" />
        )}
        <p className="text-xs opacity-50 flex items-center gap-1 pt-1">
          <MapPin size={11} /> {data.gpsEndereco || data.enderecoManual}
        </p>
      </div>

      {/* Link copiável */}
      <div className="flex items-center gap-2 p-3 rounded-2xl border" style={{ backgroundColor: THEME.bg, borderColor: `${THEME.primary}20` }}>
        <span className="text-xs font-mono opacity-50 truncate flex-1">{shareUrl}</span>
        <button
          onClick={copyLink}
          className="text-xs font-bold px-3 py-1 rounded-full text-white flex-shrink-0"
          style={{ backgroundColor: THEME.primary }}
        >
          Copiar
        </button>
      </div>

      {/* Botões de compartilhamento */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest opacity-40 mb-3 flex items-center justify-center gap-1">
          <Share2 size={12} /> Compartilhar agora
        </p>
        <div className="grid grid-cols-2 gap-3">
          {links.map(({ label, color, url, icon }) => (
            <button
              key={label}
              onClick={url ? () => window.open(url, '_blank') : copyLink}
              className="py-3 px-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-transform hover:scale-105 active:scale-95 shadow-lg"
              style={{ backgroundColor: color, boxShadow: `0 4px 20px ${color}40` }}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 rounded-full font-bold text-sm opacity-40 hover:opacity-80 transition-opacity"
      >
        Fechar e aguardar notificações
      </button>
    </div>
  );
}

// --- CONSTANTES ---
const STEP_TITLES = [
  'Fale sobre o seu pet',
  'Fotos e descrição',
  'Última localização',
  'Alerta ativado! 🎉',
];

// --- COMPONENTE PRINCIPAL ---
export function LostPetModal({ isOpen, onClose }: LostPetModalProps) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<FormData>({
    nome: '', especie: '', raca: '', idade: '', sexo: '', cores: [], descEmocional: '',
    fotos: [],
    localizacaoTipo: 'gps', enderecoManual: '', gpsLat: null, gpsLng: null, gpsEndereco: '',
  });

  const handleNext = async () => {
    if (step === 2) {
      setIsSubmitting(true);
      try {
        await PetService.create({
          owner_id: 'user-id-mock',
          type: 'lost',
          name: data.nome,
          breed: data.raca,
          species: data.especie as any,
          description: data.descEmocional,
          images: [],
          location: {
            lat: data.gpsLat || 0,
            lng: data.gpsLng || 0,
            address: data.gpsEndereco || data.enderecoManual
          },
          status: 'active'
        });
        setStep(3);
      } catch (err) {
        alert('Erro ao salvar no banco.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep(step + 1);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(0);
      setData({ nome: '', especie: '', raca: '', idade: '', sexo: '', cores: [], descEmocional: '', fotos: [], localizacaoTipo: 'gps', enderecoManual: '', gpsLat: null, gpsLng: null, gpsEndereco: '' });
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 py-6 overflow-y-auto">
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(46,64,54,0.5)', backdropFilter: 'blur(8px)' }} onClick={step < 3 ? handleClose : undefined} />
      <div className="relative w-full max-w-lg my-auto rounded-[2.5rem] shadow-2xl overflow-hidden" style={{ backgroundColor: 'white', animation: 'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
        <div className="px-8 pt-8 pb-6" style={{ backgroundColor: `${THEME.primary}08` }}>
          {step < 3 && (
            <button onClick={handleClose} className="absolute top-6 right-6 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:opacity-70" style={{ backgroundColor: THEME.bg }}>
              <X size={18} style={{ color: THEME.primary }} />
            </button>
          )}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: THEME.accent }}>
              <span className="text-sm">🐾</span>
            </div>
            <span className="font-black tracking-tight text-sm" style={{ color: THEME.primary }}>Patas em Casa</span>
          </div>
          {step < 3 && <StepBar step={step} total={3} />}
          <h2 className="text-2xl font-black tracking-tight" style={{ color: THEME.primary }}>{STEP_TITLES[step]}</h2>
          {step === 0 && <p className="text-sm mt-1 opacity-50 leading-relaxed">Para trazermos ele mais rápido pra casa, preencha tudo com carinho.</p>}
        </div>
        <div className="px-8 py-6">
          {step === 0 && <Step1 data={data} setData={setData} onNext={handleNext} />}
          {step === 1 && <Step2 data={data} setData={setData} onNext={handleNext} onBack={() => setStep(0)} />}
          {step === 2 && (
            <div className="relative">
              <Step3 data={data} setData={setData} onNext={handleNext} onBack={() => setStep(1)} />
              {isSubmitting && (
                <div className="absolute inset-0 bg-white/80 rounded-3xl flex items-center justify-center z-20">
                  <div className="flex flex-col items-center gap-2"><Loader2 className="animate-spin text-[#CC5833]" size={32} /><span className="text-xs font-bold opacity-40">Publicando alerta...</span></div>
                </div>
              )}
            </div>
          )}
          {step === 3 && <Step4 data={data} onClose={handleClose} />}
        </div>
      </div>
      <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }`}</style>
    </div>
  );
}
