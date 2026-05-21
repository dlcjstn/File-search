import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Progress, Achievement, DailyProgress } from '../types/progress';

interface ProgressState {
  progress: Progress;
  achievements: Achievement[];
  isLoading: boolean;
  fetchProgress: () => void;
  updateProgress: (module: string, delta: number) => void;
  checkAchievements: () => Achievement[];
  addDailyProgress: (data: Partial<DailyProgress>) => void;
  updateStreak: () => void;
}

const initialProgress: Progress = {
  totalStudyTime: 0,
  streakDays: 0,
  wordsLearned: 0,
  grammarCompleted: 0,
  speakingPractice: 0,
  listeningPractice: 0,
  weeklyData: [0, 0, 0, 0, 0, 0, 0],
  skills: {
    vocabulary: 0,
    grammar: 0,
    speaking: 0,
    listening: 0,
  },
  dailyProgress: [],
};

const initialAchievements: Achievement[] = [
  {
    id: '1',
    name: '初学者',
    description: '完成第一课学习',
    icon: '🎯',
    points: 10,
    unlocked: false,
  },
  {
    id: '2',
    name: '单词达人',
    description: '掌握100个单词',
    icon: '📚',
    points: 50,
    unlocked: false,
  },
  {
    id: '3',
    name: '坚持不懈',
    description: '连续学习7天',
    icon: '🔥',
    points: 70,
    unlocked: false,
  },
  {
    id: '4',
    name: '口语新星',
    description: '完成10次口语练习',
    icon: '🎤',
    points: 30,
    unlocked: false,
  },
  {
    id: '5',
    name: '听力大师',
    description: '完成20次听力训练',
    icon: '🎧',
    points: 40,
    unlocked: false,
  },
  {
    id: '6',
    name: '语法专家',
    description: '完成50道语法题',
    icon: '✍️',
    points: 60,
    unlocked: false,
  },
  {
    id: '7',
    name: '学习狂人',
    description: '累计学习100小时',
    icon: '🏆',
    points: 100,
    unlocked: false,
  },
  {
    id: '8',
    name: '多语言者',
    description: '学习三种语言',
    icon: '🌍',
    points: 150,
    unlocked: false,
  },
];

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      progress: initialProgress,
      achievements: initialAchievements,
      isLoading: false,

      fetchProgress: () => {
        set({ isLoading: true });
        setTimeout(() => {
          set({ isLoading: false });
        }, 300);
      },

      updateProgress: (module: string, delta: number) => {
        set((state) => {
          const updates: Partial<Progress> = {};
          
          switch (module) {
            case 'vocabulary':
              updates.wordsLearned = state.progress.wordsLearned + delta;
              updates.skills = { ...state.progress.skills, vocabulary: Math.min(100, state.progress.skills.vocabulary + delta / 10) };
              break;
            case 'grammar':
              updates.grammarCompleted = state.progress.grammarCompleted + delta;
              updates.skills = { ...state.progress.skills, grammar: Math.min(100, state.progress.skills.grammar + delta / 5) };
              break;
            case 'speaking':
              updates.speakingPractice = state.progress.speakingPractice + delta;
              updates.skills = { ...state.progress.skills, speaking: Math.min(100, state.progress.skills.speaking + delta / 10) };
              break;
            case 'listening':
              updates.listeningPractice = state.progress.listeningPractice + delta;
              updates.skills = { ...state.progress.skills, listening: Math.min(100, state.progress.skills.listening + delta / 10) };
              break;
          }
          
          updates.totalStudyTime = state.progress.totalStudyTime + delta;
          
          const today = new Date().getDay();
          const newWeeklyData = [...state.progress.weeklyData];
          newWeeklyData[today] += delta;
          
          return {
            progress: { ...state.progress, ...updates, weeklyData: newWeeklyData },
          };
        });
        
        get().checkAchievements();
      },

      checkAchievements: () => {
        const state = get();
        const newUnlocked: Achievement[] = [];
        
        const updatedAchievements = state.achievements.map(achievement => {
          if (achievement.unlocked) return achievement;
          
          let shouldUnlock = false;
          
          switch (achievement.id) {
            case '1':
              shouldUnlock = state.progress.totalStudyTime > 0;
              break;
            case '2':
              shouldUnlock = state.progress.wordsLearned >= 100;
              break;
            case '3':
              shouldUnlock = state.progress.streakDays >= 7;
              break;
            case '4':
              shouldUnlock = state.progress.speakingPractice >= 10;
              break;
            case '5':
              shouldUnlock = state.progress.listeningPractice >= 20;
              break;
            case '6':
              shouldUnlock = state.progress.grammarCompleted >= 50;
              break;
            case '7':
              shouldUnlock = state.progress.totalStudyTime >= 6000;
              break;
          }
          
          if (shouldUnlock) {
            newUnlocked.push({ ...achievement, unlocked: true, unlockedAt: new Date().toISOString() });
            return { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() };
          }
          
          return achievement;
        });
        
        if (newUnlocked.length > 0) {
          set({ achievements: updatedAchievements });
        }
        
        return newUnlocked;
      },

      addDailyProgress: (data: Partial<DailyProgress>) => {
        set((state) => ({
          progress: {
            ...state.progress,
            dailyProgress: [
              ...state.progress.dailyProgress,
              { ...data, date: new Date().toISOString() } as DailyProgress,
            ],
          },
        }));
      },

      updateStreak: () => {
        set((state) => ({
          progress: {
            ...state.progress,
            streakDays: state.progress.streakDays + 1,
          },
        }));
      },
    }),
    {
      name: 'progress-storage',
    }
  )
);
