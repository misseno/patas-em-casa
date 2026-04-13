import React from 'react';
import { Heart, X } from 'lucide-react';

interface GateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onGuest: () => void;
}

export function GateModal({ isOpen, onClose, onLogin, onGuest }: GateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
      {/* Overlay com blur */}
      <div className="absolute inset-0 bg-[#2E4036]/60 backdrop-blur-md" />

      {/* Modal */}
      <div 
        className="relative w-full max-w-[360px] bg-white rounded-[2.5rem] shadow-2xl p-10 text-center flex flex-col items-center animate-in zoom-in-95 duration-300"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 text-black/40 hover:text-black transition-colors"
        >
          <X size={18} />
        </button>

        <div className="w-16 h-16 rounded-full bg-[#CC5833] flex items-center justify-center shadow-lg shadow-[#CC5833]/30 mb-6 mt-2">
          <Heart size={28} fill="white" color="white" />
        </div>

        <h2 className="text-[1.35rem] font-black tracking-tight text-[#1A1A1A] mb-8">
          Bem-vindo ao Patas
        </h2>

        <div className="w-full space-y-3">
          <button 
            onClick={onLogin}
            className="w-full py-4 rounded-full bg-[#CC5833] text-white font-bold text-sm shadow-lg shadow-[#CC5833]/20 hover:bg-[#B34522] transition-colors"
          >
            Entrar ou Criar Conta
          </button>

          <button 
            onClick={onGuest}
            className="w-full py-4 rounded-full bg-[#2E4036] text-white font-bold text-sm shadow-lg shadow-[#2E4036]/20 hover:bg-[#202E26] transition-colors"
          >
            Entrar como Convidado
          </button>
          
          <p className="text-[10px] text-black/30 font-medium px-4 pt-4 leading-relaxed">
            Fazer login nos ajuda a manter a comunidade segura e evitar robôs.
          </p>
        </div>
      </div>
    </div>
  );
}
