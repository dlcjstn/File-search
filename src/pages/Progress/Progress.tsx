import { motion } from 'framer-motion';
import { TrendingUp, Flame, Trophy, Target, BookOpen, Mic, Headphones, PenTool, Award, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/common/Card';
import { useProgressStore } from '../../stores/progressStore';
import { useAuthStore } from '../../stores/authStore';

export const Progress = () => {
  const { user } = useAuthStore();
  const { progress, achievements } = useProgressStore();

  const skills = [
    { name: '词汇', value: progress.skills.vocabulary, icon: BookOpen, color: 'from-blue-500 to-blue-600' },
    { name: '语法', value: progress.skills.grammar, icon: PenTool, color: 'from-green-500 to-green-600' },
    { name: '口语', value: progress.skills.speaking, icon: Mic, color: 'from-pink-500 to-pink-600' },
    { name: '听力', value: progress.skills.listening, icon: Headphones, color: 'from-purple-500 to-purple-600' },
  ];

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-bold mb-2">学习进度</h1>
            <p className="text-primary-100">追踪您的学习之旅</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: '连续学习', value: progress.streakDays, unit: '天', icon: Flame, color: 'text-orange-500' },
            { label: '总学习时长', value: Math.floor(progress.totalStudyTime / 60), unit: '小时', icon: TrendingUp, color: 'text-blue-500' },
            { label: '已学单词', value: progress.wordsLearned, unit: '个', icon: BookOpen, color: 'text-green-500' },
            { label: '完成语法', value: progress.grammarCompleted, unit: '题', icon: PenTool, color: 'text-purple-500' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="text-center py-6">
                  <stat.icon className={`${stat.color} mx-auto mb-2`} size={32} />
                  <div className="text-3xl font-bold text-gray-800">
                    {stat.value}
                    <span className="text-lg text-gray-500 ml-1">{stat.unit}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Target className="text-accent-500" />
                  能力雷达图
                </h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skills.map((skill, index) => (
                    <div key={skill.name}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-10 h-10 bg-gradient-to-br ${skill.color} rounded-lg flex items-center justify-center`}>
                            <skill.icon className="text-white" size={20} />
                          </div>
                          <span className="font-semibold text-gray-700">{skill.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{Math.round(skill.value)}%</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.value}%` }}
                          transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                          className={`h-full bg-gradient-to-r ${skill.color}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="text-accent-500" />
                  本周学习热力图
                </h2>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day, index) => (
                    <div key={day} className="text-center">
                      <div className="text-sm text-gray-500 mb-2">{day}</div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.6 + index * 0.05 }}
                        className={`w-full aspect-square rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                          progress.weeklyData[index] > 30
                            ? 'bg-gradient-to-br from-green-400 to-green-500'
                            : progress.weeklyData[index] > 15
                            ? 'bg-gradient-to-br from-green-300 to-green-400'
                            : progress.weeklyData[index] > 0
                            ? 'bg-gradient-to-br from-green-200 to-green-300'
                            : 'bg-gray-200'
                        }`}
                      >
                        {progress.weeklyData[index] > 0 ? Math.floor(progress.weeklyData[index] / 10) : ''}
                      </motion.div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <span>无学习</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 rounded" />
                    <span>少量</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-400 rounded" />
                    <span>正常</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span>高强度</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Trophy className="text-accent-500" />
                成就徽章
              </h2>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className={`text-center p-4 rounded-xl ${
                      achievement.unlocked ? 'bg-gradient-to-br from-yellow-100 to-orange-100' : 'bg-gray-100 opacity-60'
                    }`}
                  >
                    <div className={`text-5xl mb-2 ${!achievement.unlocked && 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1">{achievement.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{achievement.description}</p>
                    <div className="flex items-center justify-center gap-1">
                      <Award size={16} className="text-yellow-500" />
                      <span className="text-sm font-semibold text-yellow-600">{achievement.points} 积分</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <CardContent className="py-8 text-center">
              <h3 className="text-2xl font-bold mb-2">学习数据总览</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-6">
                <div>
                  <div className="text-4xl font-bold">{progress.wordsLearned}</div>
                  <div className="text-white/80">词汇量</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">{progress.grammarCompleted}</div>
                  <div className="text-white/80">语法题</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">{progress.speakingPractice}</div>
                  <div className="text-white/80">口语练习</div>
                </div>
                <div>
                  <div className="text-4xl font-bold">{progress.listeningPractice}</div>
                  <div className="text-white/80">听力训练</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
