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

EventSchema.methods.ownedBy = function(username) {
    return this.find({owner:req.username}, function(err, events) {
      if(!err) {
        return res.send(events);
      } else {
        res.statusCode = 500;
        console.log('Internal error(%d): %s',res.statusCode,err.message);
        return res.send({ error: 'Server error' });
      }
    });
};

EventSchema.methods.imInvited = function(username) {
    return this.find({guests:username}, function(err, events) {
      if(!err) {
        return res.send(events);
      } else {
        res.statusCode = 500;
        console.log('Internal error(%d): %s',res.statusCode,err.message);
        return res.send({ error: 'Server error' });
      }
    });
};

EventSchema.methods.iRefused = function(username) {
    return this.find({refusedBy:username}, function(err, events) {
      if(!err) {
        return res.send(events);
      } else {
        res.statusCode = 500;
        console.log('Internal error(%d): %s',res.statusCode,err.message);
        return res.send({ error: 'Server error' });
      }
    });
};

EventSchema.methods.iWillGo = function(username) {
    return this.find({coming:username}, function(err, events) {
      if(!err) {
        return res.send(events);
      } else {
        res.statusCode = 500;
        console.log('Internal error(%d): %s',res.statusCode,err.message);
        return res.send({ error: 'Server error' });
      }
    });
};

module.exports = mongoose.model('Event', EventSchema);