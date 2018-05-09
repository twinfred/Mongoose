const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('express-flash');
const mongoose = require('mongoose');
// VALIDATOR
const expressValidator = require('express-validator');
const validatorOptions = {};
const util = require('util');
// BCRYPT
const bcrypt = require('bcrypt');
const saltRounds = 10;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressValidator(validatorOptions));
app.use(session({
    secret: 'timssupersecretawesomekeyisalmostasawesomeasheis',
    resave: false,
    saveUninitialized: true,
}))
app.use(flash());

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

// LOGIN / REG PAGE
app.get('/', (req, res)=>{
    if(!req.session.user_id){
        res.render('index');
    }else{
        res.redirect('/home');
    }
});

// REGISTRATION
app.post('/register',(req, res)=>{
    console.log("FORM INPUT", req.body);
    // PASSWORD MATCH VALIDATION
    if(req.body.password !== req.body.passwordConf || !req.body.password){
        console.log("password error")
        req.flash('error', "Either your passwords don't match or you didn't input a password.");
        return res.redirect('/');
    }else if(req.body.password.length < 6){
        req.flash('error', "Your password needs to be at least 6 characters long.");
        return res.redirect('/');
    }else{
        console.log("passwords good to go")
        User.findOne({email: req.body.email}, (err, user)=>{
            // UNIQUE EMAIL VALIDATION
            if(user){
                console.log("user already exists")
                req.flash('error', 'Email already exists.');
                return res.redirect('/');
            }else{
                console.log("attempting to create new user")
                var newUser = new User();
                var emailRegEx = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
                if(!emailRegEx.test(req.body.email)){
                    req.flash('error', 'The email you entered is not the correct format.');
                    return res.redirect('/');
                }else{
                    newUser.email = req.body.email;
                }
                newUser.first_name = req.body.first_name;
                newUser.last_name = req.body.last_name;
                newUser.birthday = req.body.birthday;
                console.log("attempting to hash pw")
                bcrypt.hash(req.body.password, saltRounds, (err, hashedPW)=>{
                    if(err){
                        console.log("passwords err found")
                        req.flash('error', 'Something went wrong with your password. Please try again.');
                        return res.redirect('/');
                    }else{
                        console.log("hashed pw created")
                        console.log("HASHED PW:", hashedPW);
                        newUser.password = hashedPW;
                        console.log("attempting to save new user")
                        newUser.save(err=>{
                            if(err){
                                console.log("save err found")
                                if(err.errors.email){
                                    req.flash('error', err.errors.email.properties.message);
                                }
                                if(err.errors.first_name){
                                    req.flash('error', err.errors.first_name.properties.message);
                                }
                                if(err.errors.last_name){
                                    req.flash('error', err.errors.last_name.properties.message);
                                }
                                if(err.errors.birthday){
                                    req.flash('error', err.errors.birthday.properties.message);
                                }
                                return res.redirect('/');
                            }else{
                                console.log("new user created")
                                req.session.user_id = newUser._id;
                                return res.redirect('/home');
                            }
                        })
                    }
                })
            }
        })
    }
});

// LOGIN
app.post('/login', (req, res)=>{
    console.log(req.body);
    User.findOne({email: req.body.email}, (err, user)=>{
        if(user){
            bcrypt.compare(req.body.password, user.password, (err, result)=>{
                if(!result){
                    req.flash('error', "Incorrect email or password.");
                    return res.redirect('/');
                }else{
                    req.session.user_id = user._id;
                    return res.redirect('/home');
                }
            })
        }else{
            req.flash('error', "Incorrect email or password.");
            return res.redirect('/');
        }
    })
});

// HOMEPAGE
app.get('/home', (req, res)=>{
    if(!req.session.user_id){
        res.redirect('/');
    }else{
        var context = {}
        User.findOne({_id: req.session.user_id}, (err, user)=>{
            context.user = user;
            Secret.find({}, (err, secrets)=>{
                context.secrets = secrets;
                res.render('home', context);
            }).sort('-createdAt')
        })
    }
});

// ADD SECRET
app.post('/add_secret', (req, res)=>{
    console.log(req.body);
    Secret.create(req.body, (err, secret)=>{
        console.log("ERROR", err);
        console.log("SECRET", secret);
        if(err){
            for(var x in err.errors){
                req.flash('error', err.errors[x].message);
                return res.redirect('/home');
            }
        }else{
            console.log("Adding comment to user.");
            User.update({_id: req.session.user_id}, {$push: {secrets: secret}},(err, user)=>{
                if(err){
                    for(var x in err.errors){
                        req.flash('error', err.errors[x].message);
                        return res.redirect('/home');
                    }
                }else{
                    return res.redirect('/home');
                }
            })
        }
    }) 
});

// SECRET PROFILE
app.get('/secret/:secret_id', (req, res)=>{
    console.log(req.params.secret_id);
    if(!req.session.user_id){
        res.redirect('/');
    }else{
        Secret.findOne({_id: req.params.secret_id}, (err, secret)=>{
            console.log("ERROR", err)
            if(err){
                req.flash('error', "This secret no longer exist.");
                return res.redirect('/home');
            }else{
                var context = {secret: secret};
                console.log(context);
                return res.render('secret_profile', context);
            }
        })
    }
});

// ADD COMMENT TO SECRET
app.post('/add_comment/:secret_id', (req, res)=>{
    console.log(req.body);
    Comment.create(req.body, (err, comment)=>{
        if(err){
            for(var x in err.errors){
                req.flash('error', err.errors[x].message);
                return res.redirect('/secret/'+req.params.secret_id);
            }
        }else{
            Secret.update({_id: req.params.secret_id}, {$push: {comments: comment}}, (err, secret)=>{
                if(err){
                    for(var x in err.errors){
                        req.flash('error', err.errors[x].message);
                        return res.redirect('/secret/'+req.params.secret_id);
                    }
                }else{
                    User.update({_id: req.session.user_id}, {$push: {comments: comment}}, (req, res)=>{
                        if(err){
                            for(var x in err.errors){
                                req.flash('error', err.errors[x].message);
                                return res.redirect('/secret/'+req.params.secret_id);
                            }
                        }else{
                            return res.redirect('/secret/'+req.params.secret_id);
                        }
                    })
                }
            })
        }
    })
});

// DELETE SECRET
app.get('/secret/:secret_id/delete', (req, res)=>{
    console.log("Attempting to delete secret.");
    Secret.findOne({_id: req.params.secret_id}, (err,secret)=>{
        if(err){
            for(var x in err.errors){
                req.flash('error', err.errors[x].message);
                return res.redirect('/secret/'+req.params.secret_id);
            }
        }else{
            User.update({_id: req.session.user_id}, {$pull: {secrets: secret}}, (err, user)=>{
                if(err){
                    for(var x in err.errors){
                        req.flash('error', err.errors[x].message);
                        return res.redirect('/secret/'+req.params.secret_id);
                    }
                }else{
                    Secret.remove({_id: req.params.secret_id}, (err)=>{
                        console.log("secret fully deleted");
                        return res.redirect('/');
                    })
                }
            })
        }
    })
})
// LOGOUT
app.get('/logout', (req, res)=>{
    if(!req.session.user_id){
        res.redirect('/');
    }else{
        req.session.destroy();
        res.redirect('/');
    }
});

// RUN SERVER
server.listen(4567, function(){
    console.log("Server running on port 4567.");
});