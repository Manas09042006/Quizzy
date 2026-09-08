<<<<<<< HEAD
import { useEffect, useState, useContext } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, Search, PlayCircle, CheckCircle2, FileCheck2 } from "lucide-react";
import { useApi } from "../api/api";
import { useError } from "../context/ErrorContext";
import { AuthContext } from "../context/authContext";

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  status: "draft" | "active" | "ended";
  createdAt: string;
  defaultTimeLimit?: number;
  totalTimeMinutes: number;
  questionCount: number;
=======
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Plus, Clock, ListOrdered, Search } from 'lucide-react';
import { useApi } from "../api/api";
import { useError } from "../context/ErrorContext";

// Updated interface to include time and question count
interface Quiz {
  _id: string;
  title: string;
  createdAt: string;
  timeLimit: number; // Time limit in minutes
  questionCount: number; // Total number of questions
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
}

export default function QuizList() {
  const api = useApi();
  const { setErrors } = useError();
<<<<<<< HEAD
  const { user } = useContext(AuthContext);
  const isStudent = !user?.isAdmin && user?.role !== "admin";

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAll = async () => {
      setErrors([]);
      try {
        const [quizRes, dashRes] = await Promise.all([
          api.get("/quizzes"),
          isStudent ? api.get("/auth/dashboard") : Promise.resolve({ data: { tests: [] } }),
        ]);
        setQuizzes(quizRes.data.data || []);

        const tests: any[] = dashRes.data.tests || [];
        const ids = new Set(tests.map((t: any) => t.quizId?.toString()));
        setAttemptedIds(ids);
      } catch {
        // quiet
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const filteredQuizzes = quizzes.filter((quiz) => {
    const titleMatch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    const dateMatch = new Date(quiz.createdAt).toLocaleDateString().includes(searchTerm);
    return titleMatch || dateMatch;
  });

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-slate-50 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Available Assessments
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Select an assessment below. Live quizzes can be started immediately.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-xs"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-500">Loading assessments...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm max-w-md mx-auto">
            <p className="text-base font-bold text-gray-700 mb-2">No quizzes available</p>
            <p className="text-xs text-gray-400 mb-6">Check back later or ask your instructor.</p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
            >
              <Plus size={16} /> Create a Quiz
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredQuizzes.map((quiz) => {
                const isActive = quiz.status === "active";
                const isDraft = quiz.status === "draft";
                const hasCompleted = isStudent && attemptedIds.has(quiz._id);

                return (
                  <motion.div
                    key={quiz._id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition"
                    whileHover={{ y: -3 }}
                  >
                    <div>
                      {/* Status badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                            hasCompleted
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : isActive
                              ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                              : isDraft
                              ? "bg-amber-100 text-amber-800 border-amber-300 animate-pulse"
                              : "bg-slate-100 text-slate-600 border-slate-300"
                          }`}
                        >
                          {hasCompleted
                            ? "✅ COMPLETED"
                            : isActive
                            ? "🟢 LIVE / ACTIVE"
                            : isDraft
                            ? "🟡 WAITING FOR ADMIN"
                            : "🔴 ENDED"}
                        </span>
                        <span className="text-xs text-gray-400 font-semibold">
                          {quiz.questionCount} Questions
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">
                        {quiz.title}
                      </h3>
                      {quiz.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                          {quiz.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-xs text-gray-400 font-medium mb-6">
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="text-indigo-600" />
                          {quiz.defaultTimeLimit || 30}s per question
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 space-y-2">
                      {hasCompleted ? (
                        <>
                          <div className="w-full py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-not-allowed">
                            <CheckCircle2 size={15} /> Attempt Submitted
                          </div>
                          <Link
                            to={`/result/${quiz._id}`}
                            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition"
                          >
                            <FileCheck2 size={15} /> View My Result
                          </Link>
                        </>
                      ) : isActive ? (
                        <Link
                          to={`/take/${quiz._id}`}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                        >
                          <PlayCircle size={16} /> Enter Full-Screen Quiz
                        </Link>
                      ) : isDraft ? (
                        <Link
                          to={`/waiting/${quiz._id}`}
                          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition"
                        >
                          <Clock size={16} /> Enter Waiting Room
                        </Link>
                      ) : (
                        <button
                          disabled
                          className="w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl text-xs cursor-not-allowed"
                        >
                          Assessment Ended
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
=======
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Function to fetch quizzes from the API
  async function fetchQuizzes() {
    setErrors([]);
    try {
      const res = await api.get("/quizzes");
      const quizzesWithDetails = (res.data.data || []).map((quiz: any) => ({
        ...quiz,
        timeLimit: quiz.timeLimit || 10,
        questionCount: quiz.questionCount || 10,
      }));
      setQuizzes(quizzesWithDetails);
    } catch (error) {
      // The global API interceptor handles errors
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuizzes();
  }, [api, setErrors]);

  // Filter quizzes based on search input (title or date)
  const filteredQuizzes = quizzes.filter((quiz) => {
    const titleMatch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    const dateMatch = new Date(quiz.createdAt)
      .toLocaleDateString()
      .includes(searchTerm);
    return titleMatch || dateMatch;
  });

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1, when: "beforeChildren", duration: 0.5 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } }
  };

  return (
    <motion.div className="p-8 mt-5 min-h-screen bg-gray-50" initial="hidden" animate="visible" variants={containerVariants}>
      <div className="max-w-screen-xl mx-auto">
        

        {/* Header + Search Bar */}
<div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full max-w-4xl mx-auto">
  {/* Title */}
  <h2 className="text-xl sm:text-3xl md:text-3xl font-extrabold text-gray-800 dark:text-white">
  Available Quizzes
</h2>


  {/* Search Bar */}
  <div className="flex items-center gap-2 border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 shadow-sm flex-1 sm:max-w-xs">
    <Search size={18} className="text-gray-400 dark:text-gray-300" />
    <input
      type="text"
      placeholder="Search by title or date..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="bg-transparent outline-none w-full text-sm text-gray-700 dark:text-gray-200"
    />
  </div>
</div>


        {loading ? (
          <div className="flex justify-center items-center h-40 text-indigo-600">
            <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-4 text-xl">Loading quizzes...</span>
          </div>
        ) : (
          <>
            {filteredQuizzes.length === 0 ? (
              <motion.div
                className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl shadow-lg border border-dashed border-gray-300"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <p className="text-xl text-gray-600 mb-6">No quizzes found.</p>
                <Link
                  to="/create"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
                >
                  <Plus size={20} /> Create a New Quiz
                </Link>
              </motion.div>
            ) : (
              <motion.div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" variants={containerVariants} initial="hidden" animate="visible">
                <AnimatePresence>
                  {filteredQuizzes.map((quiz) => (
                    <motion.div
                      key={quiz._id}
                      className="p-6 border border-gray-200 rounded-xl bg-white shadow-md flex flex-col justify-between transition-all duration-300 transform"
                      variants={itemVariants}
                      whileHover={{ scale: 1.05, boxShadow: "0 15px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    >
                      <div className="flex-grow w-full text-left">
                        <h3 className="text-2xl font-bold text-gray-800">{quiz.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>

                        <div className="mt-4 flex items-center justify-start gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock size={16} className="text-indigo-500" /> {quiz.timeLimit} min
                          </span>
                          <span className="flex items-center gap-1">
                            <ListOrdered size={16} className="text-indigo-500" /> {quiz.questionCount} Questions
                          </span>
                        </div>
                      </div>

                      <div className="w-full mt-6">
                        <Link
                          to={`/take/${quiz._id}`}
                          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
                        >
                          Take Quiz <ArrowRight size={20} />
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  );
}
