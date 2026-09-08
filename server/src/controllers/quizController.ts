import { Request, Response } from "express";
import mongoose from "mongoose";
import Quiz from "../models/Quiz";
import Result from "../models/Result";
import Attempt from "../models/Attempt";
import {
  createQuizSchema,
  submitQuizSchema,
} from "../validators/quizValidator";
import { mockStore } from "../utils/mockStore";
import { broadcastAdminEvent } from "./liveController";

export const createQuiz = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { error } = createQuizSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }

    const {
      title,
      description,
      status = "draft",
      timerMode = "per_question",
      defaultTimeLimit = 30,
      overallTimeLimit = 0,
      minTimePerQuestion = 0,
      shuffleQuestions = true,
      marksPerQuestion = 1,
      questions,
    } = req.body;

    if (mongoose.connection.readyState === 1) {
      const quizData = {
        title,
        description: description || "",
        status,
        timerMode,
        defaultTimeLimit,
        overallTimeLimit,
        minTimePerQuestion,
        shuffleQuestions,
        marksPerQuestion,
        questions: questions.map((q: any) => ({
          ...q,
          timeLimit: q.timeLimit || defaultTimeLimit,
          marks: q.marks || marksPerQuestion,
        })),
        createdBy: req.user?._id || req.user?.id,
      };

      const quiz = new Quiz(quizData);
      await quiz.save();

      return res.status(201).json({ success: true, data: quiz });
    } else {
      const quiz = await mockStore.createQuiz({
        title,
        description,
        status,
        timerMode,
        defaultTimeLimit,
        overallTimeLimit,
        minTimePerQuestion,
        shuffleQuestions,
        marksPerQuestion,
        questions,
        createdBy: req.user?._id || req.user?.id,
      });
      return res.status(201).json({ success: true, data: quiz });
    }
  } catch (err: any) {
    console.error("Error creating quiz:", err);
    res.status(500).json({
      success: false,
      message: err.message || "Server error while creating quiz.",
    });
  }
};

export const listQuizzes = async (_req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const quizzes = await Quiz.find()
        .select("_id title description status timerMode defaultTimeLimit overallTimeLimit minTimePerQuestion shuffleQuestions marksPerQuestion createdAt questions")
        .sort({ createdAt: -1 });

      const formatted = quizzes.map((q) => ({
        _id: q._id,
        title: q.title,
        description: q.description || "",
        status: q.status || "draft",
        timerMode: q.timerMode || "per_question",
        defaultTimeLimit: q.defaultTimeLimit || 30,
        overallTimeLimit: q.overallTimeLimit || 0,
        minTimePerQuestion: q.minTimePerQuestion || 0,
        shuffleQuestions: q.shuffleQuestions !== false,
        marksPerQuestion: q.marksPerQuestion || 1,
        createdAt: q.createdAt,
        totalTimeMinutes: q.timerMode === "overall" && q.overallTimeLimit
          ? q.overallTimeLimit
          : Math.ceil(
              (q.questions?.reduce((acc, curr) => acc + (curr.timeLimit || q.defaultTimeLimit || 30), 0) || 30) / 60
            ),
        questionCount: q.questions ? q.questions.length : 0,
      }));

      return res.status(200).json({ success: true, data: formatted });
    } else {
      const quizzes = await mockStore.listQuizzes();
      const formatted = quizzes.map((q) => ({
        _id: q._id,
        title: q.title,
        description: q.description || "",
        status: q.status || "draft",
        timerMode: q.timerMode || "per_question",
        defaultTimeLimit: q.defaultTimeLimit || 30,
        overallTimeLimit: q.overallTimeLimit || 0,
        minTimePerQuestion: q.minTimePerQuestion || 0,
        shuffleQuestions: q.shuffleQuestions !== false,
        marksPerQuestion: q.marksPerQuestion || 1,
        createdAt: q.createdAt,
        totalTimeMinutes: q.timerMode === "overall" && q.overallTimeLimit
          ? q.overallTimeLimit
          : Math.ceil(
              (q.questions?.reduce((acc, curr) => acc + (curr.timeLimit || q.defaultTimeLimit || 30), 0) || 30) / 60
            ),
        questionCount: q.questions ? q.questions.length : 0,
      }));
      return res.status(200).json({ success: true, data: formatted });
    }
  } catch (err: any) {
    console.error("Error listing quizzes:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching quizzes.",
    });
  }
};

