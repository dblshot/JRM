const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  username: { type: String },
  displayName: { type: String },
  courseContentRating: { type: Number, required: true, min: 1, max: 5 },
  favoriteActivity: {
    type: String,
    required: true,
    enum: [
      'Team Challenges',
      'Marketing Games',
      'Group Project (Agency Challenge)',
      'Class Discussions',
      'Presentations',
    ],
  },
  instructorRating: { type: Number, required: true, min: 1, max: 5 },
  mostImportantSkill: {
    type: String,
    required: true,
    enum: [
      'Teamwork',
      'Creativity',
      'Public Speaking & Presentation',
      'Marketing Knowledge',
      'Leadership',
      'Problem Solving',
      'Confidence',
    ],
  },
  improvementSuggestion: { type: String, default: '' },
  recommendToFriend: {
    type: String,
    enum: ['Definitely Yes', 'Maybe', 'Not Sure', 'No', ''],
    default: '',
  },
  submittedAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model('Feedback', feedbackSchema);

module.exports = Feedback;
