const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    points: { type: Number, required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    imageUrl: { type: String }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
