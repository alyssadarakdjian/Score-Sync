import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  // You can add more fields here, e.g. subjects, classes, etc.
});

export default mongoose.model("Teacher", teacherSchema);
