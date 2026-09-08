<<<<<<< HEAD
import { useEffect, useState, useRef, useCallback, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  ShieldAlert,
  Maximize2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
  FileCheck2,
  Grid,
  X,
} from "lucide-react";
import { useApi } from "../api/api";
import { AuthContext } from "../context/authContext";
import FullScreenWarningModal from "../components/FullScreenWarningModal";

interface Question {
  _id?: string;
  question: string;
  options: string[];
  correctIndex?: number;
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
  const { user } = useContext(AuthContext);
  const isStudent = !user?.isAdmin && user?.role !== "admin";

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAlreadyAttempted, setIsAlreadyAttempted] = useState(false);

  // Exam flow states & Server Attempt
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasEnteredFullscreen, setHasEnteredFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showOverviewModal, setShowOverviewModal] = useState(false);

  // Per-question timer states
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const timerRef = useRef<any>(null);

  // Overall exam timer (for timerMode="overall")
  const [timerMode, setTimerMode] = useState<"per_question" | "overall">("per_question");
  const [overallTimeLeft, setOverallTimeLeft] = useState<number>(0);
  const overallTimerRef = useRef<any>(null);

  // Minimum time enforcement per question
  const [minTimePerQuestion, setMinTimePerQuestion] = useState<number>(0);
  const [timeSpentOnQuestion, setTimeSpentOnQuestion] = useState<number>(0);
  const minTimeRef = useRef<any>(null);

  const MAX_WARNINGS = 3;
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

  // Auto-save helper
  const triggerAutoSave = useCallback(
    async (currentAnswers: (number | null)[], qIdx: number, vCount: number) => {
      if (!attemptId || submitting) return;
      try {
        await api.patch(`/attempts/${attemptId}/save`, {
          answers: currentAnswers,
          currentQuestion: qIdx,
          violationCount: vCount,
        });
        setLastSavedTime(new Date().toLocaleTimeString());
      } catch (err) {
        console.warn("Auto-save sync error:", err);
      }
    },
    [api, attemptId, submitting]
  );

  // Periodic Auto-Save every 10 seconds
  useEffect(() => {
    if (!hasEnteredFullscreen || submitting || !attemptId) return;

    const interval = setInterval(() => {
      triggerAutoSave(answers, currentIndex, violationCount);
    }, 10000);

    return () => clearInterval(interval);
  }, [hasEnteredFullscreen, submitting, attemptId, answers, currentIndex, violationCount, triggerAutoSave]);

  // Fetch quiz details on mount
  useEffect(() => {
    let isMounted = true;

    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        if (!isMounted) return;

        if (isStudent && res.data.hasAttempted) {
          setIsAlreadyAttempted(true);
          setQuiz(res.data.data);
          return;
        }

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

        const endpoint = attemptId ? `/attempts/${attemptId}/submit` : `/quizzes/${id}/submit`;
        await api.post(endpoint, {
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
    [api, attemptId, id, navigate, submitting]
  );

  // Navigate to any question index (support for Next, Previous, and Direct Palette jumps)
  const navigateToQuestion = useCallback(
    (targetIdx: number) => {
      if (!quiz || targetIdx < 0 || targetIdx >= quiz.questions.length) return;

      const updatedAnswers = [...answers];
      if (selectedOption !== null) {
        updatedAnswers[currentIndex] = selectedOption;
        setAnswers(updatedAnswers);
      }

      setCurrentIndex(targetIdx);
      setSelectedOption(updatedAnswers[targetIdx] !== undefined ? updatedAnswers[targetIdx] : null);
      setTimeSpentOnQuestion(0);
      triggerAutoSave(updatedAnswers, targetIdx, violationCount);

      if (timerMode === "per_question") {
        const targetQ = quiz.questions[targetIdx];
        setTimeLeft(targetQ?.timeLimit || quiz.defaultTimeLimit || 30);
      }
    },
    [quiz, currentIndex, selectedOption, answers, triggerAutoSave, violationCount, timerMode]
  );

  // Go back to previous question
  const goToPreviousQuestion = useCallback(() => {
    if (currentIndex > 0) {
      navigateToQuestion(currentIndex - 1);
    }
  }, [currentIndex, navigateToQuestion]);

  // Advance to next question (or auto-submit on last)
  const advanceQuestion = useCallback(() => {
    if (!quiz) return;

    const updatedAnswers = [...answers];
    if (selectedOption !== null) {
      updatedAnswers[currentIndex] = selectedOption;
      setAnswers(updatedAnswers);
    }

    if (currentIndex + 1 >= quiz.questions.length) {
      handleFinalSubmit(updatedAnswers, violationCount, violations, "completed");
      return;
    }

    navigateToQuestion(currentIndex + 1);
  }, [quiz, currentIndex, selectedOption, answers, handleFinalSubmit, violationCount, violations, navigateToQuestion]);

  // Option selection handler with instant state and auto-save sync
  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    const updated = [...answers];
    updated[currentIndex] = idx;
    setAnswers(updated);
    triggerAutoSave(updated, currentIndex, violationCount);
  };

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

      // Auto-save violation
      triggerAutoSave(answers, currentIndex, updatedCount);

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
    [submitting, hasEnteredFullscreen, currentIndex, violationCount, violations, answers, handleFinalSubmit, triggerAutoSave]
  );

  // Enter fullscreen & initialize server attempt
  const requestFullscreenMode = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setHasEnteredFullscreen(true);

      // Initialize or resume attempt on the backend
      const res = await api.post(`/quizzes/${id}/start-attempt`);
      if (res.data.success) {
        const attemptData = res.data.data;
        setAttemptId(attemptData.attemptId);

        // Apply timerMode and overall/min time settings from server
        const serverTimerMode = attemptData.timerMode || "per_question";
        const serverMinTime = attemptData.minTimePerQuestion || 0;
        setTimerMode(serverTimerMode);
        setMinTimePerQuestion(serverMinTime);
        setTimeSpentOnQuestion(0);

        setQuiz((prev: any) => ({
          ...prev,
          title: attemptData.title || prev?.title,
          description: attemptData.description || prev?.description,
          questions: attemptData.questions,
        }));

        if (Array.isArray(attemptData.savedAnswers)) {
          setAnswers(attemptData.savedAnswers);
          const initIdx = attemptData.currentQuestion || 0;
          setSelectedOption(attemptData.savedAnswers[initIdx] !== undefined ? attemptData.savedAnswers[initIdx] : null);
        }
        if (typeof attemptData.currentQuestion === "number") {
          setCurrentIndex(attemptData.currentQuestion);
        }
        if (typeof attemptData.violationCount === "number") {
          setViolationCount(attemptData.violationCount);
        }

        const initialQ = attemptData.questions[attemptData.currentQuestion || 0];
        if (serverTimerMode === "per_question") {
          setTimeLeft(initialQ?.timeLimit || quiz?.defaultTimeLimit || 30);
        } else {
          // Overall timer: use remainingSeconds from server
          setOverallTimeLeft(attemptData.remainingSeconds || (attemptData.overallTimeLimit || 30) * 60);
        }
      }
    } catch (err: any) {
      console.warn("Fullscreen permission or attempt initialization error:", err);
      if (isStudent && err.response?.data?.hasAttempted) {
        setIsAlreadyAttempted(true);
      } else {
        const msg = err.response?.data?.message || "Failed to start secure quiz attempt.";
        setError(msg);
      }
      setHasEnteredFullscreen(false);
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

  // Per-question timer countdown (only in per_question mode)
  useEffect(() => {
    if (!hasEnteredFullscreen || submitting || warningModal.isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    if (timerMode !== "per_question") {
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
  }, [hasEnteredFullscreen, submitting, warningModal.isOpen, advanceQuestion, timerMode]);

  // Overall exam timer countdown (only in overall mode)
  useEffect(() => {
    if (!hasEnteredFullscreen || submitting || warningModal.isOpen) {
      if (overallTimerRef.current) clearInterval(overallTimerRef.current);
      return;
    }
    if (timerMode !== "overall" || overallTimeLeft <= 0) {
      if (overallTimerRef.current) clearInterval(overallTimerRef.current);
      return;
    }

    overallTimerRef.current = setInterval(() => {
      setOverallTimeLeft((prev) => {
        if (prev <= 1) {
          handleFinalSubmit(answers, violationCount, violations, "completed");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (overallTimerRef.current) clearInterval(overallTimerRef.current);
    };
  }, [hasEnteredFullscreen, submitting, warningModal.isOpen, timerMode, overallTimeLeft, answers, violationCount, violations, handleFinalSubmit]);

  // Min time per question counter
  useEffect(() => {
    if (!hasEnteredFullscreen || submitting) return;
    if (minTimePerQuestion <= 0) return;
    setTimeSpentOnQuestion(0);
    minTimeRef.current = setInterval(() => {
      setTimeSpentOnQuestion((prev) => prev + 1);
    }, 1000);
    return () => {
      if (minTimeRef.current) clearInterval(minTimeRef.current);
    };
  }, [hasEnteredFullscreen, submitting, currentIndex, minTimePerQuestion]);

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

  // Single-Attempt Enforcement Notice (Students Only)
  if (isAlreadyAttempted) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 sm:p-10 max-w-lg w-full border border-slate-200 shadow-2xl text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200 shadow-sm">
            <CheckCircle2 size={36} />
          </div>

          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            Single Attempt Enforced
          </span>

          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-3 mb-2">
            Assessment Already Completed
          </h2>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            You have already submitted your examination for <strong>{quiz?.title || "this assessment"}</strong>. Under Quizzy examination rules, each candidate is allowed only <strong>one attempt</strong>. Retakes are strictly disabled for students.
          </p>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 mb-6 text-left space-y-2">
            <p className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600" />
              Submission Recorded & Verified
            </p>
            <p>• Your answers, time, and proctoring logs are safely preserved.</p>
            <p>• Further submissions or retakes for this assessment are blocked for candidates.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate(`/result/${id}`)}
              className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <FileCheck2 size={16} /> View Submission Result
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </motion.div>
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
            <p>• You can <strong>check previous questions</strong>, preview upcoming questions, and review answers before final submission.</p>
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
  const timerPercentage = timerMode === "per_question"
    ? Math.max(0, (timeLeft / qTimeLimit) * 100)
    : Math.max(0, (overallTimeLeft / (overallTimeLeft + 1)) * 100); // Overall: not question-based progress
  const progressBarPct = quiz.questions.length > 0
    ? Math.round(((currentIndex + 1) / quiz.questions.length) * 100)
    : 0;
  const canAdvance = minTimePerQuestion <= 0 || timeSpentOnQuestion >= minTimePerQuestion;

  const formatTime = (secs: number) =>
    `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  const overallTimerColor =
    overallTimeLeft <= 60 ? "bg-red-950/60 border-red-600 text-red-400 animate-pulse" :
    overallTimeLeft <= 120 ? "bg-amber-950/60 border-amber-600 text-amber-400" :
    "bg-emerald-950/60 border-emerald-700 text-emerald-300";

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

        {/* Top bar indicators */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Overall Timer — shown only when timerMode=overall */}
          {timerMode === "overall" && (
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-sm font-black border ${overallTimerColor}`}>
              <Clock size={15} />
              <span>{formatTime(overallTimeLeft)}</span>
              <span className="text-[10px] font-bold opacity-70 ml-0.5">TOTAL</span>
            </div>
          )}

          {/* Auto-Save Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px]">{lastSavedTime ? `Auto-saved ${lastSavedTime}` : "Auto-save active"}</span>
          </div>

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

      {/* Progress Bar & Countdown Timer Bar */}
      <div className="w-full bg-slate-800 h-1.5">
        {/* In overall mode show question progress; in per_question show time progress */}
        <motion.div
          className={`h-full transition-all duration-300 ${
            timerMode === "per_question"
              ? timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-amber-500" : "bg-indigo-500"
              : "bg-indigo-500"
          }`}
          style={{ width: timerMode === "per_question" ? `${timerPercentage}%` : `${progressBarPct}%` }}
        />
      </div>

      {/* Question Quick-Navigation Palette Bar */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-8 pt-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-bold text-slate-400 shrink-0">Questions:</span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            {quiz.questions.map((_, idx) => {
              const isAnswered = answers[idx] !== null && answers[idx] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => navigateToQuestion(idx)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-400 font-black scale-105"
                      : isAnswered
                      ? "bg-emerald-600 text-white font-bold"
                      : "bg-slate-800 text-slate-400 border border-slate-700 hover:text-white hover:border-slate-500"
                  }`}
                  title={`Question ${idx + 1} (${isAnswered ? "Answered" : "Unanswered"}) - Click to preview`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowOverviewModal(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition shrink-0"
          title="Preview and review all questions"
        >
          <Grid size={13} className="text-indigo-400" />
          Preview All ({answers.filter((a) => a !== null && a !== undefined).length}/{quiz.questions.length})
        </button>
      </div>

      {/* Main Question Interface */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 max-w-4xl w-full mx-auto">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-slate-700/80 shadow-2xl overflow-hidden min-h-fit h-auto"
        >
          {/* Question Header & Countdown Badge */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black tracking-wider uppercase text-indigo-400 bg-indigo-950/60 border border-indigo-800 px-3 py-1 rounded-lg">
                Question {currentIndex + 1}
              </span>
              <span className="text-xs font-bold text-amber-300 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-lg flex items-center gap-1">
                ⭐ {currentQuestion.marks || quiz.marksPerQuestion || 1} {(currentQuestion.marks || quiz.marksPerQuestion || 1) === 1 ? "Mark" : "Marks"}
              </span>
            </div>

            {/* Per-question timer (only in per_question mode) */}
            {timerMode === "per_question" && (
              <div
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-sm font-black border ${timeLeft <= 5
                    ? "bg-red-950/60 border-red-600 text-red-400 animate-pulse"
                    : timeLeft <= 10
                      ? "bg-amber-950/60 border-amber-600 text-amber-400"
                      : "bg-indigo-950/60 border-indigo-700 text-indigo-300"
                  }`}
              >
                <Clock size={16} />
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Min time lock indicator */}
            {minTimePerQuestion > 0 && !canAdvance && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-violet-950/60 border border-violet-700 text-violet-300">
                <Clock size={13} />
                <span>Read time: {minTimePerQuestion - timeSpentOnQuestion}s left</span>
              </div>
            )}
          </div>

          {/* Question Text */}
          <div className="text-xl sm:text-2xl font-bold text-white leading-relaxed mb-8 break-words [overflow-wrap:anywhere] whitespace-pre-wrap max-w-full">
            {currentQuestion.question}
          </div>

          {/* Options Grid */}
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D...

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl border text-sm sm:text-base font-semibold transition-all flex items-center gap-4 min-w-0 ${isSelected
                      ? "bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-[1.01]"
                      : "bg-slate-900/60 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-500"
                    }`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${isSelected
                        ? "bg-white text-indigo-600"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                  >
                    {optionLetter}
                  </span>
                  <span className="flex-1 min-w-0 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Footer Action: Previous & Next/Submit */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-700/80 flex-wrap gap-3">
            <button
              type="button"
              onClick={goToPreviousQuestion}
              disabled={currentIndex === 0 || submitting}
              className="px-5 py-3 font-bold rounded-xl text-sm border border-slate-700 bg-slate-900/80 hover:bg-slate-700 text-slate-200 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2 transition"
            >
              <ArrowLeft size={16} />
              Previous Question
            </button>

            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              {canAdvance
                ? "You can review previous questions or advance."
                : `Please read for ${minTimePerQuestion - timeSpentOnQuestion}s more before advancing.`}
            </p>

            <button
              onClick={advanceQuestion}
              disabled={submitting || !canAdvance}
              className={`px-6 py-3 font-bold rounded-xl text-sm shadow-md flex items-center gap-2 transition ${
                canAdvance
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              {currentIndex + 1 === quiz.questions.length ? "Submit Exam" : "Next Question"}
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Candidate Question Overview & Preview Modal */}
      <AnimatePresence>
        {showOverviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-700 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Grid size={18} className="text-indigo-400" />
                    Questions Overview & Preview
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Click any question to jump to it and review your answer.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOverviewModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="py-3 px-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs shrink-0">
                <span className="text-slate-400">
                  Total: <strong className="text-white">{quiz.questions.length} Questions</strong>
                </span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Answered: {answers.filter((a) => a !== null && a !== undefined).length}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400 font-bold">
                    <span className="w-2 h-2 rounded-full bg-slate-500" />
                    Unanswered: {answers.filter((a) => a === null || a === undefined).length}
                  </span>
                </div>
              </div>

              {/* Scrollable Questions Grid */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
                {quiz.questions.map((q, idx) => {
                  const isAnswered = answers[idx] !== null && answers[idx] !== undefined;
                  const isCurrent = idx === currentIndex;

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        navigateToQuestion(idx);
                        setShowOverviewModal(false);
                      }}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-4 ${
                        isCurrent
                          ? "bg-indigo-950/60 border-indigo-500 ring-1 ring-indigo-400"
                          : isAnswered
                          ? "bg-slate-800/80 border-emerald-900/60 hover:border-emerald-500"
                          : "bg-slate-800/40 border-slate-700/80 hover:border-slate-500"
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <span
                          className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 ${
                            isCurrent
                              ? "bg-indigo-600 text-white"
                              : isAnswered
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm font-semibold text-slate-200 break-words [overflow-wrap:anywhere]">
                            {q.question}
                          </p>
                          <span className="text-[11px] text-amber-400/80 font-bold block mt-0.5">
                            ⭐ {q.marks || quiz.marksPerQuestion || 1} {((q.marks || quiz.marksPerQuestion || 1) === 1) ? "Mark" : "Marks"}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            isAnswered
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : "bg-slate-800 text-slate-400 border-slate-700"
                          }`}
                        >
                          {isAnswered ? "Answered" : "Not Answered"}
                        </span>
                        <button
                          type="button"
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                        >
                          Go
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end shrink-0">
                <button
                  type="button"
                  onClick={() => setShowOverviewModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition"
                >
                  Return to Exam
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Bar: Status */}
      <div className="px-6 py-3 border-t border-slate-800/80 bg-slate-950/80 text-center text-xs text-slate-500">
        Anti-Cheat Active • Full-Screen Monitored • All tab and window activities are logged
      </div>
=======
import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { XCircle, Clock } from "lucide-react";
import { useApi } from "../api/api";
import { useError } from "../context/ErrorContext";
import { AuthContext } from "../context/authContext";
import { useSuccess } from "../context/SuccessContext";

// Define the shape of a question
type Q = {
  _id?: string;
  question: string;
  options: string[];
  correctIndex: number;
};

// Define the shape of the quiz data
type QuizData = {
  title: string;
  questions: Q[];
};

// Helper function to format time from seconds to MM:SS
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

export default function TakeQuiz() {
  const { id } = useParams();
  const api = useApi();
  const { setErrors } = useError();
  const { addMessage } = useSuccess();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30); // Per-question time left in seconds
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [, setIsDevToolsModal] = useState(false);

  // Custom Modal for Alerts
  const CustomModal = ({
    isOpen,
    onClose,
    message,
    showCloseButton = true,
  }: {
    isOpen: boolean;
    onClose: () => void;
    message: string;
    showCloseButton?: boolean;
  }) => {
    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm w-full">
          <p className="text-lg font-semibold text-gray-800 mb-4">{message}</p>
          {showCloseButton && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200"
            >
              OK
            </button>
          )}
        </div>
      </div>
    );
  };

  // Disclaimer modal on initial load
  useEffect(() => {
    if (!loading) {
      setModalMessage(
        "Important: This is a timed quiz. Switching tabs or leaving this page will result in the quiz ending and the page refreshing. Inspecting the page is also disabled."
      );
      setShowModal(true);
    }
  }, [loading]);

  // Disable right-click & inspect
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J"].includes(e.key.toUpperCase())) ||
        (e.ctrlKey && e.key.toUpperCase() === "U")
      ) {
        e.preventDefault();
        setModalMessage("Inspecting is disabled!");
        setShowModal(true);
      }
    };
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate]);

  // Tab-switching protection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setModalMessage(
          "Warning: You left the quiz. The page will now refresh."
        );
        setShowModal(true);
        setTimeout(() => {
          window.location.reload();
        }, 3000); // Give user 3 seconds to read the warning before refresh
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Load quiz
  // Load quiz
  const loadQuiz = async () => {
    setErrors([]);

    // DevTools check
    const isDevToolsOpen = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      return widthThreshold || heightThreshold;
    };

    if (isDevToolsOpen()) {
      setModalMessage(
        "Developer tools detected! Please close them to start the quiz."
      );
      setIsDevToolsModal(true);
      setShowModal(true);
      setLoading(false);
      return;
    }

    try {
      const res = await api.get(`/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const quizData: QuizData = res.data.data;
      setQuiz(quizData);
      setAnswers(Array(quizData.questions.length).fill(null));
    } catch (err: any) {
      setErrors([err.response?.data?.message || "Failed to load quiz"]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadQuiz();
  }, [id, api, setErrors, token]);

  // Timer logic for each question
  useEffect(() => {
    if (loading || !quiz || showModal) return;

    if (timeLeft <= 0) {
      if (index < quiz.questions.length - 1) {
        setIndex((i) => i + 1);
        setTimeLeft(30); // Reset timer for next question
      } else {
        submitQuiz(answers);
      }
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, quiz, index, answers, showModal]);

  // Handle quiz submission
  const submitQuiz = async (finalAnswers: (number | null)[] = answers) => {
    try {
      const res = await api.post(
        `/quizzes/${id}/submit`,
        { answers: finalAnswers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      navigate(`/result/${id}`, {
        state: {
          score: res.data.score,
          title: res.data.title,
          total: res.data.total,
          answers: finalAnswers,
          quiz,
          details: res.data.details,
        },
      });
      addMessage("Quiz Submitted Sucessfully");
    } catch (err: any) {
      setErrors([err.response?.data?.message || "Failed to submit quiz"]);
    }
  };

  // Move to the next question or submit
  const next = async () => {
    if (index < (quiz?.questions.length ?? 0) - 1) {
      setIndex((i) => i + 1);
      setTimeLeft(30); // Reset timer for next question
    } else {
      await submitQuiz();
    }
  };

  // Handle option selection
  const chooseOption = (idx: number) => {
    const copy = [...answers];
    copy[index] = idx;
    setAnswers(copy);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-700 h-12 w-12 border-t-red-600 animate-spin"></div>
        <p className="ml-4 text-xl text-gray-400">Loading quiz...</p>
      </div>
    );

  if (!quiz || quiz.questions.length === 0)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900 p-4">
        <div className="max-w-xl mx-auto text-center p-8 bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          {/* Error Title */}
          <p className="text-2xl text-red-500 font-bold mb-6 flex items-center justify-center gap-2">
            <XCircle size={28} />
            Your developer tool detected
          </p>

          {/* Description */}
          <p className="text-gray-300 mb-8">
            Close the Developer tool to start the quiz. Please try
            again or go back to the homepage. Quiz Not Found or No Questions Available.
          </p>

          {/* Buttons */}
          <div className="flex justify-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-lg font-medium rounded-md shadow-lg hover:bg-red-700 transition-all duration-300"
            >
              Go Home
            </Link>
            <button
              onClick={loadQuiz}
              className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white text-lg font-medium rounded-md shadow-lg hover:bg-red-700 transition-all duration-300"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );

  const q = quiz.questions[index];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 sm:p-6 md:p-8 font-mono text-gray-200">
      <CustomModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message={modalMessage}
        showCloseButton={!modalMessage.includes("Warning")}
      />
      <motion.div
        className="max-w-3xl w-full bg-gray-800 rounded-lg shadow-2xl p-6 sm:p-8 md:p-8 border border-gray-700"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
      >
        <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            {quiz.title}
          </h2>
          <div className="flex items-center gap-2 text-red-500 font-semibold text-xl">
            <Clock size={24} />
            <p>{formatTime(timeLeft)}</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm text-gray-400 mb-2">
            Question <span className="font-bold text-red-500">{index + 1}</span>{" "}
            of{" "}
            <span className="font-bold text-red-500">
              {quiz.questions.length}
            </span>
          </p>
          <p className="text-lg sm:text-xl font-semibold text-gray-200">
            {q.question}
          </p>
        </div>

        <div className="space-y-4">
          {q.options.map((opt, i) => (
            <motion.button
              key={i}
              onClick={() => chooseOption(i)}
              className={`w-full text-left p-4 transition-all duration-200 transform hover:bg-gray-700 border border-gray-700 ${
                answers[index] === i
                  ? "bg-red-600 text-white shadow-md border-red-700"
                  : "bg-gray-800 text-gray-200"
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 flex items-center justify-center font-bold transition-colors duration-300 border-2 border-gray-600 ${
                    answers[index] === i
                      ? "bg-white text-red-600 border-white"
                      : "bg-gray-700 text-gray-400"
                  }`}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="flex-1 text-base sm:text-lg">{opt}</span>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-end mt-8">
          <motion.button
            onClick={next}
            className={`px-8 py-3 text-lg font-bold rounded-md shadow-lg transition-all duration-300 transform ${
              answers[index] === null
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-red-600 text-white hover:bg-red-700"
            }`}
            disabled={answers[index] === null}
          >
            {index < (quiz?.questions.length ?? 0) - 1
              ? "Next Question"
              : "Submit Quiz"}
          </motion.button>
        </div>
      </motion.div>
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
    </div>
  );
}
