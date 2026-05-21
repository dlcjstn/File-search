export type Language = 'english' | 'japanese' | 'korean';
export type Level = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Course {
  id: string;
  language: Language;
  level: Level;
  title: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  thumbnail?: string;
  orderIndex: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  type: 'vocabulary' | 'grammar' | 'speaking' | 'listening';
  content: LessonContent;
  orderIndex: number;
}

export interface LessonContent {
  words?: VocabularyWord[];
  grammar?: GrammarRule[];
  dialogues?: Dialogue[];
  audio?: AudioMaterial[];
}

export interface VocabularyWord {
  id: string;
  word: string;
  pronunciation: string;
  meaning: string;
  example: string;
  exampleTranslation: string;
  level: Level;
  status?: 'new' | 'learning' | 'mastered';
}

export interface GrammarRule {
  id: string;
  title: string;
  description: string;
  examples: GrammarExample[];
  level: Level;
}

export interface GrammarExample {
  original: string;
  translation: string;
  explanation?: string;
}

export interface Dialogue {
  id: string;
  speaker: string;
  text: string;
  translation: string;
  audioUrl?: string;
}

export interface AudioMaterial {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  duration: number;
  transcript?: string;
  translation?: string;
  level: Level;
}
