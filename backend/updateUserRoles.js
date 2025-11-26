import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function updateUserRoles() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Update all users except luteach@test.com to have role 'student'
    const result = await User.updateMany(
      { 
        email: { $ne: 'luteach@test.com' },
        $or: [
          { role: { $exists: false } },
          { role: null },
          { role: '' }
        ]
      },
      { 
        $set: { role: 'student' } 
      }
    );

    console.log(`✅ Updated ${result.modifiedCount} users to role 'student'`);

    // Show all users with their roles
    const allUsers = await User.find({}, 'email role fullname').sort({ email: 1 });
    console.log('\n📋 All users and their roles:');
    allUsers.forEach(user => {
      console.log(`  - ${user.email}: ${user.role || 'NO ROLE'} (${user.fullname || 'No name'})`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

updateUserRoles();
