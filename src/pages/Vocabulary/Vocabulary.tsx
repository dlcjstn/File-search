import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, RotateCcw, Check, BookOpen, Volume2 } from 'lucide-react';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLearnStore } from '../../stores/learnStore';
import { useProgressStore } from '../../stores/progressStore';
import { vocabularyData } from '../../data/courses';
import { VocabularyWord } from '../../types/course';

export const Vocabulary = () => {
  const { currentLanguage } = useLearnStore();
  const { updateProgress } = useProgressStore();
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedWords, setStudiedWords] = useState<Set<string>>(new Set());
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => {
    const languageData = vocabularyData[currentLanguage]?.beginner || [];
    setWords(languageData);
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [currentLanguage]);

  const currentWord = words[currentIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = (status: 'new' | 'learning' | 'mastered') => {
    if (!studiedWords.has(currentWord.id)) {
      setStudiedWords(new Set([...studiedWords, currentWord.id]));
      if (status === 'mastered') {
        updateProgress('vocabulary', 1);
      }
    }

    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      setShowComplete(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setStudiedWords(new Set());
    setShowComplete(false);
  };

  const speakWord = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage === 'english' ? 'en-US' : currentLanguage === 'japanese' ? 'ja-JP' : 'ko-KR';
    speechSynthesis.speak(utterance);
  };

  if (showComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Check className="text-white" size={48} />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">太棒了！</h2>
          <p className="text-gray-600 mb-8">
            您已完成本课学习
            <br />
            <span className="text-4xl font-bold text-green-500">{studiedWords.size}</span> 个单词
          </p>
          <div className="space-y-3">
            <Button onClick={handleRestart} className="w-full">
              再学一遍
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = '/learn'} className="w-full">
              返回学习中心
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/learn" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={24} className="text-gray-600" />
              </a>
              <div>
                <h1 className="text-xl font-bold text-gray-800">单词记忆</h1>
                <p className="text-sm text-gray-500">
                  {currentIndex + 1} / {words.length}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen size={20} className="text-accent-500" />
              <span className="text-gray-600">{studiedWords.size} 已学</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
                className="h-full bg-gradient-to-r from-accent-500 to-accent-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="max-w-2xl mx-auto"
          >
            <Card className="overflow-hidden">
              <div
                onClick={handleFlip}
                className="relative h-80 cursor-pointer perspective-1000"
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 w-full h-full"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 flex flex-col items-center justify-center p-8"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <span className="text-5xl font-bold text-white mb-4">{currentWord.word}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakWord(currentWord.word);
                      }}
                      className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
                    >
                      <Volume2 className="text-white" size={28} />
                    </button>
                    <p className="text-primary-100 mt-4">点击查看释义</p>
                  </div>

                  <div
                    className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <span className="text-4xl font-bold text-primary-500 mb-4">{currentWord.meaning}</span>
                    <p className="text-lg text-gray-600 mb-2 text-center">{currentWord.pronunciation}</p>
                    <div className="border-t border-gray-200 w-full my-4" />
                    <div className="text-center">
                      <p className="text-gray-800 italic mb-2">{currentWord.example}</p>
                      <p className="text-gray-500">{currentWord.exampleTranslation}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </Card>

            <div className="flex gap-4 mt-8">
              <Button
                variant="secondary"
                onClick={handleFlip}
                className="flex-1"
              >
                <RotateCcw size={20} />
                翻转
              </Button>
            </div>

            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => handleNext('new')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600"
              >
                认识
              </Button>
              <Button
                onClick={() => handleNext('learning')}
                className="flex-1 bg-gradient-to-r from-yellow-500 to-yellow-600"
              >
                再想想
              </Button>
              <Button
                onClick={() => handleNext('mastered')}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600"
              >
                <Check size={20} />
                掌握
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
