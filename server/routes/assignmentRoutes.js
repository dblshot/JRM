const express = require('express');
const router = express.Router();
const Assignment = require('../schemas/Assignment');
const User = require('../schemas/User');

// CREATE Assignment
router.post('/', async (req, res) => {
  try {
    const assignment = new Assignment(req.body);
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ all Assignments
router.get('/', async (req, res) => {
  try {
    const assignments = await Assignment.find().populate('lessonId');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ one Assignment by ID
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('lessonId');
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Assignment by ID
router.put('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE Assignment by ID
router.delete('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all submissions for a specific assignment
router.get('/:id/submissions', async (req, res) => {
  try {
    const users = await User.find({ 'completedAssignments.assignmentId': req.params.id }, 'username displayName completedAssignments');
    const submissions = users.map(user => {
      const submission = user.completedAssignments.find(a => a.assignmentId.toString() === req.params.id);
      return {
        userId: user._id,
        username: user.username,
        displayName: user.displayName,
        ...submission?._doc
      };
    });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Grade a user's assignment submission
router.post('/:assignmentId/grade/:userId', async (req, res) => {
  const { grade } = req.body;
  if (typeof grade !== 'number') {
    return res.status(400).json({ error: 'Grade must be a number' });
  }
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const assignment = user.completedAssignments.find(a => a.assignmentId.toString() === req.params.assignmentId);
    if (!assignment) return res.status(404).json({ error: 'Assignment submission not found' });

    assignment.graded = true;
    assignment.grade = grade;
    user.score += grade;
    await user.save();

    res.json({ message: 'Assignment graded', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
