import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, User, ArrowRight, Heart, Loader2 } from "lucide-react";
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
    // Simulação de login por email
    setTimeout(() => {
      onLoginSuccess({ 
        full_name: "Usuário Exemplo", 
        email: loginEmail,
        points: 0
      });
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
    // Simulação de cadastro
    setTimeout(() => {
      onLoginSuccess({ 
        full_name: regName, 
        email: regEmail,
        avatar_url: regPhoto,
        points: 50 // Bônus de boas-vindas
      });
      setLoading(false);
    }, 2000);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const response: any = await AuthService.signInWithGoogle();
      const { data, error } = response;
      if (error) throw error;
      
      // Capturamos as informações do Google
      const userData = data.user;
      setRegName(userData.user_metadata.full_name);
      setRegEmail(userData.email);
      setRegPhoto(userData.user_metadata.avatar_url);
      
      // Levamos o usuário para "completar" o cadastro para ele revisar os dados
      setTab("completing");
    } catch (err) {
      console.error(err);
      alert("Erro no login social");
    } finally {
      setLoading(false);
    }
  };

  const handleFinishGoogle = () => {
    onLoginSuccess({
      full_name: regName,
      email: regEmail,
      avatar_url: regPhoto,
      points: 100 // Bônus Google
    });
  };

  const switchTab = (newTab: AuthTab) => {
    if (loading) return;
    setTab(newTab);
    setShowPassword(false);
    setShowConfirm(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            key="auth-overlay"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3 }}
            onClick={!loading ? onClose : undefined}
            className="fixed inset-0 z-[60] bg-slate/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            key="auth-modal"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[70] flex items-center justify-center px-4"
          >
            <div className="relative w-full max-w-md max-h-[90vh] bg-[#F2F0E9] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar">
              
              {/* Header decorativo */}
              <div className="relative bg-gradient-to-br from-[#CC5833]/10 to-[#CC5833]/5 px-8 pt-8 pb-6 border-b border-black/5">
                {!loading && (
                  <button
                    onClick={onClose}
                    className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 transition-colors"
                  >
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
                <p className="text-sm opacity-50 mt-1">
                  {tab === "login"
                    ? "Entre para ajudar e ser ajudado pela comunidade."
                    : tab === "register" 
                    ? "Junte-se a quem transforma o desespero em esperança."
                    : "Validamos suas informações do Google corretamente."}
                </p>
              </div>

              {/* Abas */}
              {tab !== "completing" && (
                <div className="flex mx-8 mt-6 mb-0 rounded-xl bg-black/5 p-1 gap-1">
                  <button
                    disabled={loading}
                    onClick={() => switchTab("login")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      tab === "login"
                        ? "bg-white text-[#2E4036] shadow-sm"
                        : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    Entrar
                  </button>
                  <button
                    disabled={loading}
                    onClick={() => switchTab("register")}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                      tab === "register"
                        ? "bg-white text-[#2E4036] shadow-sm"
                        : "opacity-40 hover:opacity-100"
                    }`}
                  >
                    Criar Conta
                  </button>
                </div>
              )}

              {/* Formulários */}
              <div className="px-8 py-6">
                <AnimatePresence mode="wait">
                  {tab === "login" ? (
                    <motion.form
                      key="login-form"
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 16 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleLoginSubmit}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold opacity-40 uppercase tracking-wider">E-mail</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                          <input
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            required
                            placeholder="seu@email.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC5833]/30 transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-semibold opacity-40 uppercase tracking-wider">Senha</label>
                          <button type="button" className="text-xs text-[#CC5833] hover:underline font-medium">Esqueci a senha</button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                          <input
                            type={showPassword ? "text" : "password"}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/50 border border-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC5833]/30 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-50"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-black/5 shadow-inner mt-2">
                        <div className="flex items-center h-5">
                          <input
                            id="consent-login"
                            type="checkbox"
                            checked={hasConsented}
                            onChange={(e) => setHasConsented(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[#CC5833] focus:ring-[#CC5833]"
                          />
                        </div>
                        <label htmlFor="consent-login" className="text-[10px] text-[#2E4036]/60 leading-relaxed cursor-pointer font-medium">
                          <span className="font-black text-[#2E4036] uppercase tracking-tighter">Compromisso Ético:</span> Autorizo o uso confidencial dos meus dados para fins exclusivos de proteção e reencontro animal conforme a <span className="text-[#CC5833] font-bold">Privacidade Jobs Standard</span>.
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-xl bg-[#2E4036] text-white font-bold flex items-center justify-center gap-2 hover:bg-[#1A261F] transition-all shadow-lg shadow-[#2E4036]/10 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar na conta"}
                        {!loading && <ArrowRight className="w-4 h-4" />}
                      </button>

                      <div className="relative my-2 py-4 flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-black/5"></div></div>
                        <span className="relative bg-[#F2F0E9] px-4 text-[10px] font-black uppercase tracking-widest text-[#2E4036]/30">ou quer apenas olhar?</span>
                      </div>

                      <button
                        type="button"
                        onClick={onGuestSuccess}
                        className="w-full py-3.5 rounded-xl border-2 border-dashed border-[#2E4036]/10 text-[11px] font-black uppercase tracking-widest text-[#2E4036] hover:bg-white transition-all flex items-center justify-center gap-2"
                      >
                        <User className="w-4 h-4" /> Continuar como Convidado
                      </button>

                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-black/5" />
                        <span className="text-[10px] opacity-30 font-bold uppercase tracking-widest">ou use as redes</span>
                        <div className="flex-1 h-px bg-black/5" />
                      </div>

                      <SocialButtons onGoogleClick={handleGoogleLogin} loading={loading} />
                    </motion.form>
                  ) : tab === "register" ? (
                    <motion.form
                      key="register-form"
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2 }}
                      onSubmit={handleRegisterSubmit}
                      className="flex flex-col gap-4"
                    >
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold opacity-40 uppercase tracking-wider">Nome completo</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                          <input
                            type="text"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            required
                            placeholder="Ex: João Silva"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC5833]/30 transition-all"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold opacity-40 uppercase tracking-wider">E-mail</label>
                        <div className="relative">
                          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 opacity-20" />
                          <input
                            type="email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            required
                            placeholder="seu@email.com"
                            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/50 border border-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC5833]/30 transition-all"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold opacity-40 uppercase tracking-wider">Senha</label>
                          <input
                            type="password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                            minLength={8}
                            className="w-full px-4 py-3 rounded-xl bg-white/50 border border-black/5 text-sm focus:outline-none focus:ring-2 focus:ring-[#CC5833]/30 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold opacity-40 uppercase tracking-wider">Repetir</label>
                          <input
                            type="password"
                            value={regConfirm}
                            onChange={(e) => setRegConfirm(e.target.value)}
                            required
                            placeholder="••••••••"
                            className={`w-full px-4 py-3 rounded-xl bg-white/50 border text-sm focus:outline-none focus:ring-2 transition-all ${
                              regConfirm && regPassword !== regConfirm ? "border-red-400 focus:ring-red-200" : "border-black/5 focus:ring-[#CC5833]/30"
                            }`}
                          />
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-4 bg-white rounded-2xl border border-black/5 shadow-inner mt-2">
                        <div className="flex items-center h-5">
                          <input
                            id="consent-reg"
                            type="checkbox"
                            checked={hasConsented}
                            onChange={(e) => setHasConsented(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-[#CC5833] focus:ring-[#CC5833]"
                          />
                        </div>
                        <label htmlFor="consent-reg" className="text-[10px] text-[#2E4036]/60 leading-relaxed cursor-pointer font-medium">
                          <span className="font-black text-[#2E4036] uppercase tracking-tighter">Compromisso Ético:</span> Autorizo o uso confidencial dos meus dados para proteger a comunidade conforme a <span className="text-[#CC5833] font-bold">Privacidade Jobs Standard</span>.
                        </label>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 bg-[#CC5833] text-white py-4 rounded-[2rem] text-sm font-bold hover:bg-[#b04a2a] shadow-xl mt-2 transition-all disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <>Criar minha conta <ArrowRight className="w-4 h-4" /></>}
                      </button>

                      <div className="flex items-center gap-3 my-1">
                        <div className="flex-1 h-px bg-black/5" />
                        <span className="text-[10px] opacity-30 font-bold uppercase tracking-widest">ou</span>
                        <div className="flex-1 h-px bg-black/5" />
                      </div>

                      <SocialButtons onGoogleClick={handleGoogleLogin} loading={loading} />
                    </motion.form>
                  ) : (
                    <motion.div
                      key="completing-form"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col gap-6 text-center"
                    >
                      <div className="relative w-24 h-24 mx-auto">
                        <img 
                          src={regPhoto || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"} 
                          className="w-full h-full rounded-[2rem] object-cover shadow-lg border-4 border-white"
                          alt="Perfil"
                        />
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#06D6A0] rounded-full flex items-center justify-center text-white border-2 border-white">
                          <Heart size={14} fill="white" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="text-left space-y-1">
                          <label className="text-[10px] font-black uppercase opacity-30 ml-4">Nome que aparecerá no sistema</label>
                          <input 
                            value={regName} 
                            onChange={e => setRegName(e.target.value)}
                            className="w-full px-6 py-4 rounded-2xl bg-white border border-black/5 font-bold text-[#2E4036] focus:ring-2 focus:ring-[#06D6A0]/20 outline-none"
                          />
                        </div>
                        <div className="text-left space-y-1">
                          <label className="text-[10px] font-black uppercase opacity-30 ml-4">Confirmar E-mail</label>
                          <input 
                            value={regEmail} 
                            readOnly
                            className="w-full px-6 py-4 rounded-2xl bg-black/5 border border-black/5 font-medium opacity-50 outline-none"
                          />
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#06D6A0]/10 text-[#2E4036] text-[11px] font-medium leading-relaxed">
                        Tudo certo! Capturamos sua foto e nome do Google. Você poderá alterá-los a qualquer momento no seu perfil.
                      </div>

                      <button
                        onClick={handleFinishGoogle}
                        className="w-full py-4 rounded-full bg-[#06D6A0] text-[#2E4036] font-black text-sm shadow-xl shadow-[#06D6A0]/20 hover:scale-[1.02] transition-transform"
                      >
                        Começar minha Jornada 🐾
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SocialButtons({ onGoogleClick, loading }: { onGoogleClick: () => void, loading: boolean }) {
  return (
    <div className="flex gap-3">
      <button
        type="button"
        disabled={loading}
        onClick={onGoogleClick}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-black/5 bg-white hover:bg-black/5 transition-colors text-xs font-bold text-[#2E4036] disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Google
      </button>

      <button
        type="button"
        disabled={loading}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-black/5 bg-white hover:bg-black/5 transition-colors text-xs font-bold text-[#2E4036] disabled:opacity-50"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
        Facebook
      </button>
    </div>
  );
}
