import React, { useState, useEffect, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BREEDS_DB: Record<string, string[]> = {
  cao: [
    'Affenpinscher', 'Afghan Hound', 'Airedale Terrier', 'Akita Inu', 'Basenji', 'Basset Hound', 'Beagle', 
    'Bearded Collie', 'Bernese Mountain Dog', 'Bichon Frisé', 'Bloodhound', 'Border Collie', 'Border Terrier', 
    'Borzoi', 'Boston Terrier', 'Boxer', 'Bull Terrier', 'Bulldog Francês', 'Bulldog Inglês', 'Bullmastiff', 
    'Cairn Terrier', 'Cane Corso', 'Cavalier King Charles Spaniel', 'Chesapeake Bay Retriever', 'Chihuahua', 
    'Chow Chow', 'Cocker Spaniel Americano', 'Cocker Spaniel Inglês', 'Collie', 'Dachshund (Salsicha)', 
    'Dálmata', 'Doberman Pinscher', 'Dogue Alemão', 'English Setter', 'English Springer Spaniel', 
    'Fila Brasileiro', 'Fox Terrier', 'German Shorthaired Pointer', 'Golden Retriever', 'Greyhound', 
    'Havanese', 'Irish Setter', 'Irish Wolfhound', 'Jack Russell Terrier', 'Japanese Chin', 'Labrador Retriever', 
    'Lhasa Apso', 'Maltês', 'Mastiff', 'Mastim Napolitano', 'Miniature Pinscher', 'Miniature Schnauzer', 
    'Newfoundland', 'Old English Sheepdog', 'Papillon', 'Pastor Alemão', 'Pastor Belga', 'Pastor Branco Suíço', 
    'Pastor de Shetland', 'Pequinês', 'Pointer Inglês', 'Pomerânia (Spitz Alemão)', 'Poodle', 'Portuguese Water Dog', 
    'Pug', 'Rat Terrier', 'Rhodesian Ridgeback', 'Rottweiler', 'Saint Bernard', 'Saluki', 'Samoyed', 
    'Schipperke', 'Scottish Terrier', 'Shar-Pei', 'Shetland Sheepdog', 'Shiba Inu', 'Shih Tzu', 'Siberian Husky', 
    'Silky Terrier', 'Soft Coated Wheaten Terrier', 'Staffordshire Bull Terrier', 'Standard Schnauzer', 
    'Tibetan Terrier', 'Vizsla', 'Weimaraner', 'Welsh Corgi Cardigan', 'Welsh Corgi Pembroke', 'West Highland White Terrier', 
    'Whippet', 'Yorkshire Terrier', 'Vira-lata (SRD)'
  ],
  gato: [
    'Abissínio', 'Angorá Turco', 'Azul Russo', 'Balinês', 'Bengal', 'Birmanês', 'Bombaim', 'British Shorthair', 
    'Burmês', 'Chartreux', 'Cornish Rex', 'Devon Rex', 'Egyptian Mau', 'Exótico de Pêlo Curto', 'Havana Brown', 
    'Himalaio', 'Javanês', 'Korat', 'Maine Coon', 'Manx', 'Norueguês da Floresta', 'Ocicat', 'Oriental Shorthair', 
    'Persa', 'Ragdoll', 'Siamês', 'Singapura', 'Somali', 'Sphynx', 'Tonquinês', 'Vira-lata (SRD)', 'SRD'
  ],
  outro: ['Coelho', 'Hamster', 'Pássaro', 'Tartaruga', 'Porquinho da Índia', 'Chinchila', 'Furão', 'Réptil']
};

interface BreedSelectorProps {
  especie: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  themeColor?: string;
}

export const BreedSelector: React.FC<BreedSelectorProps> = ({ 
  especie, 
  value, 
  onChange, 
  disabled = false,
  themeColor = '#2E4036'
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [internalValue, setInternalValue] = useState(value);

  // Sincroniza valor interno com o externo
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const suggestions = useMemo(() => {
    if (!internalValue || internalValue.length < 1) return [];
    
    // Se a espécie não estiver selecionada, busca em todas as categorias principais
    let list: string[] = [];
    if (!especie) {
      list = [...BREEDS_DB.cao, ...BREEDS_DB.gato, ...BREEDS_DB.outro];
    } else {
      list = BREEDS_DB[especie] || BREEDS_DB['outro'];
    }

    // Remover duplicatas se houver
    const uniqueList = Array.from(new Set(list));

    return uniqueList
      .filter(b => b.toLowerCase().startsWith(internalValue.toLowerCase()))
      .slice(0, 5);
  }, [especie, internalValue]);

  const handleInputChange = (val: string) => {
    // Capitalização Jobsiana - Automática e Elegante
    const capitalized = val.charAt(0).toUpperCase() + val.slice(1);
    setInternalValue(capitalized);
    onChange(capitalized);
    setShowSuggestions(true);

    // Lógica imediata de auto-complete se sobrar apenas um (Magic step)
    let list: string[] = [];
    if (!especie) {
      list = [...BREEDS_DB.cao, ...BREEDS_DB.gato, ...BREEDS_DB.outro];
    } else {
      list = BREEDS_DB[especie] || BREEDS_DB['outro'];
    }
    
    // Remove duplicatas
    const uniqueList = Array.from(new Set(list));
    const matches = uniqueList.filter(b => b.toLowerCase().startsWith(val.toLowerCase()));
    
    if (matches.length === 1 && matches[0].length > val.length && val.length >= 3) {
       // Se sobrar apenas um e o usuário digitou pelo menos 3 letras, a tecnologia faz o trabalho
       onChange(matches[0]);
       setInternalValue(matches[0]);
       setShowSuggestions(false);
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={internalValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          disabled={disabled}
          placeholder="Comece a digitar a raça..."
          className={`w-full p-4 pl-12 rounded-[2rem] outline-none text-sm font-medium transition-all shadow-inner ${disabled ? 'opacity-40 cursor-not-allowed text-gray-400' : 'focus:ring-4 focus:ring-black/5'}`}
          style={{ backgroundColor: '#F2F0E9' }}
        />
        <Search 
          size={18} 
          className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none transition-colors" 
          style={{ color: internalValue ? themeColor : 'inherit' }}
        />
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 5, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            className="absolute left-0 right-0 z-[200] bg-white rounded-[2.5rem] shadow-[0_30px_90px_rgba(0,0,0,0.25)] border border-black/5 overflow-hidden ring-1 ring-black/5"
          >
            <div className="p-3">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 px-5 py-4">Sugestões Criativas</p>
              <div className="space-y-1">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      onChange(s);
                      setInternalValue(s);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-5 py-4 rounded-2xl text-sm font-bold flex items-center justify-between hover:bg-[#F2F0E9] transition-all group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{s}</span>
                    {s.toLowerCase() === internalValue.toLowerCase() && <Check size={16} className="text-green-500" />}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
