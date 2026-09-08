import express from "express";
import {
  getAttempt,
  autoSaveAttempt,
  submitAttempt,
} from "../controllers/attemptController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// All attempt routes require active authenticated user
router.use(authMiddleware);

// Restore active attempt (Phase 5)
router.get("/:attemptId", getAttempt);

// Auto-save attempt progress (Phase 5)
router.patch("/:attemptId/save", autoSaveAttempt);

// Submit attempt (Phase 2 & 3)
router.post("/:attemptId/submit", submitAttempt);

export default router;
