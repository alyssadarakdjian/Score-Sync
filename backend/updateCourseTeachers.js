import mongoose from 'mongoose';
import dotenv from 'dotenv';
import AdminCourse from './models/AdminCourse.js';
import User from './models/User.js';

dotenv.config();

async function updateCourseTeachers() {
  try {
    // Connect to both databases
    const mongoUri = process.env.MONGO_URI_ADMIN || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Find the admin teacher (luteach@test.com)
    const teacher = await User.findOne({ email: 'luteach@test.com' });
    
    if (!teacher) {
      console.log('❌ Teacher not found');
      process.exit(1);
    }

    console.log(`👨‍🏫 Found teacher: ${teacher.fullname} (${teacher.email})`);

    // Update all courses that don't have teacher info or need updating
    const result = await AdminCourse.updateMany(
      {}, // Update all courses
      {
        $set: {
          teacher_name: teacher.fullname,
          teacher_email: teacher.email
        }
      }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} courses with teacher information`);
    
    // Show updated courses
    const courses = await AdminCourse.find({});
    console.log('\n📚 Updated courses:');
    courses.forEach(course => {
      console.log(`  - ${course.course_code}: ${course.course_name} (Teacher: ${course.teacher_name})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating courses:', error);
    process.exit(1);
  }
}

updateCourseTeachers();
