const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title : { type: String, required: true },
    videoLink : { type: String},
    slidesLink : { type: String },
    notes: {
        type: String,
        default: '',
    },
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
