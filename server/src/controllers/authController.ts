import { Request, Response } from "express";
<<<<<<< HEAD
import mongoose from "mongoose";
import User from "../models/User";
import { generateToken } from "../utils/generateToken";
import { mockStore } from "../utils/mockStore";
import { logAudit } from "../utils/auditLogger";
=======
import User, { IUser } from "../models/User";
import { generateToken } from "../utils/generateToken";
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6

// --- Register User ---
export const registerUser = async (req: Request, res: Response) => {
  try {
<<<<<<< HEAD
    const { name, email, password, role, adminPasscode } = req.body;

    if (!name || !name.trim() || !email || !email.trim() || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const isAdmin =
      role === "admin" ||
      adminPasscode === "admin123" ||
      req.body.isAdmin === true;

    // Admin accounts created via valid passcode can be active; student accounts are pending approval
    const status = isAdmin ? "active" : "pending_approval";

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const user = new User({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        isAdmin,
        status,
      });
      await user.save();

      // Audit Log
      await logAudit({
        action: "USER_REGISTERED",
        actorId: user.id.toString(),
        actorName: user.name,
        actorRole: isAdmin ? "admin" : "student",
        targetId: user.id.toString(),
        details: { email: user.email, role: isAdmin ? "admin" : "user", status },
        ipAddress: req.ip || "127.0.0.1",
      });

      if (isAdmin) {
        const token = generateToken(user.id.toString());
        return res.status(201).json({
          success: true,
          message: "Admin registered successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            status: user.status,
          },
          token,
        });
      }

      // Students do NOT receive a login token upon registration
      return res.status(201).json({
        success: true,
        message: "Registration submitted successfully. Your account is pending admin approval.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: false,
          status: "pending_approval",
        },
      });
    } else {
      // In-Memory Fallback
      const existingUser = await mockStore.findUserByEmail(email.trim());
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }

      const user = await mockStore.createUser(name.trim(), email.trim(), password, isAdmin);

      // Audit Log
      await logAudit({
        action: "USER_REGISTERED",
        actorId: user._id,
        actorName: user.name,
        actorRole: isAdmin ? "admin" : "student",
        targetId: user._id,
        details: { email: user.email, role: isAdmin ? "admin" : "user", status },
        ipAddress: req.ip || "127.0.0.1",
      });

      if (isAdmin) {
        const token = generateToken(user._id);
        return res.status(201).json({
          success: true,
          message: "Admin registered successfully",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            status: user.status,
          },
          token,
        });
      }

      // Students do NOT receive a login token upon registration
      return res.status(201).json({
        success: true,
        message: "Registration submitted successfully. Your account is pending admin approval.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: false,
          status: "pending_approval",
        },
      });
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    res.status(500).json({ message: error.message || "Server error", error });
=======
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = new User({ name, email, password });
    await user.save();

    // Optionally, return user info with token after registration
    const token = generateToken(user.id.toString());

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
  }
};

// --- Login User ---
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

<<<<<<< HEAD
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

      // Check User Status
      if (user.status === "pending_approval") {
        return res.status(403).json({
          success: false,
          status: "pending_approval",
          message: "Your account is pending admin approval.",
        });
      }

      if (user.status === "blocked") {
        return res.status(403).json({
          success: false,
          status: "blocked",
          message: "Your account has been blocked by administrator.",
        });
      }

      // Record last login
      user.lastLogin = new Date();
      await user.save();

      if (user.isAdmin) {
        await logAudit({
          action: "ADMIN_LOGIN",
          actorId: user.id.toString(),
          actorName: user.name,
          actorRole: "admin",
          targetId: user.id.toString(),
          details: { email: user.email },
          ipAddress: req.ip || "127.0.0.1",
        });
      }

      const token = generateToken(user.id.toString());

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin || false,
          status: user.status || "active",
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

      // Check User Status
      if (user.status === "pending_approval") {
        return res.status(403).json({
          success: false,
          status: "pending_approval",
          message: "Your account is pending admin approval.",
        });
      }

      if (user.status === "blocked") {
        return res.status(403).json({
          success: false,
          status: "blocked",
          message: "Your account has been blocked by administrator.",
        });
      }

      // Record last login
      user.lastLogin = new Date();
      await user.save();

      if (user.isAdmin) {
        await logAudit({
          action: "ADMIN_LOGIN",
          actorId: user._id,
          actorName: user.name,
          actorRole: "admin",
          targetId: user._id,
          details: { email: user.email },
          ipAddress: req.ip || "127.0.0.1",
        });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin || false,
          status: user.status || "active",
          tests: user.tests || [],
        },
      });
    }
  } catch (error: any) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Server error", error });
  }
};
=======
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user.id.toString());

    // Return token + user info
    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tests: user.tests, // Include test history
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


>>>>>>> a3beb8596b3e5ac64b90309eb8e887dff468dbd6
