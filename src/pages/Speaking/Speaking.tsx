import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic, Square, Play, Volume2, Star } from 'lucide-react';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLearnStore } from '../../stores/learnStore';
import { useProgressStore } from '../../stores/progressStore';

const speakingScenes = [
  {
    id: 'greeting',
    title: '日常问候',
    scenarios: [
      {
        id: '1',
        speaker: 'A',
        text: 'Hello! How are you today?',
        translation: '你好！今天怎么样？',
        difficulty: 1,
      },
      {
        id: '2',
        speaker: 'B',
        text: "I'm doing great, thank you! And you?",
        translation: '我很好，谢谢！你呢？',
        difficulty: 1,
      },
    ],
  },
  {
    id: 'shopping',
    title: '购物场景',
    scenarios: [
      {
        id: '3',
        speaker: 'A',
        text: 'How much does this cost?',
        translation: '这个多少钱？',
        difficulty: 2,
      },
      {
        id: '4',
        speaker: 'B',
        text: "It's twenty dollars.",
        translation: '二十美元。',
        difficulty: 2,
      },
    ],
  },
  {
    id: 'restaurant',
    title: '餐厅用餐',
    scenarios: [
      {
        id: '5',
        speaker: 'A',
        text: 'Can I see the menu, please?',
        translation: '请给我看一下菜单好吗？',
        difficulty: 3,
      },
      {
        id: '6',
        speaker: 'B',
        text: 'Of course, here you are.',
        translation: '当然，给您。',
        difficulty: 3,
      },
    ],
  },
];

export const Speaking = () => {
  const { currentLanguage } = useLearnStore();
  const { updateProgress } = useProgressStore();
  const [currentSceneIndex, setCurrentScenarioIndex] = useState(0);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const scene = speakingScenes[currentSceneIndex];
  const currentDialog = scene?.scenarios[currentScenario];

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      setScore(null);
      setShowResult(false);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('无法访问麦克风:', error);
      alert('请允许麦克风权限以使用此功能');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsRecording(false);
    setHasRecording(true);
    simulateScore();
  };

  const simulateScore = () => {
    setTimeout(() => {
      const randomScore = Math.floor(Math.random() * 3) + 3;
      setScore(randomScore);
      setShowResult(true);
      updateProgress('speaking', 1);
    }, 1000);
  };

  const playOriginal = () => {
    const utterance = new SpeechSynthesisUtterance(currentDialog.text);
    utterance.lang = 'en-US';
    speechSynthesis.speak(utterance);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentScenario < scene.scenarios.length - 1) {
      setCurrentScenario(currentScenario + 1);
    } else if (currentSceneIndex < speakingScenes.length - 1) {
      setCurrentScenarioIndex(currentSceneIndex + 1);
      setCurrentScenario(0);
    } else {
      setCurrentScenarioIndex(0);
      setCurrentScenario(0);
    }
    setHasRecording(false);
    setScore(null);
    setShowResult(false);
    setRecordingTime(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <a href="/learn" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={24} className="text-gray-600" />
            </a>
            <div>
              <h1 className="text-xl font-bold text-gray-800">口语跟读</h1>
              <p className="text-sm text-gray-500">{scene?.title}</p>
            </div>
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
            <div className="h-2 bg-gradient-to-r from-pink-500 to-rose-500" />
            <CardContent className="py-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 text-pink-700 rounded-full mb-4">
                  <span className="font-semibold">{currentDialog?.speaker}</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">{currentDialog?.text}</h2>
                <p className="text-xl text-gray-600">{currentDialog?.translation}</p>
                <button
                  onClick={playOriginal}
                  className="mt-4 p-3 bg-pink-100 rounded-full hover:bg-pink-200 transition-colors"
                >
                  <Volume2 className="text-pink-600" size={28} />
                </button>
              </div>

              <div className="flex flex-col items-center">
                <motion.div
                  animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className={`w-32 h-32 rounded-full flex items-center justify-center mb-6 ${
                    isRecording
                      ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                      : hasRecording
                      ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                      : 'bg-gray-200'
                  }`}
                >
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className="w-full h-full rounded-full flex items-center justify-center"
                  >
                    {isRecording ? (
                      <Square className="text-white" size={40} fill="white" />
                    ) : hasRecording ? (
                      <Play className="text-white ml-1" size={40} />
                    ) : (
                      <Mic className="text-gray-500" size={40} />
                    )}
                  </button>
                </motion.div>

                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-2xl font-bold text-pink-600 mb-4"
                  >
                    {formatTime(recordingTime)}
                  </motion.div>
                )}

                <p className="text-gray-500">
                  {isRecording ? '点击停止录音' : hasRecording ? '点击回放' : '点击开始录音'}
                </p>
              </div>

              {showResult && score !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 p-6 bg-white rounded-xl shadow-lg"
                >
                  <h3 className="text-xl font-bold text-gray-800 text-center mb-4">发音评分</h3>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={32}
                        className={star <= score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <p className="text-center text-gray-600 mb-4">
                    {score >= 4
                      ? '太棒了！发音非常标准！'
                      : score >= 3
                      ? '不错！继续练习会更好！'
                      : '加油！多听几遍原声再试试！'}
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={playOriginal} variant="secondary" className="flex-1">
                      再听一遍
                    </Button>
                    <Button onClick={startRecording} className="flex-1">
                      重新录音
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="flex gap-4">
          <Button variant="secondary" onClick={handleNext} className="flex-1">
            下一句
          </Button>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">场景选择</h3>
          <div className="grid grid-cols-3 gap-4">
            {speakingScenes.map((s, index) => (
              <Card
                key={s.id}
                hover={true}
                onClick={() => {
                  setCurrentScenarioIndex(index);
                  setCurrentScenario(0);
                  setHasRecording(false);
                  setScore(null);
                  setShowResult(false);
                }}
                className={`cursor-pointer ${
                  currentSceneIndex === index ? 'ring-4 ring-pink-500' : ''
                }`}
              >
                <CardContent className="text-center py-4">
                  <p className="font-semibold text-gray-800">{s.title}</p>
                  <p className="text-sm text-gray-500">{s.scenarios.length} 句</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
