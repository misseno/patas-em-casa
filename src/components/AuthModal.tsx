import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, User, ArrowRight, Heart, Loader2, CheckCircle2 } from "lucide-react";
import { AuthService } from "../lib/AuthService";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
  onGuestSuccess: () => void;
}

type AuthTab = "login" | "register" | "completing";

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants: any = {
  hidden: { opacity: 0, scale: 0.94, y: 24 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.94, 
    y: 24, 
    transition: { duration: 0.25, ease: "easeIn" } 
  },
};

export function AuthModal({ isOpen, onClose, onLoginSuccess, onGuestSuccess }: AuthModalProps) {
  const [tab, setTab] = useState<AuthTab>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register/Complete form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [regPhoto, setRegPhoto] = useState<string | null>(null);
  const [hasConsented, setHasConsented] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsented) {
      alert("Por favor, autorize o uso confidencial dos dados para continuar.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess({ full_name: "Usuário Exemplo", email: loginEmail, points: 0 });
      setLoading(false);
    }, 1500);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConsented) {
      alert("Por favor, autorize o uso confidencial dos dados para criar sua conta.");
      return;
    }
    if (regPassword !== regConfirm) {
      alert("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      onLoginSuccess({ full_name: regName, email: regEmail, avatar_url: regPhoto, points: 50 });
      setLoading(false);
    }, 2000);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await AuthService.signInWithGoogle();
      if (error) throw error;
      // O Supabase redirecionará, o tratamento do retorno é feito pelo no useEffect do App.tsx
    } catch (err) {
      alert("Erro no login com Google");
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    try {
      const { error } = await AuthService.signInWithFacebook();
      if (error) throw error;
    } catch (err) {
      alert("Erro no login com Facebook");
      setLoading(false);
    }
  };

  const handleFinishSocial = () => {
    if (!hasConsented) {
      alert("Por favor, aceite o compromisso de ética e confidencialidade antes de começar.");
      return;
    }
    onLoginSuccess({ full_name: regName, email: regEmail, avatar_url: regPhoto, points: 100 });
  };

  const switchTab = (newTab: AuthTab) => {
    if (loading) return;
    setTab(newTab);
    setHasConsented(false); // Reset consent on tab change for safety
    if (newTab !== "completing") {
      setRegName("");
      setRegEmail("");
      setRegPhoto(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={overlayVariants}
            initial="hidden" animate="visible" exit="hidden"
            onClick={!loading ? onClose : undefined}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            variants={modalVariants}
            initial="hidden" animate="visible" exit="exit"
            className="fixed inset-0 z-[70] flex items-center justify-center px-4"
          >
            <div className="relative w-full max-w-md max-h-[90vh] bg-[#F2F0E9] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="relative bg-gradient-to-br from-[#CC5833]/10 to-[#CC5833]/5 px-8 pt-8 pb-6 border-b border-black/5">
                  {!loading && (
                    <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors">
                      <X className="w-4 h-4 opacity-40" />
                    </button>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="w-5 h-5 text-[#CC5833]" fill="currentColor" />
                    <span className="font-bold text-[#2E4036] tracking-tight">Patas em Casa</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#2E4036] tracking-tight">
                    {tab === "login" ? "Bem-vindo de volta 👋" : tab === "register" ? "Criar sua conta" : "Confirme seus dados"}
                  </h2>
                </div>

                {tab !== "completing" && (
                  <div className="flex mx-8 mt-6 mb-0 rounded-xl bg-black/5 p-1 gap-1">
                    {["login", "register"].map((t) => (
                      <button key={t} onClick={() => switchTab(t as AuthTab)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? "bg-white text-[#2E4036] shadow-sm" : "opacity-40"}`}>
                        {t === "login" ? "Entrar" : "Criar Conta"}
                      </button>
                    ))}
                  </div>
                )}

                <div className="px-8 py-6">
                  {tab === "login" && (
                    <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-semibold opacity-40 uppercase tracking-wider ml-2">E-mail</label>
                        <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" /><input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-black/5 text-sm outline-none" placeholder="seu@email.com" /></div>
                      </div>
                      <div className="flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-semibold opacity-40 uppercase tracking-wider ml-2">Senha</label>
                        <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" /><input type={showPassword ? "text" : "password"} value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-black/5 text-sm outline-none" placeholder="••••••••" /></div>
                      </div>
                      <PrivacyCheckbox checked={hasConsented} onChange={setHasConsented} />
                      <button type="submit" disabled={loading} className="w-full py-4 rounded-xl bg-[#2E4036] text-white font-bold shadow-lg disabled:opacity-50">Entrar na conta</button>
                      <button type="button" onClick={onGuestSuccess} className="w-full py-3.5 rounded-xl border-2 border-dashed border-[#2E4036]/10 text-[11px] font-black uppercase text-[#2E4036]">Continuar como Visitante</button>
                      <SocialButtons onGoogleClick={handleGoogleLogin} onFacebookClick={handleFacebookLogin} loading={loading} />
                    </form>
                  )}

                  {tab === "register" && (
                    <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                      <div className="flex flex-col gap-1.5 text-left"><label className="text-xs font-semibold opacity-40 ml-2">Nome</label><input value={regName} onChange={e => setRegName(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-white border border-black/5 text-sm outline-none" /></div>
                      <div className="flex flex-col gap-1.5 text-left"><label className="text-xs font-semibold opacity-40 ml-2">E-mail</label><input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required className="w-full px-4 py-3 rounded-xl bg-white border border-black/5 text-sm outline-none" /></div>
                      <div className="grid grid-cols-2 gap-3">
                        <input type="password" value={regPassword} onChange={e => setRegPassword(e.target.value)} required placeholder="Senha" minLength={8} className="px-4 py-3 rounded-xl bg-white border border-black/5 text-sm outline-none" />
                        <input type="password" value={regConfirm} onChange={e => setRegConfirm(e.target.value)} required placeholder="Repetir" className="px-4 py-3 rounded-xl bg-white border border-black/5 text-sm outline-none" />
                      </div>
                      <PrivacyCheckbox checked={hasConsented} onChange={setHasConsented} />
                      <button type="submit" disabled={loading} className="w-full py-4 rounded-[2rem] bg-[#CC5833] text-white font-bold shadow-xl disabled:opacity-50">Criar minha conta</button>
                      <SocialButtons onGoogleClick={handleGoogleLogin} onFacebookClick={handleFacebookLogin} loading={loading} />
                    </form>
                  )}

                  {tab === "completing" && (
                    <div className="flex flex-col gap-6 text-center">
                      <div className="relative w-24 h-24 mx-auto">
                        <img 
                          src={regPhoto || AuthService.getBeautifulAvatar(regName || regEmail)} 
                          className="w-full h-full rounded-[2rem] object-cover shadow-lg border-4 border-white" 
                          alt="Perfil" 
                        />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#06D6A0] rounded-full flex items-center justify-center text-white border-2 border-white"><Heart size={14} fill="white" /></div>
                      </div>
                      <div className="space-y-4">
                        <div className="text-left space-y-1">
                          <label className="text-[10px] font-black uppercase opacity-30 ml-4">Nome no sistema</label>
                          <input value={regName} onChange={e => setRegName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-white border border-black/5 font-bold outline-none" />
                        </div>
                        <PrivacyCheckbox checked={hasConsented} onChange={setHasConsented} />
                      </div>
                      <p className="text-[10px] text-[#2E4036]/40 leading-tight">
                        {regPhoto ? "Usando sua foto do perfil social" : "Criamos um avatar exclusivo para você"}
                      </p>
                      <button onClick={handleFinishSocial} className="w-full py-4 rounded-full bg-[#06D6A0] text-[#2E4036] font-black text-sm shadow-xl">Começar minha Jornada 🐾</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PrivacyCheckbox({ checked, onChange }: { checked: boolean, onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-black/5 shadow-inner">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-gray-300 text-[#CC5833]" />
      <p className="text-[10px] text-[#2E4036]/60 leading-relaxed text-left">
        <span className="font-black text-[#2E4036] uppercase tracking-tighter">Compromisso Ético:</span> Autorizo o uso confidencial dos meus dados para fins de proteção animal conforme a <span className="text-[#CC5833] font-bold">Privacidade Jobs Standard</span>.
      </p>
    </div>
  );
}

function SocialButtons({ onGoogleClick, onFacebookClick, loading }: { onGoogleClick: () => void, onFacebookClick: () => void, loading: boolean }) {
  return (
    <div className="flex gap-3 mt-2">
      <button type="button" disabled={loading} onClick={onGoogleClick} className="flex-1 py-3 rounded-xl border border-black/5 bg-white text-xs font-bold flex items-center justify-center gap-2">Google</button>
      <button type="button" disabled={loading} onClick={onFacebookClick} className="flex-1 py-3 rounded-xl border border-black/5 bg-white text-xs font-bold flex items-center justify-center gap-2">Facebook</button>
    </div>
  );
}
