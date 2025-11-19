import express from "express";
import Course from "../models/Course.js";
import User from "../models/User.js";

const router = express.Router();

// Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find();
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get courses assigned to a specific user
router.get("/user/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // If user has a 'courses' field, return only those
    if (user.courses && user.courses.length > 0) {
      const userCourses = await Course.find({
        course_code: { $in: user.courses },
      });
      return res.json(userCourses);
    }

    res.json([]); // user exists but has no courses
  } catch (err) {
    console.error("Error fetching user courses:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get one course by code
router.get("/:course_code", async (req, res) => {
  try {
    const course = await Course.findOne({
      course_code: req.params.course_code,
    });
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new course
router.post("/", async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update a course
router.put("/:course_code", async (req, res) => {
  try {
    const updatedCourse = await Course.findOneAndUpdate(
      { course_code: req.params.course_code },
      req.body,
      { new: true }
    );
    if (!updatedCourse)
      return res.status(404).json({ message: "Course not found" });
    res.json(updatedCourse);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete a course
router.delete("/:course_code", async (req, res) => {
  try {
    const deletedCourse = await Course.findOneAndDelete({
      course_code: req.params.course_code,
    });
    if (!deletedCourse)
      return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;