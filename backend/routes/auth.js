import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullname, studentId, dateOfBirth } = req.body; // role intentionally omitted (always student)

    if (!email || !password || !studentId || !dateOfBirth)
      return res.status(400).json({ message: "Missing required fields" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime()))
      return res.status(400).json({ message: "Invalid dateOfBirth" });

    const newUser = new User({
      email,
      password,
      fullname,
      studentId,
      dateOfBirth: dob,
      role: "student",
    });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.password !== password)
      return res.status(400).json({ message: "Invalid credentials" });

    // ✅ Return user data (excluding password)
    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        studentId: user.studentId,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin login (explicit) - only succeeds if user has role 'admin'
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log("[ADMIN LOGIN] Attempt:", { email, providedPassword: password });
    if (!user) {
      console.log("[ADMIN LOGIN] No user found for email");
      return res.status(400).json({ message: "Invalid admin credentials" });
    }
    if (user.password !== password) {
      console.log("[ADMIN LOGIN] Password mismatch");
      return res.status(400).json({ message: "Invalid admin credentials" });
    }
    if (user.role !== "admin") {
      console.log("[ADMIN LOGIN] Role not admin:", user.role);
      return res.status(400).json({ message: "Invalid admin credentials" });
    }
    res.json({
      message: "Admin login successful",
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by email (exclude password)
router.get("/user", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Missing email" });

    const user = await User.findOne({ email }).select("-password -__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all students (for admin to add to courses)
router.get("/students", async (req, res) => {
  try {
    const students = await User.find({ role: "student" })
      .select("fullname email studentId _id")
      .sort({ fullname: 1 });
    res.json({ students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (for messaging dropdown)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().select("fullname email _id role");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;