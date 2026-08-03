import { create } from 'zustand';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSubtle: string;
  cardBg: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  accent: string;
  accentRed: string;
  heroBg: [string, string, string];
  boxBg: string;
  inputBg: string;
  headerBtnBg: string;
}

export const lightTheme: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',
  cardBg: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  primary: '#0D1B3E',
  accent: '#16A34A',
  accentRed: '#DC2626',
  heroBg: ['#0D1B3E', '#162544', '#0F172A'],
  boxBg: '#F4FAF7',
  inputBg: '#FFFFFF',
  headerBtnBg: '#FFFFFF',
};

export const darkTheme: ThemeColors = {
  background: '#070D1B',
  surface: '#0F1A34',
  surfaceSubtle: '#182647',
  cardBg: '#0F1A34',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: '#1E2C4F',
  primary: '#38BDF8',
  accent: '#10B981',
  accentRed: '#EF4444',
  heroBg: ['#040812', '#0A1326', '#03060F'],
  boxBg: '#0D241D',
  inputBg: '#0F1A34',
  headerBtnBg: '#0F1A34',
};

interface ThemeState {
  themeMode: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const initialSystemTheme: ThemeMode = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';

export const useThemeStore = create<ThemeState>((set) => ({
  themeMode: initialSystemTheme,
  toggleTheme: () =>
    set((state) => ({
      themeMode: state.themeMode === 'light' ? 'dark' : 'light',
    })),
  setTheme: (mode: ThemeMode) => set({ themeMode: mode }),
}));

export function useTheme() {
  const { themeMode, toggleTheme, setTheme } = useThemeStore();
  const isDark = themeMode === 'dark';
  const colors = isDark ? darkTheme : lightTheme;

  return {
    themeMode,
    isDark,
    colors,
    toggleTheme,
    setTheme,
  };
}
