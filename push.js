module.exports = function() {

var gcm = require('node-gcm');

sendPush = function (user, dataObject){

    // create a message with default values
    var message = new gcm.Message();

    // or with object values
    var message = new gcm.Message({
        //collapseKey: 'demo',
        delayWhileIdle: true,
        timeToLive: 3,
        data: dataObject
    });

    var sender = new gcm.Sender('AIzaSyAZQzEx6O339rmn0jnYD_Ce0cM5I684Jgk'); // OBSOLETE, CHECK : https://console.developers.google.com to get the new key (AftersoonApp)
    var registrationId = user.GCMid;

    if(registrationId != [])
    {
        sender.send(message, registrationId, 4, function (err, result) {
            console.log(result);
        });
    }
    else
    {
        console.log('Problem - No GCMid for ' + user.username);
    }
}
}
