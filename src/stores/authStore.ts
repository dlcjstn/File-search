import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/user';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nickname: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        const existingUser = mockUsers.find((u: any) => u.email === email);
        
        if (existingUser && existingUser.password === password) {
          const { password: _, ...userData } = existingUser;
          set({ user: userData, isAuthenticated: true, isLoading: false });
          return true;
        }
        
        set({ isLoading: false });
        return false;
      },

      register: async (email: string, password: string, nickname: string) => {
        set({ isLoading: true });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const mockUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
        
        if (mockUsers.find((u: any) => u.email === email)) {
          set({ isLoading: false });
          return false;
        }
        
        const newUser: User = {
          id: crypto.randomUUID(),
          email,
          nickname,
          preferredLanguage: 'english',
          dailyGoal: 10,
          totalPoints: 0,
          level: 1,
          streakDays: 0,
          createdAt: new Date().toISOString(),
        };
        
        mockUsers.push({ ...newUser, password });
        localStorage.setItem('mockUsers', JSON.stringify(mockUsers));
        
        set({ user: newUser, isAuthenticated: true, isLoading: false });
        return true;
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (data: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
