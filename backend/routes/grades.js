// backend/routes/grades.js
import express from "express";
import Grade from "../models/Grade.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/grades?studentEmail=...
router.get("/", async (req, res) => {
  try {
    const { studentEmail } = req.query;
    const filter = {};

    if (studentEmail) {
      filter.studentEmail = studentEmail;
    }

    const grades = await Grade.find(filter).sort({ gradedDate: -1 });
    res.json({ grades });
  } catch (err) {
    console.error("Error fetching grades:", err);
    res.status(500).json({ message: "Failed to fetch grades" });
  }
});

// Simple admin check middleware using x-user-email header
async function requireAdmin(req, res, next) {
  try {
    const email = req.header('x-user-email');
    if (!email) return res.status(401).json({ message: 'Missing admin email header' });
    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Authorization check failed' });
  }
}

// POST /api/grades (admin only)
router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      studentEmail,
      studentName,
      courseName,
      assignmentName,
      assignmentType,
      score,
      maxScore,
      percentage,
      letterGrade,
      gradedDate,
    } = req.body;

    if (
      !studentEmail ||
      !courseName ||
      !assignmentName ||
      score == null ||
      maxScore == null
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const grade = new Grade({
      studentEmail,
      studentName,
      courseName,
      assignmentName,
      assignmentType,
      score,
      maxScore,
      percentage,
      letterGrade,
      gradedDate: gradedDate || new Date(),
    });

    await grade.save();
    res.status(201).json({ message: "Grade created", grade });
  } catch (err) {
    console.error("Error creating grade:", err);
    res.status(500).json({ message: "Failed to create grade" });
  }
});

// PUT /api/grades/:id (admin only)
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const updated = await Grade.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updated) {
      return res.status(404).json({ message: "Grade not found" });
    }
    res.json({ message: "Grade updated", grade: updated });
  } catch (err) {
    console.error("Error updating grade:", err);
    res.status(500).json({ message: "Failed to update grade" });
  }
});

// DELETE /api/grades/:id (admin only)
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const deleted = await Grade.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Grade not found" });
    }
    res.json({ message: "Grade deleted" });
  } catch (err) {
    console.error("Error deleting grade:", err);
    res.status(500).json({ message: "Failed to delete grade" });
  }
});

export default router;
