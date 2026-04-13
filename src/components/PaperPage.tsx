import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Clock,
  Star,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Share2,
  BookmarkPlus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { PaperArtwork } from "./PaperArtwork";

interface PaperPageProps {
  paperId: Id<"papers">;
  onBack: () => void;
}

export function PaperPage({ paperId, onBack }: PaperPageProps) {
  const data = useQuery(api.papers.getWithProgress, { id: paperId });
  const startPaper = useMutation(api.progress.startPaper);
  const updateProgress = useMutation(api.progress.updateProgress);
  const submitQuiz = useMutation(api.progress.submitQuiz);
  const generateNodes = useMutation(api.knowledge.generateNodesFromPaper);

  const [showKeyLearnings, setShowKeyLearnings] = useState(false);
  const [quizMode, setQuizMode] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [quizComplete, setQuizComplete] = useState(false);

  useEffect(() => {
    if (data?.paper && !data.progress) {
      startPaper({ paperId });
    }
  }, [data, paperId, startPaper]);

  useEffect(() => {
    // Simulate reading progress
    if (data?.paper && !quizMode && data.progress?.progress !== 100) {
      const interval = setInterval(() => {
        const newProgress = Math.min((data.progress?.progress || 0) + 10, 100);
        updateProgress({ paperId, progress: newProgress });
        if (newProgress >= 100) {
          clearInterval(interval);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [data, quizMode, paperId, updateProgress]);

  const handleShare = async () => {
    if (navigator.share && data?.paper) {
      await navigator.share({
        title: data.paper.title,
        text: `Check out this research paper on MedLoop: ${data.paper.title}`,
        url: window.location.href,
      });
    }
  };

  const handleAnswerSelect = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const question = data?.questions?.[currentQuestion];
    if (question && index === question.correctIndex) {
      setCorrectAnswers((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!data?.questions) return;

    if (currentQuestion < data.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz complete
      setQuizComplete(true);
      const score = Math.round((correctAnswers / data.questions.length) * 100);
      submitQuiz({ paperId, score });
      generateNodes({ paperId });
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </div>
    );
  }

  const { paper, progress, questions } = data;

  if (!paper) {
    return (
      <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center">
        <p className="text-gray-400">Paper not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a12]">
      {/* Hero */}
      <div className="relative h-64 md:h-80">
        <div className="absolute inset-0 opacity-50">
          <PaperArtwork specialty={paper.specialty} size="large" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a12] via-[#0a0a12]/50 to-transparent" />

        {/* Navigation */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors">
              <BookmarkPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress?.progress || 0}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pb-32 -mt-20 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs font-medium rounded-full border border-purple-500/30">
            {paper.specialty}
          </span>
          <span className="px-2.5 py-1 bg-white/10 text-gray-300 text-xs font-medium rounded-full">
            {paper.difficulty}
          </span>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
          {paper.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {paper.readTime} min read
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="w-4 h-4" />
            {paper.citations} citations
          </div>
          <span>Published {paper.publishedDate}</span>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {paper.authors.map((author: string, i: number) => (
            <span key={i} className="text-gray-400 text-sm">
              {author}{i < paper.authors.length - 1 ? "," : ""}
            </span>
          ))}
        </div>

        {/* Abstract */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Abstract</h2>
          <p className="text-gray-300 leading-relaxed">{paper.abstract}</p>
        </div>

        {/* Key Learnings Dropdown */}
        <button
          onClick={() => setShowKeyLearnings(!showKeyLearnings)}
          className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-6 flex items-center justify-between text-left hover:bg-white/8 transition-colors"
        >
          <span className="text-white font-medium">Key Learnings ({paper.keyLearnings.length})</span>
          {showKeyLearnings ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        <AnimatePresence>
          {showKeyLearnings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6"
            >
              <div className="space-y-3">
                {paper.keyLearnings.map((learning: string, i: number) => (
                  <div
                    key={i}
                    className="flex gap-3 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl"
                  >
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-purple-300 text-sm font-medium">{i + 1}</span>
                    </div>
                    <p className="text-gray-200 text-sm">{learning}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Source Link */}
        <a
          href={paper.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-transparent border border-white/20 text-white font-medium rounded-xl hover:bg-white/5 transition-all mb-6"
        >
          <ExternalLink className="w-5 h-5" />
          View Original Paper
        </a>

        {/* Quiz Section */}
        {!quizMode && progress?.progress === 100 && questions && questions.length > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setQuizMode(true)}
            className="w-full py-4 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-purple-500 hover:to-indigo-500 transition-all"
          >
            Take Quiz ({questions.length} questions)
          </motion.button>
        )}

        {/* Quiz Mode */}
        {quizMode && questions && !quizComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400 text-sm">
                Question {currentQuestion + 1} of {questions.length}
              </span>
              <div className="flex gap-1">
                {questions.map((_: unknown, i: number) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < currentQuestion
                        ? "bg-purple-500"
                        : i === currentQuestion
                        ? "bg-white"
                        : "bg-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-6">
              {questions[currentQuestion].question}
            </h3>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option: string, i: number) => {
                const isCorrect = i === questions[currentQuestion].correctIndex;
                const isSelected = selectedAnswer === i;

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(i)}
                    disabled={showResult}
                    className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${
                      showResult
                        ? isCorrect
                          ? "bg-green-500/20 border-green-500/50 border"
                          : isSelected
                          ? "bg-red-500/20 border-red-500/50 border"
                          : "bg-white/5 border border-white/10"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {showResult && isCorrect && (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    <span className={showResult && isCorrect ? "text-green-300" : "text-white"}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {showResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6"
              >
                <p className="text-gray-300 text-sm mb-4">
                  {questions[currentQuestion].explanation}
                </p>
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3 px-4 bg-transparent border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all"
                >
                  {currentQuestion < questions.length - 1 ? "Next Question" : "See Results"}
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Quiz Complete */}
        {quizComplete && questions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30 rounded-xl p-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Quiz Complete!</h3>
            <p className="text-gray-300 mb-4">
              You scored {correctAnswers} out of {questions.length}
            </p>
            <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400 mb-6">
              {Math.round((correctAnswers / questions.length) * 100)}%
            </div>
            <button
              onClick={onBack}
              className="py-3 px-6 bg-transparent border border-white/20 text-white font-semibold rounded-xl hover:bg-white/5 transition-all"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="fixed bottom-4 left-0 right-0 text-center">
        <p className="text-gray-700 text-xs">
          Requested by @web-user · Built by @clonkbot
        </p>
      </div>
    </div>
  );
}
