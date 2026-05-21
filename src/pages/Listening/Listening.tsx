import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, Pause, RotateCcw, Volume2, Settings } from 'lucide-react';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLearnStore } from '../../stores/learnStore';
import { useProgressStore } from '../../stores/progressStore';

const listeningMaterials = [
  {
    id: '1',
    title: '日常对话：自我介绍',
    description: '学习如何用英语介绍自己',
    duration: '1:30',
    level: '入门',
    transcript: "Hello, my name is John. I'm from New York. I'm a student at Harvard University. I study computer science. I love playing basketball and reading books. Nice to meet you!",
    translation: '你好，我叫约翰。我来自纽约。我是哈佛大学的学生。我学计算机科学。我喜欢打篮球和读书。很高兴认识你！',
  },
  {
    id: '2',
    title: '机场广播',
    description: '听懂机场常见的英语广播',
    duration: '2:00',
    level: '入门',
    transcript: "Welcome to London Heathrow Airport. Flight BA 123 to Paris is now boarding at gate 15. Please have your boarding pass ready. This is the final call for passengers traveling to Paris.",
    translation: '欢迎来到伦敦希思罗机场。飞往巴黎的BA123航班正在15号登机口登机。请准备好您的登机牌。这是前往巴黎旅客的最后登机通知。',
  },
  {
    id: '3',
    title: '餐厅点餐',
    description: '在餐厅用英语点餐的实用对话',
    duration: '2:30',
    level: '中级',
    transcript: "Good evening, welcome to La Maison. Do you have a reservation? Yes, a table for two under the name Smith. Excellent, right this way please. Could I start you off with something to drink? I'll have a glass of red wine, please.",
    translation: '晚上好，欢迎光临拉梅森餐厅。请问您有预约吗？是的，史密斯先生，两位。太好了，请这边走。我先给您上点喝的好吗？请给我一杯红酒。',
  },
  {
    id: '4',
    title: '天气预报',
    description: '听懂英语天气预报',
    duration: '1:45',
    level: '中级',
    transcript: "Tomorrow's weather forecast shows sunny skies in the morning with clouds increasing in the afternoon. The high will be 72 degrees Fahrenheit, and the low will be 58 degrees. There is a 30 percent chance of rain in the evening.",
    translation: '明天的天气预报显示，上午天气晴朗，下午云量增加。最高温度将是72华氏度，最低温度是58华氏度。晚上有30%的降雨概率。',
  },
];

const speeds = [0.5, 0.75, 1.0, 1.25, 1.5];

export const Listening = () => {
  const { currentLanguage } = useLearnStore();
  const { updateProgress } = useProgressStore();
  const [currentMaterialIndex, setCurrentMaterialIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speed, setSpeed] = useState(1.0);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<string>('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const material = listeningMaterials[currentMaterialIndex];

  const playAudio = () => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(material.transcript);
    utterance.lang = 'en-US';
    utterance.rate = speed;
    utteranceRef.current = utterance;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => {
      setIsPlaying(false);
      setShowQuiz(true);
      updateProgress('listening', 1);
    };
    utterance.onboundary = () => {
      setCurrentTime((prev) => prev + 0.1);
    };

    speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (isPlaying) {
      speechSynthesis.cancel();
      playAudio();
    }
  };

  const handleQuizSubmit = () => {
    const answer = quizAnswer.toLowerCase().trim();
    const correct = material.transcript.toLowerCase().includes(answer) || answer.length > 5;
    setIsCorrect(correct);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/learn" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={24} className="text-gray-600" />
              </a>
              <div>
                <h1 className="text-xl font-bold text-gray-800">听力训练</h1>
                <p className="text-sm text-gray-500">{material.title}</p>
              </div>
            </div>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Settings size={24} className="text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-indigo-500 to-purple-500" />
            <CardContent className="py-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{material.title}</h2>
                <p className="text-gray-600">{material.description}</p>
                <div className="flex items-center justify-center gap-4 mt-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm">
                    {material.level}
                  </span>
                  <span className="text-gray-500">{material.duration}</span>
                </div>
              </div>

              <div className="flex flex-col items-center mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={playAudio}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-xl"
                >
                  {isPlaying ? (
                    <Pause className="text-white" size={40} fill="white" />
                  ) : (
                    <Play className="text-white ml-1" size={40} fill="white" />
                  )}
                </motion.button>
                <p className="mt-4 text-gray-600">
                  {isPlaying ? '点击暂停' : '点击播放音频'}
                </p>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                  <span>播放速度</span>
                  <span>{speed}x</span>
                </div>
                <div className="flex gap-2">
                  {speeds.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSpeedChange(s)}
                      className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                        speed === s
                          ? 'bg-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {showTranscript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-gray-50 rounded-lg"
                >
                  <h3 className="font-bold text-gray-800 mb-2">原文</h3>
                  <p className="text-gray-700">{material.transcript}</p>
                </motion.div>
              )}

              {showTranslation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-blue-50 rounded-lg"
                >
                  <h3 className="font-bold text-blue-800 mb-2">译文</h3>
                  <p className="text-blue-700">{material.translation}</p>
                </motion.div>
              )}

              <div className="flex gap-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowTranslation(!showTranslation)}
                  className="flex-1"
                >
                  <Volume2 size={20} />
                  {showTranslation ? '隐藏译文' : '显示译文'}
                </Button>
                <Button variant="secondary" onClick={stopAudio} className="flex-1">
                  <RotateCcw size={20} />
                  重播
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {showQuiz && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="py-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">听力理解测验</h3>
                <p className="text-gray-600 mb-4">
                  请用英语回答：这段音频主要讲了什么？
                </p>
                <textarea
                  value={quizAnswer}
                  onChange={(e) => setQuizAnswer(e.target.value)}
                  placeholder="在这里输入你的答案..."
                  className="w-full h-32 p-4 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
                />
                <Button onClick={handleQuizSubmit} className="mt-4 w-full">
                  提交答案
                </Button>
                {isCorrect !== null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`mt-4 p-4 rounded-lg ${
                      isCorrect ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    <p className="font-semibold">
                      {isCorrect ? '太棒了！回答正确！' : '继续加油！参考答案：'}
                    </p>
                    {!isCorrect && (
                      <p className="mt-2 text-sm">{material.translation}</p>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">听力材料</h3>
          <div className="grid gap-4">
            {listeningMaterials.map((m, index) => (
              <Card
                key={m.id}
                hover={true}
                onClick={() => {
                  setCurrentMaterialIndex(index);
                  stopAudio();
                  setShowQuiz(false);
                  setQuizAnswer('');
                  setIsCorrect(null);
                }}
                className={`cursor-pointer ${
                  currentMaterialIndex === index ? 'ring-4 ring-indigo-500' : ''
                }`}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{m.title}</h4>
                      <p className="text-sm text-gray-500">{m.description}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-sm">
                        {m.level}
                      </span>
                      <span className="text-gray-500">{m.duration}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
