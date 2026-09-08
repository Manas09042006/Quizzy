import { Request, Response } from "express";
import mongoose from "mongoose";
import Attempt from "../models/Attempt";
import Quiz from "../models/Quiz";
import Result from "../models/Result";
import User from "../models/User";
import { mockStore } from "../utils/mockStore";
import { shuffleWithMapping, reconstructSanitizedQuestions } from "../utils/randomizer";
import { broadcastAdminEvent } from "./liveController";
import { logAudit } from "../utils/auditLogger";

/**
 * Start a new quiz attempt or restore active in-progress attempt
 * POST /api/quizzes/:id/start-attempt
 */
export const startAttempt = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { id: quizId } = req.params;
    const userId = req.user?._id || req.user?.id;

    // 1. Verify student is active
    if (req.user?.status !== "active") {
      return res.status(403).json({
        success: false,
        message:
          req.user?.status === "blocked"
            ? "Your account has been blocked by administrator."
            : "Your account is pending admin approval.",
      });
    }

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(quizId)) {
        return res.status(400).json({ success: false, message: "Invalid quiz ID" });
      }

      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }

      if (quiz.status !== "active") {
        return res.status(400).json({
          success: false,
          message:
            quiz.status === "draft"
              ? "This quiz is in waiting room / draft mode and not yet active."
              : "This quiz has already ended.",
        });
      }

      // Check existing attempts (Prevent Multiple Attempts / Retakes - ONLY for students)
      const isStudent = !req.user?.isAdmin && req.user?.role !== "admin";
      const existingAttempts = await Attempt.find({ userId, quizId }).sort({ createdAt: -1 });

      if (isStudent) {
        const completedAttempt = existingAttempts.find((a) =>
          ["submitted", "auto_submitted", "expired", "terminated_violations"].includes(a.status)
        );
        const existingResult = await Result.findOne({ userId, quizId });

        if (completedAttempt || existingResult) {
          return res.status(400).json({
            success: false,
            hasAttempted: true,
            message: "You have already completed this quiz. Retakes are not allowed for students.",
          });
        }
      }

      // Check if there is an active in_progress attempt not yet expired
      const activeAttempt = existingAttempts.find(
        (a) => a.status === "in_progress" && new Date(a.expiresAt).getTime() > Date.now()
      );

      if (activeAttempt) {
        const sanitizedQuestions = reconstructSanitizedQuestions(
          quiz.questions,
          activeAttempt.questionOrder,
          activeAttempt.optionOrders
        );

        const remainingSeconds = Math.max(
          0,
          Math.floor((new Date(activeAttempt.expiresAt).getTime() - Date.now()) / 1000)
        );

        return res.status(200).json({
          success: true,
          message: "Resuming existing active attempt",
          data: {
            attemptId: activeAttempt._id,
            quizId: quiz._id,
            title: quiz.title,
            description: quiz.description,
            startedAt: activeAttempt.startedAt,
            expiresAt: activeAttempt.expiresAt,
            serverTime: new Date(),
            remainingSeconds,
            questions: sanitizedQuestions,
            savedAnswers: activeAttempt.answers,
            currentQuestion: activeAttempt.currentQuestion,
            violationCount: activeAttempt.violationCount,
          },
        });
      }

      // Generate server-controlled start and expiry times
      // If timerMode is "overall", use overallTimeLimit (minutes); else sum per-question timers
      const timerMode = (quiz as any).timerMode || "per_question";
      const overallTimeLimitMins = (quiz as any).overallTimeLimit || 0;
      const shouldShuffle = (quiz as any).shuffleQuestions !== false;
      const totalDurationSeconds = timerMode === "overall" && overallTimeLimitMins > 0
        ? overallTimeLimitMins * 60
        : quiz.questions.reduce((sum, q) => sum + (q.timeLimit || quiz.defaultTimeLimit || 30), 0);

      const startedAt = new Date();
      const expiresAt = new Date(startedAt.getTime() + totalDurationSeconds * 1000);

      // Shuffle questions & options (conditional per shuffleQuestions setting)
      let questionOrder: number[];
      let optionOrders: number[][];
      if (shouldShuffle) {
        const qShuffle = shuffleWithMapping(quiz.questions);
        questionOrder = qShuffle.mapping;
        optionOrders = questionOrder.map((origQIdx) => shuffleWithMapping(quiz.questions[origQIdx].options).mapping);
      } else {
        questionOrder = quiz.questions.map((_, i) => i);
        optionOrders = quiz.questions.map((q) => q.options.map((_, i) => i));
      }

      const attempt = new Attempt({
        quizId: quiz._id,
        userId: req.user._id,
        userName: req.user.name || "Participant",
        userEmail: req.user.email || "",
        startedAt,
        expiresAt,
        status: "in_progress",
        answers: new Array(quiz.questions.length).fill(null),
        currentQuestion: 0,
        violationCount: 0,
        questionOrder,
        optionOrders,
      });
      await attempt.save();

      // Audit Log
      await logAudit({
        action: "EXAM_STARTED",
        actorId: req.user._id.toString(),
        actorName: req.user.name || "Participant",
        actorRole: "student",
        targetId: quiz._id.toString(),
        details: { quizTitle: quiz.title, totalQuestions: quiz.questions.length },
        ipAddress: req.ip || "127.0.0.1",
      });

      const sanitizedQuestions = reconstructSanitizedQuestions(
        quiz.questions,
        questionOrder,
        optionOrders
      );

      return res.status(201).json({
        success: true,
        data: {
          attemptId: attempt._id,
          quizId: quiz._id,
          title: quiz.title,
          description: quiz.description,
          timerMode,
          overallTimeLimit: overallTimeLimitMins,
          minTimePerQuestion: (quiz as any).minTimePerQuestion || 0,
          startedAt: attempt.startedAt,
          expiresAt: attempt.expiresAt,
          serverTime: new Date(),
          remainingSeconds: totalDurationSeconds,
          questions: sanitizedQuestions,
          savedAnswers: attempt.answers,
          currentQuestion: 0,
          violationCount: 0,
        },
      });
    } else {
      // Mock Store Fallback
      const quiz = await mockStore.findQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }

      if (quiz.status !== "active") {
        return res.status(400).json({
          success: false,
          message:
            quiz.status === "draft"
              ? "This quiz is in waiting room / draft mode and not yet active."
              : "This quiz has already ended.",
        });
      }

      // Prevent Multiple Attempts / Retakes - ONLY for students
      const isStudent = !req.user?.isAdmin && req.user?.role !== "admin";
      if (isStudent) {
        const userAttempts = await mockStore.findUserAttempts(userId, quizId);
        const completed = userAttempts.find((a) =>
          ["submitted", "auto_submitted", "expired", "terminated_violations"].includes(a.status)
        );
        const existingResult = await mockStore.getLatestResult(userId, quizId);
        if (completed || existingResult) {
          return res.status(400).json({
            success: false,
            hasAttempted: true,
            message: "You have already completed this quiz. Retakes are not allowed for students.",
          });
        }
      }

      const activeAttempt = await mockStore.findActiveAttempt(userId, quizId);
      if (activeAttempt) {
        const sanitizedQuestions = reconstructSanitizedQuestions(
          quiz.questions,
          activeAttempt.questionOrder,
          activeAttempt.optionOrders
        );

        const remainingSeconds = Math.max(
          0,
          Math.floor((new Date(activeAttempt.expiresAt).getTime() - Date.now()) / 1000)
        );

        return res.status(200).json({
          success: true,
          message: "Resuming existing active attempt",
          data: {
            attemptId: activeAttempt._id,
            quizId: quiz._id,
            title: quiz.title,
            description: quiz.description,
            startedAt: activeAttempt.startedAt,
            expiresAt: activeAttempt.expiresAt,
            serverTime: new Date(),
            remainingSeconds,
            questions: sanitizedQuestions,
            savedAnswers: activeAttempt.answers,
            currentQuestion: activeAttempt.currentQuestion,
            violationCount: activeAttempt.violationCount,
          },
        });
      }

      const timerModeMock = (quiz as any).timerMode || "per_question";
      const overallTimeLimitMinsMock = (quiz as any).overallTimeLimit || 0;
      const shouldShuffleMock = (quiz as any).shuffleQuestions !== false;
      const totalDurationSeconds = timerModeMock === "overall" && overallTimeLimitMinsMock > 0
        ? overallTimeLimitMinsMock * 60
        : quiz.questions.reduce((sum, q) => sum + (q.timeLimit || quiz.defaultTimeLimit || 30), 0);

      const startedAt = new Date();
      const expiresAt = new Date(startedAt.getTime() + totalDurationSeconds * 1000);

      let questionOrder: number[];
      let optionOrders: number[][];
      if (shouldShuffleMock) {
        const qShuffle = shuffleWithMapping(quiz.questions);
        questionOrder = qShuffle.mapping;
        optionOrders = questionOrder.map((origQIdx) => shuffleWithMapping(quiz.questions[origQIdx].options).mapping);
      } else {
        questionOrder = quiz.questions.map((_, i) => i);
        optionOrders = quiz.questions.map((q) => q.options.map((_, i) => i));
      }

      const attempt = await mockStore.createAttempt({
        quizId: quiz._id,
        userId,
        userName: req.user.name || "Participant",
        userEmail: req.user.email || "",
        startedAt,
        expiresAt,
        questionOrder,
        optionOrders,
        totalQuestions: quiz.questions.length,
      });

      // Audit Log
      await logAudit({
        action: "EXAM_STARTED",
        actorId: userId,
        actorName: req.user.name || "Participant",
        actorRole: "student",
        targetId: quiz._id,
        details: { quizTitle: quiz.title, totalQuestions: quiz.questions.length },
        ipAddress: req.ip || "127.0.0.1",
      });

      const sanitizedQuestions = reconstructSanitizedQuestions(
        quiz.questions,
        questionOrder,
        optionOrders
      );

      return res.status(201).json({
        success: true,
        data: {
          attemptId: attempt._id,
          quizId: quiz._id,
          title: quiz.title,
          description: quiz.description,
          timerMode: timerModeMock,
          overallTimeLimit: overallTimeLimitMinsMock,
          minTimePerQuestion: (quiz as any).minTimePerQuestion || 0,
          startedAt: attempt.startedAt,
          expiresAt: attempt.expiresAt,
          serverTime: new Date(),
          remainingSeconds: totalDurationSeconds,
          questions: sanitizedQuestions,
          savedAnswers: attempt.answers,
          currentQuestion: 0,
          violationCount: 0,
        },
      });
    }
  } catch (err: any) {
    console.error("Error starting attempt:", err);
    res.status(500).json({ success: false, message: "Server error starting attempt" });
  }
};

