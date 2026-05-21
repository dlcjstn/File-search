export interface User {
  id: string;
  email: string;
  nickname: string;
  avatar?: string;
  preferredLanguage: string;
  dailyGoal: number;
  totalPoints: number;
  level: number;
  streakDays: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, nickname: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}
