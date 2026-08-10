import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  email: string;
  name: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, name?: string) => void;
  register: (email: string, password: string, name: string) => void;
  updateProfile: (name: string, email: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email: string, _password: string, name?: string) => {
        set({
          user: { email, name: name || email.split('@')[0] },
          isAuthenticated: true,
        });
      },
      register: (email: string, _password: string, name: string) => {
        set({
          user: { email, name },
          isAuthenticated: true,
        });
      },
      updateProfile: (name: string, email: string) => {
        set((state) => ({
          user: state.user
            ? { ...state.user, name: name.trim(), email: email.trim() }
            : { name: name.trim(), email: email.trim() },
        }));
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
