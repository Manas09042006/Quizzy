import { Request, Response } from "express";
import mongoose from "mongoose";
import Quiz from "../models/Quiz";
import Result from "../models/Result";
import User from "../models/User";
import Attempt from "../models/Attempt";
import AuditLog from "../models/AuditLog";
import { mockStore } from "../utils/mockStore";
import { broadcastQuizStatusChange } from "./liveController";
import { logAudit } from "../utils/auditLogger";

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

      // Audit Log
      await logAudit({
        action: status === "active" ? "QUIZ_PUBLISHED" : status === "draft" ? "QUIZ_UNPUBLISHED" : "QUIZ_UPDATED",
        actorId: (req as any).user?._id || (req as any).user?.id,
        actorName: (req as any).user?.name || "Admin",
        actorRole: "admin",
        targetId: id,
        details: { quizTitle: quiz.title, newStatus: status },
        ipAddress: req.ip || "127.0.0.1",
      });

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

      // Audit Log
      await logAudit({
        action: status === "active" ? "QUIZ_PUBLISHED" : status === "draft" ? "QUIZ_UNPUBLISHED" : "QUIZ_UPDATED",
        actorId: (req as any).user?._id || (req as any).user?.id,
        actorName: (req as any).user?.name || "Admin",
        actorRole: "admin",
        targetId: id,
        details: { quizTitle: quiz.title, newStatus: status },
        ipAddress: req.ip || "127.0.0.1",
      });

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

/**
 * List all students with optional status filter & search query
 */
export const listStudents = async (req: Request, res: Response) => {
  try {
    const { status, search } = req.query as { status?: string; search?: string };

    if (mongoose.connection.readyState === 1) {
      const query: any = { isAdmin: { $ne: true }, role: { $ne: "admin" } };

      if (status && status !== "all") {
        query.status = status;
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [{ name: regex }, { email: regex }];
      }

      const students = await User.find(query)
        .select("_id name email status lastLogin createdAt tests")
        .sort({ createdAt: -1 })
        .lean();

      const formatted = students.map((s) => ({
        _id: s._id,
        name: s.name,
        email: s.email,
        status: s.status || "pending_approval",
        lastLogin: s.lastLogin,
        createdAt: s.createdAt,
        quizAttempts: Array.isArray(s.tests) ? s.tests.length : 0,
      }));

      return res.status(200).json({ success: true, data: formatted });
    } else {
      const students = await mockStore.listStudents({ status, search });
      return res.status(200).json({ success: true, data: students });
    }
  } catch (err: any) {
    console.error("Error listing students:", err);
    res.status(500).json({ success: false, message: "Failed to load students list" });
  }
};

/**
 * Update Student Status (Approve, Block, Unblock)
 */
export const updateStudentStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending_approval", "active", "blocked"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'pending_approval', 'active', or 'blocked'",
      });
    }

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid student ID" });
      }

      const student = await User.findById(id);
      if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }

      if (student.isAdmin) {
        return res.status(400).json({ success: false, message: "Cannot alter status of an administrator" });
      }

      student.status = status;
      await student.save();

      const action = status === "active" ? "ADMIN_APPROVED_USER" : status === "blocked" ? "ADMIN_BLOCKED_USER" : "ADMIN_UNBLOCKED_USER";
      await logAudit({
        action,
        actorId: (req as any).user?._id || (req as any).user?.id,
        actorName: (req as any).user?.name || "Admin",
        actorRole: "admin",
        targetId: id,
        details: { studentName: student.name, studentEmail: student.email, newStatus: status },
        ipAddress: req.ip || "127.0.0.1",
      });

      return res.status(200).json({
        success: true,
        message: `Student account status successfully updated to ${status}`,
        data: {
          _id: student._id,
          name: student.name,
          email: student.email,
          status: student.status,
        },
      });
    } else {
      const student = await mockStore.updateUserStatus(id, status);
      if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }

      const action = status === "active" ? "ADMIN_APPROVED_USER" : status === "blocked" ? "ADMIN_BLOCKED_USER" : "ADMIN_UNBLOCKED_USER";
      await logAudit({
        action,
        actorId: (req as any).user?._id || (req as any).user?.id,
        actorName: (req as any).user?.name || "Admin",
        actorRole: "admin",
        targetId: id,
        details: { studentName: student.name, studentEmail: student.email, newStatus: status },
        ipAddress: req.ip || "127.0.0.1",
      });

      return res.status(200).json({
        success: true,
        message: `Student account status successfully updated to ${status}`,
        data: {
          _id: student._id,
          name: student.name,
          email: student.email,
          status: student.status,
        },
      });
    }
  } catch (err: any) {
    console.error("Error updating student status:", err);
    res.status(500).json({ success: false, message: "Failed to update student status" });
  }
};

