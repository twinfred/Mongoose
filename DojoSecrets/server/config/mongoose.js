const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/dojo_secrets');
require('./../models/comment');
require('./../models/secret');
require('./../models/user');