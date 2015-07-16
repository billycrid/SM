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

function compileOutputItems(status, errormessage, rows){
    var output = "";
    output += '{ "totalCount" : "'+rows.length+'", "items" : {  ';

    for(i = 0; i < rows.length; i++){
        output += '"value_'+i+'" : "'+rows[i].value+'",';
    }
    var jsonOutput = output.slice(0, -1);
    jsonOutput += '}, ';

    var message = '"status" : "'+status+'",';
    message += '"message" : "'+errormessage+'"}';

    outfinal = jsonOutput + message;


    return JSON.parse(outfinal);
}

router.get('/', function(req, res, next) {
    var selectalltags = "SELECT * FROM tags";
    connection.query(selectalltags, function (err, rows) {
        if (err) {
            throw err;
        } else {
            res.status(200).send(compileOutputItems("success", "All tags found", rows));
        }
    });
});

module.exports = router;