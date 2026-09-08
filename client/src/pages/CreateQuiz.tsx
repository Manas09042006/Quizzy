import React, { useState, useEffect } from "react";
<<<<<<< HEAD
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Share2,
  Copy,
  Clock,
  Timer,
  Eye,
  CheckCircle2,
  Shuffle,
  ToggleLeft,
  ToggleRight,
  Star,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
=======
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Share2, Copy } from "lucide-react";
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
import { useApi } from "../api/api";
import { useError } from "../context/ErrorContext";
import { useSuccess } from "../context/SuccessContext";

<<<<<<< HEAD
type Q = {
  question: string;
  options: string[];
  correctIndex: number;
  timeLimit?: number;
  marks?: number;
};
=======
type Option = string;
type Q = { question: string; options: Option[]; correctIndex: number };
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6

export default function CreateQuiz() {
  const api = useApi();
  const { setErrors } = useError();
  const { addMessage } = useSuccess();

  const [title, setTitle] = useState("");
<<<<<<< HEAD
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "active">("draft");
  const [timerMode, setTimerMode] = useState<"per_question" | "overall">("per_question");
  const [defaultTimeLimit, setDefaultTimeLimit] = useState(30);
  const [overallTimeLimit, setOverallTimeLimit] = useState(0); // minutes
  const [minTimePerQuestion, setMinTimePerQuestion] = useState(0); // seconds
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);

  // Question Preview simulator states
  const [previewModalIndex, setPreviewModalIndex] = useState<number | null>(null);
  const [previewSelectedOption, setPreviewSelectedOption] = useState<number | null>(null);
  const [previewShowAnswerKey, setPreviewShowAnswerKey] = useState<boolean>(true);

  const [questions, setQuestions] = useState<Q[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      timeLimit: 30,
      marks: 1,
    },
  ]);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [createdQuizId, setCreatedQuizId] = useState<string | null>(null);
=======
  const [submitted, setSubmitted] = useState(false);
  const [questions, setQuestions] = useState<Q[]>([
    { question: "", options: ["", "", "", ""], correctIndex: 0 },
  ]);
  const [quizLink, setQuizLink] = useState<string | null>(null);
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyLink = () => {
<<<<<<< HEAD
    if (!createdQuizId) return;
    const fullLink = `${window.location.origin}/take/${createdQuizId}`;
=======
    if (!quizLink) return;
    const fullLink = `${window.location.origin}${quizLink}`;
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
    navigator.clipboard.writeText(fullLink).then(() => setCopied(true));
  };

  const updateQuestion = (i: number, field: Partial<Q>) => {
    const copy = [...questions];
    copy[i] = { ...copy[i], ...field };
    setQuestions(copy);
  };

  const addQuestion = () =>
    setQuestions([
      ...questions,
<<<<<<< HEAD
      {
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        timeLimit: defaultTimeLimit,
        marks: marksPerQuestion,
      },
=======
      { question: "", options: ["", "", "", ""], correctIndex: 0 },
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
    ]);

  const removeQuestion = (i: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== i));
  };

<<<<<<< HEAD
  const addOption = (qIdx: number) => {
    if (questions[qIdx].options.length >= 6) return;
    const opts = [...questions[qIdx].options, ""];
    updateQuestion(qIdx, { options: opts });
  };

  const removeOption = (qIdx: number, optIdx: number) => {
    if (questions[qIdx].options.length <= 2) return;
    const opts = questions[qIdx].options.filter((_, idx) => idx !== optIdx);
    const newCorrect =
      questions[qIdx].correctIndex >= opts.length
        ? opts.length - 1
        : questions[qIdx].correctIndex;
    updateQuestion(qIdx, { options: opts, correctIndex: newCorrect });
  };

  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    if (!title.trim()) newErrors.push("Quiz title is required.");
    if (timerMode === "overall" && (!overallTimeLimit || overallTimeLimit < 1)) {
      newErrors.push("Overall time limit must be at least 1 minute.");
    }
