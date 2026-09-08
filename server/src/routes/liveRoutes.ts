import express from "express";
import { subscribeQuizLive, subscribeAdminLive } from "../controllers/liveController";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware";

const router = express.Router();

// SSE stream for user waiting room
router.get("/quiz/:id", subscribeQuizLive);

// SSE stream for admin live monitor
router.get("/admin/:id", authMiddleware, adminMiddleware, subscribeAdminLive);

export default router;
