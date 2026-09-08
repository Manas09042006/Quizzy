import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Square,
  Users,
  AlertTriangle,
  Trophy,
  Clock,
  RefreshCw,
  CheckCircle2,
  Eye,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import { useApi, API_BASE } from "../../api/api";
import { useSuccess } from "../../context/SuccessContext";

interface Participant {
  _id: string;
  userName: string;
  userEmail: string;
  score: number;
  totalMarks?: number;
  total: number;
  violationCount: number;
  violations: string[];
  status: string;
  answers: (number | null)[];
  createdAt: string;
}

export default function MonitorQuiz() {
  const { id } = useParams<{ id: string }>();
  const api = useApi();
  const { addMessage } = useSuccess();

  const [quiz, setQuiz] = useState<any>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    flaggedCount: 0,
    averageScore: "0",
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inspectUser, setInspectUser] = useState<Participant | null>(null);
  const [sortOrder, setSortOrder] = useState<"none" | "asc" | "desc">("none");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemoveParticipant = async (resultId: string) => {
    if (!window.confirm("Remove this participant's result from this quiz? This action cannot be undone.")) return;
    setRemovingId(resultId);
    try {
      await api.delete(`/admin/quizzes/${id}/participants/${resultId}`);
      addMessage("Participant result removed from this quiz.");
      setParticipants((prev) => prev.filter((p) => p._id !== resultId));
      if (inspectUser?._id === resultId) setInspectUser(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to remove participant.");
    } finally {
      setRemovingId(null);
    }
  };

  const fetchMonitoringData = async () => {
    try {
      setRefreshing(true);
      const res = await api.get(`/admin/quizzes/${id}/monitor`);
      if (res.data.success) {
        const d = res.data.data;
        setQuiz(d.quiz);
        setParticipants(d.participants || []);
        setStats({
          totalAttempts: d.totalAttempts || 0,
          flaggedCount: d.flaggedCount || 0,
          averageScore: d.averageScore || "0",
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load live monitor");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();

    // 1. Real-time SSE listener
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${API_BASE}/live/admin/${id}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "new_submission") {
            addMessage(`New candidate submission: ${data.data?.userName || "Participant"}`);
            fetchMonitoringData();
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // quiet
    }

    // 2. Fallback polling every 4 seconds
    const interval = setInterval(fetchMonitoringData, 4000);

    return () => {
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [id]);

  const handleStatusChange = async (newStatus: "draft" | "active" | "ended") => {
    try {
      const res = await api.patch(`/admin/quizzes/${id}/status`, { status: newStatus });
      if (res.data.success) {
        addMessage(`Quiz status updated to ${newStatus.toUpperCase()}`);
        setQuiz((prev: any) => ({ ...prev, status: newStatus }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center">
        <RefreshCw size={36} className="animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-gray-600">Connecting to Live Exam Stream...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-xl max-w-md w-full text-center">
          <AlertTriangle size={40} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Monitor Offline</h2>
          <p className="text-sm text-gray-600 mb-6">{error || "Quiz not found"}</p>
          <Link
            to="/admin"
            className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm inline-flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Return to Admin Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isActive = quiz.status === "active";
  const isDraft = quiz.status === "draft";

  const sortedParticipants = [...participants].sort((a, b) => {
    if (sortOrder === "desc") return b.score - a.score;
    if (sortOrder === "asc") return a.score - b.score;
    return 0;
  });

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "none" || prev === "asc") ? "desc" : "asc");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-indigo-600 mb-2 transition"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                {quiz.title}
              </h1>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full border ${
                  isActive
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse"
                    : isDraft
                    ? "bg-amber-100 text-amber-800 border-amber-300"
                    : "bg-slate-100 text-slate-600 border-slate-300"
                }`}
              >
                {isActive ? "🟢 LIVE / ACTIVE" : isDraft ? "🟡 WAITING FOR START" : "🔴 ENDED"}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Live anti-cheat surveillance, participant scores, and violation audit stream.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {!isActive ? (
              <button
                onClick={() => handleStatusChange("active")}
                className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-100 transition"
              >
                <Play size={16} /> Start Quiz Now
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange("ended")}
                className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-red-100 transition"
              >
                <Square size={16} /> Stop / End Quiz
              </button>
            )}

            <button
              onClick={fetchMonitoringData}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              title="Refresh stream"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin text-indigo-600" : ""} />
            </button>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Participants</span>
              <Users size={18} className="text-indigo-600" />
            </div>
            <p className="text-3xl font-black text-gray-900">{stats.totalAttempts}</p>
            <span className="text-xs text-indigo-600 font-semibold mt-1 block">Submissions received</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Average Score</span>
              <Trophy size={18} className="text-emerald-600" />
            </div>
            <p className="text-3xl font-black text-emerald-600">
              {stats.averageScore} / {quiz.questions?.length || 0}
            </p>
            <span className="text-xs text-emerald-700 font-semibold mt-1 block">Mean score</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-400 uppercase">Timer Per Question</span>
              <Clock size={18} className="text-blue-600" />
            </div>
            <p className="text-3xl font-black text-blue-600">{quiz.defaultTimeLimit || 30}s</p>
            <span className="text-xs text-blue-700 font-semibold mt-1 block">Countdown limit</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-red-200 shadow-sm bg-red-50/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-red-600 uppercase">Suspicious Flags</span>
              <AlertTriangle size={18} className="text-red-600" />
            </div>
            <p className="text-3xl font-black text-red-600">{stats.flaggedCount}</p>
            <span className="text-xs text-red-700 font-semibold mt-1 block">
              Candidates with violations
            </span>
          </div>
        </div>

        {/* Live Participants Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-gray-900">Live Participant Results & Surveillance</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Automatically updates when candidates submit or trigger anti-cheat warnings.
              </p>
            </div>
          <div className="flex items-center gap-2">
            {/* Sort toggle */}
            <button
              onClick={toggleSort}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                sortOrder !== "none"
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
              title="Sort by marks"
            >
              {sortOrder === "desc" ? <ArrowDown size={13} /> : sortOrder === "asc" ? <ArrowUp size={13} /> : <ArrowUpDown size={13} />}
              {sortOrder === "desc" ? "Highest First" : sortOrder === "asc" ? "Lowest First" : "Sort by Marks"}
            </button>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
              Live Feed Active
            </div>
          </div>
        </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-gray-400 uppercase text-[11px] font-black">
                  <th className="pb-3 pl-2">Candidate</th>
                  <th className="pb-3">
                    <button onClick={toggleSort} className="flex items-center gap-1 hover:text-indigo-600 transition">
                      Score
                      {sortOrder === "desc" ? <ArrowDown size={11} /> : sortOrder === "asc" ? <ArrowUp size={11} /> : <ArrowUpDown size={11} />}
                    </button>
                  </th>
                  <th className="pb-3">Percentage</th>
                  <th className="pb-3">Anti-Cheat Surveillance</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {participants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      No participants have submitted answers yet. Start the quiz to allow attempts.
                    </td>
                  </tr>
                ) : (
                  sortedParticipants.map((p) => {
                    const isClean = p.violationCount === 0;
                    const percent = p.total > 0 ? Math.round((p.score / p.total) * 100) : 0;
                    const isTerminated = p.status === "terminated_violations";

                    return (
                      <tr key={p._id} className="hover:bg-slate-50/70 transition">
                        <td className="py-4 pl-2">
                          <p className="font-bold text-gray-900">{p.userName}</p>
                          <span className="text-[11px] text-gray-400">{p.userEmail}</span>
                        </td>

                        <td className="py-4 font-black text-gray-900 text-base">
                          {p.score} <span className="text-xs text-gray-400 font-normal">/ {p.total}</span>
                        </td>

                        <td className="py-4 font-bold text-indigo-600">{percent}%</td>

                        <td className="py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                              isClean
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : isTerminated || p.violationCount >= 3
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
                                <AlertTriangle size={13} className={isTerminated ? "text-red-600" : "text-amber-600"} />
                                {p.violationCount} Violations Recorded
                              </>
                            )}
                          </span>
                        </td>

                        <td className="py-4">
                          <span
                            className={`text-xs font-bold uppercase ${
                              isTerminated ? "text-red-600 font-black" : "text-slate-600"
                            }`}
                          >
                            {isTerminated ? "Auto-Terminated" : "Completed"}
                          </span>
                        </td>

                        <td className="py-4 text-right pr-2">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setInspectUser(p)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg text-xs transition inline-flex items-center gap-1"
                            >
                              <Eye size={13} /> Audit
                            </button>
                            <button
                              onClick={() => handleRemoveParticipant(p._id)}
                              disabled={removingId === p._id}
                              className="px-2 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-xs transition inline-flex items-center gap-1 border border-red-200 disabled:opacity-50"
                              title="Remove participant result"
                            >
                              {removingId === p._id ? <RefreshCw size={12} className="animate-spin" /> : <Trash2 size={12} />}
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
      </div>

      {/* Candidate Audit Modal */}
      <AnimatePresence>
        {inspectUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
                <div>
                  <h3 className="text-lg font-black text-gray-900">{inspectUser.userName}</h3>
                  <p className="text-xs text-gray-400">{inspectUser.userEmail}</p>
                </div>
                <button
                  onClick={() => setInspectUser(null)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4 overflow-y-auto pr-1 flex-1">
                {/* Score badge */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-400 block font-semibold">Assessment Score</span>
                    <span className="text-xl font-black text-gray-900">
                      {inspectUser.score} / {inspectUser.total}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Integrity Verdict</span>
                    <span
                      className={`font-black ${
                        inspectUser.violationCount === 0 ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      {inspectUser.violationCount === 0 ? "100% Honest (0 Flags)" : `${inspectUser.violationCount} Flags Logged`}
                    </span>
                  </div>
                </div>

                {/* Violations Log List */}
                <div>
                  <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider mb-2">
                    Suspicious Activity Log:
                  </h4>
                  {inspectUser.violations && inspectUser.violations.length > 0 ? (
                    <div className="space-y-2">
                      {inspectUser.violations.map((v, i) => (
                        <div
                          key={i}
                          className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-xs text-red-800 font-semibold flex items-start gap-2"
                        >
                          <AlertTriangle size={14} className="text-red-600 mt-0.5 shrink-0" />
                          <span>{v}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      Candidate maintained full-screen mode with zero tab switches throughout.
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 shrink-0">
                <button
                  onClick={() => setInspectUser(null)}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-slate-800 text-xs rounded-xl transition"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
