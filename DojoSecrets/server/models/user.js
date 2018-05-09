const mongoose = require('mongoose');
const commentSchema = require('./comment');
const secretSchema = require('./secret');

module.exports = new mongoose.Schema({
    email: {type: String, required: [true, "An email is required."]},
    first_name: {type: String, required: [true, "A first name is required."], minlength: [2, "Your first name is too short."]},
    last_name: {type: String, required: [true, "A last name is required."], minlength: [2, "Your last name is too short."]},
    birthday: {type: String, required: [true, "A birthday is required."]},
    password: String,
    secrets: [secretSchema],
    comments: [commentSchema],
}, {timestamps: true});

const User = mongoose.model('users', module.exports);