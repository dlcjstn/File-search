import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, Course, VocabularyWord, GrammarRule } from '../types/course';

interface LearnState {
  currentLanguage: Language;
  currentCourse: Course | null;
  vocabulary: VocabularyWord[];
  grammar: GrammarRule[];
  dailyWordsGoal: number;
  setCurrentLanguage: (lang: Language) => void;
  setCurrentCourse: (course: Course | null) => void;
  updateWordStatus: (wordId: string, status: 'new' | 'learning' | 'mastered') => void;
  getWordsByLevel: (level: string) => VocabularyWord[];
  getGrammarByLevel: (level: string) => GrammarRule[];
  setDailyWordsGoal: (goal: number) => void;
}

export const useLearnStore = create<LearnState>()(
  persist(
    (set, get) => ({
      currentLanguage: 'english',
      currentCourse: null,
      vocabulary: [],
      grammar: [],
      dailyWordsGoal: 10,

      setCurrentLanguage: (lang: Language) => {
        set({ currentLanguage: lang });
      },

      setCurrentCourse: (course: Course | null) => {
        set({ currentCourse: course });
      },

      updateWordStatus: (wordId: string, status: 'new' | 'learning' | 'mastered') => {
        set((state) => ({
          vocabulary: state.vocabulary.map(word =>
            word.id === wordId ? { ...word, status } : word
          ),
        }));
      },

      getWordsByLevel: (level: string) => {
        return get().vocabulary.filter(word => word.level === level);
      },

      getGrammarByLevel: (level: string) => {
        return get().grammar.filter(rule => rule.level === level);
      },

      setDailyWordsGoal: (goal: number) => {
        set({ dailyWordsGoal: goal });
      },
    }),
    {
      name: 'learn-storage',
    }
  )
);
