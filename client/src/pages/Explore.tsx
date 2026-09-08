<<<<<<< HEAD
import { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Compass,
  Search,
  ArrowRight,
  Clock,
  Sparkles,
  BookOpen,
  ListOrdered,
  CheckCircle2,
  FileCheck2,
} from "lucide-react";
import { useApi } from "../api/api";
import { AuthContext } from "../context/authContext";

interface QuizItem {
  _id: string;
  title: string;
  createdAt: string;
  timeLimit?: number;
  questionCount?: number;
}

const colorPalette = [
  { bg: "bg-indigo-500", text: "text-indigo-600", border: "border-indigo-400" },
  { bg: "bg-purple-500", text: "text-purple-600", border: "border-purple-400" },
  { bg: "bg-emerald-500", text: "text-emerald-600", border: "border-emerald-400" },
  { bg: "bg-amber-500", text: "text-amber-600", border: "border-amber-400" },
  { bg: "bg-rose-500", text: "text-rose-600", border: "border-rose-400" },
  { bg: "bg-cyan-500", text: "text-cyan-600", border: "border-cyan-400" },
];

export default function Explore() {
  const api = useApi();
  const { user } = useContext(AuthContext);
  const isStudent = !user?.isAdmin && user?.role !== "admin";

  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [attemptedIds, setAttemptedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [quizRes, dashRes] = await Promise.all([
          api.get("/quizzes"),
          isStudent ? api.get("/auth/dashboard") : Promise.resolve({ data: { tests: [] } }),
        ]);
        setQuizzes(quizRes.data.data || []);

        const tests: any[] = dashRes.data.tests || [];
        const ids = new Set(tests.map((t: any) => t.quizId?.toString()));
        setAttemptedIds(ids);
      } catch (err) {
        console.error("Failed to load quizzes for explore page", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [api]);

  const filteredQuizzes = quizzes.filter((q) =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.35 } },
  };

  return (
    <div className="bg-slate-50 min-h-[85vh] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-3 shadow-inner">
            <Compass size={28} />
          </div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight"
=======
import { motion } from 'framer-motion';
import { BookOpen, FlaskConical, History, Computer, Sparkles, Search, ArrowRight } from 'lucide-react';
import { useState } from 'react';

// Mock data for the quizzes to be displayed on the page.
// In a real application, this data would be fetched from a server.
const mockQuizzes = [
  {
    id: 1,
    title: "World History Trivia",
    description: "Test your knowledge of key historical events and figures from around the globe.",
    category: "History",
    icon: <History size={24} className="text-white" />,
    color: "bg-purple-500"
  },
  {
    id: 2,
    title: "Science Superlatives",
    description: "Explore fascinating facts and concepts across physics, biology, and chemistry.",
    category: "Science",
    icon: <FlaskConical size={24} className="text-white" />,
    color: "bg-blue-500"
  },
  {
    id: 3,
    title: "Computer Science Basics",
    description: "A beginner-friendly quiz on fundamental programming and computer science topics.",
    category: "Technology",
    icon: <Computer size={24} className="text-white" />,
    color: "bg-green-500"
  },
  {
    id: 4,
    title: "Literature Legends",
    description: "From Shakespeare to modern authors, how well do you know classic books and their stories?",
    category: "Literature",
    icon: <BookOpen size={24} className="text-white" />,
    color: "bg-red-500"
  },
  {
    id: 5,
    title: "General Knowledge",
    description: "A wide-ranging quiz to test your general knowledge on various topics.",
    category: "Misc",
    icon: <Sparkles size={24} className="text-white" />,
    color: "bg-yellow-500"
  },
];

const Explore = () => {
  // State to hold the search query. This is for demonstration purposes.
  const [searchQuery, setSearchQuery] = useState('');

  // Variants for card animation
  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Main Header Section */}
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-2"
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
          >
            Explore Quizzes
          </motion.h1>
          <motion.p
<<<<<<< HEAD
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mt-2"
          >
            Discover challenges across programming, science, history, and general knowledge.
          </motion.p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-12">
          <div className="relative flex items-center shadow-sm rounded-2xl">
            <Search className="absolute left-4 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search quizzes by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 text-slate-500">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent mb-3"></div>
            <p className="font-medium">Discovering quizzes...</p>
          </div>
        ) : filteredQuizzes.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-lg mx-auto p-8">
            <div className="inline-flex p-3 bg-indigo-50 text-indigo-600 rounded-2xl mb-4">
              <Sparkles size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Quizzes Found</h3>
            <p className="text-slate-600 mb-6 text-sm">
              {searchQuery
                ? `No quizzes match "${searchQuery}". Try a different keyword.`
                : "No quizzes have been created yet. Be the first to build one!"}
            </p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-sm"
            >
              Create a Quiz
            </Link>
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
            }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filteredQuizzes.map((quiz, index) => {
                const theme = colorPalette[index % colorPalette.length];
                const count = quiz.questionCount || 4;
                const time = quiz.timeLimit || 5;
                const hasCompleted = isStudent && attemptedIds.has(quiz._id);

                return (
                  <motion.div
                    key={quiz._id}
                    variants={cardVariants}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl border border-slate-200 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${theme.bg} shadow-md`}
                        >
                          {hasCompleted ? <CheckCircle2 size={20} /> : <BookOpen size={20} />}
                        </div>
                        <span className="text-xs font-semibold text-slate-400">
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {hasCompleted && (
                        <span className="inline-block text-[10px] font-black tracking-wider uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full mb-2">
                          ✅ Completed
                        </span>
                      )}

                      <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">
                        {quiz.title}
                      </h3>

                      <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 mt-4">
                        <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <Clock size={14} className="text-indigo-600" /> {time} mins
                        </span>
                        <span className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                          <ListOrdered size={14} className="text-indigo-600" /> {count} Questions
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                      {hasCompleted ? (
                        <>
                          <div className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold rounded-xl text-sm cursor-not-allowed">
                            <CheckCircle2 size={16} /> Attempt Locked
                          </div>
                          <Link
                            to={`/result/${quiz._id}`}
                            className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
                          >
                            <FileCheck2 size={16} /> View My Result
                          </Link>
                        </>
                      ) : (
                        <Link
                          to={`/take/${quiz._id}`}
                          className="w-full inline-flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md shadow-indigo-100 transition-all text-sm"
                        >
                          Start Quiz <ArrowRight size={16} />
                        </Link>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

=======
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Discover and play a variety of quizzes on different topics. Challenge yourself and learn something new!
          </motion.p>
        </div>

        {/* Search Bar Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-10 w-full max-w-md mx-auto"
        >
          <div className="relative flex items-center">
            <Search className="absolute left-4 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-full border-2 border-gray-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all outline-none shadow-sm"
            />
          </div>
        </motion.div>

        {/* Quiz Cards Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {mockQuizzes.map((quiz, index) => (
            <motion.div
              key={quiz.id}
              variants={cardVariants}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.03, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)" }}
              className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between cursor-pointer transition-all border-l-4"
              style={{ borderLeftColor: quiz.color.split('-')[0] + "-400" }} // Dynamic border color
            >
              {/* Card Header */}
              <div className="flex items-center space-x-4 mb-4">
                <div className={`p-3 rounded-full ${quiz.color}`}>
                  {quiz.icon}
                </div>
                <span className="text-sm font-semibold text-gray-500">{quiz.category}</span>
              </div>
              
              {/* Card Body */}
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{quiz.title}</h3>
                <p className="text-gray-600 text-sm">{quiz.description}</p>
              </div>

              {/* Card Footer */}
              <div className="mt-4">
                <button className="flex items-center space-x-2 text-indigo-600 font-medium hover:text-indigo-800 transition-colors">
                  <span>Start Quiz</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default Explore;
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
