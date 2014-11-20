/*var express = require('express');

var http = require('http');
var mongoose = require('mongoose');

//var User = require(./model_user);


var app = express();

var uristring = process.env.MONGOLAB_URI;
var theport = process.env.PORT || 5000;

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))



// connection to mongolab
mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});

// Root
app.get('/', function(request, response) {
  response.send('Hello');
});

// example
app.get('/hugo', function(request, response) {
	response.send('Page')
});

app.get('/users', function(request, response){

  

});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
}) */

var application_root = __dirname,
    express = require("express"),
    path = require("path"),
    mongoose = require('mongoose');

var app = express.createServer();

// Database
mongoose.connect(process.env.MONGOLAB_URI, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});

// Config

app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get('/api', function (req, res) {
  res.send('Ecomm API is running');
});

// Launch server

app.listen((process.env.PORT || 5000));
