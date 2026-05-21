import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mic, Headphones, PenTool, ChevronRight, Flame, Target, TrendingUp, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/common/Card';
import { useAuthStore } from '../../stores/authStore';
import { useLearnStore } from '../../stores/learnStore';
import { useProgressStore } from '../../stores/progressStore';
import { Language, Level } from '../../types/course';

const languageOptions = [
  { id: 'english' as Language, name: '英语', flag: '🇬🇧', color: 'bg-blue-500' },
  { id: 'japanese' as Language, name: '日语', flag: '🇯🇵', color: 'bg-pink-500' },
  { id: 'korean' as Language, name: '韩语', flag: '🇰🇷', color: 'bg-purple-500' },
];

const modules = [
  { id: 'vocabulary', name: '单词记忆', icon: BookOpen, color: 'from-blue-500 to-blue-600', path: '/vocabulary' },
  { id: 'grammar', name: '语法练习', icon: PenTool, color: 'from-green-500 to-green-600', path: '/grammar' },
  { id: 'speaking', name: '口语跟读', icon: Mic, color: 'from-pink-500 to-pink-600', path: '/speaking' },
  { id: 'listening', name: '听力训练', icon: Headphones, color: 'from-purple-500 to-purple-600', path: '/listening' },
];

const levels: { id: Level; name: string; color: string }[] = [
  { id: 'beginner', name: '入门', color: 'bg-green-100 text-green-700' },
  { id: 'intermediate', name: '中级', color: 'bg-blue-100 text-blue-700' },
  { id: 'advanced', name: '高级', color: 'bg-purple-100 text-purple-700' },
  { id: 'expert', name: '专家', color: 'bg-orange-100 text-orange-700' },
];

export const Learn = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentLanguage, setCurrentLanguage } = useLearnStore();
  const { progress } = useProgressStore();
  const [selectedLevel, setSelectedLevel] = useState<Level>('beginner');

  const handleModuleClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">学习中心</h1>
            <p className="text-primary-100">欢迎回来，{user?.nickname || '学习者'}！继续您的学习之旅</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <Flame className="text-accent-400" size={24} />
                <div>
                  <div className="text-2xl font-bold">{progress.streakDays}</div>
                  <div className="text-sm text-primary-100">连续学习天数</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <Target className="text-mint" size={24} />
                <div>
                  <div className="text-2xl font-bold">{progress.wordsLearned}</div>
                  <div className="text-sm text-primary-100">已学单词</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="text-sky" size={24} />
                <div>
                  <div className="text-2xl font-bold">{progress.grammarCompleted}</div>
                  <div className="text-sm text-primary-100">语法练习</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="text-accent-400" size={24} />
                <div>
                  <div className="text-2xl font-bold">{Math.floor(progress.totalStudyTime / 60)}</div>
                  <div className="text-sm text-primary-100">学习时长(小时)</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Globe className="text-accent-500" />
            选择学习语言
          </h2>
          <div className="flex gap-4">
            {languageOptions.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setCurrentLanguage(lang.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                  currentLanguage === lang.id
                    ? `${lang.color} text-white shadow-lg scale-105`
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-semibold">{lang.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">学习模块</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                <Card
                  hover={true}
                  onClick={() => handleModuleClick(module.path)}
                  className="overflow-hidden"
                >
                  <div className={`h-2 bg-gradient-to-r ${module.color}`} />
                  <CardContent className="text-center py-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${module.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <module.icon className="text-white" size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{module.name}</h3>
                    <p className="text-gray-500 text-sm mb-4">
                      {module.id === 'vocabulary' && '闪卡式记忆'}
                      {module.id === 'grammar' && '多种题型'}
                      {module.id === 'speaking' && 'AI评分'}
                      {module.id === 'listening' && '多倍速'}
                    </p>
                    <ChevronRight className="text-gray-400 mx-auto" size={24} />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">课程推荐</h2>
          <div className="mb-4">
            <div className="flex gap-2">
              {levels.map((level) => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedLevel === level.id
                      ? `${level.color} shadow-md`
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: currentLanguage === 'english' ? '英语入门基础' : currentLanguage === 'japanese' ? '日语五十音入门' : '韩语发音入门',
                lessons: 20,
                progress: 0,
                level: '入门',
                levelColor: 'bg-green-100 text-green-700',
                lang: currentLanguage,
              },
              {
                title: currentLanguage === 'english' ? '英语中级提升' : currentLanguage === 'japanese' ? '日语日常会话' : '韩语TOPIK备考',
                lessons: 30,
                progress: 0,
                level: '中级',
                levelColor: 'bg-blue-100 text-blue-700',
                lang: currentLanguage,
              },
              {
                title: currentLanguage === 'english' ? '英语高级进阶' : currentLanguage === 'japanese' ? '日语能力考N1' : '韩语TOPIK高级',
                lessons: 25,
                progress: 0,
                level: '高级',
                levelColor: 'bg-purple-100 text-purple-700',
                lang: currentLanguage,
              },
            ]
              .filter((course) => course.level === levels.find((l) => l.id === selectedLevel)?.name)
              .map((course, index) => (
                <motion.div
                  key={course.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <Card hover={true} className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${course.levelColor}`}>
                          {course.level}
                        </span>
                        <span className="text-gray-500 text-sm">{course.lessons} 课时</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>学习进度</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                            className="h-full bg-gradient-to-r from-accent-500 to-accent-600"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleModuleClick('/vocabulary')}
                        className="w-full py-3 bg-gradient-to-r from-accent-500 to-accent-600 text-white rounded-lg font-semibold hover:from-accent-600 hover:to-accent-700 transition-all"
                      >
                        开始学习
                      </button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
