import express from 'express';
import AdminCourse from '../models/AdminCourse.js';
import User from '../models/User.js';

const router = express.Router();

// Simple admin middleware (duplicate for isolation)
async function requireAdmin(req, res, next) {
  try {
    const email = req.header('x-user-email');
    if (!email) return res.status(401).json({ message: 'Missing admin email header' });
    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin privileges required' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Authorization check failed' });
  }
}

// GET all courses (admins & students can view)
router.get('/', async (_req, res) => {
  try {
    const courses = await AdminCourse.find().sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// CREATE (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const course = new AdminCourse(req.body);
    await course.save();
    res.status(201).json({ message: 'Course created', course });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create course' });
  }
});

// UPDATE (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const updated = await AdminCourse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course updated', course: updated });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update course' });
  }
});

// DELETE (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deleted = await AdminCourse.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Course not found' });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete course' });
  }
});

export default router;
