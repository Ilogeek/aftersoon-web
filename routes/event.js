/**
 * Event
 *
 * @module      :: Routes
 * @description :: Maps routes and actions
 */


module.exports = function(app) {

  var bodyParser = require('body-parser');

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(bodyParser.json())

  var Event = require('../models/event');
  var User  = require('../models/user');

  /**
   * Find and retrieves all events
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  findAllEvents = function(req, res) {
    console.log("POST - /events");
    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

            // function findAllEvents
            return Event.find(function(err, events) {
              if(!err) {
                res.statusCode = 200;
                return res.send({status:200, events:events});
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
   * Find and retrieves a single event by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  findOne = function(req, res) {

    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

          console.log("POST - /event/:id");
          return Event.findById(req.params.id, function(err, event) {

            if(!event) {
              res.statusCode = 404;
              return res.send({ status: 404 });
            }

            if(!err) {
              res.statusCode = 200;
              return res.send({ status: 200, event:event });
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
   * Creates a new event from the data request
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  addEvent = function(req, res) {

    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was failure
        if (myselfUser) {

            console.log('POST - /event');
            console.log(req.is('json'));
            console.log(req.body);

            var event = new Event({
                title: req.body.title,
                date: req.body.date,
                owner: req.body.myUsername,
                guests: req.body.guests,
                place_name: req.body.place_name,
                place_gps: req.body.place_gps,
                date_locked : req.body.date_locked,
                type : req.body.type,
                version : 1
            });

            event.save(function(err) {

              if(err) {

                console.log('Error while saving event : ' + err);
                res.statusCode = 500;
                return res.send({ stauts : 500, error: err });

              } else {

                console.log("Event created");
                res.statusCode = 200;
                return res.send({ status: 200, event:event });

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
   * Update an event by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  updateEvent = function(req, res) {


    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

              // Solution by ID
              console.log("PUT - /event/:id");
              return Event.findById(req.params.id, function(err, event) {

                if(!event) {
                  res.statusCode = 404;
                  return res.send({ status: 404 });
                }

                // we dont want the user to update its username right ?

                
                if (req.body.title != null) event.title = req.body.title;
                if (req.body.date != null) event.date = req.body.date;
                if (req.body.owner != null) event.owner = req.body.owner;
                if (req.body.guests != null) event.guests = req.body.guests;
                if (req.body.coming != null) event.coming = req.body.coming;
                if (req.body.refusedBy != null) event.refusedBy = req.body.refusedBy;
                if (req.body.place_name != null) event.place_name = req.body.place_name;
                if (req.body.place_gps != null) event.place_gps = req.body.place_gps;
                if (req.body.date_locked != null) event.date_locked = req.body.date_locked;
                if (req.body.type != null) event.type = req.body.type;
                event.version = event.version + 1;
            

                return event.save(function(err) {
                  if(!err) {
                    console.log('Updated');
                    res.statusCode = 200;
                    return res.send({ status: 200, event:event });
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



  /**
   * Delete a event by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  deleteEvent = function(req, res) {

    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser && myselfUser.username == req.params.username) {

            //Solution by Username which is unique so its like an ID
            console.log("DELETE - /event/:id");
            return Event.findById(req.params.id, function(err, event) {
              
              if(!event) {
                res.statusCode = 404;
                return res.send({ status: 404 });
              }

              return event.remove(function(err) {
                if(!err) {
                  console.log('Removed event');
                  res.statusCode = 200;
                  return res.send({ status: 200 });
                } else {
                  res.statusCode = 500;
                  console.log('Internal error(%d): %s',res.statusCode,err.message);
                  return res.send({ status: 500 });
                }
              })
            });



          }
          else {
            return res.send({status: 403, message: 'Bad Authentication.'});
          }
        });
  }

  /**
   * Change staut for a specific Event
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  changeStatus = function(req, res) {

    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

            console.log("POST - /event/:id/userStatus");
            return Event.findById(req.params.id, function(err, event) {
             
              if(!event) {
                res.statusCode = 404;
                return res.send({ status: 404 });
              }

              if(event.date_locked > Date.now)
              {
                var isInvited = (event.guests.indexOf(req.body.myUsername) != -1);
                var hasAccepted = (event.coming.indexOf(req.body.myUsername) != -1);
                var hasRefused = (event.refusedBy.indexOf(req.body.myUsername) != -1);

                if( !isInvited && !hasAccepted && !hasRefused )
                {
                  res.statusCode = 403;
                  return res.send({status: 403, message: 'Not invited' });
                }
                if( isInvited )
                {
                  event.guests.splice(event.guests.indexOf(req.body.myUsername), 1);
                  if(req.body.status == "accept")
                  {
                    event.coming.push(req.body.myUsername);
                    res.statusCode = 200;
                    return res.send({ status: 200, message:'accepted' });
                  }
                  if(req.body.status == "refuse")
                  {
                    event.refusedBy.push(req.body.myUsername);
                    res.statusCode = 200;
                    return res.send({ status: 200, message:'refused' });
                  }
                }
                else if (hasAccepted && req.body.status == "refuse")
                {
                  event.coming.splice(event.coming.indexOf(req.body.myUsername), 1);
                  event.refusedBy.push(req.body.myUsername);
                  res.statusCode = 200;
                  return res.send({ status: 200, message: 'From Accepted to Refused' });
                }
                else if (hasRefused && req.body.status == "accept")
                {
                  event.refusedBy.splice(event.refusedBy.indexOf(req.body.myUsername), 1);
                  event.coming.push(req.body.myUsername);
                  res.statusCode = 200;
                  return res.send({ status: 200, message: 'From Refused to Accepted' });
                }
              }
              else
              {
                res.statusCode = 403;
                return res.send({status:403, message: 'Date is over' });
              }
              

            });

          // EVENT SAVE NEEDED AND EVENT.VERSION +1

          }
          else {
            res.statusCode = 403;
            return res.send({status:403, message: 'Bad Authentication.'});
          }
        });
  }

  //Link routes and actions
  app.post('/events', findAllEvents);
  // dont forget to change :username by :id if we switch in the fonction 
  app.post('/event/:id', findOne);
  app.post('/event', addEvent);
  // dont forget to change :username by :id if we switch in the fonction 
  app.put('/event/:id', updateEvent);
  // dont forget to change :username by :id if we switch in the fonction 
  app.delete('/event/:id', deleteEvent);
  app.post('/event/:id/userStatus', changeStatus);
  /* TODO app.get('/event/:id/invited', invitedUsers);
  app.get('/event/:id/accepted',acceptedUsers);
  app.get('/event/:id/refused', refusedUsers); */
}