import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface ITestResult {
<<<<<<< HEAD
  quizId: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  correctCount?: number;
  wrongCount?: number;
  unansweredCount?: number;
  violationCount?: number;
  status?: "completed" | "terminated_violations";
  date: Date;
}

export type UserStatus = "pending_approval" | "active" | "blocked";

=======
  quizTitle: string;
  quizId: string;
  score: number;
  totalQuestions: number;
  date: Date;
}

>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
<<<<<<< HEAD
  role: "admin" | "user";
  isAdmin: boolean;
  status: UserStatus;
  lastLogin?: Date;
  tests: ITestResult[];
  createdAt: Date;
  updatedAt: Date;
=======
  isAdmin: boolean;
  tests: ITestResult[];
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  comparePassword(enteredPassword: string): Promise<boolean>;
}

const TestResultSchema = new Schema<ITestResult>({
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  score: { type: Number, required: true },
  totalQuestions: { type: Number, required: true },
<<<<<<< HEAD
  correctCount: { type: Number, default: 0 },
  wrongCount: { type: Number, default: 0 },
  unansweredCount: { type: Number, default: 0 },
  violationCount: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["completed", "terminated_violations"],
    default: "completed",
  },
=======
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  date: { type: Date, default: Date.now },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
<<<<<<< HEAD
    role: { type: String, enum: ["admin", "user"], default: "user" },
    isAdmin: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending_approval", "active", "blocked"],
      default: "pending_approval",
    },
    lastLogin: { type: Date },
=======
    isAdmin: { type: Boolean, default: false },
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
    tests: [TestResultSchema],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
