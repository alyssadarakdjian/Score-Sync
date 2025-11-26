import mongoose from 'mongoose';

// Optional separate connection for admin DB if MONGO_URI_ADMIN provided.
// Falls back to default mongoose connection.
let adminConnection = mongoose;
if (process.env.MONGO_URI_ADMIN) {
  try {
    adminConnection = mongoose.createConnection(process.env.MONGO_URI_ADMIN);
    adminConnection.on('connected', () => console.log('✅ Admin Mongo connection established'));
  } catch (err) {
    console.warn('⚠️ Failed to create separate admin connection, using default:', err.message);
    adminConnection = mongoose;
  }
}

const adminCourseSchema = new mongoose.Schema(
  {
    course_code: { type: String, required: true },
    course_name: { type: String, required: true },
    description: { type: String },
    teacher_name: { type: String },
    teacher_email: { type: String },
    grade_level: { type: String },
    subject: { type: String },
    credits: { type: Number, default: 1 },
    semester: { type: String },
    academic_year: { type: String },
    room_number: { type: String },
    schedule: { type: String },
    max_students: { type: Number, default: 30 },
    status: { type: String, default: 'active' },
  },
  { timestamps: true, collection: 'courses' }
);

// Use existing model if already compiled (for hot reload safety)
export default (adminConnection.models.AdminCourse || adminConnection.model('AdminCourse', adminCourseSchema, 'courses'));
