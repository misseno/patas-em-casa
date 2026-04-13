import { supabase } from './supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  phone?: string;
  points: number;
  created_at: string;
}

const IS_MOCK_MODE = true; // Mantendo o padrão do projeto

export const AuthService = {
  // LOGIN COM GOOGLE
  async signInWithGoogle() {
    if (IS_MOCK_MODE) {
      console.log('Simulação: Iniciando Login com Google...');
      // Simulando retorno do Google após alguns ms
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockUser = {
            id: 'mock-google-id',
            email: 'usuario@gmail.com',
            user_metadata: {
              full_name: 'Herói Samaritano',
              avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
            }
          };
          resolve({ data: { user: mockUser }, error: null });
        }, 1000);
      });
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    
    return { data, error };
  },

  // SIGNOUT
  async signOut() {
    if (IS_MOCK_MODE) return { error: null };
    return await supabase.auth.signOut();
  },

  // OBTER PERFIL
  async getProfile(userId: string): Promise<UserProfile | null> {
    if (IS_MOCK_MODE) {
      return {
        id: userId,
        full_name: 'Herói Samaritano',
        email: 'usuario@gmail.com',
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        points: 850,
        created_at: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data;
  },

  // ATUALIZAR PERFIL
  async updateProfile(profile: Partial<UserProfile>) {
    if (IS_MOCK_MODE) {
      console.log('Simulação: Atualizando Perfil...', profile);
      return { success: true };
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select();

    if (error) throw error;
    return { success: true, data };
  }
};
