import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  PlusCircle,
  Play,
  Square,
  Trash2,
  Users,
  Activity,
  AlertTriangle,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  X,
  Search,
} from "lucide-react";
import { useApi } from "../../api/api";
import { useSuccess } from "../../context/SuccessContext";

interface QuizItem {
  _id: string;
  title: string;
  description?: string;
  status: "draft" | "active" | "ended";
  defaultTimeLimit: number;
  marksPerQuestion: number;
  questionCount: number;
  totalAttempts: number;
  createdAt: string;
}

interface SubmissionItem {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalMarks?: number;
  total: number;
  violationCount: number;
  violations: string[];
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const api = useApi();
  const { addMessage } = useSuccess();

  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeQuizzes: 0,
    upcomingQuizzes: 0,
    endedQuizzes: 0,
    totalSubmissions: 0,
    flaggedSubmissions: 0,
    totalViolations: 0,
  });

  // Modal for inspecting candidate violations
  const [selectedViolationLog, setSelectedViolationLog] = useState<SubmissionItem | null>(null);

  // Search filter
  const [searchQuiz, setSearchQuiz] = useState("");

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/admin/overview");
      if (res.data.success) {
        const d = res.data.data;
        setQuizzes(d.quizzes || []);
        setSubmissions(d.recentSubmissions || []);
        setStats({
          totalQuizzes: d.totalQuizzes || 0,
          activeQuizzes: d.activeQuizzes || 0,
          upcomingQuizzes: d.upcomingQuizzes || 0,
          endedQuizzes: d.endedQuizzes || 0,
          totalSubmissions: d.totalSubmissions || 0,
          flaggedSubmissions: d.flaggedSubmissions || 0,
          totalViolations: d.totalViolations || 0,
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch admin overview");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (quizId: string, newStatus: "draft" | "active" | "ended") => {
    try {
      const res = await api.patch(`/admin/quizzes/${quizId}/status`, { status: newStatus });
      if (res.data.success) {
        addMessage(`Quiz status updated to "${newStatus.toUpperCase()}"`);
        setQuizzes((prev) =>
          prev.map((q) => (q._id === quizId ? { ...q, status: newStatus } : q))
        );
        if (newStatus === "active") {
          setStats((prev) => ({
            ...prev,
            activeQuizzes: prev.activeQuizzes + 1,
            upcomingQuizzes: Math.max(0, prev.upcomingQuizzes - 1),
          }));
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update quiz status");
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!window.confirm("Are you sure you want to delete this quiz? All attempts will be removed.")) {
      return;
    }
    try {
      await api.delete(`/admin/quizzes/${quizId}`);
      addMessage("Quiz deleted successfully");
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete quiz");
    }
  };

  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(searchQuiz.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center">
        <RefreshCw size={36} className="animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-gray-600">Loading Admin Control Center...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-2xl">
            {error}
          </div>
        )}
        {/* Admin Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <Shield size={28} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                  Admin Command Center
                </h1>
                <span className="bg-amber-100 text-amber-900 text-xs font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                  Host Access
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Manage quizzes, control real-time start/end status, and monitor candidate integrity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={refreshing}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <Link
              to="/create"
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-100 flex items-center gap-2 transition"
            >
              <PlusCircle size={18} /> Create New Quiz
            </Link>
          </div>
        </div>

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Total Quizzes</span>
              <Activity size={18} className="text-indigo-600" />
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.totalQuizzes}</p>
            <span className="text-xs text-indigo-600 font-semibold mt-1 block">
              {stats.upcomingQuizzes} waiting in draft
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Active Quizzes</span>
              <Play size={18} className="text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-600">{stats.activeQuizzes}</p>
            <span className="text-xs text-emerald-700 font-semibold mt-1 block">
              Open for candidates
            </span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Submissions</span>
              <Users size={18} className="text-blue-600" />
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.totalSubmissions}</p>
            <span className="text-xs text-blue-600 font-semibold mt-1 block">Completed exams</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-red-200 shadow-sm bg-red-50/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-600 uppercase">Flagged Violations</span>
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <p className="text-3xl font-black text-red-600">{stats.flaggedSubmissions}</p>
            <span className="text-xs text-red-700 font-semibold mt-1 block">
              {stats.totalViolations} suspicious actions detected
            </span>
          </div>
        </div>

        {/* Quiz Management Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">Quiz Management & Real-Time Controls</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Control which quizzes are open for user attempts in real time.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search quizzes..."
                value={searchQuiz}
                onChange={(e) => setSearchQuiz(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-gray-400 uppercase text-[11px] font-black">
                  <th className="pb-3 pl-2">Quiz Title</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Questions</th>
                  <th className="pb-3">Timer/Q</th>
                  <th className="pb-3">Attempts</th>
                  <th className="pb-3 text-right pr-2">Controls & Monitoring</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredQuizzes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No quizzes found. Click "Create New Quiz" to get started.
                    </td>
                  </tr>
                ) : (
                  filteredQuizzes.map((quiz) => {
                    const isActive = quiz.status === "active";
                    const isDraft = quiz.status === "draft";
                    const isEnded = quiz.status === "ended";

                    return (
                      <tr key={quiz._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 pl-2 font-bold text-gray-900 max-w-xs">
                          <p className="truncate">{quiz.title}</p>
                          <span className="text-[11px] font-normal text-gray-400">
                            ID: {quiz._id.substring(quiz._id.length - 8)}
                          </span>
                        </td>

                        <td className="py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${
                              isActive
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : isDraft
                                ? "bg-amber-100 text-amber-800 border-amber-300"
                                : "bg-slate-100 text-slate-600 border-slate-300"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isActive ? "bg-emerald-600" : isDraft ? "bg-amber-600 animate-pulse" : "bg-slate-400"
                              }`}
                            />
                            {isActive ? "ACTIVE" : isDraft ? "WAITING (DRAFT)" : "ENDED"}
                          </span>
                        </td>

                        <td className="py-4 text-gray-700">{quiz.questionCount} Qs</td>
                        <td className="py-4 text-gray-700">{quiz.defaultTimeLimit || 30}s</td>
                        <td className="py-4 text-gray-700 font-bold">{quiz.totalAttempts || 0}</td>

                        <td className="py-4 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Start Quiz Button */}
                            {!isActive && (
                              <button
                                onClick={() => handleStatusChange(quiz._id, "active")}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs"
                                title="Start Quiz (Users can now enter and take)"
                              >
                                <Play size={13} /> Start
                              </button>
                            )}

                            {/* Stop/End Quiz Button */}
                            {isActive && (
                              <button
                                onClick={() => handleStatusChange(quiz._id, "ended")}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs"
                                title="Stop & Close Quiz"
                              >
                                <Square size={13} /> Stop
                              </button>
                            )}

                            {/* Set to Draft */}
                            {isEnded && (
                              <button
                                onClick={() => handleStatusChange(quiz._id, "draft")}
                                className="px-2.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold transition"
                                title="Reset to Waiting/Draft"
                              >
                                Draft
                              </button>
                            )}

                            {/* Live Monitor */}
                            <Link
                              to={`/admin/monitor/${quiz._id}`}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                              title="Live Monitoring & Scores"
                            >
                              <Eye size={14} /> Monitor
                            </Link>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteQuiz(quiz._id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Quiz"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Suspicious Activity & Recent Submissions Feed */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                <AlertTriangle size={22} className="text-amber-500" />
                Anti-Cheat Activity & Recent Submissions
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Real-time integrity logs for candidate assessments.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-600">
              Live Auditing Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-gray-400 uppercase text-[11px] font-black">
                  <th className="pb-3 pl-2">Candidate</th>
                  <th className="pb-3">Quiz</th>
                  <th className="pb-3">Score</th>
                  <th className="pb-3">Integrity & Violations</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {submissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      No candidate submissions yet.
                    </td>
                  </tr>
                ) : (
                  submissions.map((sub) => {
                    const isClean = sub.violationCount === 0;
                    const isCritical = sub.violationCount >= 3 || sub.status === "terminated_violations";

                    return (
                      <tr key={sub._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 pl-2">
                          <p className="font-bold text-gray-900">{sub.userName}</p>
                          <span className="text-[11px] text-gray-400">{sub.userEmail}</span>
                        </td>

                        <td className="py-4 text-gray-700 max-w-xs truncate">
                          {sub.quizTitle}
                        </td>

                        <td className="py-4 font-black text-gray-900">
                          {sub.score} / {sub.totalMarks || sub.total}
                        </td>

                        <td className="py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                              isClean
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : isCritical
                                ? "bg-red-100 text-red-800 border-red-300"
                                : "bg-amber-100 text-amber-800 border-amber-300"
                            }`}
                          >
                            {isClean ? (
                              <>
                                <CheckCircle2 size={13} className="text-emerald-600" />
                                0 Violations (Clean)
                              </>
                            ) : (
                              <>
                                <AlertTriangle size={13} className={isCritical ? "text-red-600" : "text-amber-600"} />
                                {sub.violationCount} Suspicious Actions
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-4">
                          <span
                            className={`text-xs font-bold uppercase ${
                              isCritical ? "text-red-600 font-black" : "text-slate-600"
                            }`}
                          >
                            {sub.status || "completed"}
                          </span>
                        </td>

                        <td className="py-4 text-right pr-2">
                          {sub.violationCount > 0 ? (
                            <button
                              onClick={() => setSelectedViolationLog(sub)}
                              className="px-3 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-lg text-xs font-bold transition inline-flex items-center gap-1"
                            >
                              <AlertTriangle size={12} /> View Logs
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400 italic">No warnings</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Violation Log Modal */}
      <AnimatePresence>
        {selectedViolationLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle size={22} />
                  <h3 className="text-lg font-black text-gray-900">Anti-Cheat Audit Log</h3>
                </div>
                <button
                  onClick={() => setSelectedViolationLog(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-4 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1">
                <p>
                  <strong>Candidate:</strong> {selectedViolationLog.userName} ({selectedViolationLog.userEmail})
                </p>
                <p>
                  <strong>Quiz:</strong> {selectedViolationLog.quizTitle}
                </p>
                <p>
                  <strong>Total Violations:</strong>{" "}
                  <span className="text-red-600 font-bold">{selectedViolationLog.violationCount}</span>
                </p>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedViolationLog.violations && selectedViolationLog.violations.length > 0 ? (
                  selectedViolationLog.violations.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs font-semibold text-red-800 flex items-start gap-2"
                    >
                      <Clock size={14} className="text-red-500 mt-0.5 shrink-0" />
                      <span>{log}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No specific violation entries recorded.</p>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setSelectedViolationLog(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition"
                >
                  Close Audit Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
