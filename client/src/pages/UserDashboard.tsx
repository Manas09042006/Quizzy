import { useEffect, useState, useContext, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  ListChecks,
  Search,
  Sparkles,
  PlayCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { AuthContext } from "../context/authContext";
import { useApi } from "../api/api";

interface QuizAttempt {
  quizId: string;
  quizTitle: string;
  date: string;
  status?: string;
}

interface AvailableQuiz {
  _id: string;
  title: string;
  description?: string;
  status: "draft" | "active" | "ended";
  defaultTimeLimit: number;
  questionCount: number;
}

export default function UserDashboard() {
  const api = useApi();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [quizzes, setQuizzes] = useState<AvailableQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // 1. Fetch attempt history (just quiz titles + dates, no scores)
        const dashRes = await api.get("/auth/dashboard");
        const formattedAttempts: QuizAttempt[] = (dashRes.data.tests || []).map((r: any) => ({
          quizId: r.quizId,
          quizTitle: r.quizTitle || `Assessment ${String(r.quizId || "").substring(0, 6)}`,
          date: r.date || new Date().toISOString(),
          status: r.status || "completed",
        }));

        formattedAttempts.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setAttempts(formattedAttempts);

        // 2. Fetch all quizzes
        const quizRes = await api.get("/quizzes");
        if (quizRes.data.success && Array.isArray(quizRes.data.data)) {
          setQuizzes(quizRes.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, api]);

  // Set of attempted quiz IDs for quick lookup
  const attemptedIds = useMemo(() => new Set(attempts.map((a) => a.quizId)), [attempts]);

  const activeQuizzes = quizzes.filter((q) => q.status === "active");

  const filteredAttempts = useMemo(() => {
    return attempts.filter((a) =>
      a.quizTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [attempts, searchTerm]);

  const handleQuizAction = (quiz: AvailableQuiz) => {
    if (quiz.status === "active") {
      navigate(`/take/${quiz._id}`);
    } else if (quiz.status === "draft") {
      navigate(`/waiting/${quiz._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl">
            {error}
          </div>
        )}

        {/* Welcome Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-2xl shadow-md">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Welcome, {user?.name || "Student"}!
                </h1>
                <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
                  Student
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-0.5">
                View available assessments and your submission history.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 text-center">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Attempted</p>
              <p className="text-3xl font-black text-indigo-600">{attempts.length}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Live Now</p>
              <p className="text-3xl font-black text-emerald-600">{activeQuizzes.length}</p>
            </div>
          </div>
        </div>

        {/* Available Quizzes Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />
              Available Assessments
            </h2>
            <Link to="/list" className="text-xs font-bold text-indigo-600 hover:underline">
              View All ({quizzes.length})
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-gray-400">Loading assessments...</div>
          ) : quizzes.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 text-sm text-gray-400">
              No assessments available yet. Check back later.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {quizzes.slice(0, 6).map((quiz) => {
                const isActive = quiz.status === "active";
                const isDraft = quiz.status === "draft";
                const isAttempted = attemptedIds.has(quiz._id);

                return (
                  <motion.div
                    key={quiz._id}
                    whileHover={{ y: -3 }}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* Status + Attempted badges */}
                      <div className="flex items-center justify-between mb-3 flex-wrap gap-1.5">
                        <span
                          className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                            isActive
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : isDraft
                              ? "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
                              : "bg-slate-100 text-slate-600 border-slate-300"
                          }`}
                        >
                          {isActive
                            ? "🟢 LIVE / ACTIVE"
                            : isDraft
                            ? "🟡 WAITING FOR ADMIN"
                            : "🔴 ENDED"}
                        </span>

                        {isAttempted && (
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Attempted
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-gray-900 text-base mb-1.5 leading-snug">
                        {quiz.title}
                      </h3>
                      <p className="text-xs text-gray-400 mb-4">
                        {quiz.questionCount} Questions · {quiz.defaultTimeLimit || 30}s per question
                      </p>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                      {isActive ? (
                        <button
                          onClick={() => handleQuizAction(quiz)}
                          className="w-full px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <PlayCircle size={15} /> {isAttempted ? "Retake Quiz" : "Start Quiz"}
                        </button>
                      ) : isDraft ? (
                        <button
                          onClick={() => handleQuizAction(quiz)}
                          className="w-full px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                        >
                          <Clock size={15} /> Enter Waiting Room
                        </button>
                      ) : (
                        <div className="w-full py-2.5 text-center text-xs font-bold text-gray-400">
                          Assessment Closed
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Anti-Cheat Integrity Notice */}
        <div className="bg-indigo-50/80 border border-indigo-100 rounded-3xl p-5 flex items-start gap-4">
          <ShieldCheck size={22} className="text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-black text-indigo-950">Anti-Cheat Integrity Enforcement</p>
            <p className="text-xs text-indigo-800/80 leading-relaxed mt-0.5">
              All assessments require Full-Screen mode. Tab switching, window minimization, and focus loss are monitored and recorded. Scores are visible only to the instructor.
            </p>
          </div>
        </div>

        {/* Attempt History */}
        <div className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ListChecks size={22} className="text-indigo-600" />
              Your Submission History
            </h2>
            <span className="text-xs text-gray-400 font-semibold">
              {attempts.length} assessment{attempts.length !== 1 ? "s" : ""} submitted
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by assessment title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
            />
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              Loading submission history...
            </div>
          ) : filteredAttempts.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <BookOpen size={26} className="text-slate-400" />
              </div>
              <p className="text-base font-bold text-gray-600 mb-1">No Submissions Yet</p>
              <p className="text-xs text-gray-400 mb-5">
                {searchTerm
                  ? "No assessments match your search."
                  : "You haven't attempted any assessments. Start one from above!"}
              </p>
              <Link
                to="/list"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                <Sparkles size={14} /> Browse Assessments
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAttempts.map((attempt, index) => (
                <div
                  key={attempt.quizId + index}
                  className="p-4 bg-slate-50/70 hover:bg-slate-100/60 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-gray-900 truncate">{attempt.quizTitle}</h4>
                      <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={12} />
                        {new Date(attempt.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 text-[11px] font-black px-3 py-1 rounded-full border ${
                      attempt.status === "terminated_violations"
                        ? "bg-red-100 text-red-800 border-red-200"
                        : "bg-emerald-100 text-emerald-800 border-emerald-200"
                    }`}
                  >
                    {attempt.status === "terminated_violations"
                      ? "⚠️ Terminated"
                      : "✅ Submitted"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
