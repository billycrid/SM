var express = require('express');
var router = express.Router();
var db = require('mysql');
var device = require('express-device');
var app = express();
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'billycrid@hotmail.co.uk',
        pass: 'f8bjcwow91'
    }
});

app.use(device.capture());

var connection =  db.createConnection({
    host : '127.0.0.1',
    user : 'root',
    password: '',
    database: 'main_db'
});

connection.connect();
var removeSessions = "TRUNCATE session";
connection.query(removeSessions, function () {
    console.log("Connection established, previous sessions cleared.");
});
function compileOutput(status, errormessage, rows){
    var message;
    if(status == "failed"){
        message = '{ "status" : "failed", "error" : "'+errormessage+'" }';
    } else if(status == "success"){
        message = '{ "status" : "success", "message" : "'+errormessage+'"}';
    }
    return JSON.parse(message);
}

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}
function sendRegistrationMail(mailTo, firstName, username, random) {
    var mailOptions = {
        from: 'GlobeTrotter <billycrid@hotmail.co.uk>', // sender address
        to: mailTo, // list of receivers
        subject: 'GlobeTrotter Registration Confirmation', // Subject line
        text: 'GlobeTrotter Registration Confirmation', // plaintext body
        html: 'Hello '+firstName+'!<br>Click the following link to <a href="http://localhost:3000/user/confirmation/'+username+'/'+random+'">confirm your account activation.</a>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + info.response);
        }
    });
}





router.get('/unsubscribe/:tagId', function(req, res) {
    var param = req.param("tagId");
    if(!req.session.username){
        res.status(400).send(compileOutput("failed", "Please login to unsubscribe"));
    } else {
        if (param == "account") {
            var userUnSub = "DELETE FROM `main_db`.`users` WHERE `users`.`username` = '" + req.session.username + "'";
            connection.query(userUnSub, function (err, rows) {
                if (err) {
                    throw err;
                } else {
                    console.log(req.session.username+' unsubscribed :(');
                    req.session.destroy();
                    res.status(200).send(compileOutput("success", "You have unsubscribed from the system"));
                }
            });
        } else if (param == "news") {
            var updateUser = "UPDATE `main_db`.`users` SET `notifications` = 'false' WHERE `users`.`username` = '" + req.session.username + "';";
            connection.query(updateUser, function (err, rows) {
                if (err) {
                    res.status(400).send(compileOutput("failed", "There was an error with the query."));
                } else {
                    res.status(200).send(compileOutput("success", "You have unsubscribed"));
                }
            });
        } else {
            res.status(400).send(compileOutput("failed", "Invalid endpoint for unsubscription."));
        }
    }
});
router.get('/confirmation/:username/:random', function(req, res) {
    var username = req.param("username");
    var random = req.param("random");
    var selectSQL = "SELECT * FROM users WHERE username = '"+username+"' AND active_state = '"+random+"' ";
    connection.query(selectSQL, function (err, rows) {
        if (err) {
            res.status(400).send(compileOutput("failed", "There was an error with the query."));
        } else {
            if(rows[0].active_state != random){
                res.status(400).send(compileOutput("failed", "The username and randomhash dont match.."));
            } else {
                var updateUser = "UPDATE `main_db`.`users` SET `active_state` = null WHERE `users`.`username` = '"+username+"';";
                connection.query(updateUser, function (err, rows) {
                });
                res.status(200).send(compileOutput("success", "Your account is now active"));
                console.log(username+" has just activated their account")
            }
        }
    });

});
router.get('/subscribe/:tagId', function(req, res) {
    var param = req.param("tagId");
    if(param == "news"){
        if(!req.session.username){
            res.status(400).send(compileOutput("failed", "Please login to subscribe"));
        } else {
            var updateUser = "UPDATE `main_db`.`users` SET `notifications` = 'true' WHERE `users`.`username` = '" + req.session.username + "';";
            connection.query(updateUser, function (err, rows) {
                if (err) {
                    res.status(400).send(compileOutput("failed", "There was an error with the query."));
                } else {
                    res.status(200).send(compileOutput("success", "You have subscribed"));
                }
            });
        }
    } else {
        res.status(400).send(compileOutput("failed", "Invalid endpoint for subscription."));
    }
});
router.post('/subscribe/:tagId', function(req, res) {
    var param = req.param("tagId");
    var username = req.body.username;
    var password = req.body.password;
    var email = req.body.email;
    var first_name = req.body.first_name;
    var last_name = req.body.last_name;
    var home_address_1 = req.body.home_address_1;
    var home_address_2 = req.body.home_address_2;
    var home_address_city = req.body.home_address_city;
    var home_address_postcode = req.body.home_address_postcode;
    var current_address_1 = req.body.current_address_1;
    var current_address_2 = req.body.current_address_2;
    var current_address_city = req.body.current_address_city;
    var current_address_postcode = req.body.current_address_postcode;
    var contact_number = req.body.contact_number;
    var facebookusername = req.body.facebookusername;
    var twitterusername = req.body.twitterusername;
    var instagramusername = req.body.instagramusername;
    var snapchatusername = req.body.snapchatusername;
    var notifications = req.body.notifications;

    if (param == "account"){
        if(!username || !password || !first_name || !last_name || !home_address_1 || !home_address_city || !email){
            res.status(400).send(compileOutput("failed", "Subscription attempt failed, please supply; Username, email, password, first_name, last_name, home_address_1, home_address_city"));
        } else {
            if(validateEmail(email)){
                var selectUser32 = 'SELECT * FROM `users` where `username` = "' + username + '" OR `email` = "'+email+'";';
                connection.query(selectUser32, function (err, rows) {
                    if (err) {
                        throw err;
                    } else {
                        if (rows.length) {
                            res.status(400).send(compileOutput("failed", "Username or Email already exists"));
                        } else {
                            var randomHash = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);;
                            var userSub = "INSERT INTO `main_db`.`users` (`user_id`, `username`, `password`, `first_name`, `last_name`, `email`, `home_address_1`, `home_address_2`, `home_address_city`, `home_address_postcode`, `current_address_1`, `current_address_2`, `current_address_city`, `current_address_postcode`, `contact_number`, `facebookusername`, `twitterusername`, `instagramusername`, `snapchatusername`, `registration_date`, `lastlogin`, `notifications`, `session_token`, `active_state`) VALUES (NULL, '" + username + "', '" + password + "', '" + first_name + "', '" + last_name + "', '" + email + "',  '" + home_address_1 + "', '" + home_address_2 + "', '" + home_address_city + "', '" + home_address_postcode + "', '" + current_address_1 + "', '" + current_address_2 + "', '" + current_address_city + "', '" + current_address_postcode + "', '" + contact_number + "', '" + facebookusername + "', '" + twitterusername + "', '" + instagramusername + "', '" + snapchatusername + "', CURRENT_TIMESTAMP, null, '" + notifications + "', '', '"+randomHash+"');";

                            connection.query(userSub, function (err, rows) {
                                if (err) {
                                    throw err;
                                } else {
                                    if (rows) {
                                        console.log(username + ' subscribed :)');
                                        sendRegistrationMail(email, first_name, username, randomHash);
                                        res.status(200).send(compileOutput("success", "You have subscribed to the system, please check your emails to activate your account."));
                                    } else {
                                        res.status(400).send(compileOutput("failed", "There was an error with your subscription"));
                                    }
                                }
                            });
                        }
                    }
                });
            } else {
                res.status(400).send(compileOutput("failed", "Incorrect email format"));
            }
        }
    } else {
        res.status(400).send(compileOutput("failed", "Invalid endpoint for subscription."));
    }
});

module.exports = router;
