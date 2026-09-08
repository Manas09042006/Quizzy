import mongoose, { Schema, Document } from "mongoose";

export type AuditAction =
  | "USER_REGISTERED"
  | "USER_EMAIL_VERIFIED"
  | "ADMIN_APPROVED_USER"
  | "ADMIN_BLOCKED_USER"
  | "ADMIN_UNBLOCKED_USER"
  | "ADMIN_LOGIN"
  | "QUIZ_CREATED"
  | "QUIZ_UPDATED"
  | "QUIZ_DELETED"
  | "QUIZ_PUBLISHED"
  | "QUIZ_UNPUBLISHED"
  | "EXAM_STARTED"
  | "EXAM_SUBMITTED"
  | "EXAM_AUTO_SUBMITTED"
  | "CHEATING_VIOLATION_TRIGGERED"
  | "PASSWORD_CHANGED"
  | "PASSWORD_RESET"
  | "ADMIN_DELETED_USER"
  | "ADMIN_REMOVED_PARTICIPANT";

export interface IAuditLog extends Document {
  action: AuditAction;
  actorId?: string;
  actorName?: string;
  actorRole: "admin" | "student" | "system";
  targetId?: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    actorId: { type: String, default: "system" },
    actorName: { type: String, default: "System" },
    actorRole: {
      type: String,
      enum: ["admin", "student", "system"],
      default: "system",
    },
    targetId: { type: String, default: "" },
    details: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "127.0.0.1" },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  { timestamps: false }
);

export default mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
