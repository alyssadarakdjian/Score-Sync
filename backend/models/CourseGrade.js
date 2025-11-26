import mongoose from 'mongoose';

// Optional separate connection for admin DB if MONGO_URI_ADMIN provided.
// Falls back to default mongoose connection.
let adminConnection = mongoose;
if (process.env.MONGO_URI_ADMIN) {
  try {
    adminConnection = mongoose.createConnection(process.env.MONGO_URI_ADMIN);
    adminConnection.on('connected', () => console.log('✅ Admin Mongo connection established (CourseGrade)'));
  } catch (err) {
    console.warn('⚠️ Failed to create separate admin connection, using default:', err.message);
    adminConnection = mongoose;
  }
}

const gradeItemSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Assignment/Test name
  grade: { type: Number, required: true }, // Numeric grade (0-100)
  maxGrade: { type: Number, default: 100 }, // Maximum possible grade
  weight: { type: Number, default: 1 }, // Weight for average calculation
  date: { type: Date, default: Date.now },
  notes: { type: String }
});

const courseGradeSchema = new mongoose.Schema(
  {
    courseId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'AdminCourse', 
      required: true 
    },
    studentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    gradeItems: [gradeItemSchema],
    overallGrade: { type: Number }, // Calculated average
    letterGrade: { type: String }, // A, B, C, D, F
    comments: { type: String }
  },
  { 
    timestamps: true, 
    collection: 'coursegrades' 
  }
);

// Method to calculate overall grade
courseGradeSchema.methods.calculateOverallGrade = function() {
  if (!this.gradeItems || this.gradeItems.length === 0) {
    this.overallGrade = null;
    this.letterGrade = null;
    return;
  }

  // Calculate total points earned and total points possible
  let totalPointsEarned = 0;
  let totalPointsPossible = 0;

  this.gradeItems.forEach(item => {
    totalPointsEarned += item.grade;
    totalPointsPossible += item.maxGrade;
  });

  // Calculate percentage: (total earned / total possible) * 100
  this.overallGrade = totalPointsPossible > 0 
    ? Math.round((totalPointsEarned / totalPointsPossible) * 10000) / 100 
    : null;

  // Calculate letter grade
  if (this.overallGrade !== null) {
    if (this.overallGrade >= 90) this.letterGrade = 'A';
    else if (this.overallGrade >= 80) this.letterGrade = 'B';
    else if (this.overallGrade >= 70) this.letterGrade = 'C';
    else if (this.overallGrade >= 60) this.letterGrade = 'D';
    else this.letterGrade = 'F';
  }
};

// Pre-save hook to auto-calculate grades
courseGradeSchema.pre('save', function(next) {
  this.calculateOverallGrade();
  next();
});

// Compound index for efficient lookups
courseGradeSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

// Use existing model if already compiled (for hot reload safety)
export default (adminConnection.models.CourseGrade || adminConnection.model('CourseGrade', courseGradeSchema, 'coursegrades'));
