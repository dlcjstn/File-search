import { Course, VocabularyWord, GrammarRule, Language, Level } from '../types/course';

export const courses: Course[] = [
  {
    id: 'en-beginner',
    language: 'english',
    level: 'beginner',
    title: '英语入门基础',
    description: '从零开始学习英语，掌握基础词汇和简单句型',
    totalLessons: 20,
    completedLessons: 0,
    orderIndex: 1,
  },
  {
    id: 'en-intermediate',
    language: 'english',
    level: 'intermediate',
    title: '英语中级提升',
    description: '扩展词汇量，学习复杂句型和日常对话',
    totalLessons: 30,
    completedLessons: 0,
    orderIndex: 2,
  },
  {
    id: 'en-advanced',
    language: 'english',
    level: 'advanced',
    title: '英语高级进阶',
    description: '深入语法，提升阅读和写作能力',
    totalLessons: 25,
    completedLessons: 0,
    orderIndex: 3,
  },
  {
    id: 'jp-beginner',
    language: 'japanese',
    level: 'beginner',
    title: '日语五十音入门',
    description: '学习日语假名发音和基础单词',
    totalLessons: 15,
    completedLessons: 0,
    orderIndex: 4,
  },
  {
    id: 'jp-intermediate',
    language: 'japanese',
    level: 'intermediate',
    title: '日语日常会话',
    description: '掌握日常生活场景对话和常用语法',
    totalLessons: 25,
    completedLessons: 0,
    orderIndex: 5,
  },
  {
    id: 'jp-advanced',
    language: 'japanese',
    level: 'advanced',
    title: '日语能力考N1',
    description: '全面备考JLPT N1级别',
    totalLessons: 40,
    completedLessons: 0,
    orderIndex: 6,
  },
  {
    id: 'kr-beginner',
    language: 'korean',
    level: 'beginner',
    title: '韩语发音入门',
    description: '学习韩语字母表和基础发音规则',
    totalLessons: 12,
    completedLessons: 0,
    orderIndex: 7,
  },
  {
    id: 'kr-intermediate',
    language: 'korean',
    level: 'intermediate',
    title: '韩语TOPIK备考',
    description: '系统学习TOPIK中级内容',
    totalLessons: 35,
    completedLessons: 0,
    orderIndex: 8,
  },
  {
    id: 'kr-advanced',
    language: 'korean',
    level: 'advanced',
    title: '韩语TOPIK高级',
    description: '冲刺TOPIK高级考试',
    totalLessons: 40,
    completedLessons: 0,
    orderIndex: 9,
  },
];

