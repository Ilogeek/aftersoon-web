module.exports = function(mongoose, bcrypt, SALT_WORK_FACTOR) {
   
var Schema = mongoose.Schema; 

var UserSchema = new Schema({
    //email: { type: String, required: true, index: { unique: true } },
    password: { type: String, required: true},
    //nom_usuel: { type : String, match: /^[a-zA-Z0-9-_]+$/ , required : true},
    telephone: String,
    //adresse: { type:String, required: true},
    gps: String
});
 
/*UserSchema.pre(save, function(next) {
    var user = this;
 
// only hash the password if it has been modified (or is new)
if (!user.isModified('password')) return next();
 
// generate a salt
bcrypt.genSalt( SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
 
    // hash the password using our new salt
    bcrypt.hash(user.password, salt, function(err, hash) {
        if (err) return next(err);
 
        // override the cleartext password with the hashed one
        user.password = hash;
        next();
    });
});
 
 
});*/

UserSchema.methods.cryptPassword = function(password) {
    /*bcrypt.genSalt( SALT_WORK_FACTOR, function(err, salt) { 
        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            this.password = hash;
        });
    });*/
    this.password = "changed";
};
 
/*UserSchema.methods.comparePassword = function(candidatePassword) {
    return UserSchema.methods.cryptPassword(candidatePassword) == this.password;
};*/

    return mongoose.model('UserSchema', UserSchema);

}