const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
  name: { type: String, required: true },
  archivedAt: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  summary: {
    studentCount: { type: Number, default: 0 },
    adminCount: { type: Number, default: 0 },
    lessonCount: { type: Number, default: 0 },
    quizCount: { type: Number, default: 0 },
    assignmentCount: { type: Number, default: 0 },
    feedbackCount: { type: Number, default: 0 },
  },
  data: {
    users: { type: Array, default: [] },
    lessons: { type: Array, default: [] },
    quizzes: { type: Array, default: [] },
    assignments: { type: Array, default: [] },
    feedback: { type: Array, default: [] },
  },
});

const Archive = mongoose.model('Archive', archiveSchema);

module.exports = Archive;
