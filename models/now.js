var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var NowSchema = new Schema({
    titleMessage       : {type: String},
    responseMessage    : {type: String},
    responseStatus     : {type: Number, enum: [1, 0]},
    travelMode  : {type: String, required:true, enum: ['WALKING', 'DRIVING', 'TRANSIT'], default: 'TRANSIT'},
    openNow     : {type: String, enum: ['no', 'yes'], default: 'no'},
    radius      : {type: Number, default:200},
    rankBy      : {type: String, enum: ['DISTANCE', 'PROMINENCE'], default: 'PROMINENCE'},
    date        : {type: Date, required: true, default: Date.now},
    owner       : {type: String, required:true}, 
    guest       : {type: String}, 
    seen        : {type: String}, // the owner can see if the message appeared on the guest's phone
    latOwner    : {type: Number},
    longOwner   : {type: Number}, 
    latGuest    : {type: Number},
    longGuest   : {type: Number}, 
    type        : {type: String, enum: ['bar', 'cafe', 'library', 'movie_theater', 'museum', 'night_club', 'parking', 'restaurant', 'subway_station', 'none'], default: 'none'}
    // Type from https://developers.google.com/places/documentation/supported_types
    // 'none' will return the middlepoint between the 2 persons
});

NowSchema.methods.calculateDestination = function(){
  if(latOwner && latGuest && longOwner && latGuest)
  {
    var paramURL = "firstAddress="+this.latOwner+",%20"+this.longOwner;
    paramURL += "&secondAddress="+this.latGuest+",%20"+this.longGuest;
    paramURL += "&travelModeParam="+this.travelMode;
    paramURL += "&typeOfPlaces="+this.type;
    paramURL += "&radius="+this.radius;
    paramURL += "&rankBy="+this.rankBy;
    paramURL += "&openNow="+this.openNow;

    var request = new XMLHttpRequest();
    console.log(paramURL);
    request.open('GET', '/map/json?'+paramURL, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        // Success!
        console.log('WOUHOU');
        var resp = request.responseText;
        console.log(resp);
      } else {
        // We reached our target server, but it returned an error
        console.log('ERROR#1');
      }
    };

    request.onerror = function() {
      // There was a connection error of some sort
      console.log('ERROR#2');
    };

    request.send();
  }
};

module.exports = mongoose.model('Now', NowSchema);