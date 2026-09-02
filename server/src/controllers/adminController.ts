import { Request, Response } from "express";
import mongoose from "mongoose";
import Quiz from "../models/Quiz";
import Result from "../models/Result";
import { mockStore } from "../utils/mockStore";
import { broadcastQuizStatusChange } from "./liveController";

/**
 * Get Admin Overview Metrics
 */
export const getAdminOverview = async (_req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const totalQuizzes = await Quiz.countDocuments();
      const activeQuizzes = await Quiz.countDocuments({ status: "active" });
      const upcomingQuizzes = await Quiz.countDocuments({ status: "draft" });
      const endedQuizzes = await Quiz.countDocuments({ status: "ended" });
      const totalSubmissions = await Result.countDocuments();
      const flaggedSubmissions = await Result.countDocuments({ violationCount: { $gt: 0 } });
      const allResults = await Result.find().select("violationCount").lean();
      const totalViolations = allResults.reduce((sum, r) => sum + (r.violationCount || 0), 0);

      const recentSubmissions = await Result.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .lean();

      const quizzes = await Quiz.find().sort({ createdAt: -1 }).lean();
      const formattedQuizzes = await Promise.all(
        quizzes.map(async (q) => ({
          _id: q._id,
          title: q.title,
          description: q.description || "",
          status: q.status || "draft",
          defaultTimeLimit: q.defaultTimeLimit || 30,
          marksPerQuestion: q.marksPerQuestion || 1,
          questionCount: q.questions ? q.questions.length : 0,
          createdAt: q.createdAt,
          totalAttempts: await Result.countDocuments({ quizId: q._id }),
        }))
      );

      return res.status(200).json({
        success: true,
        data: {
          totalQuizzes,
          activeQuizzes,
          upcomingQuizzes,
          endedQuizzes,
          totalSubmissions,
          flaggedSubmissions,
          totalViolations,
          recentSubmissions,
          quizzes: formattedQuizzes,
        },
      });
    } else {
      const data = await mockStore.getAdminOverview();
      return res.status(200).json({ success: true, data });
    }
  } catch (err: any) {
    console.error("Error fetching admin overview:", err);
    res.status(500).json({ success: false, message: "Failed to load admin overview metrics" });
  }
};

/**
 * Get detailed live monitoring data for a specific quiz
 */
export const getQuizMonitoringData = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      const quiz = await Quiz.findById(id).lean();
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }

      const results = await Result.find({ quizId: id }).sort({ createdAt: -1 }).lean();
      const flaggedCount = results.filter((r) => r.violationCount > 0).length;
      const averageScore =
        results.length > 0
          ? (results.reduce((s, r) => s + r.score, 0) / results.length).toFixed(1)
          : "0";

      return res.status(200).json({
        success: true,
        data: {
          quiz,
          totalAttempts: results.length,
          flaggedCount,
          averageScore,
          participants: results,
        },
      });
    } else {
      const data = await mockStore.getQuizMonitoringData(id);
      if (!data) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }
      return res.status(200).json({ success: true, data });
    }
  } catch (err: any) {
    console.error("Error fetching quiz monitoring data:", err);
    res.status(500).json({ success: false, message: "Failed to load quiz monitoring data" });
  }
};

/**
 * Update Quiz Status (Start/Stop/Draft) and broadcast real-time SSE
 */
export const setQuizStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["draft", "active", "ended"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'draft', 'active', or 'ended'",
      });
    }

    if (mongoose.connection.readyState === 1) {
      const quiz = await Quiz.findByIdAndUpdate(id, { status }, { new: true });
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }

      // Broadcast real-time SSE notification to all users waiting
      broadcastQuizStatusChange(id, status);

      return res.status(200).json({
        success: true,
        message: `Quiz status successfully updated to ${status}`,
        data: quiz,
      });
    } else {
      const quiz = await mockStore.updateQuizStatus(id, status);
      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }

      // Broadcast real-time SSE notification to all users waiting
      broadcastQuizStatusChange(id, status);

      return res.status(200).json({
        success: true,
        message: `Quiz status successfully updated to ${status}`,
        data: quiz,
      });
    }
  } catch (err: any) {
    console.error("Error updating quiz status:", err);
    res.status(500).json({ success: false, message: "Failed to update quiz status" });
  }
};

/**
 * Edit Quiz (title, description, defaultTimeLimit, questions)
 */
export const editQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, defaultTimeLimit, marksPerQuestion, questions } = req.body;

    if (mongoose.connection.readyState === 1) {
      const quiz = await Quiz.findByIdAndUpdate(
        id,
        {
          title,
          description: description || "",
          status: status || "draft",
          defaultTimeLimit: defaultTimeLimit || 30,
          marksPerQuestion: marksPerQuestion || 1,
          questions,
        },
        { new: true }
      );

      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }

      return res.status(200).json({ success: true, message: "Quiz updated successfully", data: quiz });
    } else {
      const quiz = await mockStore.editQuiz(id, {
        title,
        description,
        status,
        defaultTimeLimit,
        marksPerQuestion,
        questions,
      });

      if (!quiz) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }

      return res.status(200).json({ success: true, message: "Quiz updated successfully", data: quiz });
    }
  } catch (err: any) {
    console.error("Error updating quiz:", err);
    res.status(500).json({ success: false, message: "Failed to update quiz" });
  }
};

/**
 * Delete Quiz
 */
export const removeQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      await Quiz.findByIdAndDelete(id);
      await Result.deleteMany({ quizId: id });
      return res.status(200).json({ success: true, message: "Quiz deleted successfully" });
    } else {
      const deleted = await mockStore.deleteQuiz(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Quiz not found" });
      }
      return res.status(200).json({ success: true, message: "Quiz deleted successfully" });
    }
  } catch (err: any) {
    console.error("Error deleting quiz:", err);
    res.status(500).json({ success: false, message: "Failed to delete quiz" });
  }
};
