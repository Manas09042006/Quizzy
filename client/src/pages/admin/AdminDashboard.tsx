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
  X,
  Search,
  UserCheck,
  UserX,
  FileText,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Clock,
  Star,
  Check,
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

interface StudentItem {
  _id: string;
  name: string;
  email: string;
  status: "pending_approval" | "active" | "blocked";
  createdAt: string;
  lastLogin?: string;
  quizAttempts: number;
}

interface AuditLogItem {
  _id: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
  timestamp: string;
}

export default function AdminDashboard() {
  const api = useApi();
  const { addMessage } = useSuccess();

  // Navigation tab: Quizzes | Students | Audit Logs
  const [activeTab, setActiveTab] = useState<"quizzes" | "students" | "audit">("quizzes");

  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditMeta, setAuditMeta] = useState({ total: 0, page: 1, totalPages: 1 });

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

  // Question Preview simulator states
  const [previewQuizData, setPreviewQuizData] = useState<{
    title: string;
    questions: any[];
    timerMode?: string;
    overallTimeLimit?: number;
    defaultTimeLimit?: number;
    marksPerQuestion?: number;
    minTimePerQuestion?: number;
  } | null>(null);
  const [previewModalIdx, setPreviewModalIdx] = useState<number>(0);
  const [previewSelectedOpt, setPreviewSelectedOpt] = useState<number | null>(null);
  const [previewShowAnswers, setPreviewShowAnswers] = useState<boolean>(false);
  const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);

  // Confirmation dialog modal for destructive/critical actions
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    confirmColor: "red" | "indigo" | "emerald";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "",
    confirmColor: "indigo",
    onConfirm: () => {},
  });

  // Filters
  const [searchQuiz, setSearchQuiz] = useState("");
  const [studentStatusFilter, setStudentStatusFilter] = useState<string>("all");
  const [studentSearch, setStudentSearch] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState<string>("all");
  const [auditSearch, setAuditSearch] = useState("");
  const [auditPage, setAuditPage] = useState(1);

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

  const fetchStudents = async () => {
    try {
      const params: any = {};
      if (studentStatusFilter !== "all") params.status = studentStatusFilter;
      if (studentSearch.trim()) params.search = studentSearch.trim();

      const res = await api.get("/admin/students", { params });
      if (res.data.success) {
        setStudents(res.data.data || []);
      }
    } catch (err: any) {
      console.error("Failed to load students:", err);
    }
  };

  const fetchAuditLogs = async (page = 1) => {
    try {
      const params: any = { page, limit: 15 };
      if (auditActionFilter !== "all") params.action = auditActionFilter;
      if (auditSearch.trim()) params.search = auditSearch.trim();

      const res = await api.get("/admin/audit-logs", { params });
      if (res.data.success) {
        setAuditLogs(res.data.data.logs || []);
        setAuditMeta({
          total: res.data.data.total || 0,
          page: res.data.data.page || 1,
          totalPages: res.data.data.totalPages || 1,
        });
      }
    } catch (err: any) {
      console.error("Failed to load audit logs:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === "students") {
      fetchStudents();
    } else if (activeTab === "audit") {
      fetchAuditLogs(auditPage);
    }
  }, [activeTab, studentStatusFilter, studentSearch, auditActionFilter, auditSearch, auditPage]);

  // Quiz status change
  const handleStatusChange = async (quizId: string, newStatus: "draft" | "active" | "ended") => {
    try {
      const res = await api.patch(`/admin/quizzes/${quizId}/status`, { status: newStatus });
      if (res.data.success) {
        addMessage(`Quiz status updated to "${newStatus.toUpperCase()}"`);
        setQuizzes((prev) =>
          prev.map((q) => (q._id === quizId ? { ...q, status: newStatus } : q))
        );
        fetchDashboardData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update quiz status");
    }
  };

  const handleDeleteQuiz = (quizId: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Quiz Assessment",
      message: "Are you sure you want to delete this quiz? All candidate attempts and results will be permanently removed.",
      confirmText: "Delete Quiz",
      confirmColor: "red",
      onConfirm: async () => {
        try {
          await api.delete(`/admin/quizzes/${quizId}`);
          addMessage("Quiz deleted successfully.");
          setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          fetchDashboardData();
        } catch (err: any) {
          alert(err.response?.data?.message || "Failed to delete quiz");
        }
      },
    });
  };

  // Student status change (Approve, Block, Unblock)
  const handleStudentStatusChange = (
    student: StudentItem,
    newStatus: "pending_approval" | "active" | "blocked"
  ) => {
    const isBlocking = newStatus === "blocked";
    const isApproving = newStatus === "active" && student.status === "pending_approval";

    const promptTitle = isBlocking
      ? "Block Student Account"
      : isApproving
      ? "Approve Student Account"
      : "Unblock Student Account";

    const promptMessage = isBlocking
      ? `Are you sure you want to block ${student.name} (${student.email})? They will immediately lose access to quizzes and login.`
      : isApproving
      ? `Approve registration for ${student.name} (${student.email})? They will be granted access to take quizzes.`
      : `Restore active status for ${student.name} (${student.email})?`;

    setConfirmModal({
      isOpen: true,
      title: promptTitle,
      message: promptMessage,
      confirmText: isBlocking ? "Block Account" : isApproving ? "Approve Student" : "Unblock Student",
      confirmColor: isBlocking ? "red" : "emerald",
      onConfirm: async () => {
        try {
          const res = await api.patch(`/admin/students/${student._id}/status`, { status: newStatus });
          if (res.data.success) {
            addMessage(`Student account status updated to "${newStatus.toUpperCase()}"`);
            setStudents((prev) =>
              prev.map((s) => (s._id === student._id ? { ...s, status: newStatus } : s))
            );
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          }
        } catch (err: any) {
          alert(err.response?.data?.message || "Failed to update student status");
        }
      },
    });
  };

  // Delete student permanently
  const handleDeleteStudent = (student: StudentItem) => {
    setConfirmModal({
      isOpen: true,
      title: "Remove Student Account",
      message: `Are you sure you want to permanently remove ${student.name} (${student.email})? All associated attempts and test history will be deleted.`,
      confirmText: "Delete Student",
      confirmColor: "red",
      onConfirm: async () => {
        try {
          const res = await api.delete(`/admin/students/${student._id}`);
          if (res.data.success) {
            addMessage(`Student account "${student.name}" deleted successfully.`);
            setStudents((prev) => prev.filter((s) => s._id !== student._id));
            setConfirmModal((prev) => ({ ...prev, isOpen: false }));
          }
        } catch (err: any) {
          alert(err.response?.data?.message || "Failed to delete student account");
        }
      },
    });
  };

  // Preview Quiz Questions
  const handlePreviewQuiz = async (quizId: string) => {
    try {
      setLoadingPreviewId(quizId);
      const res = await api.get(`/quizzes/${quizId}`);
      if (res.data.success) {
        setPreviewQuizData(res.data.data);
        setPreviewModalIdx(0);
        setPreviewSelectedOpt(null);
        setPreviewShowAnswers(false); // Default to student blind view
      }
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to load quiz for preview");
    } finally {
      setLoadingPreviewId(null);
    }
  };

  // Filtered quizzes
  const filteredQuizzes = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(searchQuiz.toLowerCase()) ||
      (q.description && q.description.toLowerCase().includes(searchQuiz.toLowerCase()))
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
                Manage students, publish quizzes, control live examination rooms, and inspect audit logs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                fetchDashboardData();
                if (activeTab === "students") fetchStudents();
                if (activeTab === "audit") fetchAuditLogs(auditPage);
              }}
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

        {/* 3 Main Admin Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("quizzes")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === "quizzes"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <BookOpen size={16} />
            Quizzes & Live Exams ({quizzes.length})
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === "students"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Users size={16} />
            Students Management
          </button>

          <button
            onClick={() => setActiveTab("audit")}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition ${
              activeTab === "audit"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <FileText size={16} />
            Reports & Audit Logs
          </button>
        </div>

        {/* ================= TAB 1: QUIZZES ================= */}
        {activeTab === "quizzes" && (
          <div className="space-y-8">
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

                            <td className="py-4 text-gray-700">
                              <button
                                onClick={() => handlePreviewQuiz(quiz._id)}
                                className="inline-flex items-center gap-1 font-bold text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                                title="Click to preview questions"
                              >
                                <BookOpen size={13} />
                                {quiz.questionCount} Qs
                              </button>
                            </td>
                            <td className="py-4 text-gray-700">{quiz.defaultTimeLimit || 30}s</td>
                            <td className="py-4 text-gray-700 font-bold">{quiz.totalAttempts || 0}</td>

                            <td className="py-4 text-right pr-2">
                              <div className="flex items-center justify-end gap-1.5">
                                {/* Preview Questions Button */}
                                <button
                                  onClick={() => handlePreviewQuiz(quiz._id)}
                                  disabled={loadingPreviewId === quiz._id}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                                  title="Preview quiz questions"
                                >
                                  {loadingPreviewId === quiz._id ? (
                                    <RefreshCw size={13} className="animate-spin text-indigo-600" />
                                  ) : (
                                    <Eye size={13} />
                                  )}
                                  Preview
                                </button>
                                {!isActive && (
                                  <button
                                    onClick={() => handleStatusChange(quiz._id, "active")}
                                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs"
                                    title="Start / Publish Quiz"
                                  >
                                    <Play size={13} /> Publish
                                  </button>
                                )}

                                {isActive && (
                                  <button
                                    onClick={() => handleStatusChange(quiz._id, "ended")}
                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition shadow-xs"
                                    title="Stop & Close Quiz"
                                  >
                                    <Square size={13} /> Stop
                                  </button>
                                )}

                                {isEnded && (
                                  <button
                                    onClick={() => handleStatusChange(quiz._id, "draft")}
                                    className="px-2.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-lg text-xs font-bold transition"
                                    title="Reset to Waiting/Draft"
                                  >
                                    Draft
                                  </button>
                                )}

                                <Link
                                  to={`/admin/monitor/${quiz._id}`}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                                  title="Live Monitoring & Scores"
                                >
                                  <Eye size={14} /> Monitor
                                </Link>

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

            {/* Anti-Cheat Activity & Recent Submissions */}
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
        )}

        {/* ================= TAB 2: STUDENTS MANAGEMENT (Phase 9) ================= */}
        {activeTab === "students" && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Users size={22} className="text-indigo-600" />
                  Student Account Approvals & Access Control
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Review registrations, approve student accounts, or block malicious candidates.
                </p>
              </div>

              {/* Status Filter Tabs & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  {["all", "pending_approval", "active", "blocked"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setStudentStatusFilter(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                        studentStatusFilter === st
                          ? "bg-white text-indigo-600 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {st.replace("_", " ")}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-56">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search name / email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-gray-400 uppercase text-[11px] font-black">
                    <th className="pb-3 pl-2">Student</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Registered On</th>
                    <th className="pb-3">Last Login</th>
                    <th className="pb-3">Attempts</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400">
                        No students found matching this criteria.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => {
                      const isPending = student.status === "pending_approval";
                      const isActive = student.status === "active";
                      const isBlocked = student.status === "blocked";

                      return (
                        <tr key={student._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-4 pl-2">
                            <p className="font-bold text-gray-900">{student.name}</p>
                            <span className="text-[11px] text-gray-400">{student.email}</span>
                          </td>

                          <td className="py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black border ${
                                isPending
                                  ? "bg-amber-100 text-amber-800 border-amber-300"
                                  : isActive
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                  : "bg-red-100 text-red-800 border-red-300"
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  isPending ? "bg-amber-500 animate-pulse" : isActive ? "bg-emerald-500" : "bg-red-500"
                                }`}
                              />
                              {isPending ? "PENDING APPROVAL" : isActive ? "ACTIVE" : "BLOCKED"}
                            </span>
                          </td>

                          <td className="py-4 text-gray-600">
                            {new Date(student.createdAt).toLocaleDateString()}
                          </td>

                          <td className="py-4 text-gray-600">
                            {student.lastLogin
                              ? new Date(student.lastLogin).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : "Never"}
                          </td>

                          <td className="py-4 font-bold text-gray-800">{student.quizAttempts}</td>

                          <td className="py-4 text-right pr-2">
                            <div className="flex items-center justify-end gap-2">
                              {/* Pending Approval: Approve action */}
                              {isPending && (
                                <button
                                  onClick={() => handleStudentStatusChange(student, "active")}
                                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition shadow-xs"
                                >
                                  <UserCheck size={14} /> Approve
                                </button>
                              )}

                              {/* Active: Block action */}
                              {isActive && (
                                <button
                                  onClick={() => handleStudentStatusChange(student, "blocked")}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                                >
                                  <UserX size={14} /> Block
                                </button>
                              )}

                              {/* Blocked: Unblock action */}
                              {isBlocked && (
                                <button
                                  onClick={() => handleStudentStatusChange(student, "active")}
                                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1 transition"
                                >
                                  <UserCheck size={14} /> Unblock
                                </button>
                              )}

                              {/* Delete student permanently */}
                              <button
                                onClick={() => handleDeleteStudent(student)}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold transition inline-flex items-center"
                                title="Delete student account"
                              >
                                <Trash2 size={14} />
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
        )}

        {/* ================= TAB 3: AUDIT LOGS & REPORTS (Phase 8) ================= */}
        {activeTab === "audit" && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <FileText size={22} className="text-indigo-600" />
                  System Security & Audit Trail
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Immutable record of user registrations, admin approvals, exam starts, and security violations.
                </p>
              </div>

              {/* Action Filter & Search */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={auditActionFilter}
                  onChange={(e) => {
                    setAuditActionFilter(e.target.value);
                    setAuditPage(1);
                  }}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
                >
                  <option value="all">All Event Types</option>
                  <option value="USER_REGISTERED">User Registered</option>
                  <option value="ADMIN_APPROVED_USER">Admin Approved User</option>
                  <option value="ADMIN_BLOCKED_USER">Admin Blocked User</option>
                  <option value="ADMIN_LOGIN">Admin Login</option>
                  <option value="QUIZ_PUBLISHED">Quiz Published</option>
                  <option value="QUIZ_UNPUBLISHED">Quiz Unpublished</option>
                  <option value="EXAM_STARTED">Exam Started</option>
                  <option value="EXAM_SUBMITTED">Exam Submitted</option>
                  <option value="EXAM_AUTO_SUBMITTED">Exam Auto-Submitted</option>
                  <option value="CHEATING_VIOLATION_TRIGGERED">Cheating Violation</option>
                </select>

                <div className="relative w-full sm:w-56">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search action, actor, details..."
                    value={auditSearch}
                    onChange={(e) => {
                      setAuditSearch(e.target.value);
                      setAuditPage(1);
                    }}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-gray-400 uppercase text-[11px] font-black">
                    <th className="pb-3 pl-2">Timestamp</th>
                    <th className="pb-3">Action Event</th>
                    <th className="pb-3">Actor</th>
                    <th className="pb-3">Details</th>
                    <th className="pb-3 text-right pr-2">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">
                        No audit events recorded yet.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => {
                      const isCritical =
                        log.action.includes("BLOCKED") ||
                        log.action.includes("CHEATING") ||
                        log.action.includes("AUTO_SUBMITTED");
                      const isSuccess =
                        log.action.includes("APPROVED") || log.action.includes("PUBLISHED");

                      return (
                        <tr key={log._id} className="hover:bg-slate-50/70 transition">
                          <td className="py-4 pl-2 text-gray-500 font-mono text-[11px]">
                            {new Date(log.timestamp).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </td>

                          <td className="py-4">
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                                isCritical
                                  ? "bg-red-50 text-red-800 border-red-200"
                                  : isSuccess
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-indigo-50 text-indigo-800 border-indigo-200"
                              }`}
                            >
                              {log.action}
                            </span>
                          </td>

                          <td className="py-4 text-gray-900 font-semibold">
                            {log.actorName}
                            <span className="text-[11px] text-gray-400 block font-normal capitalize">
                              Role: {log.actorRole}
                            </span>
                          </td>

                          <td className="py-4 text-gray-700 text-xs font-mono max-w-sm truncate">
                            {typeof log.details === "object"
                              ? JSON.stringify(log.details)
                              : String(log.details || "-")}
                          </td>

                          <td className="py-4 text-right pr-2 text-gray-400 text-xs font-mono">
                            {log.ipAddress || "127.0.0.1"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Audit Pagination */}
            {auditMeta.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-xs text-gray-500">
                  Page {auditMeta.page} of {auditMeta.totalPages} ({auditMeta.total} events)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                    disabled={auditMeta.page <= 1}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setAuditPage((p) => Math.min(auditMeta.totalPages, p + 1))}
                    disabled={auditMeta.page >= auditMeta.totalPages}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog Modal */}
      <AnimatePresence>
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-2">{confirmModal.title}</h3>
              <p className="text-xs text-gray-600 mb-6 leading-relaxed">{confirmModal.message}</p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-md transition ${
                    confirmModal.confirmColor === "red"
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Candidate Violations Modal */}
      <AnimatePresence>
        {selectedViolationLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-amber-500" size={20} />
                  <h3 className="text-base font-bold text-gray-900">
                    Security Incident Log
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedViolationLog(null)}
                  className="p-1 hover:bg-slate-100 rounded-lg text-gray-400 hover:text-gray-700 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <p>
                  <strong>Candidate:</strong> {selectedViolationLog.userName} ({selectedViolationLog.userEmail})
                </p>
                <p>
                  <strong>Quiz Assessment:</strong> {selectedViolationLog.quizTitle}
                </p>
                <p>
                  <strong>Total Recorded Violations:</strong>{" "}
                  <span className="text-red-600 font-bold">
                    {selectedViolationLog.violationCount}
                  </span>
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 max-h-56 overflow-y-auto space-y-2">
                <p className="text-[11px] font-black uppercase text-gray-400">Timestamped Incidents:</p>
                {selectedViolationLog.violations && selectedViolationLog.violations.length > 0 ? (
                  selectedViolationLog.violations.map((v, i) => (
                    <div key={i} className="text-xs text-red-800 bg-red-50/70 p-2 rounded-lg border border-red-100">
                      {v}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic">No specific violation details available.</p>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedViolationLog(null)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Question Preview Modal for Quizzes in Dashboard */}
      <AnimatePresence>
        {previewQuizData && previewQuizData.questions && previewQuizData.questions.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-700 max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold">
                    <Eye size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">
                        Question {previewModalIdx + 1} of {previewQuizData.questions.length}
                      </h3>
                      <span className="text-[10px] font-bold bg-violet-950 text-violet-300 border border-violet-800 px-2 py-0.5 rounded-full">
                        Student View Preview
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {previewQuizData.title}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewQuizData(null);
                    setPreviewSelectedOpt(null);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Close preview"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Ribbon: Timer, Marks, & Answer Key Toggle */}
              <div className="py-3 px-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Timer Mode Badge */}
                  {previewQuizData.timerMode === "overall" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-amber-950/60 border border-amber-700 text-amber-300">
                      <Clock size={13} />
                      {previewQuizData.overallTimeLimit || 15}:00 TOTAL (Overall Mode)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-indigo-950/60 border border-indigo-700 text-indigo-300">
                      <Clock size={13} />
                      {previewQuizData.questions[previewModalIdx]?.timeLimit || previewQuizData.defaultTimeLimit || 30}s Countdown
                    </span>
                  )}

                  {/* Marks Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    <Star size={12} className="text-amber-400" />
                    {previewQuizData.questions[previewModalIdx]?.marks || previewQuizData.marksPerQuestion || 1} {((previewQuizData.questions[previewModalIdx]?.marks || previewQuizData.marksPerQuestion || 1) === 1) ? "Mark" : "Marks"}
                  </span>
                </div>

                {/* Show/Hide Answer Key Switch */}
                <button
                  type="button"
                  onClick={() => setPreviewShowAnswers((v) => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                    previewShowAnswers
                      ? "bg-emerald-950/70 border-emerald-700 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                  title="Toggle display of correct answer — Admin only feature"
                >
                  <CheckCircle2 size={13} className={previewShowAnswers ? "text-emerald-400" : "text-slate-500"} />
                  {previewShowAnswers ? "Hide Answer Key" : "Show Answer Key (Admin)"}
                </button>
              </div>

              {/* Scrollable Question Content */}
              {/* Notice banner shown when in student blind mode */}
              {!previewShowAnswers && (
                <div className="mx-4 sm:mx-6 mt-3 px-3 py-2 bg-violet-950/50 border border-violet-800/60 rounded-xl text-[11px] text-violet-300 font-semibold flex items-center gap-2 shrink-0">
                  <Eye size={13} className="shrink-0" />
                  Previewing as student — questions appear exactly as candidates see them during the exam. Toggle "Show Answer Key" above to reveal correct answers.
                </div>
              )}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                {previewQuizData.questions[previewModalIdx] && (
                  <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 space-y-4">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-bold uppercase tracking-wider text-indigo-400">
                        Question {previewModalIdx + 1} of {previewQuizData.questions.length}
                      </span>
                      {previewQuizData.minTimePerQuestion && previewQuizData.minTimePerQuestion > 0 && (
                        <span className="text-[11px] text-violet-300 bg-violet-950/60 border border-violet-800 px-2 py-0.5 rounded-md">
                          Min read time: {previewQuizData.minTimePerQuestion}s
                        </span>
                      )}
                    </div>

                    <div className="text-lg sm:text-xl font-bold text-white leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
                      {previewQuizData.questions[previewModalIdx].question}
                    </div>

                    {/* Options Simulator */}
                    <div className="space-y-2.5 pt-2">
                      {previewQuizData.questions[previewModalIdx].options?.map((opt: string, oIdx: number) => {
                        const isSelected = previewSelectedOpt === oIdx;
                        const isCorrect = oIdx === previewQuizData.questions[previewModalIdx].correctIndex;
                        const letter = String.fromCharCode(65 + oIdx);

                        let borderBgClasses =
                          "bg-slate-900/70 border-slate-700 text-slate-300 hover:border-slate-500";
                        if (isSelected) {
                          borderBgClasses =
                            "bg-indigo-900/60 border-indigo-500 text-white shadow-md shadow-indigo-900/30";
                        }
                        if (previewShowAnswers && isCorrect) {
                          borderBgClasses =
                            "bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50";
                        }

                        return (
                          <button
                            key={oIdx}
                            type="button"
                            onClick={() => setPreviewSelectedOpt(oIdx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 ${borderBgClasses}`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <span
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                  previewShowAnswers && isCorrect
                                    ? "bg-emerald-600 text-white"
                                    : isSelected
                                    ? "bg-indigo-600 text-white"
                                    : "bg-slate-800 text-slate-400 border border-slate-700"
                                }`}
                              >
                                {letter}
                              </span>
                              <span className="flex-1 min-w-0 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">{opt}</span>
                            </div>

                            {previewShowAnswers && isCorrect && (
                              <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                                <Check size={11} /> Correct Answer
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  disabled={previewModalIdx <= 0}
                  onClick={() => {
                    setPreviewModalIdx((prev) => (prev > 0 ? prev - 1 : prev));
                    setPreviewSelectedOpt(null);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft size={16} /> Prev Question
                </button>

                {/* Quick Jump Buttons */}
                <div className="hidden sm:flex items-center gap-1 overflow-x-auto max-w-xs py-1">
                  {previewQuizData.questions.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPreviewModalIdx(idx);
                        setPreviewSelectedOpt(null);
                      }}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                        previewModalIdx === idx
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                      title={`Jump to Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={previewModalIdx >= previewQuizData.questions.length - 1}
                  onClick={() => {
                    setPreviewModalIdx((prev) =>
                      prev < previewQuizData.questions.length - 1 ? prev + 1 : prev
                    );
                    setPreviewSelectedOpt(null);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-30 disabled:pointer-events-none"
                >
                  Next Question <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