/**
 * Restore an active attempt (Phase 5: Auto-Save & Recovery)
 * GET /api/attempts/:attemptId
 */
export const getAttempt = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { attemptId } = req.params;
    const userId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(attemptId)) {
        return res.status(400).json({ success: false, message: "Invalid attempt ID" });
      }

      const attempt = await Attempt.findById(attemptId);
      if (!attempt) {
        return res.status(404).json({ success: false, message: "Attempt not found" });
      }

      // Phase 7: IDOR / BOLA check
      if (attempt.userId.toString() !== userId.toString() && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You cannot access another student's attempt",
        });
      }

      const quiz = await Quiz.findById(attempt.quizId);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Associated quiz not found" });
      }

      // Server-side expiry check (Phase 3)
      const now = Date.now();
      if (attempt.status === "in_progress" && now > new Date(attempt.expiresAt).getTime() + 10000) {
        attempt.status = "expired";
        await attempt.save();
      }

      const sanitizedQuestions = reconstructSanitizedQuestions(
        quiz.questions,
        attempt.questionOrder,
        attempt.optionOrders
      );

      const remainingSeconds = Math.max(
        0,
        Math.floor((new Date(attempt.expiresAt).getTime() - now) / 1000)
      );

      return res.status(200).json({
        success: true,
        data: {
          attemptId: attempt._id,
          quizId: quiz._id,
          title: quiz.title,
          status: attempt.status,
          startedAt: attempt.startedAt,
          expiresAt: attempt.expiresAt,
          serverTime: new Date(),
          remainingSeconds,
          questions: sanitizedQuestions,
          savedAnswers: attempt.answers,
          currentQuestion: attempt.currentQuestion,
          violationCount: attempt.violationCount,
        },
      });
    } else {
      const attempt = await mockStore.findAttemptById(attemptId);
      if (!attempt) {
        return res.status(404).json({ success: false, message: "Attempt not found" });
      }

      // Phase 7: IDOR / BOLA check
      if (attempt.userId !== userId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You cannot access another student's attempt",
        });
      }

      const quiz = await mockStore.findQuizById(attempt.quizId);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Associated quiz not found" });
      }

      const now = Date.now();
      if (attempt.status === "in_progress" && now > new Date(attempt.expiresAt).getTime() + 10000) {
        await mockStore.updateAttempt(attemptId, { status: "expired" });
        attempt.status = "expired";
      }

      const sanitizedQuestions = reconstructSanitizedQuestions(
        quiz.questions,
        attempt.questionOrder,
        attempt.optionOrders
      );

      const remainingSeconds = Math.max(
        0,
        Math.floor((new Date(attempt.expiresAt).getTime() - now) / 1000)
      );

      return res.status(200).json({
        success: true,
        data: {
          attemptId: attempt._id,
          quizId: quiz._id,
          title: quiz.title,
          status: attempt.status,
          startedAt: attempt.startedAt,
          expiresAt: attempt.expiresAt,
          serverTime: new Date(),
          remainingSeconds,
          questions: sanitizedQuestions,
          savedAnswers: attempt.answers,
          currentQuestion: attempt.currentQuestion,
          violationCount: attempt.violationCount,
        },
      });
    }
  } catch (err: any) {
    console.error("Error retrieving attempt:", err);
    res.status(500).json({ success: false, message: "Server error fetching attempt" });
  }
};

