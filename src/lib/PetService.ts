import { supabase, type Pet } from './supabase';

/**
 * SERVIÇO DE DADOS - PATAS EM CASA
 * Centraliza as chamadas ao Supabase para facilitar manutenção e Mock fallback
 */

const IS_MOCK_MODE = false;

export const PetService = {
  // FAZER UPLOAD DE IMAGENS
  async uploadImages(files: File[]): Promise<string[]> {
    const urls: string[] = [];
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `pets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('pet-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        continue;
      }

      const { data } = supabase.storage
        .from('pet-images')
        .getPublicUrl(filePath);

      urls.push(data.publicUrl);
    }
    
    return urls;
  },

  // BUSCAR TODOS OS PETS
  async getAll(): Promise<Pet[]> {
    if (IS_MOCK_MODE) return [];
    
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // CRIAR UM NOVO REPORTE (PERDI/ACHEI)
  async create(petData: Omit<Pet, 'id' | 'created_at' | 'images'>, files: File[]) {
    if (IS_MOCK_MODE) {
      console.log('Simulação de Banco: Salvando Pet...', petData);
      return { success: true };
    }

    // 1. Upload das Imagens Primeiro
    const imageUrls = await this.uploadImages(files);

    // 2. Salvar no Banco
    const { data, error } = await supabase
      .from('pets')
      .insert([{
        ...petData,
        images: imageUrls
      }])
      .select();

    if (error) throw error;
    return { success: true, data };
  },

  // BUSCA POR SIMILARIDADE (IA)
  async findMatches(_petId: string) {
    return [];
  }
};
