/**
 * One-shot: archive current live data as Junior Marketeer (Round 1),
 * wipe students + curriculum, start Double Shot (Round 2).
 * Admins are kept.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const Archive = require('../schemas/Archive');
const Round = require('../schemas/Round');
const User = require('../schemas/User');
const Lesson = require('../schemas/Lesson');
const Quiz = require('../schemas/Test');
const Assignment = require('../schemas/Assignment');
const Feedback = require('../schemas/Feedback');

const ARCHIVE_NAME = process.env.ARCHIVE_NAME || 'Junior Marketeer (Round 1)';
const NEW_ROUND_NAME = process.env.NEW_ROUND_NAME || 'Double Shot (Round 2)';

async function main() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const [users, lessons, quizzes, assignments, feedback] = await Promise.all([
    User.find({}).lean(),
    Lesson.find({}).lean(),
    Quiz.find({}).lean(),
    Assignment.find({}).lean(),
    Feedback.find({}).lean(),
  ]);

  const students = users.filter((u) => !u.admin);
  const admins = users.filter((u) => u.admin);

  console.log('BEFORE', {
    students: students.length,
    admins: admins.length,
    lessons: lessons.length,
    quizzes: quizzes.length,
    assignments: assignments.length,
    feedback: feedback.length,
  });

  const existing = await Archive.findOne({ name: ARCHIVE_NAME });
  if (existing) {
    console.log('Archive already exists:', existing._id.toString(), existing.name);
    console.log('Aborting to avoid double-wipe. Delete that archive first if you intend to re-run.');
    await mongoose.disconnect();
    process.exit(1);
  }

  const archive = await Archive.create({
    name: ARCHIVE_NAME,
    note: 'Rebrand: archived JM round, started Double Shot fresh',
    summary: {
      studentCount: students.length,
      adminCount: admins.length,
      lessonCount: lessons.length,
      quizCount: quizzes.length,
      assignmentCount: assignments.length,
      feedbackCount: feedback.length,
    },
    data: { users, lessons, quizzes, assignments, feedback },
  });

  console.log('ARCHIVED', {
    _id: archive._id.toString(),
    name: archive.name,
    archivedAt: archive.archivedAt,
    summary: archive.summary,
  });

  await Round.updateMany(
    { status: 'active' },
    { $set: { status: 'archived', archivedAt: new Date() } }
  );

  await Promise.all([
    User.deleteMany({ admin: { $ne: true } }),
    Lesson.deleteMany({}),
    Quiz.deleteMany({}),
    Assignment.deleteMany({}),
    Feedback.deleteMany({}),
  ]);

  await User.updateMany(
    { admin: true },
    { $set: { score: 0, completedTests: [], completedAssignments: [] } }
  );

  const newRound = await Round.create({
    name: NEW_ROUND_NAME,
    status: 'active',
    startedAt: new Date(),
  });

  const after = {
    students: await User.countDocuments({ admin: { $ne: true } }),
    admins: await User.countDocuments({ admin: true }),
    lessons: await Lesson.countDocuments(),
    quizzes: await Quiz.countDocuments(),
    assignments: await Assignment.countDocuments(),
    feedback: await Feedback.countDocuments(),
    archives: await Archive.countDocuments(),
    activeRound: newRound.name,
    keptAdmins: (await User.find({ admin: true }, 'username displayName').lean())
      .map((a) => `${a.displayName} (${a.username})`),
  };

  console.log('AFTER', after);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error('FAILED:', err.message || err);
  try { await mongoose.disconnect(); } catch (_) {}
  process.exit(1);
});
