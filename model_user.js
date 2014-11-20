module.exports = function(mongoose) {
/*var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    bcrypt = require('bcrypt'),
    SALT_WORK_FACTOR = 10;*/

//var mongoose = require('mongoose';)
var Schema = mongoose.Schema; 

var UserSchema = new Schema({
    /*id: Schema.ObjectId,
    email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true }
    nom_usuel: { type : String, match: /^[a-zA-Z0-9-_]+$/ , required : true},*/
    telephone: String,
    //adresse: { type:String, required: true},
    gps: String
});
 
/*UserSchema.pre(save, function(next) {
    var user = this;
 
// only hash the password if it has been modified (or is new)
if (!user.isModified('password')) return next();
 
// generate a salt
bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
 
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
 
        // override the cleartext password with the hashed one
        user.password = hash;
        next();
    });
});
 
 
});
 
UserSchema.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};*/

    return mongoose.model('UserSchema', UserSchema);

}