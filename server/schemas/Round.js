const mongoose = require('mongoose');

const roundSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  startedAt: { type: Date, default: Date.now },
  archivedAt: { type: Date },
});

const Round = mongoose.model('Round', roundSchema);

module.exports = Round;
