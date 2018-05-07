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

// CONNECTING 'QUOTING_DOJO' SCHEMA
mongoose.connect('mongodb://localhost/quoting_dojo;)');
const quoteSchema = new mongoose.Schema({
    name: {type: String, require: true, minlength: 2},
    quote: {type: String, required: true, minlength: 5, maxlength: 255},
}, {timestamps: true });

// CONNECTING 'QUOTE' COLLECTION
mongoose.model('quotes', quoteSchema);
const Quote = mongoose.model('quotes');

// USER-FACING GET ROUTES
app.get('/', function(req, res){
    res.render('index');
});

app.get('/quotes', function(req, res){
    Quote.find({}, function(err, quotes){
        if(err){
            console.log(err)
        }
        res.render('quotes', {quotes: quotes});
    }).sort({createdAt: -1})
});

// POST ROUTES
app.post('/add_quote', function(req, res){
    console.log("FORM INFO SENT:", req.body);
    Quote.create(req.body, function(err, result){
        if(err){
            console.log(err);
            for(var x in err.errors){
                req.flash('add_quote', err.errors[x].message);
            }
            res.redirect('/');
        }else{
            console.log("RESULT:", result);
            res.redirect('/quotes');    
        }
    })
});

// RUN SERVER
server.listen(9876, function(){
    console.log("Server running on port 9876.");
});