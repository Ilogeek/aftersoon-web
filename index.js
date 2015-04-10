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

// HIDE THE CONNECTION URL IF PUBLIC ON GITHUB ! > DONE
// Password changed before go to public, credentials are obsolete in this file
var connStr = process.env.MONGOLAB_URI || 'mongodb://heroku_app31738690:pqegvskn398qo6nb5olr5fdfar@ds053130.mongolab.com:53130/heroku_app31738690';
mongoose.connect(connStr, function(err) {
    if (err) throw err;
    console.log('Successfully connected to MongoDB');
});

// User
var User         = require('./models/user'),
    UserRoutes   = require('./routes/user')(app);

// Friend
var FriendRoutes = require('./routes/friend')(app);

// Now
var Now          = require('./models/now'),
    NowRoutes    = require('./routes/now')(app);

// Event
var Event        = require('./models/event'),
    EventRoutes  = require('./routes/event')(app);

// Root
 app.get('/', function(request, response) {
   response.send('<h1>Aftersoon</h1><p>An experimental project made by <a href="http://www.aernewein.eu">Antoine Ernewein</a>, <a href="http://steve.benedick.fr">Steve Benedick</a>, Etienne Heitz & <a href="http://hzilliox.fr">Hugo Zilliox</a></p><h2>If you see this page it means that the webservice is alive</h2><br/><img src="http://www.emojibase.com/resources/img/emojis/hangouts/1f419.png" />');
 });


// Visual examples for destination calculation (CLIENT SIDE)
 app.get('/map', function(req, res) {
    res.render('map/index');
 });

 app.get('/map/json', function(req, res) {
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
    nows.forEach(function(now) {
      if(Math.abs(new Date().getTime() - now.date.getTime())> _MS_IN_6_HOURS)
      {
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

