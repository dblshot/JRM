const express = require('express');
const router = express.Router();
const Lesson = require('../schemas/Lesson');

// Route 1: Create a new lesson
router.post('/', async (req, res) => {
  const { title, videoLink, slidesLink, links, notes } = req.body;
  if (!title || (!videoLink && !slidesLink && (!links || links.length === 0))) {
    return res.status(400).json({ message: 'Title is required, and at least one of video link, slides link, or a custom link must be provided.' });
  }
  try {
    const lesson = new Lesson({ title, videoLink, slidesLink, links, notes });
    await lesson.save();
    res.status(201).json({ message: 'Lesson created successfully', lesson });
  } catch (err) {
    res.status(500).json({ message: 'Error creating lesson', error: err.message });
  }
});


// Route 2: Get all lessons
router.get('/', async (req, res) => {
  try {
    const lessons = await Lesson.find({}, 'title videoLink slidesLink links notes _id');
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching lessons', error: err.message });
  }
});

// Route 3: Delete a lesson by ID
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const lesson = await Lesson.findByIdAndDelete(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    res.json({ message: 'Lesson deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting lesson', error: err.message });
  }
});

// Route 4: Update a lesson by ID
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, videoLink, slidesLink, links, notes } = req.body;
  
  try {
    const lesson = await Lesson.findById(id);
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Update only the fields that are provided
    if (title) lesson.title = title;
    if (videoLink !== undefined) lesson.videoLink = videoLink;
    if (slidesLink !== undefined) lesson.slidesLink = slidesLink;
    if (links !== undefined) lesson.links = links;
    if (notes !== undefined) lesson.notes = notes;

    await lesson.save();
    res.json({ message: 'Lesson updated successfully', lesson });
  } catch (err) {
    res.status(500).json({ message: 'Error updating lesson', error: err.message });
  }
});

module.exports = router;
