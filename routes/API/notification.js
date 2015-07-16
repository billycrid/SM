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

router.get('/:tagID', function(req, res, next) {
    var status = req.param("tagID");
    if(req.session.username) {
        if(status == "unread"){
            var checknotification = "SELECT * FROM `notifications` WHERE `user_id` = '"+req.session.user_id+"' AND `read_status` IS NOT NULL";
            connection.query(checknotification, function (err, rows) {
                if(rows.length > 0){
                    var readNotifications = "UPDATE notifications SET `read_status`= NULL WHERE `notification_id` = '" + rows[0].notification_id + "'";
                    for (var i = 1; i < rows.length; i++) {
                        readNotifications += " OR `notification_id` = '" + rows[i].notification_id + "' ";
                    }
                    console.log(readNotifications);
                    connection.query(readNotifications, function (err, rowsddd) {
                        console.log(rowsddd);
                    });
                    res.status(200).send(rows);
                } else {
                    res.status(400).send(compileOutput("failed", "you no have no notifications"));
                }
            });
        } else if (status == "read"){
            var checknotification = "SELECT * FROM `notifications` WHERE `user_id` = '"+req.session.user_id+"' AND `read_status` IS NULL";
            connection.query(checknotification, function (err, rows) {
                res.status(200).send(rows);
            });
        } else if(status=="all") {
            var checknotification = "SELECT * FROM `notifications` WHERE `user_id` = '"+req.session.user_id+"'";
            connection.query(checknotification, function (err, rows) {
                res.status(200).json(rows);
            });
        } else {
            res.status(400).send(compileOutput("failed", "Invalid endpoint"));
        }
    } else {
        res.status(400).send(compileOutput("failed", "You are not logged in"));
    }
});


module.exports = router;