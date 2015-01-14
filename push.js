module.exports = function(app) {

var gcm = require('node-gcm');

function sendPush(user, dataObject){

    // create a message with default values
    var message = new gcm.Message();

    // or with object values
    var message = new gcm.Message({
        //collapseKey: 'demo',
        delayWhileIdle: true,
        timeToLive: 3,
        data: dataObject
    });

    var sender = new gcm.Sender('AIzaSyAZQzEx6O339rmn0jnYD_Ce0cM5I684Jgk'); // PRIVATE
    var registrationId = user.GCMid;

    // OPTIONAL
    // add new key-value in data object
    //message.addDataWithKeyValue('key1','message1');
    //message.addDataWithKeyValue('key2','message2');

    // or add a data object
    /*message.addDataWithObject({
        key1: 'message1',
        key2: 'message2'
    }); // EDIT HERE CHANGE WITH "dataObject"*/

    // or with backwards compability of previous versions
    //message.addData('key1','message1');
    //message.addData('key2','message2');


    //message.collapseKey = 'demo';
    //message.delayWhileIdle = true;
    //message.timeToLive = 3;
    //message.dryRun = true; // https://plus.google.com/+NickButcher/posts/YkifRyLxsB9
    // END OPTIONAL

    // At least one required
    //registrationIds.push('regId1');
    //registrationIds.push('regId2'); 

    /**
     * Params: message-literal, registrationIds-array, No. of retries, callback-function
     **/
    sender.send(message, registrationId, 4, function (err, result) {
        console.log(result);
    });

}


app.get('/push', function(req, res) {
   var user = {GCMid:["APA91bE7T73QqLw6Kku1YeWQ2nwsSmepWg8DXlHIbgFx3hGHJwvevRowoG_RbWZdcLJS0EB0U1AkxWqyOk-aAky3xkXE1y5CIQnqJ6UozfeCXlU0FkxGtLyzAqz7zKqukAPWA9wpnjOsg5H7CxyIz2jY_EMQf-0wR_tHFSGqhwyzPo5nwqQjfyY"]};
   sendPush(user,{message: 'sale pute. plus jamais CUDA'});
   return res.send({ status: 200 });
});

}