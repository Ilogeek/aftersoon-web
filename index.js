var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');



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

 app.get('/map/json', function(req, res) {
    //res.setHeader('content-type', 'application/json');
    res.render('map/json');
 });



 



