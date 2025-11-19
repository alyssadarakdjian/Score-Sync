// backend/models/Grade.js
import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema(
  {
    studentEmail: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
    },
    courseName: {
      type: String,
      required: true,
    },
    assignmentName: {
      type: String,
      required: true,
    },
    assignmentType: {
      type: String, // Homework, Quiz, Test, etc
    },
    score: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
    },
    letterGrade: {
      type: String,
    },
    gradedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Grade", gradeSchema);
