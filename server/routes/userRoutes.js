const express = require('express');
const router = express.Router();
const User = require('../schemas/User');
const jwt = require('jsonwebtoken');

// Route 1: Create a new user
router.post('/register', async (req, res) => {
  const { username, password, displayName , admin } = req.body;
  if (!username || !password || !displayName) {
    return res.status(400).json({ message: 'Username, displayName, and password are required.' });
  }
  try {
    const user = new User({ username, password, displayName, admin });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user: { username, displayName, score: user.score } });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

// Route 2: Get all users and their scores
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'username displayName score password admin completedTests -_id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
});

// Route 3: Login user and return JWT
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  try {
    const user = await User.findOne({ username, password });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, username: user.username, admin: user.admin }, process.env.JWT_SECRET, { expiresIn: '6h' });
    res.json({ token, username: user.username, admin: user.admin, _id: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

// Add completed assignment
router.post('/:userId/complete-assignment', async (req, res) => {
  try {
    const { assignmentId, fileUrl } = req.body;
    if (!assignmentId || !fileUrl) {
      return res.status(400).json({ error: 'assignmentId and fileUrl are required' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $push: { completedAssignments: { assignmentId, fileUrl } } },
      { new: true }
    );
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Assignment marked as completed', completedAssignments: user.completedAssignments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single user by ID (for refreshing localStorage after assignment upload)
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
