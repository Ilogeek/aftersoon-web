var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var NowSchema = new Schema({
    titleMessage       : {type: String},
    responseMessage    : {type: String},
    responseStatus     : {type: Number, enum: [-1, 0, 1], default:-1},
    travelMode         : {type: String, required:true, enum: ['walking', 'driving', 'transit'], default: 'transit'},
//  openNow            : {type: String, enum: ['no', 'yes'], default: 'no'},
    radius             : {type: Number, default:200},
    rankBy             : {type: String, enum: ['DISTANCE', 'PROMINENCE'], default: 'PROMINENCE'},
    date               : {type: Date,   required: true, default: Date.now},
    owner              : {type: String, required:true}, 
    guest              : {type: String, required:true}, 
    seen               : {type: String}, // the owner can see if the message appeared on the guest's phone
    latOwner           : {type: Number, default:0},
    lonOwner           : {type: Number, default:0}, 
    latGuest           : {type: Number, default:0},
    lonGuest           : {type: Number, default:0},
    latMiddlePoint     : {type: Number, default:0},
    lonMiddlePoint     : {type: Number, default:0},
    type               : {type: String, enum: ['bar', 'cafe', 'library', 'movie_theater', 'museum', 'night_club', 'parking', 'restaurant', 'subway_station', 'none'], default: 'none'},
    // Type from https://developers.google.com/places/documentation/supported_types
    // 'none' will return the middlepoint between the 2 persons
    placesAround       : {type: Array,  default:[]},
    version            : {type: Number, default:1}
});

module.exports = mongoose.model('Now', NowSchema);