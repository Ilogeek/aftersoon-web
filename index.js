var express = require('express');

var http = require('http');
var mongoose = require('mongoose');

var User = require(./model_user);


var app = express();

var uristring = process.env.MONGOLAB_URI;
var theport = process.env.PORT || 5000;

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

// connection test to mongodb
var connected = "nop";

// connection to mongolab
mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  connected = err;
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  connected = "yup";
  }
});

// Root
app.get('/', function(request, response) {
  response.send('Hello '+ connected);
});

// example
app.get('/hugo', function(request, response) {
	response.send('Page')
});

/*app.get('/users', function(request, response){

  return User.find(function(err, users)) {
    if(!err) {
      return res.send(users);
    } else {
      return console.log(err);
    }
  });

});*/

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