/**
 * Auto-save attempt progress (Phase 5)
 * PATCH /api/attempts/:attemptId/save
 */
export const autoSaveAttempt = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { answers, currentQuestion, violationCount } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(attemptId)) {
        return res.status(400).json({ success: false, message: "Invalid attempt ID" });
      }

      const attempt = await Attempt.findById(attemptId);
      if (!attempt) {
        return res.status(404).json({ success: false, message: "Attempt not found" });
      }

      // IDOR check
      if (attempt.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden: Attempt ownership mismatch" });
      }

      if (attempt.status !== "in_progress") {
        return res.status(400).json({ success: false, message: "Attempt is already completed or expired" });
      }

      // Check timer expiration
      if (Date.now() > new Date(attempt.expiresAt).getTime() + 15000) {
        attempt.status = "auto_submitted";
        await attempt.save();
        return res.status(400).json({ success: false, message: "Exam time has expired" });
      }

      if (Array.isArray(answers)) {
        attempt.answers = answers;
      }
      if (typeof currentQuestion === "number") {
        attempt.currentQuestion = currentQuestion;
      }
      if (typeof violationCount === "number") {
        attempt.violationCount = violationCount;
      }

      await attempt.save();

      return res.status(200).json({
        success: true,
        message: "Attempt auto-saved successfully",
        savedAt: new Date(),
      });
    } else {
      const attempt = await mockStore.findAttemptById(attemptId);
      if (!attempt) {
        return res.status(404).json({ success: false, message: "Attempt not found" });
      }

      if (attempt.userId !== userId) {
        return res.status(403).json({ success: false, message: "Forbidden: Attempt ownership mismatch" });
      }

      if (attempt.status !== "in_progress") {
        return res.status(400).json({ success: false, message: "Attempt is already completed or expired" });
      }

      if (Date.now() > new Date(attempt.expiresAt).getTime() + 15000) {
        await mockStore.updateAttempt(attemptId, { status: "auto_submitted" });
        return res.status(400).json({ success: false, message: "Exam time has expired" });
      }

      const updates: any = {};
      if (Array.isArray(answers)) updates.answers = answers;
      if (typeof currentQuestion === "number") updates.currentQuestion = currentQuestion;
      if (typeof violationCount === "number") updates.violationCount = violationCount;

      await mockStore.updateAttempt(attemptId, updates);

      return res.status(200).json({
        success: true,
        message: "Attempt auto-saved successfully",
        savedAt: new Date(),
      });
    }
  } catch (err: any) {
    console.error("Error auto-saving attempt:", err);
    res.status(500).json({ success: false, message: "Server error auto-saving attempt" });
  }
};

