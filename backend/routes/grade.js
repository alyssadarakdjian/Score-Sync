//In Progress. Will be used for the Grades Tab


import express from "express";
import Grade from "../models/Grade.js";

const router = express.Router();

// Get all grades
router.get("/", async (req, res) => {
  try {
    const grades = await Grade.find().populate("studentId courseId");
    res.json(grades);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a grade
router.post("/", async (req, res) => {
  try {
    const newGrade = new Grade(req.body);
    await newGrade.save();
    res.status(201).json(newGrade);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a grade
router.put("/:id", async (req, res) => {
  try {
    const updatedGrade = await Grade.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedGrade) return res.status(404).json({ message: "Grade not found" });
    res.json(updatedGrade);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a grade
router.delete("/:id", async (req, res) => {
  try {
    const deletedGrade = await Grade.findByIdAndDelete(req.params.id);
    if (!deletedGrade) return res.status(404).json({ message: "Grade not found" });
    res.json({ message: "Grade deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;