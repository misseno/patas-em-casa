import { createClient } from '@supabase/supabase-js';

// --- CONFIGURAÇÃO DO SUPABASE ---
// Substitua pelas suas credenciais quando criar o projeto em supabase.com
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://sua-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sua-chave-anonima';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * TIPAGEM DO BANCO DE DADOS (DATABASE TYPES)
 * Conforme o crescimento do projeto, você pode gerar estes tipos automaticamente
 */
export type Pet = {
  id: string;
  owner_id: string;
  type: 'lost' | 'found' | 'adopt';
  name: string;
  breed: string;
  species: 'cao' | 'gato' | 'outro';
  description: string;
  images: string[];
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: 'active' | 'resolved';
  created_at: string;
  shelter_details?: string;
};
