import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const mockHeroes = [
  {
    id: 1,
    name: "Herói Anônimo de São Paulo",
    quote: "Ver a alegria da família ao reencontrar o Bob não tem preço.",
    date: "Há 2 horas",
    image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 2,
    name: "Mariana S.",
    quote: "Heróis não usam capas. Só prestei atenção por um minuto.",
    date: "Ontem",
    image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600",
  },
  {
    id: 3,
    name: "Herói Anônimo",
    quote: "Qualquer um faria o mesmo. Cuide bem de quem te ama.",
    date: "Há 2 dias",
    image: "https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&q=80&w=600",
  },
];

export function HeroesCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const xTransform = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  return (
    <section ref={containerRef} id="heroes" className="py-32 overflow-hidden" style={{ backgroundColor: '#F2F0E9' }}>
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <p className="font-medium tracking-wide text-sm uppercase mb-3 text-[#CC5833]">Reencontros</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight text-[#2E4036]">
            Heróis da Vida Real
          </h2>
          <p className="text-lg mt-4 max-w-2xl text-[#2E4036]/70">
            Heróis não usam capas. Outros heróis preferem ficar anônimos. 
            Estes são os Heróis da Vida Real do Patas em Casa.
          </p>
        </motion.div>
      </div>

      <motion.div style={{ x: xTransform }} className="flex gap-6 px-6 md:px-[calc((100vw-80rem)/2+1.5rem)]">
        {mockHeroes.map((hero, idx) => (
          <motion.div
            key={hero.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="group relative min-w-[320px] md:min-w-[400px] h-[500px] rounded-[2.5rem] overflow-hidden bg-white shadow-xl shadow-slate/5 border border-slate/5"
          >
            <div className="absolute inset-0 w-full h-full">
              <img 
                src={hero.image} 
                alt="Reencontro Pet" 
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate/90 via-slate/40 to-transparent"></div>
            </div>
            
            <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end h-full">
              <p className="font-medium text-sm mb-2 text-[#CC5833]">{hero.date}</p>
              <h3 className="text-2xl font-bold text-white mb-4">{hero.name}</h3>
              <p className="text-white/80 font-serif italic text-lg leading-snug">
                "{hero.quote}"
              </p>
              
              <button className="mt-8 flex items-center text-white text-sm font-medium hover:text-[#CC5833] transition-colors w-fit pb-1 border-b border-white/30 hover:border-[#CC5833]">
                Ver história completa
              </button>
            </div>
          </motion.div>
        ))}
        {/* Placeholder for "Your story here" card */}
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="min-w-[320px] md:min-w-[400px] h-[500px] rounded-[2.5rem] border-2 border-dashed flex flex-col items-center justify-center p-8 text-center"
            style={{ backgroundColor: '#CC583310', borderColor: '#CC583340' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: '#CC583320' }}>
              <svg className="w-8 h-8" style={{ color: '#CC5833' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#2E4036]">A próxima pode ser a sua</h3>
            <p className="text-sm text-[#2E4036]/60">Use o aplicativo e mude o dia de alguém.</p>
        </motion.div>
      </motion.div>
    </section>
  );
}
