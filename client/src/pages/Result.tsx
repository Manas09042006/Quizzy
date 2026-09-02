import { useEffect, useState, useContext } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Home,
  RotateCcw,
  LayoutDashboard,
  Trophy,
  Award,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Lock,
  Eye,
} from "lucide-react";
import { useApi } from "../api/api";
import { AuthContext } from "../context/authContext";

interface QuestionResult {
  question: string;
  options: string[];
  correctIndex: number;
  yourAnswer: number | null;
}

interface ResultData {
  title: string;
  total?: number;
  totalQuestions?: number;
  totalMarks?: number;
  score?: number;
  correctCount?: number;
  wrongCount?: number;
  unansweredCount?: number;
  violationCount?: number;
  violations?: string[];
  status?: string;
  isRestricted?: boolean;
  message?: string;
  details?: QuestionResult[];
}

export default function Result() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const api = useApi();
  const { user, isAdmin } = useContext(AuthContext);

  const [resultData, setResultData] = useState<ResultData | null>(
    location.state as ResultData | null
  );
  const [loading, setLoading] = useState(!resultData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (resultData || !id) return;

    const fetchResult = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/quizzes/${id}/result`);
        if (!res.data.success || !res.data.data) {
          throw new Error(res.data.message || "Failed to load quiz results.");
        }
        setResultData(res.data.data);
      } catch (err: any) {
        setError(
          err.response?.data?.message || err.message || "Could not retrieve results for this quiz."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id, resultData, api]);

  const handleRetakeQuiz = () => {
    if (id) {
      navigate(`/take/${id}`);
    } else {
      navigate("/list");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[70vh] text-slate-600">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent mb-4"></div>
        <p className="text-lg font-medium text-slate-700">Verifying assessment submission...</p>
      </div>
    );
  }

  if (!resultData || error) {
    return (
      <div className="max-w-md mx-auto text-center my-16 p-8 bg-white rounded-3xl shadow-xl border border-slate-200">
        <div className="inline-flex p-3 bg-red-50 text-red-600 rounded-2xl mb-4">
          <XCircle size={32} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">Submission Unavailable</h3>
        <p className="text-slate-600 mb-6 text-sm">
          {error || "No submission record found for this quiz."}
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/list"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors text-sm"
          >
            <Home size={18} /> Browse Quizzes
          </Link>
        </div>
      </div>
    );
  }

  // If user is a Student (Candidate), they must NOT see the result, scores, or correct answers!
  if (!isAdmin || resultData.isRestricted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 sm:p-12 max-w-lg w-full text-center shadow-xl border border-slate-200"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} />
          </div>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider mb-2">
            Assessment Completed
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
            Submitted Successfully! 🎉
          </h1>

          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Thank you, <strong>{user?.name || "Candidate"}</strong>. Your answers and anti-cheat monitoring logs have been securely recorded.
          </p>

          {/* Privacy Notice */}
          <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-left text-xs text-amber-900 mb-6 flex items-start gap-3">
            <Lock size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-amber-950 text-sm mb-0.5">Candidate Score Privacy</p>
              <p className="leading-relaxed">
                Assessment results, scores, and answer keys are confidential and accessible only by the Quiz Administrator / Instructor. Results are not shown to candidates.
              </p>
            </div>
          </div>

          {/* Submission Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs text-slate-700 space-y-1.5 mb-8">
            <p>
              <strong>Assessment:</strong> {resultData.title || "Quiz"}
            </p>
            <p>
              <strong>Candidate:</strong> {user?.name} ({user?.email})
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className="text-emerald-600 font-bold">Transmitted to Admin Review</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link
              to="/dashboard"
              className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 transition"
            >
              <LayoutDashboard size={15} /> User Dashboard
            </Link>
            <Link
              to="/list"
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Home size={15} /> Browse Quizzes
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // --- ADMIN EVALUATION VIEW ---
  const {
    title,
    total = 0,
    totalQuestions = total,
    totalMarks = total,
    score = 0,
    details = [],
    violationCount = 0,
    status = "completed",
  } = resultData;

  const calculatedCorrect =
    resultData.correctCount ??
    details.filter((d) => d.yourAnswer === d.correctIndex).length;
  const calculatedUnanswered =
    resultData.unansweredCount ??
    details.filter((d) => d.yourAnswer === null || d.yourAnswer === undefined).length;
  const calculatedWrong =
    resultData.wrongCount ??
    details.length - calculatedCorrect - calculatedUnanswered;

  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
  const passed = percentage >= 50;

  return (
    <motion.div
      className="max-w-6xl mx-auto py-8 px-4 sm:px-6 font-sans"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold tracking-wider text-amber-600 uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            👑 Admin Evaluation View
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-2">
            {title || "Quiz Performance"}
          </h1>
        </div>

        {/* Anti-Cheat Badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border text-xs font-bold ${
            violationCount === 0
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-amber-50 text-amber-800 border-amber-300"
          }`}
        >
          {violationCount === 0 ? (
            <>
              <ShieldCheck size={18} className="text-emerald-600" />
              <span>Full Integrity Verified (0 Violations)</span>
            </>
          ) : (
            <>
              <ShieldAlert size={18} className="text-amber-600" />
              <span>{violationCount} Suspicious Activity Warning(s)</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Score Card & Actions */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 text-center border border-slate-200">
            <div className="inline-flex items-center justify-center p-4 rounded-3xl mb-4 bg-slate-50">
              {passed ? (
                <Trophy size={56} className="text-amber-500" />
              ) : (
                <Award size={56} className="text-slate-400" />
              )}
            </div>

            <span
              className={`inline-block px-4 py-1.5 rounded-full font-black text-xs uppercase mb-3 ${
                status === "terminated_violations"
                  ? "bg-red-100 text-red-800"
                  : passed
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {status === "terminated_violations"
                ? "Terminated (Violations)"
                : passed
                ? "Passed Assessment"
                : "Needs Practice"}
            </span>

            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Final Score</p>
            <div className="flex items-baseline justify-center gap-1.5 mb-2">
              <span className="text-5xl font-black text-slate-900">{score}</span>
              <span className="text-2xl font-bold text-slate-400">/ {totalMarks}</span>
            </div>

            <p className="text-3xl font-extrabold text-indigo-600 mb-4">{percentage}%</p>

            <div className="w-full bg-slate-100 rounded-full h-3 mb-6 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-700 ease-out ${
                  passed ? "bg-indigo-600" : "bg-amber-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {/* Quick Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 mb-6 text-center text-xs">
              <div>
                <span className="text-emerald-600 font-bold block">{calculatedCorrect}</span>
                <span className="text-slate-400">Correct</span>
              </div>
              <div>
                <span className="text-red-600 font-bold block">{calculatedWrong}</span>
                <span className="text-slate-400">Wrong</span>
              </div>
              <div>
                <span className="text-amber-600 font-bold block">{calculatedUnanswered}</span>
                <span className="text-slate-400">Skipped</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5">
              {id && (
                <Link
                  to={`/admin/monitor/${id}`}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md text-xs flex items-center justify-center gap-1.5 transition"
                >
                  <Eye size={15} /> Open Live Monitor
                </Link>
              )}
              <Link
                to="/admin"
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
              >
                <LayoutDashboard size={15} /> Admin Dashboard
              </Link>
              {id && (
                <button
                  onClick={handleRetakeQuiz}
                  className="w-full py-2.5 text-xs text-indigo-600 font-bold hover:underline flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={14} /> Retake Assessment
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Question Breakdown */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-slate-200">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center justify-between">
              <span>Detailed Question Review</span>
              <span className="text-xs font-bold text-slate-500">
                {totalQuestions} Total Questions
              </span>
            </h2>

            <div className="space-y-4">
              {details.length > 0 ? (
                details.map((q, i) => {
                  const isAnswered = q.yourAnswer !== null && q.yourAnswer !== undefined;
                  const isCorrect = isAnswered && q.yourAnswer === q.correctIndex;

                  return (
                    <div
                      key={i}
                      className={`p-5 rounded-2xl border transition-all ${
                        !isAnswered
                          ? "bg-amber-50/50 border-amber-200"
                          : isCorrect
                          ? "bg-emerald-50/60 border-emerald-200"
                          : "bg-red-50/60 border-red-200"
                      }`}
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="mt-0.5 flex-shrink-0">
                          {!isAnswered ? (
                            <HelpCircle size={22} className="text-amber-500" />
                          ) : isCorrect ? (
                            <CheckCircle size={22} className="text-emerald-600" />
                          ) : (
                            <XCircle size={22} className="text-red-600" />
                          )}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-slate-400">Question {i + 1}</span>
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                !isAnswered
                                  ? "bg-amber-100 text-amber-800"
                                  : isCorrect
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {!isAnswered ? "Unanswered / Timed Out" : isCorrect ? "Correct (+1)" : "Incorrect (0)"}
                            </span>
                          </div>

                          <p className="text-base font-bold text-slate-900 mb-3">
                            {q.question}
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-3 border-t border-slate-200/60">
                            <div>
                              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                                Correct Answer:
                              </span>
                              <span className="font-bold text-emerald-700">
                                {q.options[q.correctIndex]}
                              </span>
                            </div>

                            <div>
                              <span className="font-semibold text-slate-400 uppercase tracking-wider block mb-0.5">
                                Your Submission:
                              </span>
                              <span
                                className={`font-bold ${
                                  !isAnswered
                                    ? "text-amber-700 italic"
                                    : isCorrect
                                    ? "text-emerald-700"
                                    : "text-red-700"
                                }`}
                              >
                                {isAnswered
                                  ? q.options[q.yourAnswer!]
                                  : "None (Time Expired)"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-500 text-center py-8 text-sm">
                  No question breakdown recorded.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
