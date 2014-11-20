var express = require('express');

var http = require('http');
//var mongoose = require('mongoose');

//var User = require(./model_user);

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;
 
var UserSchema = new Schema({
    //id: Schema.ObjectId,
    //email: { type: String, required: true, index: { unique: true } },
    //password: { type: String, required: true }
    //nom_usuel: { type : String, match: /^[a-zA-Z0-9-_]+$/ , required : true},
    telephone: String,
    //adresse: { type:String, required: true},
    gps: String
});
 
UserSchema.pre(save, function(next) {
    var user = this;
 
// only hash the password if it has been modified (or is new)
if (!user.isModified('password')) return next();
 
// generate a salt
bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
 
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
 
        // override the cleartext password with the hashed one
        user.password = hash;
        next();
    });
});
 
 
});
 
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};
 
module.exports = mongoose.model(User, UserSchema);


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