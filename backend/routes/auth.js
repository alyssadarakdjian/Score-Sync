//auth.js authenticated the user from the database and determines if the login attempt is successful

import express from "express";
import User from "../models/User.js";

const router = express.Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const { email, password, studentId, dateOfBirth } = req.body;

    // Basic validation
    if (!email || !password || !studentId || !dateOfBirth)
      return res.status(400).json({ message: "Missing required fields" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime()))
      return res.status(400).json({ message: "Invalid dateOfBirth" });

    const newUser = new User({ email, password, studentId, dateOfBirth: dob });
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

    res.json({ message: "Login successful" });
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

export default router;