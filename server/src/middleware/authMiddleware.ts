import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/User";
import { mockStore } from "../utils/mockStore";

interface JwtPayload {
  userId: string;
}

export const authMiddleware = async (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    ) as JwtPayload;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(decoded.userId).select("-password");
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }
      req.user = user;
    } else {
      const user = await mockStore.findUserById(decoded.userId);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: User not found" });
      }
      req.user = user;
    }

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
  }
};

export const adminMiddleware = (
  req: Request & { user?: any },
  res: Response,
  next: NextFunction
) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!req.user.isAdmin)
    return res.status(403).json({ message: "Forbidden: Admins only" });
  next();
};
