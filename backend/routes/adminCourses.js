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

// GET all courses (admins see all, students see only their enrolled courses)
router.get('/', async (req, res) => {
  try {
    const userEmail = req.header('x-user-email');
    
    // If no email header, return all courses (public view)
    if (!userEmail) {
      const courses = await AdminCourse.find().sort({ createdAt: -1 });
      return res.json({ courses });
    }

    // Check if user is admin or student
    const user = await User.findOne({ email: userEmail });
    
    if (!user) {
      const courses = await AdminCourse.find().sort({ createdAt: -1 });
      return res.json({ courses });
    }

    // Admins see all courses
    if (user.role === 'admin') {
      const courses = await AdminCourse.find().sort({ createdAt: -1 });
      return res.json({ courses });
    }

    // Students only see courses they're enrolled in
    const courses = await AdminCourse.find({ students: user._id }).sort({ createdAt: -1 });
    res.json({ courses });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
});

// CREATE (admin only)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const email = req.header('x-user-email');
    const adminUser = await User.findOne({ email });
    
    // Auto-populate teacher name and email from the admin who created the course
    const courseData = {
      ...req.body,
      teacher_name: adminUser?.fullname || req.body.teacher_name,
      teacher_email: adminUser?.email || req.body.teacher_email
    };
    
    const course = new AdminCourse(courseData);
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

// GET single course by ID (public)
router.get('/:id', async (req, res) => {
  try {
    const course = await AdminCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ course });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch course' });
  }
});

// GET enrolled students for a course (public)
router.get('/:id/students', async (req, res) => {
  try {
    const course = await AdminCourse.findById(req.params.id).populate('students', 'fullname email studentId');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ students: course.students || [] });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
});

// ADD student to course by email (admin only)
router.post('/:id/students', requireAdmin, async (req, res) => {
  try {
    const { studentEmail } = req.body;
    if (!studentEmail) return res.status(400).json({ message: 'Student email required' });

    const student = await User.findOne({ email: studentEmail, role: 'student' });
    if (!student) return res.status(404).json({ message: 'Student not found or not a student account' });

    const course = await AdminCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (course.students.includes(student._id)) {
      return res.status(400).json({ message: 'Student already enrolled' });
    }

    course.students.push(student._id);
    await course.save();
    
    const updatedCourse = await AdminCourse.findById(req.params.id).populate('students', 'name email student_id');
    res.json({ message: 'Student added', students: updatedCourse.students });
  } catch (err) {
    res.status(500).json({ message: 'Failed to add student' });
  }
});

// REMOVE student from course (admin only)
router.delete('/:id/students/:studentId', requireAdmin, async (req, res) => {
  try {
    const course = await AdminCourse.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.students = course.students.filter(s => s.toString() !== req.params.studentId);
    await course.save();

    const updatedCourse = await AdminCourse.findById(req.params.id).populate('students', 'fullname email studentId');
    res.json({ message: 'Student removed', students: updatedCourse.students });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove student' });
  }
});

export default router;
