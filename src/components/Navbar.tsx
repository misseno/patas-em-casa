import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { AuthModal } from "./AuthModal";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 rounded-full transition-all duration-500 w-[90%] max-w-2xl
          ${
            scrolled
              ? "bg-ivory/70 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate/5"
              : "bg-transparent text-slate"
          }`}
      >
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-peach-500" fill="currentColor" />
          <span className="font-bold text-lg tracking-tight">Patas em Casa</span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <a href="#about" className="hover:text-peach-500 transition-colors">Propósito</a>
          <a href="#heroes" className="hover:text-peach-500 transition-colors">Heróis</a>
        </div>

        <button
          id="btn-entrar"
          onClick={() => setAuthOpen(true)}
          className="magnetic-btn bg-slate text-ivory px-5 py-2 rounded-[2rem] text-sm font-medium hover:bg-slate/90 transition-colors"
        >
          Entrar
        </button>
      </motion.nav>

      <AuthModal 
        isOpen={authOpen} 
        onClose={() => setAuthOpen(false)} 
        onLoginSuccess={() => setAuthOpen(false)}
        onGuestSuccess={() => setAuthOpen(false)}
      />
    </>
  );
}
