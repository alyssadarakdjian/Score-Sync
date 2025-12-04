import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

// Load environment variables from .env file (e.g., MONGO_URI)
dotenv.config();

async function updateUserRoles() {
  try {
    // Connect to MongoDB using the connection string in the environment variables
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Update all users EXCEPT the teacher account (luteach@test.com)
    // Only update users whose role is missing, null, or an empty string
    const result = await User.updateMany(
      { 
        email: { $ne: 'luteach@test.com' }, // exclude the teacher user
        $or: [
          { role: { $exists: false } },     // role field does not exist
          { role: null },                   // role is null
          { role: '' }                      // role is an empty string
        ]
      },
      { 
        $set: { role: 'student' }           // set their role to "student"
      }
    );

    // Log how many user documents were modified
    console.log(`✅ Updated ${result.modifiedCount} users to role 'student'`);

    // Retrieve all users and show their email, role, and fullname
    const allUsers = await User.find({}, 'email role fullname').sort({ email: 1 });
    console.log('\n📋 All users and their roles:');

    // Loop through and print each user in a clean readable format
    allUsers.forEach(user => {
      console.log(`  - ${user.email}: ${user.role || 'NO ROLE'} (${user.fullname || 'No name'})`);
    });

    // Disconnect from MongoDB once finished
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  } catch (error) {
    // Print any errors that occur and exit the script
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the function when the script is executed
updateUserRoles();
