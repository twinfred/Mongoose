const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    secret: 'keyboardkitteh',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60000 }
}))
app.use(flash());

// CONNECTING 'MESSAGE_BOARD' SCHEMA
mongoose.connect('mongodb://localhost/message_board;)');
const commentSchema = new mongoose.Schema({
    name: {type: String, required: [true, "A name is required to post a comment."], minlength: [2, "Your name is too short."]},
    comment: {type: String, required: [true, "Comment cannot be blank."], minlength: [5, "Your comment is too short"], maxlength: [280, "Your comment cannot exceed 280 characters."]},
}, {timestamps: true});

const postSchema = new mongoose.Schema({
    name: {type: String, required: [true, "A name is required to post a message."], minlength: [2, "Your name is too short."]},
    message: {type: String, required: [true, "The message cannot be blank."], minlength: [5, "Your message is too short"], maxlength: [280, "Your message cannot exceed 280 characters."]},
    post_comments: [commentSchema],
}, {timestamps: true});

// CONNECTING 'QUOTE' COLLECTION
mongoose.model('post_comments', commentSchema);
const Comment = mongoose.model('post_comments');

mongoose.model('posts', postSchema);
const Post = mongoose.model('posts');

// USER-FACING GET ROUTES
app.get('/', function(req, res){
    Post.find({}, function(err, posts){
        console.log("POSTS:"+posts);
        if(err){
            res.render('index');
        }else{
            Comment.find({}, function(err, post_comments){
                res.render('index', {posts: posts});
            })
        }
    }).sort('-createdAt');
});

// POST ROUTES
app.post('/add_message', function(req, res){
    console.log("POST REQUEST INFO:", req.body);
    Post.create(req.body, function(err, result){
        if(err){
            console.log(err);
            for(var x in err.errors){
                req.flash('add_post', err.errors[x].message);
            }
            res.redirect('/');
        }else{
            console.log("RESULT:", result);
            res.redirect('/');    
        }
    })
});

app.post('/add_comment/:post_id', function(req, res){
    console.log("POST REQUEST INFO:", req.body);
    Comment.create(req.body, function(err, result){
        if(err){
            console.log(err);
            for(var x in err.errors){
                req.flash('add_comment', err.errors[x].message);
            }
        }else{
            console.log("RESULT:", result);
            console.log("POST ID:", req.params.post_id)
            Post.update({_id: req.params.post_id}, {$addToSet: {post_comments: result}}, function(err){
                console.log("ERRORS:", err)
                res.redirect('/');
            });
        }
    })
});

// RUN SERVER
server.listen(9876, function(){
    console.log("Server running on port 9876.");
});