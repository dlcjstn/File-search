import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Bell, Award, LogOut, ChevronRight, Globe, Target, Flame, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useAuthStore } from '../../stores/authStore';
import { useProgressStore } from '../../stores/progressStore';

export const Profile = () => {
  const { user, logout } = useAuthStore();
  const { progress, achievements } = useProgressStore();
  const [showSettings, setShowSettings] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-6"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center text-5xl shadow-xl">
              {user?.avatar || '👤'}
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{user?.nickname || '学习者'}</h1>
              <p className="text-primary-100">{user?.email}</p>
              <div className="flex items-center gap-4 mt-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm">
                  Lv.{user?.level || 1}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full text-sm flex items-center gap-1">
                  <Flame size={16} />
                  {progress.streakDays} 天连续
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                    <BookOpen className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">已学单词</p>
                    <p className="text-3xl font-bold text-gray-800">{progress.wordsLearned}</p>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((progress.wordsLearned / 100) * 100, 100)}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">目标 100 词</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center">
                    <Award className="text-white" size={28} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">已获成就</p>
                    <p className="text-3xl font-bold text-gray-800">{unlockedAchievements.length}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {unlockedAchievements.slice(0, 4).map((achievement) => (
                    <span key={achievement.id} className="text-2xl">{achievement.icon}</span>
                  ))}
                  {unlockedAchievements.length > 4 && (
                    <span className="text-sm text-gray-500 self-center">+{unlockedAchievements.length - 4}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-800">学习设置</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Globe className="text-accent-500" size={24} />
                    <div>
                      <p className="font-semibold text-gray-800">学习语言</p>
                      <p className="text-sm text-gray-500">
                        {user?.preferredLanguage === 'english' ? '🇬🇧 英语' : 
                         user?.preferredLanguage === 'japanese' ? '🇯🇵 日语' : '🇰🇷 韩语'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Target className="text-accent-500" size={24} />
                    <div>
                      <p className="font-semibold text-gray-800">每日目标</p>
                      <p className="text-sm text-gray-500">每天 {user?.dailyGoal || 10} 个单词</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Bell className="text-accent-500" size={24} />
                    <div>
                      <p className="font-semibold text-gray-800">学习提醒</p>
                      <p className="text-sm text-gray-500">每天 09:00</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <Settings className="text-accent-500" size={24} />
                    <div>
                      <p className="font-semibold text-gray-800">应用设置</p>
                      <p className="text-sm text-gray-500">主题、语言等</p>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="py-6">
              <Button
                variant="secondary"
                onClick={handleLogout}
                className="w-full !text-red-500 !border-red-500 hover:!bg-red-50"
              >
                <LogOut size={20} />
                退出登录
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-bold mb-2">语言星球</h3>
              <p className="text-gray-400 mb-4">让学习更有趣</p>
              <p className="text-sm text-gray-500">版本 1.0.0</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
