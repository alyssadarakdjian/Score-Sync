import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CourseGrade from './models/CourseGrade.js';

dotenv.config();

async function recalculateAllGrades() {
  try {
    // Connect to the admin database
    const mongoUri = process.env.MONGO_URI_ADMIN || process.env.MONGO_URI;
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Fetch all course grades
    const allGrades = await CourseGrade.find({});
    console.log(`📊 Found ${allGrades.length} grade records to recalculate`);

    let updated = 0;
    for (const gradeRecord of allGrades) {
      if (gradeRecord.gradeItems && gradeRecord.gradeItems.length > 0) {
        // Recalculate using the new method
        gradeRecord.calculateOverallGrade();
        await gradeRecord.save();
        updated++;
        console.log(`✅ Updated grade for student ${gradeRecord.studentId}: ${gradeRecord.overallGrade}%`);
      }
    }

    console.log(`\n✅ Successfully recalculated ${updated} grade records`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error recalculating grades:', error);
    process.exit(1);
  }
}

recalculateAllGrades();