=======
  const validateForm = (): boolean => {
    const newErrors: string[] = [];
    if (!title.trim()) newErrors.push("Quiz title is required.");
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
    questions.forEach((q, i) => {
      if (!q.question.trim())
        newErrors.push(`Question ${i + 1} cannot be empty.`);
      q.options.forEach((opt, j) => {
        if (!opt.trim())
<<<<<<< HEAD
          newErrors.push(`Option ${j + 1} for Question ${i + 1} cannot be empty.`);
=======
          newErrors.push(
            `Option ${j + 1} for Question ${i + 1} cannot be empty.`
          );
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
      });
    });
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setErrors([]);
    if (!validateForm()) return;
<<<<<<< HEAD
    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        timerMode,
        defaultTimeLimit,
        overallTimeLimit: timerMode === "overall" ? overallTimeLimit : 0,
        minTimePerQuestion,
        shuffleQuestions,
        marksPerQuestion,
        questions: questions.map((q) => ({
          ...q,
          timeLimit: timerMode === "per_question" ? (q.timeLimit || defaultTimeLimit) : defaultTimeLimit,
          marks: q.marks || marksPerQuestion,
        })),
      };

      const res = await api.post("/quizzes", payload);
      const quizId = res.data.data._id;
      addMessage("Quiz created successfully!");
      setCreatedQuizId(quizId);
