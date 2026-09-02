import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, ShieldAlert, Monitor, ArrowLeft, RefreshCw, Sparkles, CheckCircle2 } from "lucide-react";
import { useApi, API_BASE } from "../api/api";
import { AuthContext } from "../context/authContext";

export default function WaitingRoom() {
  const { id } = useParams<{ id: string }>();
  const [quiz, setQuiz] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const api = useApi();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    let isMounted = true;

    const fetchQuiz = async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        if (!isMounted) return;
        const q = res.data.data;
        setQuiz(q);

        // If quiz is already active, direct user to take it
        if (q.status === "active") {
          setIsStarting(true);
          setTimeout(() => {
            navigate(`/take/${id}`);
          }, 1200);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setError(err.response?.data?.message || "Failed to load quiz details");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchQuiz();

    // 1. Real-Time SSE Listener
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`${API_BASE}/live/quiz/${id}`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "status_change" && data.status === "active") {
            setIsStarting(true);
            setTimeout(() => {
              navigate(`/take/${id}`);
            }, 1200);
          }
        } catch {
          // ignore parse errors
        }
      };
    } catch (e) {
      console.warn("SSE connection error, falling back to polling", e);
    }

    // 2. Fallback Heartbeat Polling every 3 seconds
    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/quizzes/${id}`);
        const q = res.data.data;
        if (q.status === "active") {
          setIsStarting(true);
          clearInterval(interval);
          setTimeout(() => {
            navigate(`/take/${id}`);
          }, 1000);
        }
      } catch {
        // quiet error
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [id, navigate, api]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <RefreshCw size={36} className="animate-spin text-indigo-600 mb-3" />
        <p className="text-sm font-semibold text-gray-600">Connecting to Quiz Lobby...</p>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-red-200 shadow-xl text-center">
          <ShieldAlert size={44} className="text-red-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Unable to Join Lobby</h2>
          <p className="text-sm text-gray-600 mb-6">{error || "Quiz not found"}</p>
          <Link
            to="/list"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm"
          >
            <ArrowLeft size={16} /> Return to Quiz List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xl relative overflow-hidden"
      >
        {/* Animated background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-44 h-44 bg-indigo-100 rounded-full blur-3xl pointer-events-none" />

        {isStarting ? (
          <div className="text-center py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 size={36} />
            </motion.div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Quiz Has Started!</h2>
            <p className="text-sm font-semibold text-indigo-600 animate-pulse">
              Entering full-screen exam room now...
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
              <Link
                to="/list"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 transition"
              >
                <ArrowLeft size={14} /> Exit Lobby
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-amber-600" />
                WAITING FOR ADMIN
              </span>
            </div>

            {/* Quiz Info */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
                {quiz.title}
              </h1>
              {quiz.description && (
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{quiz.description}</p>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-xs text-gray-400 font-semibold">Questions</span>
                  <span className="text-lg font-black text-gray-900">{quiz.questions?.length || 0}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                  <span className="block text-xs text-gray-400 font-semibold">Timer / Q</span>
                  <span className="text-lg font-black text-gray-900">{quiz.defaultTimeLimit || 30}s</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-center col-span-2 sm:col-span-1">
                  <span className="block text-xs text-gray-400 font-semibold">Candidate</span>
                  <span className="text-sm font-bold text-indigo-600 truncate block">
                    {user?.name || "Student"}
                  </span>
                </div>
              </div>
            </div>

            {/* Anti-Cheat & Rules Notice */}
            <div className="p-5 bg-amber-50/70 border border-amber-200 rounded-2xl mb-8 space-y-2.5 text-xs text-amber-900">
              <p className="font-bold flex items-center gap-1.5 text-amber-800 text-sm">
                <ShieldAlert size={16} /> Strict Examination Rules:
              </p>
              <div className="flex items-start gap-2">
                <Monitor size={14} className="mt-0.5 text-amber-700 shrink-0" />
                <span>
                  <strong>Full-Screen Required:</strong> The quiz will run in full-screen mode. Exiting full-screen will trigger an immediate violation warning.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={14} className="mt-0.5 text-amber-700 shrink-0" />
                <span>
                  <strong>Per-Question Timers:</strong> When the countdown expires, your selection is automatically saved and you are moved to the next question.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <ShieldAlert size={14} className="mt-0.5 text-amber-700 shrink-0" />
                <span>
                  <strong>Anti-Cheat Active:</strong> Tab switching, minimizing the browser, or switching windows is detected and logged for the Admin. 3 violations auto-submit the quiz.
                </span>
              </div>
            </div>

            {/* Live Spinner Box */}
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCw size={20} className="animate-spin text-indigo-600" />
                <div>
                  <p className="text-xs font-bold text-indigo-950">Waiting for Admin to start the quiz...</p>
                  <p className="text-[11px] text-indigo-600">Your screen will automatically start when the host begins.</p>
                </div>
              </div>
              <Sparkles size={18} className="text-indigo-400" />
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
