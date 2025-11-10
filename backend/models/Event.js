import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // to link events to specific users
  title: { type: String, required: true },
  start: { type: Date, required: true },
  end: { type: Date, required: true },
  description: { type: String },
  color: { type: String, default: '#2563eb' }, // default blue color
  created: { type: Date, default: Date.now }
});

export default mongoose.model("Event", eventSchema);