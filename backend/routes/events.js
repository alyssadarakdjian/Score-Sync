import express from "express";
import Event from "../models/Event.js";

const router = express.Router();

// Get all events for a user
router.get("/:userId", async (req, res) => {
  try {
    const events = await Event.find({ userId: req.params.userId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new event
router.post("/", async (req, res) => {
  try {
    const { userId, title, start, end, description, color } = req.body;
    
    const newEvent = new Event({
      userId,
      title,
      start: new Date(start),
      end: new Date(end),
      description,
      color
    });

    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete an event
router.delete("/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;