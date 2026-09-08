<<<<<<< HEAD

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Trophy,
  BookOpen,
  Users,
  BarChart3,
  Clock3,
  CheckCircle2,
  Target,
  TrendingUp,
  Play,
  ArrowRight,
  ShieldCheck,
  Activity,
  Layers3,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const stats = [
    {
      title: "Total Quizzes",
      value: "128",
      description: "Available quizzes",
      icon: BookOpen,
      bg: "bg-indigo-50",
      color: "text-indigo-600",
    },
    {
      title: "Active Users",
      value: "2,486",
      description: "Registered participants",
      icon: Users,
      bg: "bg-blue-50",
      color: "text-blue-600",
    },
    {
      title: "Quiz Attempts",
      value: "18.4K",
      description: "Total attempts",
      icon: Activity,
      bg: "bg-emerald-50",
      color: "text-emerald-600",
    },
    {
      title: "Average Score",
      value: "78.6%",
      description: "Overall platform score",
      icon: BarChart3,
      bg: "bg-amber-50",
      color: "text-amber-600",
    },
  ];

  const categories = [
    {
      name: "General Knowledge",
      quizzes: 32,
      icon: Trophy,
      percentage: 82,
    },
    {
      name: "Technology",
      quizzes: 28,
      icon: Layers3,
      percentage: 74,
    },
    {
      name: "Science",
      quizzes: 24,
      icon: Target,
      percentage: 68,
    },
    {
      name: "Logical Reasoning",
      quizzes: 19,
      icon: BarChart3,
      percentage: 61,
    },
  ];

  const popularQuizzes = [
    {
      title: "Computer Fundamentals",
      category: "Technology",
      questions: 25,
      duration: "25 min",
      difficulty: "Medium",
      attempts: "3.2K",
    },
    {
      title: "General Knowledge 2026",
      category: "General Knowledge",
      questions: 20,
      duration: "20 min",
      difficulty: "Easy",
      attempts: "2.8K",
    },
    {
      title: "Logical Reasoning",
      category: "Reasoning",
      questions: 30,
      duration: "30 min",
      difficulty: "Hard",
      attempts: "2.1K",
    },
  ];

  const platformActivity = [
    {
      title: "Quiz attempts completed",
      value: "18,420",
      change: "+12.8%",
      icon: CheckCircle2,
    },
    {
      title: "Questions answered",
      value: "426K",
      change: "+9.4%",
      icon: Target,
    },
    {
      title: "Average completion rate",
      value: "91.2%",
      change: "+5.7%",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">

        {/* Background decoration */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-blue-100/40 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

          <div className="grid items-center gap-10 lg:grid-cols-2">

            {/* Hero Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-600">
                <ShieldCheck className="h-4 w-4" />
                Professional Quiz Platform
              </div>

              <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Test Knowledge.
                <span className="block text-indigo-600">
                  Measure Progress.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-slate-500 sm:text-lg">
                A centralized platform for discovering quizzes, evaluating
                knowledge, monitoring performance, and improving learning
                outcomes.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/list"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 hover:shadow-xl"
                >
                  <Play className="h-4 w-4" />
                  Explore Quizzes
                </Link>

                <Link
                  to="/leaderboard"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <Trophy className="h-4 w-4" />
                  View Leaderboard
                </Link>
              </div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="hidden justify-center lg:flex"
            >
              <div className="relative">

                {/* Main card */}
                <div className="relative w-[420px] rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Platform Overview
                      </p>

                      <h3 className="mt-1 text-xl font-bold text-slate-900">
                        Quiz Performance
                      </h3>
                    </div>

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50">
                      <BarChart3 className="h-5 w-5 text-indigo-600" />
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="mt-8 flex h-36 items-end gap-3">
                    {[45, 62, 52, 78, 68, 86, 72, 94, 82, 98].map(
                      (height, index) => (
                        <motion.div
                          key={index}
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{
                            duration: 0.7,
                            delay: index * 0.05,
                          }}
                          className="flex-1 rounded-t-md bg-indigo-500"
                        />
                      )
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs text-slate-400">
                        Average Score
                      </p>
                      <p className="text-xl font-extrabold text-slate-900">
                        78.6%
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-sm font-bold text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      12.4%
                    </div>
                  </div>
                </div>

                {/* Floating card */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -bottom-5 -left-12 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    </div>

                    <div>
                      <p className="text-xs text-slate-400">
                        Completed
                      </p>
                      <p className="font-bold text-slate-900">
                        18.4K Attempts
                      </p>
                    </div>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">

        {/* ================= STATS ================= */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                }}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Platform
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {stat.value}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {stat.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* ================= CONTENT GRID ================= */}
        <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-3">

          {/* ================= POPULAR QUIZZES ================= */}
          <section className="xl:col-span-2">

            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Discover
                </p>

                <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                  Popular Quizzes
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Explore quizzes that are currently popular on the platform.
                </p>
              </div>

              <Link
                to="/list"
                className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:flex"
              >
                View all
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="space-y-4">
              {popularQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.45,
                    delay: index * 0.1,
                  }}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-50">
                        <BookOpen className="h-5 w-5 text-indigo-600" />
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-slate-900">
                            {quiz.title}
                          </h3>

                          <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            {quiz.category}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Target className="h-3.5 w-3.5" />
                            {quiz.questions} Questions
                          </span>

                          <span className="flex items-center gap-1.5">
                            <Clock3 className="h-3.5 w-3.5" />
                            {quiz.duration}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 ${
                              quiz.difficulty === "Hard"
                                ? "bg-red-50 text-red-600"
                                : quiz.difficulty === "Medium"
                                ? "bg-amber-50 text-amber-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {quiz.difficulty}
                          </span>

                          <span className="text-slate-400">
                            {quiz.attempts} attempts
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link
                      to="/list"
                      className="inline-flex flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-600 hover:bg-indigo-600 hover:text-white"
                    >
                      <Play className="h-4 w-4" />
                      Start
                    </Link>

                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ================= CATEGORIES ================= */}
          <section>

            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Categories
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
                Explore Topics
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Browse quizzes by category.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="space-y-5">
                {categories.map((category) => {
                  const Icon = category.icon;

                  return (
                    <div key={category.name}>
                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                            <Icon className="h-4 w-4 text-slate-600" />
                          </div>

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {category.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              {category.quizzes} quizzes
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-slate-500">
                          {category.percentage}%
                        </span>

                      </div>

                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${category.percentage}%`,
                          }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full bg-indigo-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <Link
                to="/list"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
              >
                Browse All Categories
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </div>

        {/* ================= PLATFORM ACTIVITY ================= */}
        <section className="mt-10">

          <div className="mb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Analytics
            </p>

            <h2 className="mt-1 text-2xl font-extrabold text-slate-900">
              Platform Activity
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Overview of quiz activity across the platform.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {platformActivity.map((item, index) => {
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: index * 0.1,
                  }}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
                      <Icon className="h-5 w-5 text-indigo-600" />
                    </div>

                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                      <TrendingUp className="h-3 w-3" />
                      {item.change}
                    </span>
                  </div>

                  <p className="mt-5 text-sm font-medium text-slate-500">
                    {item.title}
                  </p>

                  <p className="mt-1 text-2xl font-extrabold text-slate-900">
                    {item.value}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ================= LEADERBOARD CTA ================= */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 overflow-hidden rounded-2xl bg-indigo-600 p-6 shadow-lg shadow-indigo-100 sm:p-8"
        >
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">

            <div className="flex items-start gap-4">

              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
                <Trophy className="h-6 w-6 text-white" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white">
                  Ready to test your knowledge?
                </h2>

                <p className="mt-1 max-w-xl text-sm leading-6 text-indigo-100">
                  Explore available quizzes, challenge yourself, and compare
                  results on the platform leaderboard.
                </p>
              </div>

            </div>

            <div className="flex flex-wrap gap-3">

              <Link
                to="/list"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-600 transition hover:bg-indigo-50"
              >
                Explore Quizzes
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/leaderboard"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Leaderboard
                <Trophy className="h-4 w-4" />
              </Link>

            </div>

          </div>
        </motion.section>

        {/* ================= FOOTER ================= */}
        <footer className="mt-10 border-t border-slate-200 py-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row">

            <p className="text-xs text-slate-400">
              © 2026 Quizzy. All rights reserved.
            </p>

            <div className="flex items-center gap-5 text-xs font-medium text-slate-400">
              <Link
                to="/privacy"
                className="transition hover:text-slate-700"
              >
                Privacy
              </Link>

              <Link
                to="/terms"
                className="transition hover:text-slate-700"
              >
                Terms
              </Link>

              <Link
                to="/help"
                className="transition hover:text-slate-700"
              >
                Help
              </Link>
            </div>

          </div>
        </footer>

=======
import { motion, useInView } from "framer-motion";
import {
  Sparkles,
  Trophy,
  Settings,
  Users,
  Sun,
  CheckCircle,
} from "lucide-react";
import { useRef } from "react";
import type { Variants } from "framer-motion";

export default function Home() {
  const featureVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: "easeOut" } },
  } as const;

  const heroImageVariants = {
    hidden: { opacity: 0, scale: 0.8, rotate: -5 },
    visible: {
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  } as const;

  const cardVariants = {
    offscreen: { y: 150, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.9,
      },
    },
  } as const;

  const cardRef = useRef(null);
  const isCardInView = useInView(cardRef, { once: true, amount: 0.5 });

  return (
    <div className="bg-gray-50 text-gray-900 min-h-screen font-sans">
      {/* Tailwind CSS for Inter font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
      
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-gradient-to-br from-indigo-600 to-purple-700 text-white p-6 md:p-16 rounded-b-3xl shadow-2xl overflow-hidden"
      >
        {/* Abstract background elements */}
        <div className="absolute inset-0 w-full h-full opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1440 320" preserveAspectRatio="none" fill="currentColor">
            <path d="M0,160L48,165.3C96,171,192,181,288,170.7C384,160,480,128,576,133.3C672,139,768,181,864,181.3C960,181,1056,139,1152,122.7C1248,107,1344,117,1392,122.7L1440,128L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
          <div className="md:w-1/2">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight">
              Quizzy
            </h1>
            <p className="text-lg md:text-2xl font-light mb-8 max-w-3xl mx-auto md:mx-0 opacity-90">
              The ultimate platform to create, share, and conquer quizzes. Test
              your knowledge on any topic, anytime.
            </p>
            <div className="flex justify-center md:justify-start flex-wrap gap-4">
              <motion.a
                whileHover={{ scale: 1.05, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
                href="/create"
                className="inline-block px-10 py-4 bg-white text-indigo-700 font-bold rounded-full shadow-lg transition-transform duration-300"
              >
                Create a Quiz
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.05, backgroundColor: "#ffffff", color: "#4c51bf" }}
                href="/list"
                className="inline-block px-10 py-4 border-2 border-white text-white font-bold rounded-full transition-all duration-300"
              >
                Explore Quizzes
              </motion.a>
            </div>
          </div>

          <motion.div
            className="md:w-1/2 mt-12 md:mt-0 flex justify-center"
            variants={heroImageVariants as Variants}
            initial="hidden"
            animate="visible"
          >
            <img
              src="\images\Home.png"
              alt="A fun illustration of people interacting with quizzes"
              className="rounded-3xl shadow-xl h-auto max-h-96 w-auto object-contain border-4 border-indigo-500"
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-16">
        {/* Feature Section */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Key Features
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Quizzy offers a seamless experience for creators and players alike.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          <motion.div
            className="bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-200"
            variants={featureVariants as Variants}
            whileHover={{ scale: 1.05, y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex justify-center mb-4">
              <Sparkles size={64} className="text-yellow-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Easy Creation
            </h3>
            <p className="text-gray-500">
              Quickly build engaging quizzes with a simple, intuitive interface.
              No coding required.
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-200"
            variants={featureVariants as Variants}
            whileHover={{ scale: 1.05, y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex justify-center mb-4">
              <Trophy size={64} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Challenge & Share
            </h3>
            <p className="text-gray-500">
              Share your quizzes with friends and see who can get the highest
              score.
            </p>
          </motion.div>

          <motion.div
            className="bg-white p-8 rounded-2xl shadow-lg text-center border border-gray-200"
            variants={featureVariants as Variants}
            whileHover={{ scale: 1.05, y: -10, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex justify-center mb-4">
              <Settings size={64} className="text-blue-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              Instant Feedback
            </h3>
            <p className="text-gray-500">
              Receive immediate results and review your answers to learn on the
              spot.
            </p>
          </motion.div>
        </motion.div>

        {/* Two-Section "Why Choose Quizzy?" Layout */}
        <motion.div
          ref={cardRef}
          className="bg-white p-8 md:p-16 rounded-3xl shadow-xl flex flex-col md:flex-row items-center gap-10 mt-20 border border-gray-200"
          initial="offscreen"
          animate={isCardInView ? "onscreen" : "offscreen"}
          variants={cardVariants as Variants}
        >
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Why Choose Quizzy?
            </h2>
            <p className="text-lg text-gray-500 max-w-lg md:max-w-none">
              We're more than just a quiz maker—we're a community. Our modern
              design and robust features make learning and creating fun.
            </p>
          </div>
          <div className="w-full md:w-1/2 grid grid-cols-1 gap-8">
            <motion.div whileHover={{ scale: 1.03 }} className="flex items-center space-x-4">
              <div className="bg-indigo-100 p-3 rounded-full flex-shrink-0">
                <Users size={32} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-700 mb-1">
                  Community Driven
                </h3>
                <p className="text-gray-500">
                  Join a network of learners and creators who share your passion
                  for knowledge and fun.
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-full flex-shrink-0">
                <Sun size={32} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-700 mb-1">
                  Modern & Clean Design
                </h3>
                <p className="text-gray-500">
                  Enjoy a beautiful and distraction-free interface that makes
                  creating and taking quizzes a pleasure.
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} className="flex items-center space-x-4">
              <div className="bg-yellow-100 p-3 rounded-full flex-shrink-0">
                <CheckCircle size={32} className="text-yellow-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-700 mb-1">
                  Reliable & Free
                </h3>
                <p className="text-gray-500">
                  Our platform is robust, fast, and completely free to use, with
                  no hidden costs.
                </p>
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.03 }} className="flex items-center space-x-4">
              <div className="bg-red-100 p-3 rounded-full flex-shrink-0">
                <Trophy size={32} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-700 mb-1">
                  Compete & Learn
                </h3>
                <p className="text-gray-500">
                  Challenge your friends and track your progress to see who is
                  the ultimate quiz master.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Final Call to Action */}
        <motion.div
          className="bg-indigo-600 text-white p-12 rounded-3xl text-center shadow-xl mt-20 border border-indigo-400"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h3 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to get started?
          </h3>
          <p className="text-lg md:text-xl font-light mb-8 max-w-2xl mx-auto">
            It only takes a few minutes to create your first quiz.
          </p>
          <motion.a
            href="/create"
            whileHover={{ scale: 1.05 }}
            className="inline-block px-12 py-5 bg-white text-indigo-700 font-bold rounded-full shadow-lg transition-transform duration-300"
          >
            Create Your Quiz
          </motion.a>
        </motion.div>
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
      </main>
    </div>
  );
}
<<<<<<< HEAD

=======
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
