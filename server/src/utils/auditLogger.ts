import mongoose from "mongoose";
import AuditLog, { AuditAction } from "../models/AuditLog";
import { mockStore } from "./mockStore";

export interface LogAuditParams {
  action: AuditAction;
  actorId?: string;
  actorName?: string;
  actorRole?: "admin" | "student" | "system";
  targetId?: string;
  details?: Record<string, any> | string;
  ipAddress?: string;
}

export async function logAudit(params: LogAuditParams) {
  try {
    // Sanitize details: strictly remove passwords, tokens, secrets
    let safeDetails = params.details;
    if (typeof safeDetails === "object" && safeDetails !== null) {
      safeDetails = { ...safeDetails };
      delete (safeDetails as any).password;
      delete (safeDetails as any).token;
      delete (safeDetails as any).adminPasscode;
      delete (safeDetails as any).jwt;
      delete (safeDetails as any).secret;
    }

    const payload = {
      action: params.action,
      actorId: params.actorId || "system",
      actorName: params.actorName || "System",
      actorRole: params.actorRole || "system",
      targetId: params.targetId || "",
      details: safeDetails,
      ipAddress: params.ipAddress || "127.0.0.1",
      timestamp: new Date(),
    };

    if (mongoose.connection.readyState === 1) {
      const log = new AuditLog(payload);
      await log.save();
    } else {
      await mockStore.createAuditLog(payload);
    }
  } catch (err) {
    console.warn("Failed to write audit log:", err);
  }
}
