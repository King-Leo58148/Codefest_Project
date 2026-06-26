import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setUser: (user) => {
    set({ user });
    if (user) {
      AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
      AsyncStorage.removeItem('user');
    }
  },

  setToken: (token) => {
    set({ token });
    if (token) {
      AsyncStorage.setItem('token', token);
    } else {
      AsyncStorage.removeItem('token');
    }
  },

  logout: async () => {
    await Promise.all([
      AsyncStorage.removeItem('user'),
      AsyncStorage.removeItem('token'),
    ]);
    set({ user: null, token: null });
  },

  loadStoredAuth: async () => {
    try {
      const [userStr, token] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('token'),
      ]);
      const user = userStr ? JSON.parse(userStr) : null;
      set({ user, token: token ?? null, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
