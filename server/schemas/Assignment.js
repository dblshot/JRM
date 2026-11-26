const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    label: { type: String, required: true },
    url: { type: String, required: true },
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    points: { type: Number, required: true },
    lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
    imageUrl: { type: String },
    links: { type: [linkSchema], default: [] },
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
