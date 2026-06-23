const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  choices: [String],
  correctAnswer: { type: Number, required: true }, // index of correct choice
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  basePoints: { type: Number, default: 5 },
});

const quizSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  questions: [questionSchema],
  timeLimit: { type: Number, default: 120 }, // in seconds
});

const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;
