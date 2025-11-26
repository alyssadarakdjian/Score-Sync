import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  fullname: { type: String, required: true },
  password: { type: String, required: true },
  studentId: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  role: { type: String, enum: ['student', 'admin'], required: true, default: 'student' },
});

export default mongoose.model("User", userSchema);