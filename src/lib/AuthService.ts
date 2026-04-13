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

// Desativando o modo Mock para que o login do Google/Facebook funcione de verdade nas chaves do cliente
const IS_MOCK_MODE = false; 

export const AuthService = {
  // Gerador de Avatar Maravilhoso (Estilo Apple/Notion)
  getBeautifulAvatar(seed: string) {
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  },

  // LOGIN COM GOOGLE
  async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    
    return { data, error };
  },

  // LOGIN COM FACEBOOK
  async signInWithFacebook() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: window.location.origin,
      },
    });
    
    return { data, error };
  },

  // SIGNOUT
  async signOut() {
    return await supabase.auth.signOut();
  },

  // OBTER PERFIL
  async getProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // Se não encontrar perfil, retornamos null ou um perfil básico
      return null;
    }
    return data;
  },

  // ATUALIZAR PERFIL
  async updateProfile(profile: Partial<UserProfile>) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(profile)
      .select();

    if (error) throw error;
    return { success: true, data };
  }
};
