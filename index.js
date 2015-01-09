var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var util = require('util');
var rqst = require('request');



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
 
function getMiddlePoint(origin, destination, travelMode) {

    var requestString = util.format('https://maps.googleapis.com/maps/api/directions/json?origin=%d,%d&destination=%d,%d&mode=%s', origin.lat, origin.lon, destination.lat, destination.lon, travelMode);
    
    /* Value used for calculation */
    var totalDist           = -1, // get the total distance (meter) between origin and destination, from google json result
        resJSON             = {}, // JSON object from google request
        steps               = [], // array of all steps from origin to destination (contains : distance, time, polyline, string)
        stepNumber          = -1, // index of the steps' array
        actualDist          =  0, // distance calculated at the end of the stepNumber's step from origin
        oldActualDist       = -1, // distance calculated at the begin of the stepNumber's step from origin
        middleDist          = -1, // totalDist / 2
        middleStep          = {}, // object from steps' array where the middleDist is situated                                           Start middleStep   MiddleDist          End middleStep
        arrayPolyline       = [], // polyline array (array of GPS location (lat,long)) from the middleStep's object                            (0%)         (33%)                   (100%)
        percentDistanceStep =  0, // tricky : percent where the global middle dist is situated on the total distance of the middle step  :      |------------|------------------------|
        arrayPolylineIndex  =  0, // tricky bis : calculated index with the help of the percentDistanceStep to find the good index
        middlePoint         = {}; // res object with the lat and the lon of the middle point between origin and destination

    rqst(requestString, function (err, response, body) {
      if (!err && response.statusCode == 200) {
        
        resJSON    = JSON.parse(body).routes[0];
        totalDist  = resJSON.legs[0].distance.value;
        middleDist = totalDist /2;
        steps      = resJSON.legs[0].steps;
        
        while(actualDist < middleDist)
        {
           stepNumber++;
           oldActualDist = actualDist;
           actualDist   += steps[stepNumber].distance.value;
        }

        
        middleStep    = steps[stepNumber];
        arrayPolyline = require('polyline').decode(middleStep.polyline.points);

        percentDistanceStep = ((middleDist - oldActualDist) * 100) / (actualDist - oldActualDist);
        arrayPolylineIndex  = Math.round(arrayPolyline.length * percentDistanceStep / 100);
        middlePoint.lat     = arrayPolyline[arrayPolylineIndex][0];
        middlePoint.lon     = arrayPolyline[arrayPolylineIndex][1];

       return middlePoint;

      }
      else {

        console.log('getMiddlePoint - Connection problem');
        middlePoint.lat = -1;
        middlePoint.lon = -1;
        return middlePoint;

      }
    });
}

var pos1 = {
      lat: 48.5636524,
      lon: 7.8740217
    };
var pos2 = {
      lat: 48.5691135,
      lon: 7.762094
    };

console.log(getMiddlePoint(pos1, pos2, "TRANSIT"));

 app.get('/map/test', function(req, res) {

});

