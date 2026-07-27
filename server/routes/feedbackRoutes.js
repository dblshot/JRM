const express = require('express');
const router = express.Router();
const Feedback = require('../schemas/Feedback');

// Submit feedback
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      username,
      displayName,
      courseContentRating,
      favoriteActivity,
      instructorRating,
      mostImportantSkill,
      improvementSuggestion,
      recommendToFriend,
    } = req.body;

    if (!courseContentRating || !favoriteActivity || !instructorRating || !mostImportantSkill) {
      return res.status(400).json({ error: 'Required feedback fields are missing' });
    }

    // One submission per user (if logged in)
    if (userId) {
      const existing = await Feedback.findOne({ userId });
      if (existing) {
        return res.status(400).json({ error: 'You have already submitted feedback' });
      }
    }

    const feedback = new Feedback({
      userId,
      username,
      displayName,
      courseContentRating,
      favoriteActivity,
      instructorRating,
      mostImportantSkill,
      improvementSuggestion: improvementSuggestion || '',
      recommendToFriend: recommendToFriend || '',
    });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all feedback (admin)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}).sort({ submittedAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check if a user already submitted
router.get('/status/:userId', async (req, res) => {
  try {
    const existing = await Feedback.findOne({ userId: req.params.userId });
    res.json({ submitted: !!existing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
