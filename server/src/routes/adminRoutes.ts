import express from "express";
import {
  getAdminOverview,
  getQuizMonitoringData,
  setQuizStatus,
  editQuiz,
  removeQuiz,
  listStudents,
  updateStudentStatus,
  deleteStudent,
  removeQuizParticipant,
  getAuditLogs,
} from "../controllers/adminController";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Apply auth and admin protection to all admin routes
router.use(authMiddleware, adminMiddleware);

// Admin statistics & overview
router.get("/overview", getAdminOverview);

// Student management
router.get("/students", listStudents);
router.patch("/students/:id/status", updateStudentStatus);
router.delete("/students/:id", deleteStudent);

// Audit logs (Phase 8)
router.get("/audit-logs", getAuditLogs);

// Live quiz monitoring for a specific quiz
router.get("/quizzes/:id/monitor", getQuizMonitoringData);
router.delete("/quizzes/:id/participants/:resultId", removeQuizParticipant);

// Admin Start / Stop / Draft status toggle
router.patch("/quizzes/:id/status", setQuizStatus);

// Edit quiz
router.put("/quizzes/:id", editQuiz);

// Delete quiz
router.delete("/quizzes/:id", removeQuiz);

export default router;
