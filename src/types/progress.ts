export interface DailyProgress {
  date: string;
  wordsLearned: number;
  grammarCompleted: number;
  speakingMinutes: number;
  listeningMinutes: number;
  totalStudyTime: number;
}

export interface Progress {
  totalStudyTime: number;
  streakDays: number;
  wordsLearned: number;
  grammarCompleted: number;
  speakingPractice: number;
  listeningPractice: number;
  weeklyData: number[];
  skills: {
    vocabulary: number;
    grammar: number;
    speaking: number;
    listening: number;
  };
  dailyProgress: DailyProgress[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface StudyRecord {
  id: string;
  date: string;
  module: 'vocabulary' | 'grammar' | 'speaking' | 'listening';
  language: string;
  duration: number;
  score?: number;
}