export const getQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid quiz ID." });
      }

      const quiz = await Quiz.findById(id);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found." });
      }

      let hasAttempted = false;
      const user = (req as any).user;
      const isStudent = user && !user.isAdmin && user.role !== "admin";

      if (isStudent && user?._id) {
        const userId = user._id.toString();
        const existingResult = await Result.findOne({ userId, quizId: id });
        const completedAttempt = await Attempt.findOne({
          userId,
          quizId: id,
          status: { $in: ["submitted", "auto_submitted", "expired", "terminated_violations"] },
        });
        hasAttempted = Boolean(existingResult || completedAttempt);
      }

      return res.status(200).json({ success: true, data: quiz, hasAttempted });
    } else {
      const quiz = await mockStore.findQuizById(id);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found." });
      }

      let hasAttempted = false;
      const user = (req as any).user;
      const isStudent = user && !user.isAdmin && user.role !== "admin";

      if (isStudent && user?._id) {
        const userId = user._id.toString();
        const existingResult = await mockStore.getLatestResult(userId, id);
        const userAttempts = await mockStore.findUserAttempts(userId, id);
        const completedAttempt = userAttempts.find((a) =>
          ["submitted", "auto_submitted", "expired", "terminated_violations"].includes(a.status)
        );
        hasAttempted = Boolean(existingResult || completedAttempt);
      }

      return res.status(200).json({ success: true, data: quiz, hasAttempted });
    }
  } catch (err: any) {
    console.error("Error fetching quiz:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching quiz.",
    });
  }
};

export const submitQuiz = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    const { id } = req.params;

    const { error } = submitQuizSchema.validate(req.body, {
      abortEarly: false,
    });
    if (error) {
      return res.status(400).json({
        success: false,
        errors: error.details.map((d) => d.message),
      });
    }

    const {
      answers,
      violationCount = 0,
      violations = [],
      status = "completed",
    } = req.body as {
      answers: (number | null)[];
      violationCount?: number;
      violations?: string[];
      status?: "completed" | "terminated_violations";
    };

    const userName = req.user?.name || "Participant";
    const userEmail = req.user?.email || "";

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid quiz ID." });
      }

      const quiz = await Quiz.findById(id);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found." });
      }

      // Check if quiz has ended
      if (quiz.status === "ended") {
        return res.status(400).json({
          success: false,
          message: "This quiz has already been ended by the Admin.",
        });
      }

      // Check if student has already submitted (Prevent Multiple Submissions / Retakes - ONLY for students)
      const isStudent = !req.user?.isAdmin && req.user?.role !== "admin";
      if (isStudent && req.user?._id) {
        const userId = req.user._id.toString();
        const existingResult = await Result.findOne({ userId, quizId: id });
        if (existingResult) {
          return res.status(400).json({
            success: false,
            hasAttempted: true,
            message: "You have already completed this quiz. Retakes are not allowed for students.",
          });
        }
      }

      // Calculate score & breakdown
      let score = 0;
      let totalMarks = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      quiz.questions.forEach((q, idx) => {
        const questionMarks = q.marks || 1;
        totalMarks += questionMarks;
        const ans = answers[idx];

        if (ans === null || ans === undefined) {
          unansweredCount++;
        } else if (ans === q.correctIndex) {
          correctCount++;
          score += questionMarks;
        } else {
          wrongCount++;
        }
      });

      // Save result
      const result = new Result({
        userId: req.user._id,
        userName,
        userEmail,
        quizId: quiz._id,
        quizTitle: quiz.title,
        score,
        totalMarks,
        totalQuestions: quiz.questions.length,
        correctCount,
        wrongCount,
        unansweredCount,
        answers,
        violationCount,
        violations,
        status,
        completedAt: new Date(),
      });
      await result.save();

      // Update user's test history
      if (!req.user.tests) req.user.tests = [];
      req.user.tests.push({
        quizId: quiz.id.toString(),
        quizTitle: quiz.title,
        score,
        totalQuestions: quiz.questions.length,
        correctCount,
        wrongCount,
        unansweredCount,
        violationCount,
        status,
        date: new Date(),
      });
      await req.user.save();

      // Broadcast new submission to live monitoring Admin
      broadcastAdminEvent(quiz.id.toString(), "new_submission", {
        userName,
        userEmail,
        score,
        totalQuestions: quiz.questions.length,
        violationCount,
        violations,
        status,
        date: new Date(),
      });

      // Non-admin candidates cannot see the results
      if (!req.user?.isAdmin) {
        return res.status(200).json({
          success: true,
          title: quiz.title,
          isRestricted: true,
          message: "Assessment submitted successfully. Results are reserved for Admin evaluation.",
        });
      }

      const details = quiz.questions.map((q, idx) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        yourAnswer: typeof answers[idx] === "number" ? answers[idx] : null,
      }));

      return res.status(200).json({
        success: true,
        title: quiz.title,
        score,
        totalMarks,
        totalQuestions: quiz.questions.length,
        correctCount,
        wrongCount,
        unansweredCount,
        violationCount,
        violations,
        status,
        details,
      });
    } else {
      // Mock Store Fallback
      const quiz = await mockStore.findQuizById(id);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found." });
      }

      if (quiz.status === "ended") {
        return res.status(400).json({
          success: false,
          message: "This quiz has already been ended by the Admin.",
        });
      }

      // Check if student has already submitted (Prevent Multiple Submissions / Retakes - ONLY for students)
      const isStudent = !req.user?.isAdmin && req.user?.role !== "admin";
      if (isStudent && req.user?._id) {
        const userId = req.user._id.toString();
        const existingResult = await mockStore.getLatestResult(userId, id);
        if (existingResult) {
          return res.status(400).json({
            success: false,
            hasAttempted: true,
            message: "You have already completed this quiz. Retakes are not allowed for students.",
          });
        }
      }

      let score = 0;
      let totalMarks = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      quiz.questions.forEach((q, idx) => {
        const questionMarks = q.marks || 1;
        totalMarks += questionMarks;
        const ans = answers[idx];

        if (ans === null || ans === undefined) {
          unansweredCount++;
        } else if (ans === q.correctIndex) {
          correctCount++;
          score += questionMarks;
        } else {
          wrongCount++;
        }
      });

      const userId = req.user._id || req.user.id;
      const result = await mockStore.saveResult(
        userId,
        userName,
        userEmail,
        quiz._id,
        quiz.title,
        score,
        totalMarks,
        quiz.questions.length,
        correctCount,
        wrongCount,
        unansweredCount,
        answers,
        violationCount,
        violations,
        status
      );

      if (!req.user.tests) req.user.tests = [];
      req.user.tests.push({
        quizId: quiz._id,
        quizTitle: quiz.title,
        score,
        totalQuestions: quiz.questions.length,
        correctCount,
        wrongCount,
        unansweredCount,
        violationCount,
        status,
        date: new Date(),
      });
      if (typeof req.user.save === "function") {
        await req.user.save();
      }

      // Broadcast new submission to live monitoring Admin
      broadcastAdminEvent(quiz._id, "new_submission", result);

      // Non-admin candidates cannot see the results
      if (!req.user?.isAdmin) {
        return res.status(200).json({
          success: true,
          title: quiz.title,
          isRestricted: true,
          message: "Assessment submitted successfully. Results are reserved for Admin evaluation.",
        });
      }

      const details = quiz.questions.map((q, idx) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        yourAnswer: typeof answers[idx] === "number" ? answers[idx] : null,
      }));

      return res.status(200).json({
        success: true,
        title: quiz.title,
        score,
        totalMarks,
        totalQuestions: quiz.questions.length,
        correctCount,
        wrongCount,
        unansweredCount,
        violationCount,
        violations,
        status,
        details,
      });
    }
  } catch (err: any) {
    console.error("Error submitting quiz:", err);
    res.status(500).json({
      success: false,
      message: "Server error while submitting quiz.",
    });
  }
};

