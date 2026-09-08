import mongoose, { Schema, Document } from "mongoose";

export type AttemptStatus = "in_progress" | "submitted" | "expired" | "auto_submitted";

export interface IAttempt extends Document {
  quizId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  startedAt: Date;
  expiresAt: Date;
  status: AttemptStatus;
  answers: (number | null)[];
  currentQuestion: number;
  violationCount: number;
  questionOrder: number[];
  optionOrders: number[][];
  submittedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttemptSchema = new Schema<IAttempt>(
  {
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, default: "Participant" },
    userEmail: { type: String, default: "" },
    startedAt: { type: Date, default: Date.now, required: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "expired", "auto_submitted"],
      default: "in_progress",
    },
    answers: { type: [Schema.Types.Mixed], default: [] },
    currentQuestion: { type: Number, default: 0 },
    violationCount: { type: Number, default: 0 },
    questionOrder: { type: [Number], default: [] },
    optionOrders: { type: [[Number]], default: [] },
    submittedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IAttempt>("Attempt", AttemptSchema);
