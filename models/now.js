var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var NowSchema = new Schema({
    titleMessage       : {type: String},
    responseMessage    : {type: String},
    
    travelMode         : {type: String, required:true, enum: ['walking', 'driving', 'transit'], default: 'transit'},
    radius             : {type: Number, default:200},
    rankBy             : {type: String, enum: ['DISTANCE', 'PROMINENCE'], default: 'PROMINENCE'},
    date               : {type: Date,   required: true, default: Date.now},
    type               : {type: String, enum: ['bar', 'cafe', 'library', 'movie_theater', 'museum', 'night_club', 'parking', 'restaurant', 'subway_station', 'none'], default: 'none'},
    // Type from https://developers.google.com/places/documentation/supported_types
    
    owner              : {type: String, required:true}, 
    latOwner           : {type: Number, default:0},
    lonOwner           : {type: Number, default:0}, 
    guest              : {type: String, required:true}, 
    latGuest           : {type: Number, default:0},
    lonGuest           : {type: Number, default:0},
    
    latMiddlePoint     : {type: Number, default:0},
    lonMiddlePoint     : {type: Number, default:0},
    placesAround       : {type: Array,  default:[]},
    
    version            : {type: Number, default:1},
    guestStatus        : {type: Number, default:0},
    eventStatus        : {type: Number, default:0}
});

module.exports = mongoose.model('Now', NowSchema);