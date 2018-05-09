const express = require('express');
const app = express();
const server = require('http').createServer(app);
const bodyParser = require('body-parser');
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
require('./server/config/mongoose');

// ROUTES
require('./server/config/routes.js')(app);

// RUN SERVER
server.listen(4567, function(){
    console.log("Server running on port 4567.");
});