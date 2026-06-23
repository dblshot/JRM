const mongoose = require('mongoose');

const completedTestSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  score: { type: Number, required: true },
  userAnswers: [{
    questionIndex: { type: Number, required: true },
    selectedAnswer: { type: Number, required: true }
  }],
  timeTaken: { type: Number },
  timeBonusApplied: { type: Boolean }
});

const completedAssignmentSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  uploadedAt: { type: Date, default: Date.now },
  fileUrl: { type: String, required: true },
  graded: { type: Boolean, default: false },
  grade: { type: Number },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  password: { type: String, required: true },
  score: { type: Number, default: 0 },
  admin: { type: Boolean, default: false },
  completedTests: [completedTestSchema],
  completedAssignments: [completedAssignmentSchema]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
