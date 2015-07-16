/**
 * Created by billy.j.criddle on 20/02/2015.
 */
var express = require('express');
var router = express.Router();
var db = require('mysql');
var app = express();

var connection =  db.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password: '',
    database: 'main_db'
});
connection.connect();

function compileOutput(status, errormessage, rows){
    var message;
    if(status == "failed"){
        message = '{ "status" : "failed", "error" : "'+errormessage+'" }';
    } else if(status == "success"){
        message = '{ "status" : "success", "message" : "'+errormessage+'"}';
    }
    return JSON.parse(message);
}

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.status(400).send(js.compileOutput("failed", "You cannot perform a GET request against all users."));
});

router.put('/me', function(req, res, next) {
    if(!req.session.username){
        res.status(400).send(compileOutput("failed", "You are not logged in."));
    } else {
        var selectuser = "SELECT * FROM users where username = '" + req.session.username+"';";
        connection.query(selectuser, function (err, rows) {
            if (err) {
                throw err;
            } else {
                var first_name = rows[0].first_name;
                var last_name = rows[0].last_name;
                var home_address_1 = rows[0].home_address_1;
                var home_address_2 = rows[0].home_address_2;
                var home_address_city = rows[0].home_address_city;
                var home_address_postcode = rows[0].home_address_postcode;
                var current_address_1 = rows[0].current_address_1;
                var current_address_2 = rows[0].current_address_2;
                var current_address_city = rows[0].current_address_city;
                var current_address_postcode = rows[0].current_address_postcode;
                var contact_number = rows[0].contact_number;
                var facebookusername = rows[0].facebookusername;
                var twitterusername = rows[0].twitterusername;
                var instagramusername = rows[0].instagramusername;
                var snapchatusername = rows[0].snapchatusername;
                var notifications = rows[0].notifications;
                var user_image = rows[0].user_image;
                if(req.body.first_name){
                    first_name = req.body.first_name;
                }
                if(req.body.last_name){
                    last_name = req.body.last_name;
                }
                if(req.body.home_address_1){
                    home_address_1 = req.body.home_address_1;
                }
                if(req.body.home_address_2){
                    home_address_2 = req.body.home_address_2
                }
                if(req.body.home_address_city){
                    home_address_city = req.body.home_address_city
                }
                if(req.body.home_address_postcode){
                    home_address_postcode = req.body.home_address_postcode;
                }
                if(req.body.current_address_1){
                    current_address_1 = req.body.current_address_1;
                }
                if(req.body.current_address_2){
                    current_address_2 = req.body.current_address_2;
                }
                if(req.body.current_address_city){
                    current_address_city = req.body.current_address_city;
                }
                if(req.body.current_address_postcode){
                    current_address_postcode = req.body.current_address_postcode;
                }
                if(req.body.contact_number){
                    contact_number = req.body.contact_number;
                }
                if(req.body.facebookusername){
                    facebookusername = req.body.facebookusername;
                }
                if(req.body.twitterusername){
                    twitterusername = req.body.twitterusername;
                }
                if(req.body.instagramusername){
                    instagramusername = req.body.instagramusername;
                }
                if(req.body.snapchatusername){
                    snapchatusername = req.body.snapchatusername;
                }
                if(req.body.notifications){
                    notifications = req.body.notifications;
                }
                if(req.body.user_image){
                    user_image = req.body.user_image;
                }
                var upadteUser ="UPDATE `main_db`.`users` SET `first_name` = '"+first_name+"', `last_name` = '"+last_name+"', `home_address_1` = '"+home_address_1+"',`home_address_2` = '"+home_address_2+"', `home_address_city` = '"+home_address_city+"', `home_address_postcode` = '"+home_address_postcode+"', `current_address_1` = '"+current_address_1+"', `current_address_2` = '"+current_address_2+"', `current_address_city` = '"+current_address_city+"', `current_address_postcode` = '"+current_address_postcode+"', `contact_number` = '"+contact_number+"', `facebookusername` = '"+facebookusername+"', `twitterusername` = '"+twitterusername+"', `instagramusername` = '"+instagramusername+"', `snapchatusername` = '"+snapchatusername+"', `notifications` = '"+notifications+"', `user_image` = '"+user_image+"' WHERE `users`.`username` = '"+req.session.username+"'";

                console.log(upadteUser);
                connection.query(upadteUser, function (err, rowssecond) {
                    if (err) {
                        res.status(400).send(compileOutput("failed", "Error in input."));
                        throw err;
                    } else {
                        res.status(200).send(compileOutput("success", "Your information has been updated."));
                    }
                });
            }
        });
    }
});
router.get('/me', function(req, res, next) {
    if(!req.session.username){
        res.status(400).send(compileOutput("failed", "You are not logged in."));
    } else {
        var getCurrentUser = 'SELECT * FROM users where user_id = ' + req.session.user_id+'';

        connection.query(getCurrentUser, function (err, rows) {
            if (err) {
                throw err;
            } else {
                res.send(rows);
                console.log(req.session.user_id + ' called user/me');
            }
        });
    }
});
router.post('/login', function(req, res) {
    if(req.session.username){
        res.status(400).send(compileOutput("failed", "You are already logged in."));
    } else {
        if (!req.body.username || !req.body.password) {
            res.status(400).send(compileOutput("failed", "You have not specified a username/password."));
        } else {
            var username = req.body.username;
            var password = req.body.password;
            var device = req.device.type;
            var random = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
            var userLogin = 'SELECT * FROM `users` where `username` = "' + username + '" AND `password` = "' + password + '"';
            var upadteSession = "INSERT INTO `main_db`.`session` (`token`, `device`) VALUES ('"+random+"', '"+device+"')";
            var updateUser = "UPDATE `main_db`.`users` SET `lastlogin` = CURRENT_TIMESTAMP WHERE `users`.`username` = '"+username+"';";
            var updateUser2 = "UPDATE `main_db`.`users` SET `session_token` = '"+random+"' WHERE `users`.`username` = '"+username+"';";

            connection.query(userLogin, function (err, rows) {
                if (err) {
                    res.status(400).send(compileOutput("failed", "Call failed."));
                } else {
                    if (rows.length) {
                        if (rows[0].active_state == null) {
                            connection.query(upadteSession, function (err, sessionrows) {
                                if (err) {
                                    res.status(400).send(compileOutput("failed", "Session failed to update."));
                                } else {
                                    var upadteSession2 = "UPDATE `main_db`.`session` SET `status` = 'CLOSED' WHERE `session`.`token` = '" + rows[0].session_token + "';";
                                    connection.query(upadteSession2, function (err, sessionrows) {
                                    });
                                    connection.query(updateUser, function (err, sessionrows) {
                                    });
                                    connection.query(updateUser2, function (err, sessionrows) {
                                    });
                                    req.session.device = device;
                                    req.session.username = rows[0].username;
                                    req.session.first_name = rows[0].first_name;
                                    req.session.last_name = rows[0].last_name;
                                    req.session.user_id = rows[0].user_id;
                                    req.session.user_image = rows[0].user_image;

                                    console.log(req.session.username + ' has logged in from: ' + device);


                                    var output = '{ "status" : "success", "items": [] }';
                                    var obj = JSON.parse(output);
                                    obj['items'].push({"user_id": rows[0].user_id, "username": rows[0].username,"first_name": rows[0].first_name, "last_name" : rows[0].last_name, "user_image" : rows[0].user_image, "email" : rows[0].email});
                                    /*output = JSON.stringify(obj);*/

                                    res.status(200).send(obj);
                                }
                            });
                        } else {
                            res.status(200).send(compileOutput("failed", "Your account has not been activated"));
                        }
                    }else {
                        res.status(200).send(compileOutput("failed", "Username or password is incorrect"));
                    }
                }
            });
        }
    }
});
router.get('/logout', function(req, res, next) {
    if (req.session.username) {
        var selectUser = 'SELECT * FROM `users` where `username` = "' + req.session.username + '";';
        connection.query(selectUser, function(err, rows) {
            var upadteSession2 = "UPDATE `main_db`.`session` SET `status` = 'CLOSED' WHERE `session`.`token` = '"+rows[0].session_token+"';";
            var updateUser = "UPDATE `main_db`.`users` SET `session_token` = null WHERE `users`.`session_token` = '"+rows[0].session_token+"';";
            connection.query(upadteSession2, function(err, sessionrows) {
            });
            connection.query(updateUser, function(err, sessionrows) {
            });
        });
        console.log(req.session.username+' logged out of: '+req.session.device);
        req.session.destroy();
        res.send(compileOutput("success", "You have logged out."));
    } else {
        res.status(400).send(compileOutput("failed", "You cannot logout, you were never logged in."));
    }
});



module.exports = router;