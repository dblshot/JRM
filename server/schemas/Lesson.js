const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    label: { type: String, required: true },
    url: { type: String, required: true },
}, { _id: false });

const lessonSchema = new mongoose.Schema({
    title : { type: String, required: true },
    videoLink : { type: String},
    slidesLink : { type: String },
    links: { type: [linkSchema], default: [] },
    notes: {
        type: String,
        default: '',
    },
});

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
