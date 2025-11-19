import express from "express";
import Grade from "../models/Grade.js";

const router = express.Router();

// Get grades for a student
router.get("/:studentId", async (req, res) => {
  try {
    const grades = await Grade.find({ studentId: req.params.studentId });
    res.json({ grades });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: add a grade
router.post("/", async (req, res) => {
  try {
    const grade = new Grade(req.body);
    await grade.save();
    res.status(201).json({ message: "Grade created", grade });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

export default router;
