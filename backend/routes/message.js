import express from "express";
import Message from "../models/Message.js";
import User from "../models/User.js";

const router = express.Router();

// Get all conversations for a specific user (grouped by other participant)
router.get("/conversations/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Find messages where user is sender or recipient
    const messages = await Message.find({
      $or: [{ senderId: userId }, { recipientId: userId }],
    })
      .populate("senderId", "fullname email")
      .populate("recipientId", "fullname email")
      .sort({ createdAt: -1 });

    // Group conversations by the other participant
    const conversationMap = {};
    messages.forEach((msg) => {
      const otherUser =
        msg.senderId._id.toString() === userId
          ? msg.recipientId
          : msg.senderId;

      if (!conversationMap[otherUser._id]) {
        conversationMap[otherUser._id] = {
          _id: otherUser._id,
          fullname: otherUser.fullname,
          email: otherUser.email,
          lastMessage: msg.content,
          timestamp: msg.createdAt,
        };
      }
    });

    res.json(Object.values(conversationMap));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get messages between two users
router.get("/:userId/:otherUserId", async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    const messages = await Message.find({
      $or: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("senderId", "fullname email")
      .populate("recipientId", "fullname email");

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a new message
router.post("/", async (req, res) => {
  try {
    const { senderId, recipientId, subject, content } = req.body;
    const message = new Message({ senderId, recipientId, subject, content });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete all messages between two users (conversation)
router.delete("/conversation/:userId/:otherUserId", async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;
    await Message.deleteMany({
      $or: [
        { senderId: userId, recipientId: otherUserId },
        { senderId: otherUserId, recipientId: userId },
      ],
    });
    res.json({ message: "Conversation deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting conversation:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;