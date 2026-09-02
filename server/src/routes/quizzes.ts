import express from "express";
import {
  createQuiz,
  listQuizzes,
  getQuiz,
  submitQuiz,
  getQuizResult,
} from "../controllers/quizController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", listQuizzes);
router.post("/", authMiddleware, createQuiz);
router.get("/:id", authMiddleware, getQuiz);
router.post("/:id/submit", authMiddleware, submitQuiz);
router.get("/:id/result", authMiddleware, getQuizResult);

export default router;
