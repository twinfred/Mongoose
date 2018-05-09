const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');

app.set('views', __dirname + '/client/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/client/static'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(flash());
app.use(session({
    secret: 'timssupersecretawesomekeyisalmostasawesomeasheis',
    resave: false,
    saveUninitialized: true,
}))

// MONGOD DATABASE
mongoose.connect('mongodb://localhost/dojo_secrets');

var commentSchema = new mongoose.Schema({
    content: {type: String, required: [true, "Your secret can't be blank."]},
}, {timestamps: true});

var secretSchema = new mongoose.Schema({
    content: {type: String, required: [true, "Your secret can't be blank."]},
    comments: [commentSchema],
}, {timestamps: true});

var userSchema = new mongoose.Schema({
    email: {type: String, required: [true, "An email is required."]},
    first_name: {type: String, required: [true, "A first name is required."], minlength: [2, "Your first name is too short."]},
    last_name: {type: String, required: [true, "A last name is required."], minlength: [2, "Your last name is too short."]},
    birthday: {type: String, required: [true, "A birthday is required."]},
    password: String,
    secrets: [secretSchema],
    comments: [commentSchema],
}, {timestamps: true});

const Comment = mongoose.model('comments', secretSchema);
const Secret = mongoose.model('secrets', secretSchema);
const User = mongoose.model('users', userSchema);

// ROUTES
require('./server/config/routes.js')(app);

// RUN SERVER
server.listen(4567, function(){
    console.log("Server running on port 4567.");
});