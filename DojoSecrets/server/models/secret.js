const mongoose = require('mongoose');
const commentSchema = require('./comment');

module.exports = new mongoose.Schema({
    content: {type: String, required: [true, "Your secret can't be blank."]},
    comments: [commentSchema],
}, {timestamps: true});

const Secret = mongoose.model('secrets', module.exports);