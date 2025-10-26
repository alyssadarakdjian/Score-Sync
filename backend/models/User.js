import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  studentId: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
});

export default mongoose.model("User", userSchema);