import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js"; //imports the authentication from the user
import eventRoutes from "./routes/events.js";
import assignmentRoutes from "./routes/assignments.js";
import courseRoutes from "./routes/course.js";
import gradeRoutes from "./routes/grade.js";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "Backend is running ✅" });
});

const PORT = Number(process.env.PORT) || 5050;
const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    if (!MONGO_URI) {
      console.warn("⚠️ No MONGO_URI found; starting API without DB connection.");
    } else {
      await mongoose.connect(MONGO_URI);
      console.log("✅ MongoDB connected");
    }

    app.use("/api/auth", authRoutes);
    app.use("/api/events", eventRoutes);
    app.use("/api/assignments", assignmentRoutes);
    app.use("/api/courses", courseRoutes);
    app.use("/api/grades", gradeRoutes);

    // Bind to IPv4 to avoid localhost/IPv6 quirks
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
})();