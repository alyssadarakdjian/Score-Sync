//In Progress. Will Be used for the Grades Tab

import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    assignment: { type: String, required: true },
    type: {
      type: String,
      enum: ["Exam", "Quiz", "Homework", "Project", "Other"],
      default: "Other",
    },
    score: { type: Number, required: true },
    grade: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Grade", gradeSchema);