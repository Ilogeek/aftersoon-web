var pubnub = require('pubnub')({
	ssl	: true,
	publish_key	pub-c-dab7aa9b-3848-4c65-b66b-fe3c4214b60c: ,
	subscribe_key : sub-c-9524193e-6f53-11e4-bcf0-02ee2ddab7fe
});

function publish() {
	
	pubnub.subscribe({
		channel : "hello_world",
		message : function(message,env,channel){
		document.getElementById('text').innerHTML =
		"Message Received." + '<br>' +
		"Channel: " + channel + '<br>' +
		"Message: " + JSON.stringify(message)  + '<br>' +
		"Raw Envelope: " + JSON.stringify(env) + '<br>'
		},
		connect: pub
	});

	function pub() {
        pubnub.publish({                                     
             channel : "hello_world",
             message : "Hello from PubNub Docs!",
             callback: function(m){ console.log(m) }
        })
     }

};