export const vocabularyData: Record<Language, Record<Level, VocabularyWord[]>> = {
  english: {
    beginner: [
      { id: 'en-b-1', word: 'hello', pronunciation: '/həˈloʊ/', meaning: '你好', example: 'Hello, how are you?', exampleTranslation: '你好，你好吗？', level: 'beginner' },
      { id: 'en-b-2', word: 'world', pronunciation: '/wɜːrld/', meaning: '世界', example: 'The world is beautiful.', exampleTranslation: '世界很美丽。', level: 'beginner' },
      { id: 'en-b-3', word: 'love', pronunciation: '/lʌv/', meaning: '爱', example: 'Love makes the world go round.', exampleTranslation: '爱让世界转动。', level: 'beginner' },
      { id: 'en-b-4', word: 'learn', pronunciation: '/lɜːrn/', meaning: '学习', example: 'I want to learn English.', exampleTranslation: '我想学英语。', level: 'beginner' },
      { id: 'en-b-5', word: 'friend', pronunciation: '/frend/', meaning: '朋友', example: 'She is my best friend.', exampleTranslation: '她是我最好的朋友。', level: 'beginner' },
      { id: 'en-b-6', word: 'family', pronunciation: '/ˈfæməli/', meaning: '家庭', example: 'Family is important.', exampleTranslation: '家庭很重要。', level: 'beginner' },
      { id: 'en-b-7', word: 'happy', pronunciation: '/ˈhæpi/', meaning: '快乐的', example: 'I am very happy today.', exampleTranslation: '我今天很开心。', level: 'beginner' },
      { id: 'en-b-8', word: 'time', pronunciation: '/taɪm/', meaning: '时间', example: 'Time flies.', exampleTranslation: '时光飞逝。', level: 'beginner' },
      { id: 'en-b-9', word: 'book', pronunciation: '/bʊk/', meaning: '书', example: 'I like reading books.', exampleTranslation: '我喜欢读书。', level: 'beginner' },
      { id: 'en-b-10', word: 'food', pronunciation: '/fuːd/', meaning: '食物', example: 'Food is essential.', exampleTranslation: '食物是必需的。', level: 'beginner' },
    ],
    intermediate: [
      { id: 'en-i-1', word: 'knowledge', pronunciation: '/ˈnɒlɪdʒ/', meaning: '知识', example: 'Knowledge is power.', exampleTranslation: '知识就是力量。', level: 'intermediate' },
      { id: 'en-i-2', word: 'challenge', pronunciation: '/ˈtʃælɪndʒ/', meaning: '挑战', example: 'This is a great challenge.', exampleTranslation: '这是一个巨大的挑战。', level: 'intermediate' },
      { id: 'en-i-3', word: 'opportunity', pronunciation: '/ˌɒpərˈtjuːnɪti/', meaning: '机会', example: 'Seize the opportunity.', exampleTranslation: '抓住机会。', level: 'intermediate' },
      { id: 'en-i-4', word: 'achieve', pronunciation: '/əˈtʃiːv/', meaning: '实现', example: 'We can achieve our goals.', exampleTranslation: '我们能实现目标。', level: 'intermediate' },
      { id: 'en-i-5', word: 'environment', pronunciation: '/ɪnˈvaɪrənmənt/', meaning: '环境', example: 'Protect the environment.', exampleTranslation: '保护环境。', level: 'intermediate' },
    ],
    advanced: [
      { id: 'en-a-1', word: 'sophisticated', pronunciation: '/səˈfɪstɪkeɪtɪd/', meaning: '精密的', example: 'This is a sophisticated system.', exampleTranslation: '这是一个精密的系统。', level: 'advanced' },
      { id: 'en-a-2', word: 'paradigm', pronunciation: '/ˈpærədaɪm/', meaning: '范式', example: 'A new paradigm shift.', exampleTranslation: '新的范式转变。', level: 'advanced' },
      { id: 'en-a-3', word: 'comprehensive', pronunciation: '/ˌkɒmprɪˈhensɪv/', meaning: '全面的', example: 'A comprehensive analysis.', exampleTranslation: '一个全面的分析。', level: 'advanced' },
    ],
    expert: [],
  },
  japanese: {
    beginner: [
      { id: 'jp-b-1', word: 'こんにちは', pronunciation: 'konnichiwa', meaning: '你好', example: 'こんにちは、お元気ですか？', exampleTranslation: '你好，你好吗？', level: 'beginner' },
      { id: 'jp-b-2', word: 'ありがとう', pronunciation: 'arigatou', meaning: '谢谢', example: 'ありがとうございます。', exampleTranslation: '非常感谢。', level: 'beginner' },
      { id: 'jp-b-3', word: 'すみません', pronunciation: 'sumimasen', meaning: '对不起/请问', example: 'すみません、駅はどこですか？', exampleTranslation: '请问，车站在哪里？', level: 'beginner' },
      { id: 'jp-b-4', word: 'はい', pronunciation: 'hai', meaning: '是/好的', example: 'はい、わかりました。', exampleTranslation: '是的，我明白了。', level: 'beginner' },
      { id: 'jp-b-5', word: 'いいえ', pronunciation: 'iie', meaning: '不/不是', example: 'いいえ、違います。', exampleTranslation: '不，不对。', level: 'beginner' },
    ],
    intermediate: [
      { id: 'jp-i-1', word: '頑張ってください', pronunciation: 'gambatte kudasai', meaning: '请加油', example: '試験、頑張ってください！', exampleTranslation: '考试请加油！', level: 'intermediate' },
      { id: 'jp-i-2', word: 'お世話になりました', pronunciation: 'osewa ni narimashita', meaning: '承蒙照顾', example: '今までお世話になりました。', exampleTranslation: '一直以来承蒙照顾。', level: 'intermediate' },
    ],
    advanced: [
      { id: 'jp-a-1', word: 'の変化', pronunciation: 'no henka', meaning: '的变化', example: '社会の変化に適応する。', exampleTranslation: '适应社会变化。', level: 'advanced' },
    ],
    expert: [],
  },
  korean: {
    beginner: [
      { id: 'kr-b-1', word: '안녕하세요', pronunciation: 'annyeonghaseyo', meaning: '你好', example: '안녕하세요, 만나서 반갑습니다.', exampleTranslation: '你好，很高兴认识你。', level: 'beginner' },
      { id: 'kr-b-2', word: '감사합니다', pronunciation: 'gamsahamnida', meaning: '谢谢', example: '정말 감사합니다.', exampleTranslation: '真的很感谢。', level: 'beginner' },
      { id: 'kr-b-3', word: '对不起', pronunciation: 'mianhamnida', meaning: '对不起', example: '늦어서 미안합니다。', exampleTranslation: '迟到了对不起。', level: 'beginner' },
      { id: 'kr-b-4', word: '네', pronunciation: 'ne', meaning: '是', example: '네, 알겠습니다。', exampleTranslation: '是的，我知道了。', level: 'beginner' },
      { id: 'kr-b-5', word: '아니요', pronunciation: 'aniyo', meaning: '不/不是', example: '아니요, 괜찮습니다。', exampleTranslation: '不，没关系。', level: 'beginner' },
    ],
    intermediate: [
      { id: 'kr-i-1', word: '화이팅', pronunciation: 'hwaiting', meaning: '加油', example: '시험 화이팅!', exampleTranslation: '考试加油！', level: 'intermediate' },
      { id: 'kr-i-2', word: '잘 먹었습니다', pronunciation: 'jal meogeotsseumnida', meaning: '吃好了', example: '잘 먹었습니다, 감사합니다.', exampleTranslation: '吃好了，谢谢。', level: 'intermediate' },
    ],
    advanced: [
      { id: 'kr-a-1', word: '경험', pronunciation: 'gyeongheom', meaning: '经验', example: '丰富的经验', exampleTranslation: '풍부한 경험', level: 'advanced' },
    ],
    expert: [],
  },
};

