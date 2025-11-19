import mongoose from "mongoose";

const gradeSchema = new mongoose.Schema({
  studentId: { type: String, required: true },   // or ObjectId → User._id
  course: { type: String, required: true },
  assignment: { type: String, required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Grade", gradeSchema);
