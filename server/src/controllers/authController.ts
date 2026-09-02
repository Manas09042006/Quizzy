import { Request, Response } from "express";
import mongoose from "mongoose";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import { mockStore } from "../utils/mockStore";

// --- Register User ---
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, adminPasscode } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const isAdmin =
      role === "admin" ||
      adminPasscode === "admin123" ||
      req.body.isAdmin === true;

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const user = new User({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        isAdmin,
      });
      await user.save();

      const token = generateToken(user.id.toString());
      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        token,
      });
    } else {
      // In-Memory Fallback
      const existingUser = await mockStore.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const user = await mockStore.createUser(name.trim(), email.trim(), password, isAdmin);
      const token = generateToken(user._id);

      return res.status(201).json({
        message: "User registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        token,
      });
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message || "Server error", error });
  }
};

// --- Login User ---
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: email.trim().toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user.id.toString());

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin || false,
          tests: user.tests || [],
        },
      });
    } else {
      // In-Memory Fallback
      const user = await mockStore.findUserByEmail(email.trim());
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin || false,
          tests: user.tests || [],
        },
      });
    }
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Server error", error });
  }
};
