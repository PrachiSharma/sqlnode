var http    = require("http");
var express    = require("express");
var mysql      = require('mysql');
var bodyParser = require('body-parser');
var msg91=require('msg91-sms');
var bcrypt=require('bcrypt-nodejs');
var jwt = require('jwt-simple');
var url = require('url');


var secret = 'secret';

// var jwt = require('json-web-token');
// var crypto = require('crypto');

var app = express();
app.use(express.static(__dirname + '/app'));

require('./shop')(app);
require('./product')(app);
require('./login')(app);
require('./category')(app);

var rawBodySaver = function (req, res, buf, encoding) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}
app.use(bodyParser.json({ verify: rawBodySaver }));
app.use(bodyParser.urlencoded({ verify: rawBodySaver, extended: true }));
app.use(bodyParser.raw({ verify: rawBodySaver, type: '*/*' }));

var pool      =    mysql.createPool({
   connectionLimit : 100, //important
   host     : 'localhost',
   user     : 'root',
   password : '',
   database : 'orderNode',
   debug    :  false
});

 
// msg91 variables
var authkey='authkey';

app.listen(process.env.PORT || 8000);
