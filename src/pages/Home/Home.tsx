import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Mic, Headphones, PenTool, Users, Trophy, TrendingUp, Star, ArrowRight, Globe } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card, CardContent } from '../../components/common/Card';
import { useAuthStore } from '../../stores/authStore';
import { Language } from '../../types/course';

const languages = [
  {
    id: 'english' as Language,
    name: '英语',
    flag: '🇬🇧',
    courses: 50,
    learners: '1.2M+',
    description: '全球通用语言，商务与文化交流首选',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'japanese' as Language,
    name: '日语',
    flag: '🇯🇵',
    courses: 45,
    learners: '800K+',
    description: '动漫、留学、日企就业实用语言',
    color: 'from-pink-500 to-rose-500',
  },
  {
    id: 'korean' as Language,
    name: '韩语',
    flag: '🇰🇷',
    courses: 40,
    learners: '600K+',
    description: 'K-pop、韩剧、留学韩国的热门选择',
    color: 'from-purple-500 to-violet-600',
  },
];

const features = [
  {
    icon: BookOpen,
    title: '分级课程',
    description: '从入门到精通，系统化学习路径',
    color: 'text-blue-500',
    bg: 'bg-blue-50',
  },
  {
    icon: Mic,
    title: '口语跟读',
    description: 'AI评分，实时提升发音准确性',
    color: 'text-pink-500',
    bg: 'bg-pink-50',
  },
  {
    icon: Headphones,
    title: '听力训练',
    description: '多倍速播放，告别听力困难',
    color: 'text-purple-500',
    bg: 'bg-purple-50',
  },
  {
    icon: PenTool,
    title: '语法练习',
    description: '多种题型，全面掌握语法要点',
    color: 'text-green-500',
    bg: 'bg-green-50',
  },
  {
    icon: Users,
    title: '学习社区',
    description: '与志同道合的学习者一起进步',
    color: 'text-orange-500',
    bg: 'bg-orange-50',
  },
  {
    icon: Trophy,
    title: '成就系统',
    description: '徽章收集，等级提升学习动力',
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
  },
];

const stats = [
  { label: '学习者', value: '2.6M+', icon: Users },
  { label: '课程数', value: '135+', icon: BookOpen },
  { label: '完成率', value: '89%', icon: TrendingUp },
  { label: '评分', value: '4.9', icon: Star },
];

export const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [selectedLang, setSelectedLang] = useState<Language>('english');

  const handleStartLearning = () => {
    if (isAuthenticated) {
      navigate('/learn');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-white/10 text-6xl"
              initial={{ y: '100vh', x: `${i * 5}%` }}
              animate={{ y: '-100vh', x: `${i * 5 + 10}%` }}
              transition={{
                duration: 20 + Math.random() * 10,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            >
              {['🌍', '📚', '✏️', '🎯', '⭐'][i % 5]}
            </motion.div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="w-24 h-24 bg-gradient-to-br from-accent-500 to-accent-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl"
            >
              <Globe className="text-white" size={48} />
            </motion.div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
              语言星球
              <span className="block text-accent-400">让学习更有趣</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-primary-100 mb-10 max-w-3xl mx-auto">
              沉浸式多语种学习体验，涵盖英语、日语、韩语
              <br />
              互动式学习 + 游戏化设计 = 高效有趣的语言掌握
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleStartLearning} size="lg">
                {isAuthenticated ? '继续学习' : '免费开始'}
                <ArrowRight size={20} />
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/login')}>
                {isAuthenticated ? '查看进度' : '已有账号'}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center"
              >
                <stat.icon className="w-8 h-8 text-accent-400 mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-primary-200 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">选择您的学习语言</h2>
            <p className="text-xl text-gray-600">开启专属的语言学习之旅</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {languages.map((lang, index) => (
              <motion.div
                key={lang.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                onClick={() => setSelectedLang(lang.id)}
                className={`cursor-pointer ${selectedLang === lang.id ? 'scale-105' : ''}`}
              >
                <Card hover={true} className="overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${lang.color}`} />
                  <CardContent>
                    <div className="text-6xl mb-4">{lang.flag}</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{lang.name}</h3>
                    <p className="text-gray-600 mb-4">{lang.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{lang.courses} 课程</span>
                      <span>{lang.learners} 学习者</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-800 mb-4">为什么选择语言星球？</h2>
            <p className="text-xl text-gray-600">强大的功能，全面的支持</p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover={true} className="h-full">
                  <CardContent>
                    <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-4`}>
                      <feature.icon className={feature.color} size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-accent-500 to-accent-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              准备好开始学习了吗？
            </h2>
            <p className="text-xl text-white/90 mb-8">
              加入数百万学习者，开启您的语言学习之旅
            </p>
            <Button
              onClick={handleStartLearning}
              size="lg"
              className="bg-white !text-accent-500 hover:!bg-gray-100"
            >
              {isAuthenticated ? '进入学习中心' : '免费注册'}
              <ArrowRight size={20} />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-600 rounded-xl flex items-center justify-center"
              >
                <span className="text-white text-xl">🌍</span>
              </motion.div>
              <span className="text-white font-bold text-lg">语言星球</span>
            </div>
            <div className="text-sm">
              © 2026 语言星球. 让学习更有趣.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
