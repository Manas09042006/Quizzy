<<<<<<< HEAD
import mongoose from "mongoose";
import dotenv from "dotenv";
import { seedInitialQuizzes } from "../utils/seedData";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/quizzes";

export const isMongoConnected = () => mongoose.connection.readyState === 1;

export const connectDB = async () => {
  try {
    const isCloudUri = MONGO_URI.startsWith("mongodb+srv://");
    console.log(
      `Connecting to MongoDB (${isCloudUri ? "MongoDB Atlas Cloud" : "Local instance"})...`
    );

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
    });

    console.log("✅ MongoDB connected successfully! Database mode: Cloud / Live DB.");
    await seedInitialQuizzes();
  } catch (err: any) {
    console.warn(`\n⚠️  MongoDB connection note: ${err.message || err}`);
    console.log(
      "📁 Quizzy is operating in PERSISTENT DISK STORAGE MODE: All users, quizzes, attempts, and results are safely stored in 'server/data/quizzy_store.json' and WILL NOT be lost across restarts.\n" +
      "💡 For Cloud Deployment: Add your free MongoDB Atlas connection string to MONGO_URI in your environment variables.\n"
    );
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected!");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("MongoDB reconnected!");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err);
=======
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/quizzes';

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log(`MongoDB connected successfully`);
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected!');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected!');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  });
};
