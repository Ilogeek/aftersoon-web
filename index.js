var express = require('express');

var http = require('http');
var mongoose = require('mongoose');

var app = express();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

// connection to mongolab
mongoose.connect(process.env.MONGOLAB_URI, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + process.env.MONGOLAB_URI + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + process.env.MONGOLAB_URI);
  }
});

var Schema = mongoose.Schema; 
var UserSchema = new Schema({
    /*id: Schema.ObjectId,
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
    nom_usuel: { type : String, match: /^[a-zA-Z0-9-_]+$/ , required : true},*/
    telephone: String,
    //adresse: { type:String, required: true},
    gps: String
});

var UserModel = require('./model_user')(mongoose);//mongoose.model('UserSchema', UserSchema);
var Hugo = new UserModel({'telephone':'test', 'password': ':)'});

// Root
app.get('/', function(request, response) {
  response.send('Hello ' + Hugo.telephone);
});

// example
app.get('/hugo', function(request, response) {
	response.send('Page')
});

app.get('/users', function(request, response){
  response.send('users');
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
}) 