/**
 * Submit Attempt with Server-side Evaluation, Timer Verification & Randomization Mapping
 * POST /api/attempts/:attemptId/submit
 */
export const submitAttempt = async (req: Request & { user?: any }, res: Response) => {
  try {
    const { attemptId } = req.params;
    const {
      answers = [],
      violationCount = 0,
      violations = [],
      status = "completed",
    } = req.body as {
      answers: (number | null)[];
      violationCount?: number;
      violations?: string[];
      status?: "completed" | "terminated_violations";
    };

    const userId = req.user?._id || req.user?.id;
    const userName = req.user?.name || "Participant";
    const userEmail = req.user?.email || "";

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(attemptId)) {
        return res.status(400).json({ success: false, message: "Invalid attempt ID" });
      }

      const attempt = await Attempt.findById(attemptId);
      if (!attempt) {
        return res.status(404).json({ success: false, message: "Attempt not found" });
      }

      // IDOR check (Phase 7)
      if (attempt.userId.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: "Forbidden: Attempt ownership mismatch" });
      }

      // Prevent duplicate submissions
      if (["submitted", "auto_submitted"].includes(attempt.status)) {
        return res.status(400).json({ success: false, message: "This assessment has already been submitted." });
      }

      const quiz = await Quiz.findById(attempt.quizId);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }

      // Server-side Timer Check (Phase 3)
      const now = new Date();
      const isExpired = now.getTime() > new Date(attempt.expiresAt).getTime() + 15000;
      const attemptStatus = isExpired
        ? "auto_submitted"
        : status === "terminated_violations"
          ? "terminated_violations"
          : "submitted";

      const resultStatus: "completed" | "terminated_violations" =
        status === "terminated_violations" ? "terminated_violations" : "completed";

      // Server-side Score Calculation with Randomization Permutation (Phases 4 & 8)
      let score = 0;
      let totalMarks = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      attempt.questionOrder.forEach((origQIdx, displayIdx) => {
        const origQ = quiz.questions[origQIdx];
        const questionMarks = origQ.marks || 1;
        totalMarks += questionMarks;

        const studentChoiceIdx = answers[displayIdx];

        if (studentChoiceIdx === null || studentChoiceIdx === undefined) {
          unansweredCount++;
        } else {
          // Un-shuffle student choice back to original question option index
          const optMapping = attempt.optionOrders[displayIdx] || [];
          const originalOptionIndex = optMapping[studentChoiceIdx];

          if (originalOptionIndex === origQ.correctIndex) {
            correctCount++;
            score += questionMarks;
          } else {
            wrongCount++;
          }
        }
      });

      // Save Result
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
        status: resultStatus,
        startedAt: attempt.startedAt,
        completedAt: now,
      });
      await result.save();

      // Update attempt
      attempt.status = isExpired ? "auto_submitted" : "submitted";
      attempt.answers = answers;
      attempt.submittedAt = now;
      attempt.violationCount = violationCount;
      await attempt.save();

      // Update user test history
      const user = await User.findById(userId);
      if (user) {
        if (!user.tests) user.tests = [];
        user.tests.push({
          quizId: quiz.id.toString(),
          quizTitle: quiz.title,
          score,
          totalQuestions: quiz.questions.length,
          correctCount,
          wrongCount,
          unansweredCount,
          violationCount,
          status: resultStatus,
          date: now,
        });
        await user.save();
      }

      // Broadcast live event
      broadcastAdminEvent(quiz.id.toString(), "new_submission", {
        userName,
        userEmail,
        score,
        totalQuestions: quiz.questions.length,
        violationCount,
        violations,
        status: attemptStatus,
        date: now,
      });

      // Audit Log
      await logAudit({
        action: isExpired ? "EXAM_AUTO_SUBMITTED" : "EXAM_SUBMITTED",
        actorId: req.user._id.toString(),
        actorName: userName,
        actorRole: "student",
        targetId: quiz._id.toString(),
        details: { quizTitle: quiz.title, score, totalMarks, violationCount, status: attemptStatus },
        ipAddress: req.ip || "127.0.0.1",
      });

      if (violationCount > 0) {
        await logAudit({
          action: "CHEATING_VIOLATION_TRIGGERED",
          actorId: req.user._id.toString(),
          actorName: userName,
          actorRole: "student",
          targetId: quiz._id.toString(),
          details: { quizTitle: quiz.title, violationCount, violations },
          ipAddress: req.ip || "127.0.0.1",
        });
      }

      // Never leak answer key to regular student
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
        status: attemptStatus,
        message: "Assessment submitted successfully.",
      });
    } else {
      // Mock Store Fallback
      const attempt = await mockStore.findAttemptById(attemptId);
      if (!attempt) {
        return res.status(404).json({ success: false, message: "Attempt not found" });
      }

      if (attempt.userId !== userId) {
        return res.status(403).json({ success: false, message: "Forbidden: Attempt ownership mismatch" });
      }

      if (["submitted", "auto_submitted"].includes(attempt.status)) {
        return res.status(400).json({ success: false, message: "This assessment has already been submitted." });
      }

      const quiz = await mockStore.findQuizById(attempt.quizId);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }

      const now = new Date();
      const isExpired = now.getTime() > new Date(attempt.expiresAt).getTime() + 15000;
      const attemptStatus = isExpired
        ? "auto_submitted"
        : status === "terminated_violations"
          ? "terminated_violations"
          : "submitted";

      const resultStatus: "completed" | "terminated_violations" =
        status === "terminated_violations" ? "terminated_violations" : "completed";

      let score = 0;
      let totalMarks = 0;
      let correctCount = 0;
      let wrongCount = 0;
      let unansweredCount = 0;

      attempt.questionOrder.forEach((origQIdx, displayIdx) => {
        const origQ = quiz.questions[origQIdx];
        const questionMarks = origQ.marks || 1;
        totalMarks += questionMarks;

        const studentChoiceIdx = answers[displayIdx];

        if (studentChoiceIdx === null || studentChoiceIdx === undefined) {
          unansweredCount++;
        } else {
          const optMapping = attempt.optionOrders[displayIdx] || [];
          const originalOptionIndex = optMapping[studentChoiceIdx];

          if (originalOptionIndex === origQ.correctIndex) {
            correctCount++;
            score += questionMarks;
          } else {
            wrongCount++;
          }
        }
      });

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
        resultStatus
      );

      await mockStore.updateAttempt(attemptId, {
        status: isExpired ? "auto_submitted" : "submitted",
        answers,
        submittedAt: now,
        violationCount,
      });

      const user = await mockStore.findUserById(userId);
      if (user) {
        if (!user.tests) user.tests = [];
        user.tests.push({
          quizId: quiz._id,
          quizTitle: quiz.title,
          score,
          totalQuestions: quiz.questions.length,
          correctCount,
          wrongCount,
          unansweredCount,
          violationCount,
          status: resultStatus,
          date: now,
        });
        await user.save();
      }

      broadcastAdminEvent(quiz._id, "new_submission", result);

      // Audit Log
      await logAudit({
        action: isExpired ? "EXAM_AUTO_SUBMITTED" : "EXAM_SUBMITTED",
        actorId: userId,
        actorName: userName,
        actorRole: "student",
        targetId: quiz._id,
        details: { quizTitle: quiz.title, score, totalMarks, violationCount, status: attemptStatus },
        ipAddress: req.ip || "127.0.0.1",
      });

      if (violationCount > 0) {
        await logAudit({
          action: "CHEATING_VIOLATION_TRIGGERED",
          actorId: userId,
          actorName: userName,
          actorRole: "student",
          targetId: quiz._id,
          details: { quizTitle: quiz.title, violationCount, violations },
          ipAddress: req.ip || "127.0.0.1",
        });
      }

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
        status: attemptStatus,
        message: "Assessment submitted successfully.",
      });
    }
  } catch (err: any) {
    console.error("Error submitting attempt:", err);
    res.status(500).json({ success: false, message: "Server error submitting attempt" });
  }
};
