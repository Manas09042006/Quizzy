import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
<<<<<<< HEAD
import { connectDB, isMongoConnected } from "./config/db";
=======
import { connectDB } from "./config/db";
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6

// Routes
import authRoutes from "./routes/authRoutes";
import quizRoutes from "./routes/quizzes";
<<<<<<< HEAD
import attemptRoutes from "./routes/attemptRoutes";
import adminRoutes from "./routes/adminRoutes";
import liveRoutes from "./routes/liveRoutes";
import { startKeepAliveJob } from "./utils/keepAlive";

const app = express();

// CORS Configuration - Supports production domains (e.g. Vercel) and local development
const clientUrl = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/+$/, "") : null;
const allowedOrigins = clientUrl
  ? [clientUrl, "http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]
  : "*";

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

=======

const app = express();

// Middleware
app.use(cors());
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/quizzes", quizRoutes);
<<<<<<< HEAD
app.use("/api/attempts", attemptRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/live", liveRoutes);

// Health Check & Diagnostics
app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("✅ Quizzy API is running...");
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "Quizzy API is healthy",
    mode: isMongoConnected() ? "MongoDB Atlas / Cloud" : "Persistent File Storage",
    timestamp: new Date().toISOString(),
  });
=======

// Health Check
app.get("/", (_req: Request, res: Response) => {
  res.status(200).send("✅ API is running...");
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
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

<<<<<<< HEAD
// Start Server (0.0.0.0 binding ensures external reachability on cloud providers)
const PORT = process.env.PORT || 4000;

app.listen(Number(PORT), "0.0.0.0", () => {
  console.log(`🚀 Quizzy Server listening on port ${PORT} (0.0.0.0)`);
  // Start Keep-Alive Cron job to prevent Render free instance from sleeping
  startKeepAliveJob();
});

// Initialize DB in background
connectDB().catch((err) => {
  console.error("Database connection initialization error:", err);
});
=======
// Start Server
const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to DB:", err);
    process.exit(1);
  });
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
