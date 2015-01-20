/**
 * Now
 *
 * @module      :: Routes
 * @description :: Maps routes and actions
 */
 Array.prototype.contains = function(obj) {
     var i = this.length;
     while (i--) {
         if (this[i] === obj) {
             return true;
         }
     }
     return false;
 }

module.exports = function(app) {

  var bodyParser = require('body-parser'),
      rqst       = require('request'),
      util       = require('util'),
      gcm        = require('node-gcm');

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

          var sender = new gcm.Sender('AIzaSyAZQzEx6O339rmn0jnYD_Ce0cM5I684Jgk'); // PRIVATE
          var registrationId = user.GCMid;
      
          if(registrationId.length)
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

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(bodyParser.json())

  var Now   = require('../models/now');
  var User  = require('../models/user');

  /**
   * Find and retrieves all nows
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  findAllNows = function(req, res) {
    console.log("POST - /nows");
    User.getAuthenticated(req.body.myUsername.toLowerCase(), req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

            // function findAllNows
            return Now.find({$or:[ {'owner':myselfUser.username}, {'guest':myselfUser.username} ]}, function(err, nows) {
              if(!err) {
                res.statusCode = 200;
                return res.send({status:200, nows:nows});
              } else {
                res.statusCode = 500;
                console.log('Internal error(%d): %s',res.statusCode,err.message);
                return res.send({ status: 500 });
              }
            });
        
        }
        else {
          res.statusCode = 403;
          return res.send({status: 403, message: 'Bad Authentication.'});
        }
    });
  };



  /**
   * Find and retrieves a single now by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  findOneNow = function(req, res) {

    User.getAuthenticated(req.body.myUsername.toLowerCase(), req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

          console.log("POST - /now/:id");
          return Now.findById(req.params.id, function(err, now) {

            if(!now) {
              res.statusCode = 404;
              return res.send({ status: 404 });
            }

            if(!err) {
              res.statusCode = 200;
              return res.send({ status: 200, now:now });
            } else {

              res.statusCode = 500;
              console.log('Internal error(%d): %s', res.statusCode, err.message);
              return res.send({ status: 500 });
            }
          });


          }
          else {
            res.statusCode = 403;
            return res.send({status: 403, message: 'Bad Authentication.'});
          }
        });
  };




  /**
   * Creates a new now from the data request
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  addNow = function(req, res) {

    User.getAuthenticated(req.body.myUsername.toLowerCase(), req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was failure
        if (myselfUser) {

            console.log('POST - /now');
            //console.log(req.is('json'));
            //console.log(req.body);

            var now = new Now({
                travelMode: req.body.travelMode,
                date: Date.now(),
                owner: myselfUser.username,
                guest: req.body.guest.toLowerCase(),
                latOwner: req.body.latOwner,
                lonOwner: req.body.lonOwner,
                version : 1
            });

            if(req.body.hasOwnProperty('titleMessage')) { now.titleMessage = req.body.titleMessage; }
            if(req.body.hasOwnProperty('radius')) { now.radius = req.body.radius; }
            if(req.body.hasOwnProperty('rankBy')) { now.rankBy = req.body.rankBy; }
            if(req.body.hasOwnProperty('type')) { now.type = req.body.type; }

            now.save(function(err) {

              if(err) {

                console.log('Error while saving now : ' + err);
                res.statusCode = 500;
                return res.send({ stauts : 500, error: err });

              } else {

                console.log("Now created");
                res.statusCode = 200;
                //push.sendPush(now.guest, {});


                User.findOne({username:now.guest}, function(err,user) {
                  sendPush(user, {type: "NOW_INVITATION" , now: now});
                });


                var schedule = require('node-schedule');
                var date_in_15_min = new Date(Date.now() + 15 * 60000);
                var date_in_5_min  = new Date(Date.now() + 5  * 60000);

                var reminder = schedule.scheduleJob(date_in_5_min, function(){
                    Now.findById(now._id, function(err, now) {
                        if(now) {
                          if(now.guestStatus == 0)
                          {
                            
                                User.findOne({username:now.guest}, function(err,user) {
                                  sendPush(user, {type: "NOW_REMINDER_NO_ANSWER" , now: now});
                                });
                                console.log('Reminder - No answer from guest');
                          }
                        }
                    });
                });

                var cancelled = schedule.scheduleJob(date_in_15_min, function(){
                    Now.findById(now._id, function(err, now) {
                        if(now) {
                          if(now.guestStatus == 0)
                          {
                            now.eventStatus = 2;
                            now.save(function(err) {
                              if(!err) {
                                User.findOne({username:now.owner}, function(err,user) {
                                  sendPush(user, {type: "NOW_NO_ANSWER_FROM_GUEST" , now: now});
                                });
                                User.findOne({username:now.guest}, function(err,user) {
                                  sendPush(user, {type: "NOW_NO_ANSWER_FROM_GUEST" , now: now});
                                });
                                console.log('Now cancelled - No answer from guest');
                              }
                            });
                          }
                        }
                    });
         
                });
              
                return res.send({ status: 200, now:now });

              }

            });



      }
      else {
        res.statusCode = 403;
        return res.send({status: 403, message: 'Bad Authentication.'});
      }
    });

  };



  /**
   * Update a Now by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  updateNow = function(req, res, acceptedOrNot, idNow) {

    req.params.id = idNow;
    req.body.guestStatus = acceptedOrNot;
    if (req.body.guestStatus == 0) req.body.guestStatus +=2;

    User.getAuthenticated(req.body.myUsername.toLowerCase(), req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

              // Solution by ID
              console.log("PUT - /now/:id");
              return Now.findById(req.params.id, function(err, now) {

                if(!now) {
                  res.statusCode = 404;
                  return res.send({ status: 404 });
                }

                // we dont want the user to update its username right ?


                if(req.body.hasOwnProperty('responseMessage')) now.responseMessage = req.body.responseMessage;
                if(req.body.hasOwnProperty('guestStatus'))  now.guestStatus = req.body.guestStatus;
                if(req.body.hasOwnProperty('travelMode'))  
                {
                  if(now.travelMode == "TRANSIT" || req.body.travelMode == "TRANSIT")
                  {
                    now.travelMode == "TRANSIT";
                  }
                  else {
                    now.travelMode == "DRIVING";
                  }
                }  
                now.version = now.version + 1;

                if(acceptedOrNot == 0){
                  now.eventStatus = 2;
                  User.findOne({username:now.owner}, function(err,user) {
                    sendPush(user, {type: "NOW_CANCELLED" , now: now});
                  });
                  /*User.findOne({username:now.guest}, function(err,user) {
                    sendPush(user, {type: "NOW_CANCELLED" , now: now});
                  });*/
                }
                else {
                  if(req.body.hasOwnProperty('latGuest'))        now.latGuest = req.body.latGuest;           
                  if(req.body.hasOwnProperty('lonGuest'))        now.lonGuest = req.body.lonGuest;

                }
                
                return now.save(function(err) {
                  if(!err) {
                    console.log('Updated');

                    // if we have the 2 coordinates AND responseStatus is OK we can calculate
                    if(now.latGuest && now.lonGuest && now.latOwner && now.lonOwner && now.eventStatus != 2)
                    {
                        calculateDestination(now, req, res);
                    }

                    if(acceptedOrNot == 0){
                      User.findOne({username:now.owner}, function(err,user) {
                        sendPush(user, {type: "NOW_CANCELLED" , now: now});
                      });
                      User.findOne({username:now.guest}, function(err,user) {
                        sendPush(user, {type: "NOW_CANCELLED" , now: now});
                      });
                    }

                    res.statusCode = 200;
                    return res.send({ status: 200, now:now });
                    
                  } else {
                    if(err.name == 'ValidationError') {
                      res.statusCode = 400;
                      res.send({ status: 400 });
                    } else {
                      res.statusCode = 500;
                      res.send({ status: 500 });
                    }
                    console.log('Internal error(%d): %s',res.statusCode,err.message);
                  }
                  //res.statusCode = 200
                  //res.send(event);

                });
              });

          }
          else {
            res.statusCode = 403
            return res.send({status: 403, message: 'Bad Authentication.'});
          }
        });
  };

  acceptNow = function(req, res) { updateNow(req, res, 1, req.params.id); };
  refuseNow = function(req, res) { updateNow(req, res, 0, req.params.id); };


  /**
   * Delete a Now by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  deleteNow = function(req, res) {

    User.getAuthenticated(req.body.myUsername.toLowerCase(), req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

            //Solution by Username which is unique so its like an ID
            console.log("DELETE - /now/:id");
            return Now.findById(req.params.id, function(err, now) {
              
              if(!now) {
                res.statusCode = 404;
                return res.send({ status: 404 , message: "Now doesn't exist"});
              }
              if(myselfUser.username == now.owner){
                return now.remove(function(err) {
                  if(!err) {
                    console.log('Removed Now');
                    res.statusCode = 200;
                    return res.send({ status: 200 });
                  } else {
                    res.statusCode = 500;
                    console.log('Internal error(%d): %s',res.statusCode,err.message);
                    return res.send({ status: 500 });
                  }
                })
              }
              else
              {
                res.statusCode = 403;
                return res.send({status: 403, message: 'You are not the owner.'});
              }
              
            });



          }
          else {
            return res.send({status: 403, message: 'Bad Authentication.'});
          }
        });
  }


function calculateDestination( nowObject, req, res ){
  if(nowObject.latOwner && nowObject.latGuest && nowObject.lonOwner && nowObject.lonGuest)
  {
        var travelMode = nowObject.travelMode;
        if(travelMode == "transit") 
          {
            travelMode += "&departure_time=" + Date.now();
            // Fix : Date.now give milliseconds and google api wants seconds
            travelMode  = travelMode.substring(0,travelMode.length-3);
          }

        var requestString = util.format('https://maps.googleapis.com/maps/api/directions/json?origin=%d,%d&destination=%d,%d&mode=%s', nowObject.latOwner, nowObject.lonOwner, nowObject.latGuest, nowObject.lonGuest, travelMode);
        console.log(requestString);
        /* Value used for calculation */
        var totalDist           = -1, // get the total distance (meter) between origin and destination, from google json result
            resJSON             = {}, // JSON object from google request
            steps               = [], // array of all steps from origin to destination (contains : distance, time, polyline, string)
            stepNumber          = -1, // index of the steps' array
            actualDist          =  0, // distance calculated at the end of the stepNumber's step from origin
            oldActualDist       = -1, // distance calculated at the begin of the stepNumber's step from origin
            middleDist          = -1, // totalDist / 2
            middleStep          = {}, // object from steps' array where the middleDist is situated                                           Start middleStep   MiddleDist          End middleStep
            arrayPolyline       = [], // polyline array (array of GPS location (lat,long)) from the middleStep's object                            (0%)         (33%)                   (100%)
            percentDistanceStep =  0, // tricky : percent where the global middle dist is situated on the total distance of the middle step  :      |------------|------------------------|
            arrayPolylineIndex  =  0, // tricky bis : calculated index with the help of the percentDistanceStep to find the good index
            middlePoint         = {}; // res object with the lat and the lon of the middle point between origin and destination

        rqst(requestString, function (err, response, body) {
          if (!err && response.statusCode == 200) {
            /*
            console.log(JSON.parse(body));
            console.log('-------------------------');
            console.log(JSON.parse(body).status);
            console.log('-------------------------');
            console.log(JSON.parse(body).routes[0].legs[0].distance); 
            */
            if(JSON.parse(body).status == 'OK')
            {
               // Avoid bug when people are at the same place
               if(JSON.parse(body).routes[0].legs[0].distance.value < 50)
               {
                  nowObject.latMiddlePoint = nowObject.latOwner;
                  nowObject.lonMiddlePoint = nowObject.lonOwner;
               }
               else
               {
                  resJSON    = JSON.parse(body).routes[0];
                  totalDist  = resJSON.legs[0].distance.value;
                  middleDist = totalDist /2;
                  steps      = resJSON.legs[0].steps;
                  
                  while(actualDist < middleDist)
                  {
                     stepNumber++;
                     oldActualDist = actualDist;
                     actualDist   += steps[stepNumber].distance.value;
                  }

                  
                  middleStep    = steps[stepNumber];
                  arrayPolyline = require('polyline').decode(middleStep.polyline.points);

                  percentDistanceStep      = ((middleDist - oldActualDist) * 100) / (actualDist - oldActualDist);
                  arrayPolylineIndex       = Math.round(arrayPolyline.length * percentDistanceStep / 100);
                  nowObject.latMiddlePoint = arrayPolyline[arrayPolylineIndex][0];
                  nowObject.lonMiddlePoint = arrayPolyline[arrayPolylineIndex][1];
               }

              //return middlePoint;

              var apiKey         = "AIzaSyDlKaDgFHRsl6TbqSa9bYxspYwVCaZb_XM";
              var radiusOrRankBy = "&radius="+nowObject.radius;
              
              if(nowObject.rankBy == "DISTANCE") radiusOrRankBy = "&rankby=distance";
              radiusOrRankBy = "&rankby=distance";
              
              var urlRequest = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location="+ nowObject.latMiddlePoint +","+ nowObject.lonMiddlePoint + radiusOrRankBy+"&types="+ nowObject.type +"&key="+apiKey//+"&opennow=yes";

              rqst(urlRequest, function (err, response, body) {
                if (!err && response.statusCode == 200) {
                  //console.log(JSON.parse(body).results[0]);
                  nowObject.placesAround = JSON.parse(body).results[0];
                  nowObject.eventStatus = 1;

                  nowObject.save(function(err) {
                     if(err) {
                       console.log('Error while saving now : ' + err);
                     } else {
                       console.log("Places and middlePoint saved");
                       if(req != null && res !=null)
                       {
                         //findOneNow(req, res);
                         /*if(nowObject.placesAround == [])
                         {
                           nowObject.rankby = "DISTANCE";
                           nowObject.save();
                           calculateDestination(nowObject, req, res);
                         }*/
                         User.findOne({username:nowObject.owner}, function(err,user) {
                           sendPush(user, {type: "PLACE_FOUND" , now: nowObject});
                         });
                         User.findOne({username:nowObject.guest}, function(err,user) {
                           sendPush(user, {type: "PLACE_FOUND" , now: nowObject});
                         });
                       }
                     }
                   });

                }
                else {

                  console.log('getPlacesAround - Connection problem');
               
                }
              });
            } // if JSON.parse(body).status == 'OK'
            else
            {
              console.log('No middlePoint found because of coordinates');
              nowObject.eventStatus = 2;
              nowObject.guestStatus = 2;
              nowObject.lonMiddlePoint = -1;
              nowObject.latMiddlePoint = -1;
              placesAround = [{error: 'No middle point found because of coordinates of users'}];

              nowObject.save(function(err) {
                 if(err) {
                   console.log('Error while saving now : ' + err);
                 } else {
                   console.log("Places and middlePoint saved");
                   if(req != null && res !=null)
                   {
                     //findOneNow(req, res);
                     /*if(nowObject.placesAround == [])
                     {
                       nowObject.rankby = "DISTANCE";
                       nowObject.save();
                       calculateDestination(nowObject, req, res);
                     }*/
                     User.findOne({username:nowObject.owner}, function(err,user) {
                       sendPush(user, {type: "PLACE_ERROR" , now: nowObject});
                     });
                     User.findOne({username:nowObject.guest}, function(err,user) {
                       sendPush(user, {type: "PLACE_ERROR" , now: nowObject});
                     });
                   }
                 }
               });
            }
            

          } // if !err && response.statusCode == 200
          else {

            console.log('getMiddlePoint - Connection problem');

          }
        });
    
    
  } // END IF
};

  

  //Link routes and actions
  app.post('/nows', findAllNows);
  // dont forget to change :username by :id if we switch in the fonction 
  app.post('/now/show/:id', findOneNow);
  app.post('/now', addNow);
  // dont forget to change :username by :id if we switch in the fonction 
  app.put('/now/:id', updateNow);
  app.post('/now/accept/:id', acceptNow);
  app.post('/now/refuse/:id', refuseNow);
  // dont forget to change :username by :id if we switch in the fonction 
  app.delete('/now/:id', deleteNow);
}