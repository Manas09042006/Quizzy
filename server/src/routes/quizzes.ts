import express from "express";
import {
  createQuiz,
  listQuizzes,
  getQuiz,
  submitQuiz,
  getQuizResult,
} from "../controllers/quizController";
import { startAttempt } from "../controllers/attemptController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", listQuizzes);
router.post("/", authMiddleware, createQuiz);
router.get("/:id", authMiddleware, getQuiz);
router.post("/:id/start-attempt", authMiddleware, startAttempt);
router.post("/:id/submit", authMiddleware, submitQuiz);
router.get("/:id/result", authMiddleware, getQuizResult);

export default router;
