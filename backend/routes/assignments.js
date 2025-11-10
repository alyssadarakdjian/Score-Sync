import express from 'express';
import Assignment from '../models/Assignment.js';

const router = express.Router();

// Get all assignments for a user
router.get('/:userId', async (req, res) => {
  try {
    const assignments = await Assignment.find({ userId: req.params.userId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching assignments', error: error.message });
  }
});

// Create a new assignment
router.post('/', async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    res.status(201).json(assignment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating assignment', error: error.message });
  }
});

// Mark assignment as complete
router.patch('/:id/complete', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { completed: true, completedAt: new Date() },
      { new: true }
    );
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error completing assignment', error: error.message });
  }
});

// Undo complete
router.patch('/:id/uncomplete', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      { completed: false, completedAt: null },
      { new: true }
    );
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    res.json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Error undoing assignment', error: error.message });
  }
});

// Delete an assignment
router.delete('/:id', async (req, res) => {
  try {
    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting assignment', error: error.message });
  }
});

export default router;
