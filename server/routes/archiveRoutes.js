const express = require('express');
const router = express.Router();
const Archive = require('../schemas/Archive');
const Round = require('../schemas/Round');
const User = require('../schemas/User');
const Lesson = require('../schemas/Lesson');
const Quiz = require('../schemas/Test');
const Assignment = require('../schemas/Assignment');
const Feedback = require('../schemas/Feedback');

// List archives (summary only — no full data blob)
router.get('/', async (req, res) => {
  try {
    const archives = await Archive.find({}, 'name archivedAt note summary')
      .sort({ archivedAt: -1 });
    res.json(archives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get active round info
router.get('/round/active', async (req, res) => {
  try {
    let round = await Round.findOne({ status: 'active' }).sort({ startedAt: -1 });
    if (!round) {
      round = await Round.create({ name: 'Double Shot (Round 2)', status: 'active' });
    }
    res.json(round);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one archive with full snapshot data
router.get('/:id', async (req, res) => {
  try {
    const archive = await Archive.findById(req.params.id);
    if (!archive) return res.status(404).json({ error: 'Archive not found' });
    res.json(archive);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Snapshot the current live round into an Archive, then wipe live
 * student/curriculum/feedback data so a fresh round can start.
 * Admins are kept. Body: { archiveName, newRoundName, note? }
 */
router.post('/archive-and-reset', async (req, res) => {
  const archiveName = (req.body.archiveName || '').trim() || 'Junior Marketeer (Round 1)';
  const newRoundName = (req.body.newRoundName || '').trim() || 'Double Shot (Round 2)';
  const note = (req.body.note || '').trim();

  try {
    const [users, lessons, quizzes, assignments, feedback] = await Promise.all([
      User.find({}).lean(),
      Lesson.find({}).lean(),
      Quiz.find({}).lean(),
      Assignment.find({}).lean(),
      Feedback.find({}).lean(),
    ]);

    const students = users.filter((u) => !u.admin);
    const admins = users.filter((u) => u.admin);

    const archive = await Archive.create({
      name: archiveName,
      note,
      summary: {
        studentCount: students.length,
        adminCount: admins.length,
        lessonCount: lessons.length,
        quizCount: quizzes.length,
        assignmentCount: assignments.length,
        feedbackCount: feedback.length,
      },
      data: {
        users, // full snapshot including admins as they were
        lessons,
        quizzes,
        assignments,
        feedback,
      },
    });

    // Mark any active round as archived
    await Round.updateMany(
      { status: 'active' },
      { $set: { status: 'archived', archivedAt: new Date() } }
    );

    // Wipe live round data (keep admins)
    await Promise.all([
      User.deleteMany({ admin: { $ne: true } }),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      Assignment.deleteMany({}),
      Feedback.deleteMany({}),
    ]);

    // Zero admin scores / completions so they don't pollute the new round
    await User.updateMany(
      { admin: true },
      { $set: { score: 0, completedTests: [], completedAssignments: [] } }
    );

    const newRound = await Round.create({
      name: newRoundName,
      status: 'active',
      startedAt: new Date(),
    });

    res.status(201).json({
      message: 'Round archived and fresh round started',
      archive: {
        _id: archive._id,
        name: archive.name,
        archivedAt: archive.archivedAt,
        summary: archive.summary,
      },
      newRound,
      keptAdmins: admins.map((a) => ({ username: a.username, displayName: a.displayName })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
