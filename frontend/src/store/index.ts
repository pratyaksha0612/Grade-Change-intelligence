import { create } from 'zustand'

interface AppState {
  theme: 'dark' | 'light'
  toggleTheme: () => void
  activeSessionId: string | null
  setActiveSession: (id: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'dark', // Industrial dark theme default
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: newTheme };
  }),
  activeSessionId: null,
  setActiveSession: (id) => set({ activeSessionId: id })
}))
