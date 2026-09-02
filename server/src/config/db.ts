import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedInitialQuizzes } from "../utils/seedData";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quizzes";

export const connectDB = async () => {
  try {
    console.log(`Connecting to MongoDB at ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
    await seedInitialQuizzes();
  } catch (err: any) {
    console.error("MongoDB connection error:", err.message || err);
    console.warn("\n⚠️ TIP: Ensure MongoDB is running locally on port 27017 or set a valid MONGO_URI (e.g. MongoDB Atlas) in server/.env\n");
    // In development, do not crash process immediately so server can still respond to health checks
    // and attempt auto-reconnects
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected!");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected!");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err);
  });
};
