import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import assignmentRoutes from "./routes/assignments.js";
import authRoutes from "./routes/auth.js"; // imports the authentication routes (login/register)
import eventRoutes from "./routes/events.js";
import gradesRoutes from "./routes/grades.js";
import adminCoursesRoutes from "./routes/adminCourses.js";
import courseGradesRoutes from "./routes/courseGrades.js";
import messageRoutes from "./routes/message.js";

// Load environment variables from .env file
dotenv.config();

const app = express();

// Enable CORS so the frontend can communicate with the backend
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"], // allowed frontend origins
    credentials: true, // allow cookies/auth headers
  })
);

// Allow backend to parse incoming JSON request bodies
app.use(express.json());

// Simple endpoint to verify backend is online
app.get("/api/health", (_req, res) => {
  res.json({ status: "Backend is running ✅" });
});

// Load server configs (port + database URL)
const PORT = Number(process.env.PORT) || 5050;
const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    // Connect to MongoDB if a valid URI exists
    if (MONGO_URI) {
      await mongoose.connect(MONGO_URI);
      console.log("✅ MongoDB connected");
    } else {
      // Warn if DB connection is skipped
      console.warn("⚠️ No MONGO_URI found; starting API without DB connection.");
    }

    // Register all backend API route handlers
    app.use("/api/auth", authRoutes);             // user login/register
    app.use("/api/events", eventRoutes);          // calendar events
    app.use("/api/assignments", assignmentRoutes); // assignments CRUD
    app.use("/api/grades", gradesRoutes);         // student grades
    app.use("/api/admin-courses", adminCoursesRoutes); // admin course mgmt
    app.use("/api/course-grades", courseGradesRoutes); // fetch grades for courses
    app.use("/api/messages", messageRoutes);      // messaging system

    // Start the backend server (explicit IPv4 binding for reliability)
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
    });
  } catch (err) {
    // Log DB connection failure & stop execution
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
})();
