import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ShieldAlert, Maximize2, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { useApi } from "../api/api";
import FullScreenWarningModal from "../components/FullScreenWarningModal";

interface Question {
  _id?: string;
  question: string;
  options: string[];
  correctIndex: number;
  timeLimit?: number;
  marks?: number;
}

interface QuizData {
  _id: string;
  title: string;
  description?: string;
  status: "draft" | "active" | "ended";
  defaultTimeLimit: number;
  marksPerQuestion: number;
  questions: Question[];
}

export default function TakeQuiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useApi();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Exam flow states
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Per-question timer states
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const timerRef = useRef<any>(null);

  // Anti-cheat violation tracking
  const [violationCount, setViolationCount] = useState(0);
  const [violations, setViolations] = useState<string[]>([]);
  const [warningModal, setWarningModal] = useState<{
    isOpen: boolean;
    type: "fullscreen" | "tab_switch" | "critical";
    message: string;
  }>({
    isOpen: false,
    type: "fullscreen",
    message: "",
  });

  const MAX_WARNINGS = 3;

  // Fetch quiz details on mount
  useEffect(() => {
    let isMounted = true;

    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        if (!isMounted) return;
        const q: QuizData = res.data.data;
        setQuiz(q);

        // If quiz is not started yet (draft), route user to Waiting Room
        if (q.status === "draft") {
          navigate(`/waiting/${id}`);
          return;
        }

        if (q.status === "ended") {
          setError("This quiz has already been ended by the Admin.");
          return;
        }

        // Initialize empty answers array
        setAnswers(new Array(q.questions.length).fill(null));
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Failed to load quiz.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchQuiz();

    return () => {
      isMounted = false;
    };
  }, [id, navigate, api]);

  // Submit quiz helper
  const handleFinalSubmit = useCallback(
    async (
      finalAnswers: (number | null)[],
      finalViolationCount: number,
      finalViolations: string[],
      status: "completed" | "terminated_violations" = "completed"
    ) => {
      if (submitting) return;
      setSubmitting(true);

      if (timerRef.current) clearInterval(timerRef.current);

      try {
        // Exit fullscreen smoothly if active
        if (document.fullscreenElement) {
          try {
            await document.exitFullscreen();
          } catch {
            // ignore
          }
        }

        await api.post(`/quizzes/${id}/submit`, {
          answers: finalAnswers,
          violationCount: finalViolationCount,
          violations: finalViolations,
          status,
        });

        navigate(`/result/${id}`);
      } catch (err: any) {
        console.error("Submission failed:", err);
        // Fallback route to result
        navigate(`/result/${id}`);
      }
    },
    [api, id, navigate, submitting]
  );

  // Advance to next question (auto or manual)
  const advanceQuestion = useCallback(() => {
    if (!quiz) return;

    // 1. Record current answer
    const currentQAns = selectedOption;
    const updatedAnswers = [...answers];
    updatedAnswers[currentIndex] = currentQAns;
    setAnswers(updatedAnswers);
    setSelectedOption(null);

    // 2. If this was the last question, auto-submit
    if (currentIndex + 1 >= quiz.questions.length) {
      handleFinalSubmit(updatedAnswers, violationCount, violations, "completed");
      return;
    }

    // 3. Move forward
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);

    // 4. Reset per-question countdown
    const nextQ = quiz.questions[nextIdx];
    const qTime = nextQ?.timeLimit || quiz.defaultTimeLimit || 30;
    setTimeLeft(qTime);
  }, [quiz, currentIndex, selectedOption, answers, handleFinalSubmit, violationCount, violations]);

  // Handle recorded violation
  const recordViolation = useCallback(
    (reason: string, type: "fullscreen" | "tab_switch") => {
      if (submitting || !hasEnteredFullscreen) return;

      const timestamp = new Date().toLocaleTimeString();
      const violationEntry = `${timestamp}: ${reason} (Q${currentIndex + 1})`;

      const updatedCount = violationCount + 1;
      const updatedViolations = [...violations, violationEntry];

      setViolationCount(updatedCount);
      setViolations(updatedViolations);

      if (updatedCount >= MAX_WARNINGS) {
        setWarningModal({
          isOpen: true,
          type: "critical",
          message: `Maximum allowed warnings (${MAX_WARNINGS}) reached. Quiz will be terminated immediately.`,
        });

        setTimeout(() => {
          handleFinalSubmit(answers, updatedCount, updatedViolations, "terminated_violations");
        }, 2200);
      } else {
        setWarningModal({
          isOpen: true,
          type,
          message: `${reason}. Warning ${updatedCount} of ${MAX_WARNINGS}. Leaving the quiz again will terminate your attempt.`,
        });
      }
    },
    [submitting, hasEnteredFullscreen, currentIndex, violationCount, violations, answers, handleFinalSubmit]
  );

  // Enter fullscreen request
  const requestFullscreenMode = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setHasEnteredFullscreen(true);

      // Start initial timer for question 1
      if (quiz) {
        const firstQ = quiz.questions[0];
        setTimeLeft(firstQ?.timeLimit || quiz.defaultTimeLimit || 30);
      }
    } catch (err) {
      console.warn("Fullscreen permission denied or not supported:", err);
      // Allow proceeding even if browser restricted programmatic fullscreen
      setHasEnteredFullscreen(true);
    }
  };

  // Restore fullscreen button from modal
  const restoreFullscreen = async () => {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // quiet
    }
    setWarningModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Timer countdown loop
  useEffect(() => {
    if (!hasEnteredFullscreen || submitting || warningModal.isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          advanceQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [hasEnteredFullscreen, submitting, warningModal.isOpen, advanceQuestion]);

  // Anti-cheat event listeners (Fullscreen Exit & Tab Switch / Blur)
  useEffect(() => {
    if (!hasEnteredFullscreen || submitting) return;

    // 1. Fullscreen change listener
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordViolation("Exited Full-Screen Mode", "fullscreen");
      }
    };

    // 2. Tab switch (visibility change) listener
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation("Switched browser tab or minimized window", "tab_switch");
      }
    };

    // 3. Window blur listener (switching to another desktop application)
    const handleWindowBlur = () => {
      recordViolation("Lost focus / Switched to external application", "tab_switch");
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [hasEnteredFullscreen, submitting, recordViolation]);

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center">
        <RefreshCw size={36} className="animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-gray-600">Setting up secure examination environment...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-xl max-w-md w-full text-center">
          <ShieldAlert size={44} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Examination Notice</h2>
          <p className="text-sm text-gray-600 mb-6">{error || "Quiz not found."}</p>
          <button
            onClick={() => navigate("/list")}
            className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm"
          >
            Back to Quiz List
          </button>
        </div>
      </div>
    );
  }

  // Pre-Quiz Fullscreen Prompt
  if (!hasEnteredFullscreen) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full border border-slate-200 shadow-2xl text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Maximize2 size={32} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
            Ready to Begin?
          </h1>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            You are about to start <strong>{quiz.title}</strong>. This assessment requires uninterrupted focus.
          </p>

          <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-left text-xs text-amber-900 mb-6 space-y-2">
            <p className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
              <AlertCircle size={16} /> Examination Rules:
            </p>
            <p>• The quiz will open in <strong>Full-Screen Mode</strong>.</p>
            <p>• Tab switching, minimizing, or window switching will trigger warnings.</p>
            <p>• <strong>{MAX_WARNINGS} violations</strong> will automatically fail and submit your quiz.</p>
            <p>• Each question has its own countdown timer. When time expires, answers auto-advance.</p>
            <p>• You <strong>cannot go back</strong> to previous questions.</p>
          </div>

          <button
            onClick={requestFullscreenMode}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg shadow-indigo-200 text-base flex items-center justify-center gap-2 transition"
          >
            <Maximize2 size={20} />
            Enter Full-Screen & Start Quiz
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentIndex];
  const qTimeLimit = currentQuestion?.timeLimit || quiz.defaultTimeLimit || 30;
  const timerPercentage = Math.max(0, (timeLeft / qTimeLimit) * 100);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between select-none">
      {/* Anti-Cheat Fullscreen Warning Modal */}
      <FullScreenWarningModal
        isOpen={warningModal.isOpen}
        type={warningModal.type}
        warningCount={violationCount}
        maxWarnings={MAX_WARNINGS}
        message={warningModal.message}
        onRestoreFullscreen={restoreFullscreen}
      />

      {/* Top Bar: Distraction-free Header */}
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-black text-sm">
            Q
          </span>
          <span className="font-bold text-sm text-slate-200 truncate max-w-xs sm:max-w-md">
            {quiz.title}
          </span>
        </div>

        {/* Warning Indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-800 border border-slate-700">
            <ShieldAlert size={14} className={violationCount > 0 ? "text-amber-400" : "text-emerald-400"} />
            <span className="text-slate-300">
              Warnings: <strong className={violationCount > 0 ? "text-amber-400" : "text-emerald-400"}>{violationCount}</strong> / {MAX_WARNINGS}
            </span>
          </div>

          {/* Question Index Badge */}
          <span className="text-xs font-bold text-slate-400">
            Question <strong className="text-white">{currentIndex + 1}</strong> of {quiz.questions.length}
          </span>
        </div>
      </div>

      {/* Progress & Countdown Timer Bar */}
      <div className="w-full bg-slate-800 h-1.5">
        <motion.div
          className={`h-full transition-all duration-300 ${
            timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-amber-500" : "bg-indigo-500"
          }`}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>

      {/* Main Question Interface */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 max-w-4xl w-full mx-auto">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-slate-700/80 shadow-2xl"
        >
          {/* Question Header & Countdown Badge */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
            <span className="text-xs font-black tracking-wider uppercase text-indigo-400 bg-indigo-950/60 border border-indigo-800 px-3 py-1 rounded-lg">
              Question {currentIndex + 1}
            </span>

            {/* Circular / Pill Countdown Timer */}
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-sm font-black border ${
                timeLeft <= 5
                  ? "bg-red-950/60 border-red-600 text-red-400 animate-pulse"
                  : timeLeft <= 10
                  ? "bg-amber-950/60 border-amber-600 text-amber-400"
                  : "bg-indigo-950/60 border-indigo-700 text-indigo-300"
              }`}
            >
              <Clock size={16} />
              <span>{String(Math.floor(timeLeft / 60)).padStart(2, "0")}:{String(timeLeft % 60).padStart(2, "0")}</span>
            </div>
          </div>

          {/* Question Text */}
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-8">
            {currentQuestion.question}
          </h2>

          {/* Options Grid */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D...

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm sm:text-base font-semibold transition-all flex items-center gap-4 ${
                    isSelected
                      ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-[1.01]"
                      : "bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500"
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      isSelected
                        ? "bg-white text-indigo-600"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {optionLetter}
                  </span>
                  <span className="flex-1">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/80">
            <p className="text-xs text-slate-400 font-medium">
              Answer is locked upon moving forward.
            </p>

            <button
              onClick={advanceQuestion}
              disabled={submitting}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              {currentIndex + 1 === quiz.questions.length ? "Submit Exam" : "Next Question"}
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar: Status */}
      <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/80 text-center text-xs text-slate-500">
        Anti-Cheat Active • Full-Screen Monitored • All tab and window activities are logged
      </div>
    </div>
  );
}