export const getQuizResult = async (
  req: Request & { user?: any },
  res: Response
) => {
  try {
    const { id } = req.params;
    const userId = req.user._id || req.user.id;

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid quiz ID." });
      }

      const result = await Result.findOne({
        quizId: id,
        userId: req.user._id,
      }).sort({ createdAt: -1 });

      const quiz = await Quiz.findById(id);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found." });
      }

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "No result found for this quiz.",
        });
      }

      // Candidates cannot view full result or answers
      if (!req.user?.isAdmin) {
        return res.status(200).json({
          success: true,
          data: {
            title: result.quizTitle || quiz.title,
            isRestricted: true,
            message: "Your assessment has been submitted. Results are reserved for Admin evaluation.",
            completedAt: result.completedAt || result.createdAt,
          },
        });
      }

      const details = quiz.questions.map((q, idx) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        yourAnswer:
          Array.isArray(result.answers) && typeof result.answers[idx] === "number"
            ? result.answers[idx]
            : null,
      }));

      return res.status(200).json({
        success: true,
        data: {
          title: result.quizTitle || quiz.title,
          score: result.score,
          totalMarks: result.totalMarks || result.totalQuestions,
          totalQuestions: result.totalQuestions,
          correctCount: result.correctCount || 0,
          wrongCount: result.wrongCount || 0,
          unansweredCount: result.unansweredCount || 0,
          violationCount: result.violationCount || 0,
          violations: result.violations || [],
          status: result.status || "completed",
          completedAt: result.completedAt || result.createdAt,
          details,
        },
      });
    } else {
      const result = await mockStore.getLatestResult(userId, id);
      const quiz = await mockStore.findQuizById(id);

      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found." });
      }

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "No result found for this quiz.",
        });
      }

      // Candidates cannot view full result or answers
      if (!req.user?.isAdmin) {
        return res.status(200).json({
          success: true,
          data: {
            title: result.quizTitle || quiz.title,
            isRestricted: true,
            message: "Your assessment has been submitted. Results are reserved for Admin evaluation.",
            completedAt: result.completedAt || result.createdAt,
          },
        });
      }

      const details = quiz.questions.map((q, idx) => ({
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        yourAnswer:
          Array.isArray(result.answers) && typeof result.answers[idx] === "number"
            ? result.answers[idx]
            : null,
      }));

      return res.status(200).json({
        success: true,
        data: {
          title: result.quizTitle || quiz.title,
          score: result.score,
          totalMarks: result.totalMarks || result.totalQuestions,
          totalQuestions: result.totalQuestions,
          correctCount: result.correctCount || 0,
          wrongCount: result.wrongCount || 0,
          unansweredCount: result.unansweredCount || 0,
          violationCount: result.violationCount || 0,
          violations: result.violations || [],
          status: result.status || "completed",
          completedAt: result.completedAt || result.createdAt,
          details,
        },
      });
    }
  } catch (err: any) {
    console.error("Error fetching quiz result:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching quiz result.",
    });
  }
};
