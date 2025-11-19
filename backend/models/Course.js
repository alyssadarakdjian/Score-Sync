import mongoose from "mongoose";

const courseSchema = new mongoose.Schema(
  {
    course_code: { type: String, required: true, unique: true },
    course_name: { type: String, required: true },
    description: { type: String },
    teacher_name: { type: String, required: true },
    teacher_email: { type: String },
    subject: {
      type: String,
      enum: [
        "Mathematics",
        "Science",
        "English",
        "History",
        "Foreign Language",
        "Physical Education",
        "Arts",
        "Computer Science",
        "Other",
      ],
      required: true,
    },
    credits: { type: Number },
    semester: {
      type: String,
      enum: ["Fall", "Spring", "Summer", "Full Year"],
    },
    academic_year: { type: String, required: true },
    room_number: { type: String },
    schedule: { type: String },
    max_students: { type: Number },
    status: {
      type: String,
      enum: ["active", "inactive", "completed"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Course", courseSchema);