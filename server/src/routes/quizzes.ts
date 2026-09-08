import express from "express";
<<<<<<< HEAD
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

=======
import { createQuiz, listQuizzes, getQuiz, submitQuiz } from "../controllers/quizController";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware";

const router = express.Router();
router.get("/", listQuizzes);
router.post("/", authMiddleware, adminMiddleware, createQuiz);
router.get("/:id", authMiddleware, getQuiz);
router.post("/:id/submit", authMiddleware, submitQuiz);
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
export default router;
