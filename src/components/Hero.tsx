import { motion } from "framer-motion";
import { Search, Heart, Share2 } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center pt-20 px-4 overflow-hidden">
      {/* Background visual element */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-peach-100/40 to-ivory"></div>
      
      {/* Abstract blur circles for cinematic lighting */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-peach-300/20 rounded-full blur-[100px] -z-10"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut", delay: 0.2 }}
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-300/20 rounded-full blur-[100px] -z-10"
      />

      <div className="z-10 text-center max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate/5 border border-slate/10 text-slate mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-peach-500 animate-pulse"></span>
          <span className="text-sm font-medium">Juntos trazemos de volta</span>
        </motion.div>

        <motion.h1 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-black text-slate tracking-tighter leading-[0.9] mb-6"
        >
          Conexão é o<br />
          caminho da<br />
          <span className="text-peach-500 italic font-serif font-light tracking-normal">volta.</span>
        </motion.h1>

        <motion.p 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-slate/70 max-w-2xl mb-12"
        >
          Seu pet não é só um número. É um membro da família. Use tecnologia e o poder da comunidade para transformar o desespero e construir reencontros inesquecíveis.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
        >
          <button className="magnetic-btn flex items-center justify-center gap-2 bg-slate text-ivory px-8 py-4 rounded-[2rem] text-lg font-medium hover:bg-slate/90 shadow-xl shadow-slate/20">
            <Search className="w-5 h-5" />
            Perdi meu Pet
          </button>
          <button className="magnetic-btn flex items-center justify-center gap-2 bg-peach-500 text-white px-8 py-4 rounded-[2rem] text-lg font-medium hover:bg-peach-600 shadow-xl shadow-peach-500/20">
            <Heart className="w-5 h-5" />
            Encontrei um Pet
          </button>
          <button className="magnetic-btn flex items-center justify-center gap-2 bg-white text-slate px-8 py-4 rounded-[2rem] text-lg font-medium hover:bg-gray-50 border border-slate/10 shadow-sm">
            <Share2 className="w-5 h-5" />
            Adotar / Doar
          </button>
        </motion.div>
      </div>

      {/* Decorative Bottom shape */}
      <div className="absolute bottom-0 w-full h-[20vh] bg-gradient-to-t from-ivory to-transparent pointer-events-none" />
    </section>
  );
}
