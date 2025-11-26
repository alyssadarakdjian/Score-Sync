import express from 'express';
import CourseGrade from '../models/CourseGrade.js';
import User from '../models/User.js';

const router = express.Router();

// Admin middleware
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

// GET grades for a specific course and student
router.get('/course/:courseId/student/:studentId', async (req, res) => {
  try {
    const grade = await CourseGrade.findOne({
      courseId: req.params.courseId,
      studentId: req.params.studentId
    }).populate('studentId', 'fullname email studentId')
      .populate('courseId', 'course_name course_code');
    
    res.json({ grade: grade || null });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch grade' });
  }
});

// GET all grades for a course (admin only)
router.get('/course/:courseId', requireAdmin, async (req, res) => {
  try {
    const grades = await CourseGrade.find({ courseId: req.params.courseId })
      .populate('studentId', 'fullname email studentId')
      .sort({ 'studentId.fullname': 1 });
    
    res.json({ grades });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch course grades' });
  }
});

// GET all grades for a student (returns average per course)
router.get('/student/:studentId', async (req, res) => {
  try {
    const grades = await CourseGrade.find({ studentId: req.params.studentId })
      .populate('courseId', 'course_name course_code subject');
    
    res.json({ grades });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch student grades' });
  }
});

// CREATE or UPDATE grade for a student in a course (admin only)
router.post('/course/:courseId/student/:studentId', requireAdmin, async (req, res) => {
  try {
    const { gradeItems, comments } = req.body;

    let courseGrade = await CourseGrade.findOne({
      courseId: req.params.courseId,
      studentId: req.params.studentId
    });

    if (courseGrade) {
      // Update existing
      courseGrade.gradeItems = gradeItems;
      courseGrade.comments = comments;
      await courseGrade.save();
    } else {
      // Create new
      courseGrade = new CourseGrade({
        courseId: req.params.courseId,
        studentId: req.params.studentId,
        gradeItems,
        comments
      });
      await courseGrade.save();
    }

    await courseGrade.populate('studentId', 'fullname email studentId');
    await courseGrade.populate('courseId', 'course_name course_code');

    res.json({ message: 'Grade saved', grade: courseGrade });
  } catch (err) {
    res.status(500).json({ message: 'Failed to save grade', error: err.message });
  }
});

// ADD single grade item to a student's course grade (admin only)
router.post('/course/:courseId/student/:studentId/item', requireAdmin, async (req, res) => {
  try {
    const { name, grade, maxGrade, weight, notes } = req.body;

    let courseGrade = await CourseGrade.findOne({
      courseId: req.params.courseId,
      studentId: req.params.studentId
    });

    if (!courseGrade) {
      courseGrade = new CourseGrade({
        courseId: req.params.courseId,
        studentId: req.params.studentId,
        gradeItems: []
      });
    }

    courseGrade.gradeItems.push({
      name,
      grade,
      maxGrade: maxGrade || 100,
      weight: weight || 1,
      notes
    });

    await courseGrade.save();
    await courseGrade.populate('studentId', 'fullname email studentId');

    res.json({ message: 'Grade item added', grade: courseGrade });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add grade item', error: err.message });
  }
});

// DELETE grade item (admin only)
router.delete('/grade/:gradeId/item/:itemId', requireAdmin, async (req, res) => {
  try {
    const courseGrade = await CourseGrade.findById(req.params.gradeId);
    if (!courseGrade) return res.status(404).json({ message: 'Grade not found' });

    courseGrade.gradeItems = courseGrade.gradeItems.filter(
      item => item._id.toString() !== req.params.itemId
    );
    
    await courseGrade.save();
    res.json({ message: 'Grade item deleted', grade: courseGrade });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete grade item' });
  }
});

// DELETE all grades for a student in a course (admin only)
router.delete('/course/:courseId/student/:studentId', requireAdmin, async (req, res) => {
  try {
    await CourseGrade.findOneAndDelete({
      courseId: req.params.courseId,
      studentId: req.params.studentId
    });
    res.json({ message: 'Grade deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete grade' });
  }
});

export default router;
