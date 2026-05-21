import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, X, Lightbulb, RotateCcw, Trophy } from 'lucide-react';
import { Card, CardContent } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { useLearnStore } from '../../stores/learnStore';
import { useProgressStore } from '../../stores/progressStore';
import { grammarData } from '../../data/courses';
import { GrammarRule } from '../../types/course';

interface Question {
  id: string;
  type: 'choice' | 'fill';
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
}

export const Grammar = () => {
  const { currentLanguage } = useLearnStore();
  const { updateProgress } = useProgressStore();
  const [grammarRules, setGrammarRules] = useState<GrammarRule[]>([]);
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const languageData = grammarData[currentLanguage]?.beginner || [];
    setGrammarRules(languageData);
    setCurrentRuleIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setIsAnswered(false);
    setCorrectCount(0);
    setTotalQuestions(0);
    setShowResults(false);
  }, [currentLanguage]);

  const currentRule = grammarRules[currentRuleIndex];

  const generateQuestions = (rule: GrammarRule): Question[] => {
    return rule.examples.map((example, index) => ({
      id: `${rule.id}-${index}`,
      type: 'choice' as const,
      question: `以下哪个选项的翻译最准确？`,
      options: [
        example.translation,
        ...rule.examples
          .filter((_, i) => i !== index)
          .slice(0, 2)
          .map((ex) => ex.translation),
      ].sort(() => Math.random() - 0.5),
      answer: example.translation,
      explanation: example.explanation || `正确翻译：${example.translation}`,
    }));
  };

  const questions = currentRule ? generateQuestions(currentRule) : [];
  const currentQuestion = questions[currentQuestionIndex];

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    setIsAnswered(true);
    const correct = selectedAnswer === currentQuestion.answer;
    setIsCorrect(correct);
    if (correct) {
      setCorrectCount(correctCount + 1);
      updateProgress('grammar', 1);
    }
    setTotalQuestions(totalQuestions + 1);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setIsAnswered(false);
    } else if (currentRuleIndex < grammarRules.length - 1) {
      setCurrentRuleIndex(currentRuleIndex + 1);
      setCurrentQuestionIndex(0);
      setSelectedAnswer('');
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  const handleRestart = () => {
    setCurrentRuleIndex(0);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setIsAnswered(false);
    setCorrectCount(0);
    setTotalQuestions(0);
    setShowResults(false);
  };

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Trophy className="text-white" size={48} />
          </motion.div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">练习完成！</h2>
          <div className="text-6xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent mb-4">
            {correctCount}/{totalQuestions}
          </div>
          <p className="text-gray-600 mb-8">
            正确率 {Math.round((correctCount / totalQuestions) * 100)}%
          </p>
          <div className="space-y-3">
            <Button onClick={handleRestart} className="w-full">
              再练一次
            </Button>
            <Button variant="secondary" onClick={() => window.location.href = '/learn'} className="w-full">
              返回学习中心
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentRule || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <a href="/learn" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft size={24} className="text-gray-600" />
              </a>
              <div>
                <h1 className="text-xl font-bold text-gray-800">语法练习</h1>
                <p className="text-sm text-gray-500">
                  {currentRule.title} - 第 {currentQuestionIndex + 1} 题
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500 font-semibold">{correctCount} 正确</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-500">{totalQuestions} 总计</span>
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
          <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <CardContent className="py-6">
              <h2 className="text-2xl font-bold mb-2">{currentRule.title}</h2>
              <p className="text-white/90">{currentRule.description}</p>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
          >
            <Card className="mb-6">
              <CardContent className="py-8">
                <p className="text-lg text-gray-700 mb-2">{currentQuestion.question}</p>
                <p className="text-xl font-semibold text-gray-800">
                  {grammarRules[currentRuleIndex].examples[currentQuestionIndex]?.original}
                </p>
              </CardContent>
            </Card>

            <div className="space-y-3 mb-8">
              {currentQuestion.options?.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    hover={!isAnswered}
                    onClick={() => handleSelectAnswer(option)}
                    className={`cursor-pointer transition-all ${
                      selectedAnswer === option
                        ? isAnswered
                          ? option === currentQuestion.answer
                            ? 'ring-4 ring-green-500 bg-green-50'
                            : 'ring-4 ring-red-500 bg-red-50'
                          : 'ring-4 ring-purple-500 bg-purple-50'
                        : isAnswered && option === currentQuestion.answer
                        ? 'ring-4 ring-green-500 bg-green-50'
                        : ''
                    }`}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            selectedAnswer === option
                              ? isAnswered
                                ? option === currentQuestion.answer
                                  ? 'bg-green-500 text-white'
                                  : 'bg-red-500 text-white'
                                : 'bg-purple-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-lg">{option}</span>
                        {isAnswered && option === currentQuestion.answer && (
                          <Check className="text-green-500 ml-auto" size={24} />
                        )}
                        {isAnswered && selectedAnswer === option && option !== currentQuestion.answer && (
                          <X className="text-red-500 ml-auto" size={24} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-8 p-6 rounded-xl ${
                    isCorrect ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    >
                      {isCorrect ? (
                        <Check className="text-white" size={24} />
                      ) : (
                        <X className="text-white" size={24} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                        {isCorrect ? '回答正确！' : '回答错误'}
                      </h3>
                      <div className="flex items-start gap-2 text-gray-700">
                        <Lightbulb size={20} className="text-yellow-500 mt-1 flex-shrink-0" />
                        <p>{currentQuestion.explanation}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-4">
              {!isAnswered ? (
                <Button
                  onClick={handleCheckAnswer}
                  disabled={!selectedAnswer}
                  className="flex-1"
                >
                  确认答案
                </Button>
              ) : (
                <Button onClick={handleNext} className="flex-1">
                  {currentQuestionIndex < questions.length - 1
                    ? '下一题'
                    : currentRuleIndex < grammarRules.length - 1
                    ? '下一语法'
                    : '完成'}
                </Button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
