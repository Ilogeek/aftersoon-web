var express    = require('express');
var http       = require('http');
var mongoose   = require('mongoose');
var bodyParser = require('body-parser');
var util       = require('util');
var rqst       = require('request');
var schedule   = require('node-schedule');



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

// Push message using GCM
var Push = require('./push');

// User
var User       = require('./models/user'),
    UserRoutes = require('./routes/user')(app);

// Friend
var FriendRoutes = require('./routes/friend')(app);

// Now
var Now       = require('./models/now'),
    NowRoutes = require('./routes/now')(app);

// Event
var Event       = require('./models/event'),
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

 // CRON TASK
 // Clean database every half an hour
 var rule = new schedule.RecurrenceRule();
 rule.minute = [00,30];

 var _MS_IN_6_HOURS = 1000 * 60 * 60 * 6;

 var cleanDatabase = schedule.scheduleJob(rule, function(){
     console.log('Every 30 minutes clean of the Now DB (events older than 6 hours will disappear)');
     Now.find(function(err, nows) {
        //console.log('inside');
         nows.forEach(function(now) {
            //console.log(Math.abs(Date.now() - now.date.getTime()));
            //console.log(_MS_IN_6_HOURS);
            //console.log(Math.abs(Date.now() - now.date.getTime())> _MS_IN_6_HOURS);
           if(Math.abs(new Date().getTime() - now.date.getTime())> _MS_IN_6_HOURS)
           {
                //console.log('in the loop');
                now.remove(function(err) {
                  if(!err) {
                    console.log('Now Removed');
                  } else {
                    console.log('Internal error: %s',err.message);
                  }
                });
           }
         });
 
       });
 });

