import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  Share2,
  Copy,
  Clock,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { useApi } from "../api/api";
import { useError } from "../context/ErrorContext";
import { useSuccess } from "../context/SuccessContext";

type Q = {
  question: string;
  options: string[];
  correctIndex: number;
  timeLimit?: number;
  marks?: number;
};

export default function CreateQuiz() {
  const api = useApi();
  const { setErrors } = useError();
  const { addMessage } = useSuccess();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"draft" | "active">("draft");
  const [defaultTimeLimit, setDefaultTimeLimit] = useState(30);
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);

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
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopyLink = () => {
    if (!createdQuizId) return;
    const fullLink = `${window.location.origin}/take/${createdQuizId}`;
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
      {
        question: "",
        options: ["", "", "", ""],
        correctIndex: 0,
        timeLimit: defaultTimeLimit,
        marks: marksPerQuestion,
      },
    ]);

  const removeQuestion = (i: number) => {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, idx) => idx !== i));
  };

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
    questions.forEach((q, i) => {
      if (!q.question.trim())
        newErrors.push(`Question ${i + 1} cannot be empty.`);
      q.options.forEach((opt, j) => {
        if (!opt.trim())
          newErrors.push(`Option ${j + 1} for Question ${i + 1} cannot be empty.`);
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
    setLoading(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        status,
        defaultTimeLimit,
        marksPerQuestion,
        questions: questions.map((q) => ({
          ...q,
          timeLimit: q.timeLimit || defaultTimeLimit,
          marks: q.marks || marksPerQuestion,
        })),
      };

      const res = await api.post("/quizzes", payload);
      const quizId = res.data.data._id;
      addMessage("Quiz created successfully!");
      setCreatedQuizId(quizId);
    } catch (err: any) {
      setErrors([
        err.response?.data?.message ||
          "Something went wrong while creating the quiz.",
      ]);
    } finally {
      setLoading(false);
    }
  };

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
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="create-form"
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
                Configure questions, multiple options, correct answers, and individual timers.
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

                {/* Status & Default Settings Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
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
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      Marks Per Question
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
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-slate-900">
                    Questions ({questions.length})
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">
                    Radio button indicates the correct answer.
                  </span>
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
                      <div className="flex items-center justify-between mb-4">
                        <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                          {qIdx + 1}
                        </span>

                        <div className="flex items-center gap-3">
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
                      <input
                        type="text"
                        value={q.question}
                        onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                        placeholder={`Question ${qIdx + 1} text...`}
                        className={`w-full p-3 bg-white rounded-xl border text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 mb-4 ${
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
                                className="flex-1 bg-transparent text-xs font-semibold text-slate-900 outline-none"
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
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
