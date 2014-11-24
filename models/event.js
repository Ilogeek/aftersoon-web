var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var EventSchema = new Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    guests: [String], //<-- USERNAME LIST  -- [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    coming: [String], //<-- USERNAME LIST  -- [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    refusedBy: [String], //<-- USERNAME LIST  -- [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    place_name: { type: String, required: true },
    place_gps: { type: String, required: true },
    date_locked : { type: Date, required: true, default: Date.now }
});


module.exports = mongoose.model('Event', EventSchema);