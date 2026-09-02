import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  timeLimit?: number; // seconds (e.g. 15s, 30s, 45s, 60s)
  marks?: number;     // marks for this question (default 1)
}

export interface IQuiz extends Document {
  title: string;
  description?: string;
  status: "draft" | "active" | "ended";
  defaultTimeLimit: number; // seconds per question
  marksPerQuestion: number;
  questions: IQuestion[];
  createdBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>({
  question: { type: String, required: true, trim: true },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => Array.isArray(v) && v.length >= 2,
      message: "Each question must have at least 2 options.",
    },
  },
  correctIndex: { type: Number, required: true, min: 0 },
  timeLimit: { type: Number, default: 30, min: 5, max: 300 },
  marks: { type: Number, default: 1, min: 1, max: 100 },
});

const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true, trim: true, minlength: 2, maxlength: 150 },
  description: { type: String, trim: true, default: "" },
  status: {
    type: String,
    enum: ["draft", "active", "ended"],
    default: "active",
  },
  defaultTimeLimit: { type: Number, default: 30, min: 5, max: 300 },
  marksPerQuestion: { type: Number, default: 1, min: 1, max: 100 },
  questions: {
    type: [QuestionSchema],
    required: true,
    validate: { validator: (v: IQuestion[]) => Array.isArray(v) && v.length > 0, message: "At least one question is required." },
  },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IQuiz>("Quiz", QuizSchema);
