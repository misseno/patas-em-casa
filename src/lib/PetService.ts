import { supabase, type Pet } from './supabase';

/**
 * SERVIÇO DE DADOS - PATAS EM CASA
 * Centraliza as chamadas ao Supabase para facilitar manutenção e Mock fallback
 */

const IS_MOCK_MODE = true; // Altere para false quando configurar as chaves do Supabase

export const PetService = {
  // BUSCAR TODOS OS PETS
  async getAll(): Promise<Pet[]> {
    if (IS_MOCK_MODE) {
       // Fallback para o MOCK que já temos se não houver backend
       return []; // O App.tsx cuidará disso por enquanto
    }
    
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // CRIAR UM NOVO REPORTE (PERDI/ACHEI)
  async create(pet: Omit<Pet, 'id' | 'created_at'>) {
    if (IS_MOCK_MODE) {
      console.log('Simulação de Banco: Salvando Pet...', pet);
      return { success: true };
    }

    const { data, error } = await supabase
      .from('pets')
      .insert([pet])
      .select();

    if (error) throw error;
    return { success: true, data };
  },

  // BUSCA POR SIMILARIDADE (IA)
  async findMatches(petId: string) {
    // Aqui chamaremos a Edge Function do Supabase no futuro
    return [];
  }
};
