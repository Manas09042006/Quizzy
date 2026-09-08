import mongoose, { Schema, Document } from "mongoose";

export interface IResult extends Document {
  userId: mongoose.Types.ObjectId;
<<<<<<< HEAD
  userName: string;
  userEmail: string;
  quizId: mongoose.Types.ObjectId;
  quizTitle: string;
  score: number;
  totalMarks: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  answers: (number | null)[];
  violationCount: number;
  violations: string[];
  status: "completed" | "terminated_violations";
  startedAt?: Date;
  completedAt: Date;
=======
  quizId: mongoose.Types.ObjectId;
  quizTitle: string;
  score: number;
  total: number;
  answers: number[];
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  createdAt: Date;
}

const ResultSchema = new Schema<IResult>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
<<<<<<< HEAD
  userName: { type: String, default: "Participant" },
  userEmail: { type: String, default: "" },
  quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
  quizTitle: { type: String, required: true },
  score: { type: Number, required: true },
  totalMarks: { type: Number, default: 0 },
  totalQuestions: { type: Number, required: true },
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  unansweredCount: { type: Number, default: 0 },
  answers: { type: [Schema.Types.Mixed], default: [] },
  violationCount: { type: Number, default: 0 },
  violations: { type: [String], default: [] },
  status: {
    type: String,
    enum: ["completed", "terminated_violations"],
    default: "completed",
  },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: Date.now },
=======
  quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
  quizTitle: { type: String, required: true },
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  answers: { type: [Number], required: true },
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IResult>("Result", ResultSchema);
