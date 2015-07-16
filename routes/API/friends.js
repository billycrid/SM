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

router.delete('/removefriend/:tagID', function(req, res, next) {
    var friendID = req.param("tagID");
    if(req.session.username) {
        var checkFriend = "SELECT * FROM `users` WHERE `email` = '" + friendID + "' or `username` = '" + friendID + "' or `user_id` = '" + friendID + "';";
        connection.query(checkFriend, function (err, rows) {
            if(err){
                res.status(400).send(compileOutput("failed", "There was a problem with the query"));
            } else {
                var friendIDtoDEL = rows[0].user_id;
                if(rows.length > 0){
                    //user exists
                    var checkFriendRequest = "SELECT * FROM `friends` WHERE `user_id_1` = '"+req.session.user_id+"' OR `user_id_2` = '" + req.session.user_id + "';";
                    connection.query(checkFriendRequest, function (err, friendlist) {
                        var deleteFriend = "DELETE FROM `friends` WHERE `user_id_1` = '" + req.session.user_id + "' AND `user_id_2` = '" + friendIDtoDEL + "' OR `user_id_1` = '" + friendIDtoDEL + "' AND `user_id_2` = '" + req.session.user_id + "'";
                        connection.query(deleteFriend, function (err, deleteFriend) {
                            if(deleteFriend.affectedRows > 0){
                                var addnotification = "DELETE FROM `notifications` WHERE (`user_id` = '" + req.session.user_id + "' AND `user_id_2` = '" + friendIDtoDEL + "') OR (`user_id` = '" + friendIDtoDEL + "' AND `user_id_2` = '" + req.session.user_id + "') AND `notificationtype` = '1'";
                                connection.query(addnotification, function (err, notificationlist) {});
                                res.status(200).send(compileOutput("success", friendID+" has been deleted."));
                            } else {
                                res.status(400).send(compileOutput("failed", "User was never your friend."));
                            }
                        });
                    });
                } else {
                    res.status(400).send(compileOutput("failed", "the parameter specified does not exist."));
                }
            }
        });
    } else {
        res.status(400).send(compileOutput("failed", "You are not logged in"));
    }
});

router.post('/addfriend/:tagID', function(req, res, next) {
    if(req.session.username) {
        var friendID = req.param("tagID");
        var checkFriend = "SELECT * FROM `users` WHERE `email` = '" + friendID + "' or `username` = '" + friendID + "' or `user_id` = '" + friendID + "';";
        connection.query(checkFriend, function (err, rows) {
            if (err) {
                res.status(400).send(compileOutput("failed", "There was an error with the query."));
            } else {
                if(rows.length > 0){
                    var checkFriend = "SELECT * FROM `friends` WHERE `user_id_1` = '"+req.session.user_id+"' or `user_id_2` = '"+req.session.user_id+"' AND `status` = 'ACTIVE' or `status` = 'PENDING';";
                    connection.query(checkFriend, function (err, friendslist) {
                        var friends = [];
                        for (var i = 0; i < friendslist.length; i++) {
                            if (friendslist[i].user_id_1 == rows[0].user_id) {
                                friends.push(friendslist[i].user_id_1);
                            }
                            if (friendslist[i].user_id_2 == rows[0].user_id) {
                                friends.push(friendslist[i].user_id_2);
                            }
                        }
                        if(friends.length > 0) {
                            res.status(400).send(compileOutput("failed", "You are already friends with "+friendID+" or there is a request pending."));
                        } else {
                            var addFriendPending = "INSERT INTO `main_db`.`friends` (`user_id_1`, `user_id_2`, `status`) VALUES ('"+req.session.user_id+"', '"+rows[0].user_id+"', 'PENDING');";
                            connection.query(addFriendPending, function (err, friendslist) {});
                            var addnotification = "INSERT INTO `main_db`.`notifications` (`user_id`, `notificationtype`, `user_id_2`, `read_status`) VALUES ('"+rows[0].user_id+"', '1', '"+req.session.user_id+"', '"+Math.random()+"');";
                            connection.query(addnotification, function (err, notificationlist) {});
                            res.status(200).send(compileOutput("success", friendID+" has been sent a friend request"));
                        }
                    });
                } else {
                    res.status(400).send(compileOutput("failed", "There was no users by that parameter."));
                }
            }
        });
    } else {
        res.status(400).send(compileOutput("failed", "You are not logged in.."));
    }
});