=======
    try {
      const payload = { title, questions };
      const res = await api.post("/quizzes", payload);
      const quizId = res.data.data._id;
      addMessage("Quiz Created Successfully");
      setQuizLink(`/take/${quizId}`);
      setTitle("");
      setQuestions([
        { question: "", options: ["", "", "", ""], correctIndex: 0 },
      ]);
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
    } catch (err: any) {
      setErrors([
        err.response?.data?.message ||
          "Something went wrong while creating the quiz.",
      ]);
<<<<<<< HEAD
    } finally {
      setLoading(false);
    }
  };

  // Computed summary values
  const totalQuestionsTime = questions.reduce((s, q) => s + (q.timeLimit || defaultTimeLimit), 0);
  const effectiveDuration = timerMode === "overall" && overallTimeLimit > 0
    ? overallTimeLimit
    : Math.ceil(totalQuestionsTime / 60);
  const totalMarks = questions.reduce((s, q) => s + (q.marks || marksPerQuestion), 0);

  const fullQuizLink = createdQuizId
    ? `${window.location.origin}/take/${createdQuizId}`
    : "";
  const whatsappUrl = encodeURI(
    `https://api.whatsapp.com/send?text=Take this assessment: ${fullQuizLink}`
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 my-8 font-sans">
      <AnimatePresence mode="wait">
        {createdQuizId ? (
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-200 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="text-3xl font-black text-slate-900 mb-2">Quiz Published! 🎉</h2>
            <p className="text-sm text-slate-500 mb-6">
              Status:{" "}
              <strong className={status === "active" ? "text-emerald-600" : "text-amber-600"}>
                {status === "active" ? "Live / Active" : "Waiting for Admin to Start"}
              </strong>
            </p>

            {/* Link Box */}
            <div className="flex items-center gap-2 max-w-lg mx-auto p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-8">
              <span className="flex-1 text-xs text-indigo-600 font-mono font-bold truncate text-left pl-2">
                {fullQuizLink}
              </span>
              <button
                onClick={handleCopyLink}
                className="p-2.5 rounded-xl bg-white text-slate-700 hover:text-indigo-600 border border-slate-200 transition relative"
                title="Copy share link"
              >
                <Copy size={16} />
                {copied && (
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                    Copied!
                  </span>
                )}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
              <Link
                to={`/admin/monitor/${createdQuizId}`}
                className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-100 transition"
              >
                <Eye size={15} /> Live Monitor
              </Link>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-100 transition"
              >
                <Share2 size={15} /> WhatsApp
              </a>
              <button
                onClick={() => {
                  setCreatedQuizId(null);
                  setTitle("");
                  setDescription("");
                  setTimerMode("per_question");
                  setOverallTimeLimit(0);
                  setMinTimePerQuestion(0);
                  setShuffleQuestions(true);
                  setQuestions([
                    {
                      question: "",
                      options: ["", "", "", ""],
                      correctIndex: 0,
                      timeLimit: 30,
                      marks: 1,
                    },
                  ]);
                }}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
              >
                Create Another
              </button>
=======
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const fullQuizLink = quizLink ? `${window.location.origin}${quizLink}` : "";
  const whatsappUrl = encodeURI(
    `https://api.whatsapp.com/send?text=Take this quiz: ${fullQuizLink}`
  );

  return (
    <motion.div
      className="max-w-3xl mx-auto p-4 md:p-10 my-8 bg-white rounded-3xl shadow-xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <AnimatePresence mode="wait">
        {quizLink ? (
          <motion.div
            key="success-message"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center justify-center p-8 md:p-12 bg-green-100 dark:bg-green-900 rounded-2xl shadow-lg text-center"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-green-800 dark:text-green-200 mb-4 animate-bounce">
              Quiz Created! 🎉
            </h2>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 mb-6 break-words">
              Share this link with your friends:
            </p>
            <div className="flex items-center space-x-2 w-full max-w-lg p-3 bg-white dark:bg-gray-700 rounded-lg shadow-inner">
              <a
                href={quizLink}
                className="flex-grow text-indigo-600 dark:text-indigo-400 underline break-all"
              >
                {fullQuizLink}
              </a>
              <motion.button
                onClick={handleCopyLink}
                className="p-2 rounded-full text-indigo-600 dark:text-indigo-400 relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Copy size={20} />
                <AnimatePresence>
                  {copied && (
                    <motion.span
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: -40 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full shadow-lg"
                    >
                      Copied!
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full">
              <motion.a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-bold shadow-md hover:bg-green-600"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Share2 size={20} /> Share on WhatsApp
              </motion.a>
              <motion.button
                onClick={() => setQuizLink(null)}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Another Quiz
              </motion.button>
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="create-form"
<<<<<<< HEAD
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200"
          >
            <div className="mb-8">
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Admin Assessment Studio
              </span>
              <h1 className="text-3xl font-black text-slate-900 mt-2 tracking-tight">
                Create a New Quiz
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Configure questions, marks, timers, shuffle settings, and correct answers.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quiz Metadata Box */}
              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (submitted) validateForm();
                    }}
                    placeholder="e.g. React & TypeScript Advanced Concepts"
                    className={`w-full p-3.5 bg-white rounded-xl border text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                      submitted && !title.trim() ? "border-red-500" : "border-slate-200"
                    }`}
                  />
                  {submitted && !title.trim() && (
                    <p className="text-xs text-red-600 mt-1 font-semibold">Quiz title is required.</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Quiz Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of the assessment syllabus and instructions"
                    className="w-full p-3 bg-white rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                {/* Status & Global Defaults Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Initial Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as "draft" | "active")}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600"
                    >
                      <option value="draft">🟡 Waiting for Admin (Draft)</option>
                      <option value="active">🟢 Start Immediately (Active)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Default Marks / Question
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={marksPerQuestion}
                      onChange={(e) => setMarksPerQuestion(Number(e.target.value))}
                      className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600"
                    />
                  </div>
                </div>

                {/* Timer Mode Section */}
                <div className="pt-2 space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase">
                    ⏱️ Timer Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTimerMode("per_question")}
                      className={`p-3.5 rounded-2xl border-2 text-left transition ${
                        timerMode === "per_question"
                          ? "border-indigo-500 bg-indigo-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={15} className={timerMode === "per_question" ? "text-indigo-600" : "text-slate-400"} />
                        <span className={`text-xs font-black ${timerMode === "per_question" ? "text-indigo-700" : "text-slate-700"}`}>
                          Per-Question Timer
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Each question has its own countdown. Time is set per question.</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimerMode("overall")}
                      className={`p-3.5 rounded-2xl border-2 text-left transition ${
                        timerMode === "overall"
                          ? "border-amber-500 bg-amber-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Timer size={15} className={timerMode === "overall" ? "text-amber-600" : "text-slate-400"} />
                        <span className={`text-xs font-black ${timerMode === "overall" ? "text-amber-700" : "text-slate-700"}`}>
                          Overall Test Time
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Single countdown for the whole exam. Per-question timers are disabled.</p>
                    </button>
                  </div>

                  {/* Timer Settings based on mode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {timerMode === "per_question" ? (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Default Timer / Question
                          </label>
                          <select
                            value={defaultTimeLimit}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setDefaultTimeLimit(val);
                              setQuestions((prev) =>
                                prev.map((q) => ({ ...q, timeLimit: val }))
                              );
                            }}
                            className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600"
                          >
                            <option value={15}>15 Seconds</option>
                            <option value={30}>30 Seconds</option>
                            <option value={45}>45 Seconds</option>
                            <option value={60}>60 Seconds (1 Min)</option>
                            <option value={90}>90 Seconds</option>
                            <option value={120}>120 Seconds (2 Min)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Min Time / Question
                          </label>
                          <select
                            value={minTimePerQuestion}
                            onChange={(e) => setMinTimePerQuestion(Number(e.target.value))}
                            className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600"
                          >
                            <option value={0}>No Minimum</option>
                            <option value={5}>5 Seconds</option>
                            <option value={10}>10 Seconds</option>
                            <option value={15}>15 Seconds</option>
                            <option value={20}>20 Seconds</option>
                          </select>
                          <p className="text-[10px] text-slate-400 mt-0.5">Prevents instant skipping</p>
                        </div>
                        <div className="flex items-end">
                          <div className="w-full p-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
                            <p className="text-[10px] font-bold text-indigo-600 uppercase">Estimated Duration</p>
                            <p className="text-sm font-black text-indigo-800">{effectiveDuration} min</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                            Overall Time Limit *
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              max={360}
                              value={overallTimeLimit || ""}
                              onChange={(e) => setOverallTimeLimit(Number(e.target.value))}
                              placeholder="e.g. 30"
                              className={`w-full p-2.5 bg-white rounded-xl border text-xs font-bold text-slate-800 focus:ring-2 focus:ring-amber-500 ${
                                submitted && timerMode === "overall" && !overallTimeLimit ? "border-red-500" : "border-slate-200"
                              }`}
                            />
                            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">mins</span>
                          </div>
                          {submitted && timerMode === "overall" && !overallTimeLimit && (
                            <p className="text-[10px] text-red-500 mt-0.5">Required for overall mode</p>
                          )}
                        </div>
                        <div className="sm:col-span-2 flex items-center gap-3 p-3 bg-amber-50/80 border border-amber-200 rounded-2xl">
                          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                            <Clock size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-amber-900">Per-Question Timers Disabled</p>
                            <p className="text-[11px] text-amber-700">
                              In Overall Test mode, individual question timers are locked and will not be displayed during the exam. Students will have a total of <span className="font-bold">{overallTimeLimit || "X"} minutes</span> for the entire test.
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Shuffle Questions Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2.5">
                    <Shuffle size={16} className={shuffleQuestions ? "text-violet-600" : "text-slate-400"} />
                    <div>
                      <p className="text-xs font-black text-slate-800">Shuffle Questions</p>
                      <p className="text-[10px] text-slate-500">Each student sees questions in a different random order</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShuffleQuestions((v) => !v)}
                    className="transition"
                    title="Toggle shuffle"
                  >
                    {shuffleQuestions ? (
                      <ToggleRight size={30} className="text-violet-600" />
                    ) : (
                      <ToggleLeft size={30} className="text-slate-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Live Summary Badge */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase">Questions</p>
                  <p className="text-lg font-black text-indigo-800">{questions.length}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase">Total Marks</p>
                  <p className="text-lg font-black text-emerald-800">{totalMarks}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100 text-center">
                  <p className="text-[10px] font-bold text-amber-500 uppercase">Duration</p>
                  <p className="text-lg font-black text-amber-800">{effectiveDuration} min</p>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="text-lg font-black text-slate-900">
                    Questions ({questions.length})
                  </h3>
                  <div className="flex items-center gap-2.5">
                    <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                      Radio button indicates the correct answer.
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewModalIndex(0);
                        setPreviewSelectedOption(null);
                      }}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition border border-indigo-200 shadow-xs"
                      title="Preview candidate exam experience"
                    >
                      <Eye size={14} /> Preview Questions
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {questions.map((q, qIdx) => (
                    <motion.div
                      key={qIdx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 bg-slate-50/70 rounded-3xl border border-slate-200 relative"
                    >
                      {/* Question Top Controls */}
                      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                        <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {qIdx + 1}
                        </span>

                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Per-Question Timer (only in per_question mode) */}
                          {timerMode === "per_question" && (
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                              <Clock size={14} className="text-indigo-600" />
                              <select
                                value={q.timeLimit || defaultTimeLimit}
                                onChange={(e) =>
                                  updateQuestion(qIdx, { timeLimit: Number(e.target.value) })
                                }
                                className="bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold"
                              >
                                <option value={15}>15s</option>
                                <option value={30}>30s</option>
                                <option value={45}>45s</option>
                                <option value={60}>60s</option>
                                <option value={90}>90s</option>
                              </select>
                            </div>
                          )}

                          {/* Per-Question Marks */}
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                            <Star size={13} className="text-amber-500" />
                            <input
                              type="number"
                              min={1}
                              max={100}
                              value={q.marks || marksPerQuestion}
                              onChange={(e) =>
                                updateQuestion(qIdx, { marks: Number(e.target.value) })
                              }
                              className="bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold w-14"
                              title="Marks for this question"
                            />
                            <span className="text-slate-400">mark{(q.marks || marksPerQuestion) !== 1 ? "s" : ""}</span>
                          </div>

                          {/* Preview Question Button */}
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewModalIndex(qIdx);
                              setPreviewSelectedOption(null);
                            }}
                            className="px-2.5 py-1 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg flex items-center gap-1 transition"
                            title="Preview how candidates see this question"
                          >
                            <Eye size={13} /> Preview
                          </button>

                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(qIdx)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete question"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <textarea
                        rows={3}
                        value={q.question}
                        onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                        placeholder={`Question ${qIdx + 1} text... (pasting multi-line code & indentation supported)`}
                        className={`w-full p-3 bg-white rounded-xl border text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 mb-4 resize-y min-h-[80px] break-words [overflow-wrap:anywhere] whitespace-pre-wrap ${
                          submitted && !q.question.trim() ? "border-red-500" : "border-slate-200"
                        }`}
                      />
                      {submitted && !q.question.trim() && (
                        <p className="text-xs text-red-600 mb-3 font-semibold">
                          Question text cannot be empty.
                        </p>
                      )}

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctIndex === optIdx;
                          const letter = String.fromCharCode(65 + optIdx);

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                                isCorrect
                                  ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400"
                                  : "bg-white border-slate-200"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={isCorrect}
                                onChange={() => updateQuestion(qIdx, { correctIndex: optIdx })}
                                className="w-4 h-4 text-emerald-600 accent-emerald-600 cursor-pointer"
                                title="Set as correct answer"
                              />
                              <span className="text-xs font-black text-slate-400 w-4">{letter}</span>
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => {
                                  const opts = [...q.options];
                                  opts[optIdx] = e.target.value;
                                  updateQuestion(qIdx, { options: opts });
                                }}
                                placeholder={`Option ${letter}`}
                                className="flex-1 min-w-0 bg-transparent text-xs font-semibold text-slate-900 outline-none break-words [overflow-wrap:anywhere]"
                              />
                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(qIdx, optIdx)}
                                  className="text-slate-300 hover:text-red-500 p-1"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Option Button */}
                      {q.options.length < 6 && (
                        <button
                          type="button"
                          onClick={() => addOption(qIdx)}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 mt-1"
                        >
                          <Plus size={14} /> Add Another Option
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition"
                >
                  <Plus size={18} /> Add New Question
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition"
                >
                  {loading ? "Publishing Quiz..." : "Publish Quiz"}
                </button>
=======
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <h2 className="text-2xl md:text-3xl font-extrabold mb-6 md:mb-8 text-center text-gray-800 dark:text-white">
              Create a New Quiz
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Quiz Title */}
              <motion.input
                whileFocus={{ scale: 1.01 }}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (submitted) validateForm();
                }}
                placeholder="Enter Quiz Title"
                className={`w-full p-3 text-lg border-2 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all duration-200 dark:bg-gray-700 dark:text-white dark:border-gray-600 ${
                  submitted && !title.trim() ? "border-red-500" : ""
                }`}
              />
              {submitted && !title.trim() && (
                <p className="text-sm text-red-500 mt-1">
                  Quiz title is required.
                </p>
              )}

              {/* Questions */}
              <AnimatePresence>
                {questions.map((q, i) => (
                  <motion.div
                    key={i}
                    className="p-6 border-2 border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 shadow-md"
                    initial={{ opacity: 0, x: 100 }} // Starts off-screen to the right
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 20,
                      },
                    }} // Slides in
                    exit={{ opacity: 0, x: -100 }} // Slides out to the left
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
                      <input
                        value={q.question}
                        onChange={(e) =>
                          updateQuestion(i, { question: e.target.value })
                        }
                        placeholder={`Question ${i + 1}`}
                        className={`w-full text-lg font-semibold p-2 border-b-2 bg-transparent focus:outline-none focus:border-indigo-500 dark:text-white ${
                          submitted && !q.question.trim()
                            ? "border-red-500"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      />
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeQuestion(i)}
                          className="p-2 rounded-full text-gray-400 hover:text-red-500"
                          aria-label="Remove question"
                        >
                          <Trash2 size={24} />
                        </button>
                      )}
                    </div>
                    {submitted && !q.question.trim() && (
                      <p className="text-sm text-red-500 mt-1">
                        Question {i + 1} cannot be empty.
                      </p>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {q.options.map((opt, j) => (
                        <motion.div
                          key={j}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border dark:border-gray-700"
                        >
                          <input
                            type="radio"
                            name={`correct-${i}`}
                            checked={q.correctIndex === j}
                            onChange={() =>
                              updateQuestion(i, { correctIndex: j })
                            }
                            className="form-radio h-5 w-5 text-indigo-600 border-gray-300 dark:border-gray-600"
                          />
                          <input
                            value={opt}
                            onChange={(e) => {
                              const opts = [...q.options];
                              opts[j] = e.target.value;
                              updateQuestion(i, { options: opts });
                            }}
                            placeholder={`Option ${j + 1}`}
                            className={`flex-1 p-2 border rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all duration-200 ${
                              submitted && !opt.trim() ? "border-red-500" : ""
                            }`}
                          />
                        </motion.div>
                      ))}
                    </div>
                    {submitted && q.options.some((opt) => !opt.trim()) && (
                      <p className="text-sm text-red-500 mt-1">
                        All options for Question {i + 1} must be filled.
                      </p>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <motion.button
                  type="button"
                  onClick={addQuestion}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-md flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus size={20} /> Add Question
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-bold shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create Quiz
                </motion.button>
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
<<<<<<< HEAD

      {/* Interactive Question Preview Modal */}
      <AnimatePresence>
        {previewModalIndex !== null && questions[previewModalIndex] && (
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
                        Question {previewModalIndex + 1} Preview
                      </h3>
                      <span className="text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                        Candidate Simulator
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">
                      {title.trim() ? title : "Untitled Quiz Assessment"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPreviewModalIndex(null);
                    setPreviewSelectedOption(null);
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title="Close preview"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Status Bar: Timers, Marks, & Answer Key Toggle */}
              <div className="py-3 px-4 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2 text-xs shrink-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Timer Badge */}
                  {timerMode === "overall" ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-amber-950/60 border border-amber-700 text-amber-300">
                      <Clock size={13} />
                      {overallTimeLimit || 15}:00 TOTAL (Overall Mode)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs font-bold bg-indigo-950/60 border border-indigo-700 text-indigo-300">
                      <Clock size={13} />
                      {questions[previewModalIndex].timeLimit || defaultTimeLimit}s Countdown
                    </span>
                  )}

                  {/* Marks Badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    <Star size={12} className="text-amber-400" />
                    {questions[previewModalIndex].marks || marksPerQuestion || 1} {((questions[previewModalIndex].marks || marksPerQuestion || 1) === 1) ? "Mark" : "Marks"}
                  </span>
                </div>

                {/* Show/Hide Answer Key Switch */}
                <button
                  type="button"
                  onClick={() => setPreviewShowAnswerKey((v) => !v)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                    previewShowAnswerKey
                      ? "bg-emerald-950/70 border-emerald-700 text-emerald-300"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200"
                  }`}
                  title="Toggle display of correct answer highlight"
                >
                  <CheckCircle2 size={13} className={previewShowAnswerKey ? "text-emerald-400" : "text-slate-500"} />
                  {previewShowAnswerKey ? "Answer Key Revealed" : "Candidate Blind Mode"}
                </button>
              </div>

              {/* Scrollable Question Content */}
              <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1">
                <div className="bg-slate-800/60 rounded-2xl p-5 border border-slate-700/80 space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold uppercase tracking-wider text-indigo-400">
                      Question {previewModalIndex + 1} of {questions.length}
                    </span>
                    {minTimePerQuestion > 0 && (
                      <span className="text-[11px] text-violet-300 bg-violet-950/60 border border-violet-800 px-2 py-0.5 rounded-md">
                        Min read time: {minTimePerQuestion}s
                      </span>
                    )}
                  </div>

                  <div className="text-lg sm:text-xl font-bold text-white leading-relaxed break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
                    {questions[previewModalIndex].question.trim() || (
                      <span className="italic text-slate-500">
                        (No question text entered yet. Type text into the question field.)
                      </span>
                    )}
                  </div>

                  {/* Options Simulator */}
                  <div className="space-y-2.5 pt-2">
                    {questions[previewModalIndex].options.map((opt, oIdx) => {
                      const isSelected = previewSelectedOption === oIdx;
                      const isCorrect = oIdx === questions[previewModalIndex].correctIndex;
                      const letter = String.fromCharCode(65 + oIdx);

                      let borderBgClasses =
                        "bg-slate-900/70 border-slate-700 text-slate-300 hover:border-slate-500";
                      if (isSelected) {
                        borderBgClasses =
                          "bg-indigo-900/60 border-indigo-500 text-white shadow-md shadow-indigo-900/30";
                      }
                      if (previewShowAnswerKey && isCorrect) {
                        borderBgClasses =
                          "bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/50";
                      }

                      return (
                        <button
                          key={oIdx}
                          type="button"
                          onClick={() => setPreviewSelectedOption(oIdx)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all flex items-center justify-between gap-3 ${borderBgClasses}`}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                previewShowAnswerKey && isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : isSelected
                                  ? "bg-indigo-600 text-white"
                                  : "bg-slate-800 text-slate-400 border border-slate-700"
                              }`}
                            >
                              {letter}
                            </span>
                            <span className="flex-1 min-w-0 break-words [overflow-wrap:anywhere] whitespace-pre-wrap">
                              {opt.trim() || <span className="italic text-slate-500">Empty option {oIdx + 1}</span>}
                            </span>
                          </div>

                          {previewShowAnswerKey && isCorrect && (
                            <span className="shrink-0 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/40 flex items-center gap-1">
                              <Check size={11} /> Correct Answer
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0">
                <button
                  type="button"
                  disabled={previewModalIndex <= 0}
                  onClick={() => {
                    setPreviewModalIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
                    setPreviewSelectedOption(null);
                  }}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition disabled:opacity-30 disabled:pointer-events-none"
                >
                  <ChevronLeft size={16} /> Prev Question
                </button>

                {/* Quick Jump Buttons */}
                <div className="hidden sm:flex items-center gap-1 overflow-x-auto max-w-xs py-1">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setPreviewModalIndex(idx);
                        setPreviewSelectedOption(null);
                      }}
                      className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                        previewModalIndex === idx
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
                  disabled={previewModalIndex >= questions.length - 1}
                  onClick={() => {
                    setPreviewModalIndex((prev) =>
                      prev !== null && prev < questions.length - 1 ? prev + 1 : prev
                    );
                    setPreviewSelectedOption(null);
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
=======
    </motion.div>
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  );
}
