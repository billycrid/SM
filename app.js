var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var friends = require('./routes/API/friends');
var user = require('./routes/API/user');
var tags = require('./routes/API/tags');
var register = require('./routes/API/register');
var notification = require('./routes/API/notification');
var session = require('express-session');
var device = require('express-device');
var app = express();
var db = require('mysql');

var mainjs = require('./routes/JS/serverside');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(favicon(__dirname + '/public/imgs/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(device.capture());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: 'keyboard cat'
}));

var connection =  db.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password: '',
    database: 'main_db'
});
connection.connect();

var html_dir = './routes/Content/';

app.get('/', function(req, res) {
    if (req.session.username) {
        res.redirect('/dashboard');
    } else {
        res.sendfile(html_dir + 'index.html');
    }
});

app.get('/dashboard', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'dashboard.html', req);
    } else {
        res.redirect('/login');
    }
});

app.get('/messages', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'messages.html', req);
    } else {
        res.redirect('/login');
    }
});

app.get('/contacts', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'contacts.html', req);
    } else {
        res.redirect('/login');
    }
});

app.get('/events', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'events.html', req);
    } else {
        res.redirect('/login');
    }
});

app.get('/videos', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'videos.html', req);
    } else {
        res.redirect('/login');
    }
});

app.get('/profile', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'profile.html', req);
    } else {
        res.redirect('/login');
    }
});

app.get('/editprofile', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'editprofile.html', req);
    } else {
        res.redirect('/login');
    }
});

app.get('/settings', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'settings.html', req);
    } else {
        res.redirect('/login');
    }
});

app.get('/logout', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'logout.html', req);
    } else {
        res.redirect('/login');
    }
});

app.get('/images', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'images.html', req);
    } else {
        res.redirect('/login');
    }
});

app.get('/dashboard/', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'dashboard.html', req);
    } else {
        res.redirect('/login');
    }
});

app.get('/profile/:username', function(req, res) {
    var username = req.param("username");
        if (req.session.username && req.session.username == username) {
            res.sendfile(html_dir + 'profile.html');
        } else {
            var doesExist = doesUsernameExist(username, function(queryResult){
                if (queryResult){
                    var isUserAFriend = areTheyFriends(req, username, function(queryResults2){

                        if(queryResults2){
                            res.sendfile(html_dir + 'friend.html');
                        } else {
                            if (req.session.username) {
                                res.sendfile(html_dir + 'notfriend.html');
                            } else {
                                res.sendfile(html_dir + 'friendbutnologin.html');
                            }
                        }
                    });
                } else {
                    res.redirect('/');
                }
            });
        }
});

app.get('/login/', function(req, res) {
    if (req.session.username) {
        res.redirect('/dashboard');
    } else {
        res.sendfile(html_dir + 'login.html');
    }
});

app.get('/logout/', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'logout.html');
    } else {
        res.redirect('/');
    }
});

app.get('/signup/', function(req, res) {
    if (req.session.username) {
        res.redirect('/dashboard');
    } else {
        res.sendfile(html_dir + 'signup.html');
    }
});

app.get('/login', function(req, res) {
    if (req.session.username) {
        res.redirect('/dashboard');
    } else {
        res.sendfile(html_dir + 'login.html');
    }
});

app.get('/logout', function(req, res) {
    if (req.session.username) {
        res.sendfile(html_dir + 'logout.html');
    } else {
        res.redirect('/');
    }
});

app.get('/signup', function(req, res) {
    if (req.session.username) {
        res.redirect('/dashboard');
    } else {
        res.sendfile(html_dir + 'signup.html');
    }
});


app.use('/API/user', user);
app.use('/API/tags', tags);
app.use('/API/friends', friends);
app.use('/API/notification', notification);
app.use('/API/register', register);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    if(err.status = 404){
        res.status(404).send("404 error oops")
        console.log("Someone accessed an invalid endpoint");
    }
});


function doesUsernameExist(usercheck, callback) {
    var checkUserName = "SELECT * FROM `users` WHERE `email` = '" + usercheck + "' or `username` = '" + usercheck + "' or `user_id` = '" + usercheck + "';",
        resReturn = false;

        connection.query(checkUserName, function(err, rows) {
            if (err) {
                console.log("Error: "+err);
                resReturn = false;
            } else {
                resReturn = rows.length;
            }
            callback(resReturn);
        });

}


function areTheyFriends(req, usercheck, callback){
    var currentUserID = req.session.user_id;
    var checkAreTheyFriends = "SELECT * FROM `friends` WHERE (`user_id_1` = '" + currentUserID + "' OR `user_id_2` = '" + currentUserID + "') AND `status` = 'ACTIVE'";
    var getusercheckid = "SELECT * FROM `users` WHERE username = '"+usercheck+"';",
        resReturn = false;

    connection.query(getusercheckid, function(err, rows) {
        if (err) {
            console.log("Error: "+err);
            resReturn = false;
        } else {
            if(rows.length > 0) {
                connection.query(checkAreTheyFriends, function(err, rows1) {
                    if (err) {
                        console.log("Error: "+err);
                        resReturn = false;
                    } else {
                            var friends = [];
                            for (var i = 0; i < rows1.length; i++) {
                                if (rows1[i].user_id_1 != currentUserID) {
                                    friends.push(rows1[i].user_id_1);
                                }
                                if (rows1[i].user_id_2 != currentUserID) {
                                    friends.push(rows1[i].user_id_2);
                                }
                            }

                            if (friends.indexOf(rows[0].user_id) > -1) {
                                resReturn = true;
                            } else {
                                resReturn = false;
                            }

                            callback(resReturn);
                        }
                });
            } else {
                res.status(400).send("Error, user not found");
            }
        }
    });




}

module.exports = app;
