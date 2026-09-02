import express from "express";
import {
  getAdminOverview,
  getQuizMonitoringData,
  setQuizStatus,
  editQuiz,
  removeQuiz,
} from "../controllers/adminController";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// Apply auth and admin protection to all admin routes
router.use(authMiddleware, adminMiddleware);

// Admin statistics & overview
router.get("/overview", getAdminOverview);

// Live quiz monitoring for a specific quiz
router.get("/quizzes/:id/monitor", getQuizMonitoringData);

// Admin Start / Stop / Draft status toggle
router.patch("/quizzes/:id/status", setQuizStatus);

// Edit quiz
router.put("/quizzes/:id", editQuiz);

// Delete quiz
router.delete("/quizzes/:id", removeQuiz);

export default router;
