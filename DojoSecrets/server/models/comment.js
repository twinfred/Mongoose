const mongoose = require('mongoose');

module.exports = new mongoose.Schema({
    content: {type: String, required: [true, "Your comment can't be blank."]},
}, {timestamps: true});

const Comment = mongoose.model('comments', module.exports);