export const grammarData: Record<Language, Record<Level, GrammarRule[]>> = {
  english: {
    beginner: [
      {
        id: 'en-g-b-1',
        title: '一般现在时',
        description: '表示习惯性动作、普遍真理和当前状态',
        examples: [
          { original: 'I play tennis every weekend.', translation: '我每个周末打网球。' },
          { original: 'The sun rises in the east.', translation: '太阳从东方升起。' },
        ],
        level: 'beginner',
      },
      {
        id: 'en-g-b-2',
        title: '现在进行时',
        description: '表示正在进行的动作',
        examples: [
          { original: 'She is reading a book now.', translation: '她现在正在读书。' },
          { original: 'They are playing football.', translation: '他们正在踢足球。' },
        ],
        level: 'beginner',
      },
      {
        id: 'en-g-b-3',
        title: '一般过去时',
        description: '表示过去发生的动作或状态',
        examples: [
          { original: 'I visited Paris last year.', translation: '我去年去了巴黎。' },
          { original: 'She was happy yesterday.', translation: '她昨天很开心。' },
        ],
        level: 'beginner',
      },
    ],
    intermediate: [
      {
        id: 'en-g-i-1',
        title: '现在完成时',
        description: '表示过去发生并持续到现在的动作，或对现在有影响',
        examples: [
          { original: 'I have lived here for 5 years.', translation: '我在这里住了5年。' },
          { original: 'She has already eaten breakfast.', translation: '她已经吃过早餐了。' },
        ],
        level: 'intermediate',
      },
      {
        id: 'en-g-i-2',
        title: '被动语态',
        description: '强调动作的承受者',
        examples: [
          { original: 'The cake was made by my mother.', translation: '蛋糕是我妈妈做的。' },
          { original: 'English is spoken worldwide.', translation: '英语在全世界被使用。' },
        ],
        level: 'intermediate',
      },
    ],
    advanced: [
      {
        id: 'en-g-a-1',
        title: '虚拟语气',
        description: '表达假设、愿望、建议等',
        examples: [
          { original: 'If I were you, I would take this job.', translation: '如果我是你，我会接受这份工作。' },
          { original: 'I wish I could speak Japanese.', translation: '我希望我会说日语。' },
        ],
        level: 'advanced',
      },
    ],
    expert: [],
  },
  japanese: {
    beginner: [
      {
        id: 'jp-g-b-1',
        title: '名词是/非',
        description: '使用です表示肯定，ではありません表示否定',
        examples: [
          { original: '私は学生です。', translation: '我是学生。' },
          { original: 'これは本ではありません。', translation: '这不是书。' },
        ],
        level: 'beginner',
      },
      {
        id: 'jp-g-b-2',
        title: '动词て形',
        description: '连接动作，表示进行或原因',
        examples: [
          { original: '食べてください。', translation: '请吃。' },
          { original: '食べてきました。', translation: '吃过了。' },
        ],
        level: 'beginner',
      },
    ],
    intermediate: [
      {
        id: 'jp-g-i-1',
        title: '被动语态',
        description: 'れる/られる形式',
        examples: [
          { original: '雨に降られました。', translation: '被雨淋了。' },
        ],
        level: 'intermediate',
      },
    ],
    advanced: [
      {
        id: 'jp-g-a-1',
        title: '敬语',
        description: '尊敬语和谦让语的使用',
        examples: [
          { original: '社長はお帰りになりました。', translation: '社长回来了。' },
        ],
        level: 'advanced',
      },
    ],
    expert: [],
  },
  korean: {
    beginner: [
      {
        id: 'kr-g-b-1',
        title: '은/는 主题标记',
        description: '表示句子的主语或主题',
        examples: [
          { original: '나는 학생이다.', translation: '我是学生。' },
          { original: '이것은 책이다.', translation: '这是书。' },
        ],
        level: 'beginner',
      },
      {
        id: 'kr-g-b-2',
        title: '을/를 宾语标记',
        description: '表示动作的对象',
        examples: [
          { original: '밥을 먹다.', translation: '吃饭。' },
          { original: '영화를 보다.', translation: '看电影。' },
        ],
        level: 'beginner',
      },
    ],
    intermediate: [
      {
        id: 'kr-g-i-1',
        title: '过去时态',
        description: '使用 았/었/였',
        examples: [
          { original: '한국에 갔다.', translation: '去韩国了。' },
          { original: '밥을 먹었다.', translation: '吃饭了。' },
        ],
        level: 'intermediate',
      },
    ],
    advanced: [
      {
        id: 'kr-g-a-1',
        title: '连接句尾',
        description: '各种连接句子的语法',
        examples: [
          { original: '비가 와서 우산을 가져갔다.', translation: '因为下雨，带了伞。' },
        ],
        level: 'advanced',
      },
    ],
    expert: [],
  },
};

export const getCoursesByLanguage = (language: Language): Course[] => {
  return courses.filter(course => course.language === language);
};

export const getCoursesByLevel = (language: Language, level: Level): Course[] => {
  return courses.filter(course => course.language === language && course.level === level);
};