router.get('/:tagID', function(req, res, next) {
    var param = req.param("tagID");
    if(param != "pending") {
        if (!req.session.username) {
            res.status(400).send(compileOutput("failed", "You are not logged in."));
        } else {
            var getFriendList = "SELECT * FROM `friends` WHERE (`user_id_1` = '" + req.session.user_id + "' OR `user_id_2` = '" + req.session.user_id + "') AND `status` = 'ACTIVE'";
            connection.query(getFriendList, function (err, rows) {
                if (err) {
                    throw err;
                } else {
                    if (rows.length > 0) {
                        var friends = [];
                        for (var i = 0; i < rows.length; i++) {
                            if (rows[i].user_id_1 != req.session.user_id) {
                                friends.push(rows[i].user_id_1);
                            }
                            if (rows[i].user_id_2 != req.session.user_id) {
                                friends.push(rows[i].user_id_2);
                            }
                        }

                        var selectUsersNames = "SELECT user_id, first_name, last_name, email, user_image, username FROM `users` WHERE";
                        for (var j = 0; j < friends.length; j++) {
                            selectUsersNames += " user_id = " + friends[j] + " OR";
                        }
                        var sql = selectUsersNames.slice(0, -3);
                        sql += ";";
                        connection.query(sql, function (err, rowsfriends) {
                            if (err) {
                                throw err;
                            } else {
                                res.send(rowsfriends);
                            }
                        });
                    } else {
                        res.status(200).send(compileOutput("success", "No friends found"));
                    }
                }
            });
        }
    } else if (param == "pending"){
        if (!req.session.username) {
            res.status(400).send(compileOutput("failed", "You are not logged in."));
        } else {
            var getFriendList = "SELECT * FROM `friends` WHERE (`user_id_1` = '" + req.session.user_id + "' OR `user_id_2` = '" + req.session.user_id + "') AND `status` = 'PENDING'";
            connection.query(getFriendList, function (err, rows) {
                if (err) {
                    throw err;
                } else {
                    if (rows.length > 0) {
                        var friends = [];
                        for (var i = 0; i < rows.length; i++) {
                            if (rows[i].user_id_1 != req.session.user_id) {
                                friends.push(rows[i].user_id_1);
                            }
                            if (rows[i].user_id_2 != req.session.user_id) {
                                friends.push(rows[i].user_id_2);
                            }
                        }
                        var selectUsersNames = "SELECT user_id, first_name, last_name, email, user_image, username FROM `users` WHERE";
                        for (var j = 0; j < friends.length; j++) {
                            selectUsersNames += " user_id = " + friends[j] + " OR";
                        }
                        var sql = selectUsersNames.slice(0, -3);
                        sql += ";";
                        connection.query(sql, function (err, rowsfriends) {
                            if (err) {
                                throw err;
                            } else {
                                var output = '{ "status" : "success", "totalCount" : "'+rowsfriends.length+'", "items": [] }';
                                var obj = JSON.parse(output);
                                for (var i = 0; i < rowsfriends.length; i++) {
                                    obj['items'].push({"user_id": rowsfriends[i].user_id,"first_name": rowsfriends[i].first_name,"last_name": rowsfriends[i].last_name, "email" : rowsfriends[i].email, "username" : rowsfriends[i].username});
                                }
                                output = JSON.stringify(obj);
                                res.send(output);
                            }
                        });
                    } else {
                        res.status(400).send(compileOutput("failed", "No friends found"));
                    }
                }
            });
        }
    }
});

router.get('/acceptfriend/:tagID', function(req, res, next) {
    var friendID = req.param("tagID");
    if(req.session.username) {
        var checkFriend = "SELECT * FROM `users` WHERE `email` = '" + friendID + "' or `username` = '" + friendID + "' or `user_id` = '" + friendID + "';";
        connection.query(checkFriend, function (err, rows) {
            if(err){
                res.status(400).send(compileOutput("failed", "There was a problem with the query"));
            } else {
                if(rows.length > 0){
                    //user exists
                    var checkFriendRequest = "SELECT * FROM `friends` WHERE `user_id_1` = '"+rows[0].user_id+"' AND`user_id_2` = '" + req.session.user_id + "' AND `status` = 'PENDING';";
                    console.log(checkFriendRequest);
                    connection.query(checkFriendRequest, function (err, pendingfriends) {
                        if(pendingfriends.length > 0){
                            var add =  "UPDATE `main_db`.`friends` SET `status` = 'ACTIVE' WHERE `friends`.`user_id_1` = '"+rows[0].user_id+"' AND `friends`.`user_id_2` = '"+req.session.user_id+"';";;
                            var addnotification = "INSERT INTO `main_db`.`notifications` (`user_id`, `notificationtype`, `user_id_2`, `read_status`) VALUES ('"+rows[0].user_id+"', '2', '"+req.session.user_id+"', '"+Math.random()+"');";
                            connection.query(addnotification, function (err, notificationlist) {});
                            connection.query(add, function (err, pendingfriends) {
                            });
                            res.status(200).send(compileOutput("success", "You and "+friendID+" are now friends."));
                        } else {
                            res.status(400).send(compileOutput("failed", "You have no pending friend request with this user"));
                        }

                    });
                } else {
                    res.status(400).send(compileOutput("failed", "the parameter specified does not exist."));
                }
            }
        });
    } else {
        res.status(400).send(compileOutput("failed", "You are not logged in"));
    }
});



module.exports = router;