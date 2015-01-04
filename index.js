var express = require('express');
var http = require('http');
var mongoose = require('mongoose');

var app = express();
app.set('view engine', 'ejs')
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
}) ;

var connStr = process.env.MONGOLAB_URI || 'mongodb://heroku_app31738690:pqegvskn398qo6nb5olr5fdfar@ds053130.mongolab.com:53130/heroku_app31738690';
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});


// User
var User = require('./models/user'),
    UserRoutes = require('./routes/user')(app);

// Friend
var FriendRoutes = require('./routes/friend')(app);

// Event
var Event = require('./models/event'),
    EventRoutes = require('./routes/event')(app);

// Map
//var Map = require('./map.js');

// Root
 app.get('/', function(request, response) {
   response.send('Aftersoon');
 });

 app.get('/map', function(req, res) {
    res.render('map/index');
 });


 /*

 // attempt to authenticate user
 User.getAuthenticated('Hugo', 'Password123', function(err, user, reason) {
     if (err) throw err;

     // login was successful if we have a user
     if (user) {
         // handle login success
         console.log('login success');
         return;
     }

     // otherwise we can determine why we failed
     var reasons = User.failedLogin;
     switch (reason) {
         case reasons.NOT_FOUND:
         case reasons.PASSWORD_INCORRECT:
             // note: these cases are usually treated the same - don't tell
             // the user *why* the login failed, only that it did
             break;
         case reasons.MAX_ATTEMPTS:
             // send email or otherwise notify user that account is
             // temporarily locked
             break;
     }
 });

*/



