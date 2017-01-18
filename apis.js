module.exports = function(app){

var http    = require("http");
var express    = require("express");
var mysql      = require('mysql');
var bodyParser = require('body-parser');
var msg91=require('msg91-sms');
var bcrypt=require('bcrypt-nodejs');
var jwt = require('jwt-simple');
var url = require('url');


var secret = 'secret';

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
var authkey='131158ATiJ87lwNvgr582aeff4';


/* ------------------------------------------------------------------
Admin  Categories API
------------------------------------------------------------------- */
//create categories api
app.post("/api/categorys",function(req,res){
  var rawToStr = JSON.parse(req.rawBody);

  var jsonHeader = JSON.stringify(req.headers);
  var jsonParsed = JSON.parse(jsonHeader);

  var xToken = jsonParsed['x-auth-token'];

  var decoded = jwt.decode(xToken, secret);

  //check if x-auth-token is correct or not
  pool.query('SELECT * FROM user WHERE login = ? AND role = ?', [decoded,'ROLE_ADMIN'], function(err, rows, fields) {
     if(err){
       var resObj = {
         "data": null,
         "message": "Can not connect to the server.",
         "status": "FAIL",
         "statusCode": 401
       }
       res.send(resObj);
     }
     else {
       //if that account is not admin account
       if(rows == "")
       {
         var resObj = {
           "data": null,
           "message": "Access Denied",
           "status": "FAIL",
           "statusCode": 401
         }
         res.send(resObj);
       }
       else{
         /////////////////////////////////////////////////////////////////
         //check if category already exists or not
         pool.query('SELECT * FROM category WHERE name = ?', [rawToStr.name], function(err, rows, fields) {
            if(err){
              var resObj = {
                "data": null,
                "message": "Can not connect to the server.",
                "status": "FAIL",
                "statusCode": 401
              }
              res.send(resObj);
            }
            else {
              //if that account is not admin account
              if(rows == "")
              {
                //create new category
                pool.query('INSERT INTO category(name, description, activated, image_url) VALUES  ( "' + rawToStr.name + '", "' + rawToStr.description + '", true, "' + rawToStr.imageUrl+ '")', function(err, results, fields) {
                    if(err){
                      var resObj = {
                        "data": null,
                        "message": "Can not connect to the server.",
                        "status": "FAIL",
                        "statusCode": 403
                      }
                      res.send(resObj);
                    }
                    else
                    {

                      var resObj = {
                        "id": results.insertId,
                        "name": rawToStr.name,
                        "description": rawToStr.description,
                        "activated": true,
                        "imageUrl": rawToStr.imageUrl
                      }

                      res.send(resObj);
                    }
                });
              }
              else{
                var resObj = {
                  "data": null,
                  "message": "Category already exists",
                  "status": "FAIL",
                  "statusCode": 401
                }
                res.send(resObj);
              }
            }
         });
         /////////////////////////////////////////////////////////////////
       }
     }
  });

});


//edit categories api
app.put("/api/categorys",function(req,res){
  var rawToStr = JSON.parse(req.rawBody);

  var jsonHeader = JSON.stringify(req.headers);
  var jsonParsed = JSON.parse(jsonHeader);

  var xToken = jsonParsed['x-auth-token'];

  var decoded = jwt.decode(xToken, secret);

  //check if x-auth-token is correct or not
  pool.query('SELECT * FROM user WHERE login = ? AND role = ?', [decoded,'ROLE_ADMIN'], function(err, rows, fields) {
     if(err){
       var resObj = {
         "data": null,
         "message": "Can not connect to the server.",
         "status": "FAIL",
         "statusCode": 401
       }
       res.send(resObj);
     }
     else {
       //if that account is not admin account
       if(rows == "")
       {
         var resObj = {
           "data": null,
           "message": "Access Denied",
           "status": "FAIL",
           "statusCode": 401
         }
         res.send(resObj);
       }
       else{
         /////////////////////////////////////////////////////////////////
         //edit category if x-auth-token is correct
         pool.query('UPDATE category SET name = ?, description = ?, activated = ?, image_url = ? WHERE id = ?', [rawToStr.name, rawToStr.description, rawToStr.activated, rawToStr.imageUrl, rawToStr.id], function(err, rows, fields) {
             if(err)
             {
               var resObj = {
                 "data": null,
                 "message": "Can not connect to the server.",
                 "status": "FAIL",
                 "statusCode": 401
               }
               res.send(resObj);
             }
             else
             {
               var resObj = {
                  "id": rawToStr.id,
                  "name": rawToStr.name,
                  "description": rawToStr.description,
                  "activated": rawToStr.activated,
                  "imageUrl": rawToStr.imageUrl
              }

               res.send(resObj);
             }
         });
         /////////////////////////////////////////////////////////////////
       }
     }
  });

});

//delete category api
app.delete("/api/categorys/:id",function(req,res){
  var jsonHeader = JSON.stringify(req.headers);
  var jsonParsed = JSON.parse(jsonHeader);

  var xToken = jsonParsed['x-auth-token'];

  var decoded = jwt.decode(xToken, secret);

  //check if x-auth-token is correct or not
  pool.query('SELECT * FROM user WHERE login = ? AND role = ?', [decoded,'ROLE_ADMIN'], function(err, rows, fields) {
     if(err){
       var resObj = {
         "data": null,
         "message": "Can not connect to the server.",
         "status": "FAIL",
         "statusCode": 401
       }
       res.send(resObj);
     }
     else {
       //if that account is not admin account
       if(rows == "")
       {
         var resObj = {
           "data": null,
           "message": "Access Denied",
           "status": "FAIL",
           "statusCode": 401
         }
         res.send(resObj);
       }
       else{
         /////////////////////////////////////////////////////////////////
         //delete category query
         pool.query('DELETE FROM category WHERE id = ?', [req.params.id], function(err, rows, fields) {
          if(err)
          {
            res.send('Can not connect to the server. Please try again');
            console.log(err);
          }
          else
          {
            res.set('X-orderoneApp-alert', 'A category is deleted with identifier'+req.params.id);
            res.set('X-orderoneApp-params', req.params.id);
            res.send();
          }
        });
         /////////////////////////////////////////////////////////////////
       }
     }
  });

});

//api to get list of all categories
app.get("/api/categorys",function(req,res){
  var jsonHeader = JSON.stringify(req.headers);
  var jsonParsed = JSON.parse(jsonHeader);

  var xToken = jsonParsed['x-auth-token'];

  var decoded = jwt.decode(xToken, secret);

  //check if x-auth-token is correct or not
  pool.query('SELECT * FROM user WHERE login = ? AND role = ?', [decoded,'ROLE_ADMIN'], function(err, rows, fields) {
     if(err){
       var resObj = {
         "data": null,
         "message": "Can not connect to the server.",
         "status": "FAIL",
         "statusCode": 401
       }
       res.send(resObj);
     }
     else {
       //if that account is not admin account
       if(rows == "")
       {
         var resObj = {
           "data": null,
           "message": "Access Denied",
           "status": "FAIL",
           "statusCode": 401
         }
         res.send(resObj);
       }
       else{
         /////////////////////////////////////////////////////////////////
         pool.query('SELECT * FROM category WHERE 1', function(err, rows, fields) {
            if(err){
              var resObj = {
                "data": null,
                "message": "Can not connect to the server.",
                "status": "FAIL",
                "statusCode": 401
              }
              res.send(resObj);
            }
            else {
              res.send(rows);
            }
         });
         /////////////////////////////////////////////////////////////////
       }
     }
  });
});

//api to get category details by it's id
app.get("/api/categorys/:id",function(req,res){
  var cId = req.params.id;
  var jsonHeader = JSON.stringify(req.headers);
  var jsonParsed = JSON.parse(jsonHeader);

  var xToken = jsonParsed['x-auth-token'];

  var decoded = jwt.decode(xToken, secret);

  //check if x-auth-token is correct or not
  pool.query('SELECT * FROM user WHERE login = ? AND role = ?', [decoded,'ROLE_ADMIN'], function(err, rows, fields) {
     if(err){
       var resObj = {
         "data": null,
         "message": "Can not connect to the server.",
         "status": "FAIL",
         "statusCode": 401
       }
       res.send(resObj);
     }
     else {
       //if that account is not admin account
       if(rows == "")
       {
         var resObj = {
           "data": null,
           "message": "Access Denied",
           "status": "FAIL",
           "statusCode": 401
         }
         res.send(resObj);
       }
       else{
         /////////////////////////////////////////////////////////////////
         pool.query('SELECT * FROM category WHERE id = ?', [cId], function(err, rows, fields) {
            if(err){
              var resObj = {
                "data": null,
                "message": "Can not connect to the server.",
                "status": "FAIL",
                "statusCode": 401
              }
              res.send(resObj);
            }
            else {
              res.send(rows);
            }
         });
         /////////////////////////////////////////////////////////////////
       }
     }
  });
});

/* ------------------------------------------------------------------
Merchant Categories API
------------------------------------------------------------------- */
//to get list of categories - merchant
app.get("/api/categories",function(req,res){
  var jsonHeader = JSON.stringify(req.headers);
  var jsonParsed = JSON.parse(jsonHeader);
  var xToken = jsonParsed['x-auth-token'];

  var decoded = jwt.decode(xToken, secret);

  //check if merchant has a right access token
  pool.query('SELECT * FROM user WHERE login = ? AND role = ?', [decoded.tel,'ROLE_MERCHANT'], function(err, rows, fields) {
     if(err){
       var resObj = {
         "data": null,
         "message": "Can not connect to the server.",
         "status": "FAIL",
         "statusCode": 401
       }
       res.send(resObj);
     }
     else {
       //if that account is not admin account
       if(rows == "")
       {
         var resObj = {
           "data": null,
           "message": "Access Denied",
           "status": "FAIL",
           "statusCode": 401
         }
         res.send(resObj);
       }
       else{
         /////////////////////////////////////////////////////////////////
         pool.query('SELECT * FROM category WHERE 1', function(err, rows, fields) {
            if(err){
              var resObj = {
                "data": null,
                "message": "Can not connect to the server.",
                "status": "FAIL",
                "statusCode": 401
              }
              res.send(resObj);
            }
            else {
              var resObj = {
                "statusCode": 200,
                "status": "SUCCESS",
                "message": "Categories fetched successfully.",
                "data": rows
              }
              res.send(resObj);
            }
         });
         /////////////////////////////////////////////////////////////////
       }
     }
  });

});
}
