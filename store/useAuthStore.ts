import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  isPremium: boolean;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  isPremium: false,
  setSession: (session) => {
    let isPremium = false;
    
    // Check for premium claim in app_metadata
    if (session?.user?.app_metadata?.premium === true) {
      isPremium = true;
    }

    set({ session, isPremium });
  },
}));
