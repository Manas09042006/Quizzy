import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { connectDB } from "./config/db";

// Routes
import authRoutes from "./routes/authRoutes";
import quizRoutes from "./routes/quizzes";
import adminRoutes from "./routes/adminRoutes";
import liveRoutes from "./routes/liveRoutes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/live", liveRoutes);

// Health Check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("✅ Quizzy API is running...");
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: "Quizzy API is healthy" });
});

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Server error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Start Server
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`🚀 Quizzy Server listening on port ${PORT}`);
});

// Initialize DB in background
connectDB().catch((err) => {
  console.error("Database connection initialization error:", err);
});