/**
 * Get Audit Logs with search, filters, pagination
 * GET /api/admin/audit-logs
 */
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const { action, search, user, page = 1, limit = 20 } = req.query as any;

    if (mongoose.connection.readyState === 1) {
      const query: any = {};
      if (action && action !== "all") {
        query.action = action;
      }
      if (user) {
        query.$or = [
          { actorName: new RegExp(user.trim(), "i") },
          { actorId: user.trim() },
        ];
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [
          { action: regex },
          { actorName: regex },
          { targetId: regex },
        ];
      }

      const p = Math.max(1, parseInt(page, 10) || 1);
      const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const skip = (p - 1) * l;

      const total = await AuditLog.countDocuments(query);
      const logs = await AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(l)
        .lean();

      return res.status(200).json({
        success: true,
        data: {
          logs,
          total,
          page: p,
          totalPages: Math.ceil(total / l) || 1,
        },
      });
    } else {
      const result = await mockStore.listAuditLogs({
        action,
        search,
        user,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });
      return res.status(200).json({ success: true, data: result });
    }
  } catch (err: any) {
    console.error("Error fetching audit logs:", err);
    res.status(500).json({ success: false, message: "Failed to load audit logs" });
  }
};

/**
 * Delete Student (Remove User)
 * DELETE /api/admin/students/:id
 */
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid student ID" });
      }

      const student = await User.findById(id);
      if (!student) {
        return res.status(404).json({ success: false, message: "Student not found" });
      }

      if (student.isAdmin || student.role === "admin") {
        return res.status(400).json({ success: false, message: "Cannot delete an administrator account" });
      }

      const studentName = student.name;
      const studentEmail = student.email;

      await User.findByIdAndDelete(id);
      await Result.deleteMany({ userId: id });
      await Attempt.deleteMany({ userId: id });

      await logAudit({
        action: "ADMIN_DELETED_USER",
        actorId: (req as any).user?._id || (req as any).user?.id,
        actorName: (req as any).user?.name || "Admin",
        actorRole: "admin",
        targetId: id,
        details: { studentName, studentEmail },
        ipAddress: req.ip || "127.0.0.1",
      });

      return res.status(200).json({ success: true, message: `Student ${studentName} successfully removed` });
    } else {
      const deleted = await mockStore.deleteStudent(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Student not found or cannot be deleted" });
      }

      await logAudit({
        action: "ADMIN_DELETED_USER",
        actorId: (req as any).user?._id || (req as any).user?.id,
        actorName: (req as any).user?.name || "Admin",
        actorRole: "admin",
        targetId: id,
        details: { studentId: id },
        ipAddress: req.ip || "127.0.0.1",
      });

      return res.status(200).json({ success: true, message: "Student successfully removed" });
    }
  } catch (err: any) {
    console.error("Error deleting student:", err);
    res.status(500).json({ success: false, message: "Failed to delete student" });
  }
};

/**
 * Remove Participant from a Quiz
 * DELETE /api/admin/quizzes/:quizId/participants/:resultId
 */
export const removeQuizParticipant = async (req: Request, res: Response) => {
  try {
    const { quizId, resultId } = req.params;

    if (mongoose.connection.readyState === 1) {
      const result = await Result.findOneAndDelete({ _id: resultId, quizId });
      if (!result) {
        return res.status(404).json({ success: false, message: "Participant result not found" });
      }

      // Clean up attempt
      await Attempt.deleteMany({ quizId, userId: result.userId });

      await logAudit({
        action: "ADMIN_REMOVED_PARTICIPANT",
        actorId: (req as any).user?._id || (req as any).user?.id,
        actorName: (req as any).user?.name || "Admin",
        actorRole: "admin",
        targetId: resultId,
        details: { quizId, participantName: result.userName, participantEmail: result.userEmail },
        ipAddress: req.ip || "127.0.0.1",
      });

      return res.status(200).json({ success: true, message: "Participant removed successfully from quiz" });
    } else {
      const deleted = await mockStore.removeQuizParticipant(quizId, resultId);
      if (!deleted) {
        return res.status(404).json({ success: false, message: "Participant result not found" });
      }

      await logAudit({
        action: "ADMIN_REMOVED_PARTICIPANT",
        actorId: (req as any).user?._id || (req as any).user?.id,
        actorName: (req as any).user?.name || "Admin",
        actorRole: "admin",
        targetId: resultId,
        details: { quizId, resultId },
        ipAddress: req.ip || "127.0.0.1",
      });

      return res.status(200).json({ success: true, message: "Participant removed successfully from quiz" });
    }
  } catch (err: any) {
    console.error("Error removing quiz participant:", err);
    res.status(500).json({ success: false, message: "Failed to remove participant" });
  }
};


