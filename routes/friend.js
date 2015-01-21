/**
 * Friend
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
 };


module.exports = function(app) {

  var User       = require('../models/user'),
      bodyParser = require('body-parser'),
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
  };

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(bodyParser.json())


  /**
   * Add a friend
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  addFriend = function(req, res) {
    console.log("POST - /friend/add/:username");
    if(req.body.myUsername != null) { req.body.myUsername = req.body.myUsername.toLowerCase(); }
    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

         return User.findOne({username:req.params.username}, function(err,user) {
                   
           if(!user) {
             res.statusCode = 400;
             return res.send({ status: 400, message:"User doesn't exist" });
           }

           if(myselfUser.username == req.params.username)
           {
            res.statusCode = 400;
            return res.send({ status: 400, message:"You can't add yourself as a friend" });
           }

           if(!err) {
              if(myselfUser.askedToBeFriend.contains(user.username) || myselfUser.friends.contains(user.username))
              {
                res.statusCode = 400;
                return res.send({status:400, message:"You already asked this person to be your friend"});
              }
              else
              {
                
                myselfUser.askedToBeFriend.push(user.username);
                myselfUser.askedToBeFriend = myselfUser.askedToBeFriend.sort();
                user.requestFrom.push(myselfUser.username);
                user.requestFrom = user.requestFrom.sort();

                myselfUser.save(function(err) {
                  console.log(err);
                  if(!err) {
                    
                    user.save(function(err2) {
                      console.log(err2);
                      if(!err2) {
                        console.log('Updated');
                        res.statusCode = 200;

                        User.findOne({username:user.username}, function(err,user) {
                          sendPush(user, {type: "FRIEND_INVITATION_ASKED" , user: myselfUser});
                        });

                        return res.send({ status: 200, user:myselfUser });
                        
                      } else {
                        if(err2.name == 'ValidationError') {
                          res.statusCode = 400;
                          res.send({ status:400, message: 'Validation error' });
                        } else {
                          res.statusCode = 500;
                          res.send({ status: 500 });
                        }
                        console.log('Internal error(%d): %s',res.statusCode,err2.message);
                      }
                    });

                  } else {
                    if(err.name == 'ValidationError') {
                      res.statusCode = 400;
                      res.send({ status:400, message: 'Validation error' });
                    } else {
                      res.statusCode = 500;
                      res.send({ status: 500 });
                    }
                    console.log('Internal error(%d): %s',res.statusCode,err.message);
                  }
                });
              
              }
           } 
           else 
           {
             res.statusCode = 500;
             console.log('Internal error(%d): %s', res.statusCode, err.message);
             return res.send({ status: 500 });
           }
         });
        
        }
        else {
          res.statusCode = 403;
          return res.send({status:403, message: 'Bad Authentication.'});
        }
    });
  };

  /**
   * Add a friend with an email
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  addFriendEmail = function(req, res) {
    console.log("POST - /friend/add/email/:email");
    if(req.body.myUsername != null) { req.body.myUsername = req.body.myUsername.toLowerCase(); }
    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

         return User.findOne({email:req.params.email.toLowerCase()}, function(err,user) {
                   
           if(!user) {
             res.statusCode = 400;
             return res.send({ status: 400, message:"User doesn't exist" });
           }

           if(myselfUser.username == req.params.username)
           {
            res.statusCode = 400;
            return res.send({ status: 400, message:"You can't add yourself as a friend" });
           }

           if(!err) {
              if(myselfUser.askedToBeFriend.contains(user.username) || myselfUser.friends.contains(user.username))
              {
                res.statusCode = 400;
                return res.send({status:400, message:"You already asked this person to be your friend"});
              }
              else
              {
                
                myselfUser.askedToBeFriend.push(user.username);
                myselfUser.askedToBeFriend = myselfUser.askedToBeFriend.sort();
                user.requestFrom.push(myselfUser.username);
                user.requestFrom = user.requestFrom.sort();

                myselfUser.save(function(err) {
                  console.log(err);
                  if(!err) {
                    
                    user.save(function(err2) {
                      console.log(err2);
                      if(!err2) {
                        console.log('Updated');
                        res.statusCode = 200;

                        User.findOne({username:user.username}, function(err,user) {
                          sendPush(user, {type: "FRIEND_INVITATION_ASKED" , user: myselfUser});
                        });

                        return res.send({ status: 200, user:myselfUser });
                        // TODO : SEND PUSH TO THE OTHER USER 
                      } else {
                        if(err2.name == 'ValidationError') {
                          res.statusCode = 400;
                          res.send({ status:400, message: 'Validation error' });
                        } else {
                          res.statusCode = 500;
                          res.send({ status: 500 });
                        }
                        console.log('Internal error(%d): %s',res.statusCode,err2.message);
                      }
                    });

                  } else {
                    if(err.name == 'ValidationError') {
                      res.statusCode = 400;
                      res.send({ status:400, message: 'Validation error' });
                    } else {
                      res.statusCode = 500;
                      res.send({ status: 500 });
                    }
                    console.log('Internal error(%d): %s',res.statusCode,err.message);
                  }
                });
              
              }
           } 
           else 
           {
             res.statusCode = 500;
             console.log('Internal error(%d): %s', res.statusCode, err.message);
             return res.send({ status: 500 });
           }
         });
        
        }
        else {
          res.statusCode = 403;
          return res.send({status:403, message: 'Bad Authentication.'});
        }
    });
  };

  /**
   * Accept a friend request
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  acceptFriend = function(req, res) {
    console.log("POST - /friend/accept/:username");
    if(req.body.myUsername != null) { req.body.myUsername = req.body.myUsername.toLowerCase(); }
    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {
  
              if(!myselfUser.requestFrom.contains(req.params.username))
              {
                res.statusCode = 400;
                return res.send({status:400, message:"You haven't received an invite from this person"});
              }
              else
              {
                return User.findOne({username:req.params.username.toLowerCase()}, function(err,user) {

                  myselfUser.requestFrom.splice(myselfUser.requestFrom.indexOf(req.params.username.toLowerCase()), 1);
                  myselfUser.requestFrom = myselfUser.requestFrom.sort();
                  myselfUser.friends.push(req.params.username.toLowerCase());
                  myselfUser.friends = myselfUser.friends.sort();
                  
                  user.askedToBeFriend.splice(user.askedToBeFriend.indexOf(myselfUser.username),1);
                  user.askedToBeFriend = user.askedToBeFriend.sort();
                  user.friends.push(myselfUser.username);
                  user.friends = user.friends.sort();

                  myselfUser.save(function(err) {
                    console.log(err);
                    if(!err) {
                      
                      user.save(function(err2) {
                        console.log(err2);
                        if(!err2) {
                          console.log('Updated');

                          User.findOne({username:user.username}, function(err,user) {
                            sendPush(user, {type: "FRIEND_INVITATION_ACCEPTED" , user: myselfUser});
                          });

                          res.statusCode = 200;
                          return res.send({ status: 200, user:myselfUser });
                          // TODO : SEND PUSH TO THE OTHER USER 
                        } else {
                          if(err2.name == 'ValidationError') {
                            res.statusCode = 400;
                            res.send({ status:400, message: 'Validation error (err2.name)' });
                          } else {
                            res.statusCode = 500;
                            res.send({ status: 500 });
                          }
                          console.log('Internal error(%d): %s',res.statusCode,err2.message);
                        }
                      });

                    } else {
                      if(err.name == 'ValidationError') {
                        res.statusCode = 400;
                        res.send({ status:400, message: 'Validation error (else)' });
                      } else {
                        res.statusCode = 500;
                        res.send({ status: 500 });
                      }
                      console.log('Internal error(%d): %s',res.statusCode,err.message);
                    }
                  }); // 1st save
                
                }); // findOne
        
            }

        }
        else {
          res.statusCode = 403;
          return res.send({status:403, message: 'Bad Authentication.'});
        }
    });
  };

  /**
   * Refuse a friend request
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  refuseFriend = function(req, res) {
    console.log("POST - /friend/refuse/:username");
    if(req.body.myUsername != null) { req.body.myUsername = req.body.myUsername.toLowerCase(); }
    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

              if(!myselfUser.requestFrom.contains(req.params.username.toLowerCase()))
              {
                res.statusCode = 400;
                return res.send({status:400, message:"You haven't received an invite from this person"});
              }
              else
              {
                return User.findOne({username:req.params.username.toLowerCase()}, function(err,user) {

                  myselfUser.requestFrom.splice(myselfUser.requestFrom.indexOf(req.params.username.toLowerCase()), 1);
                  myselfUser.requestFrom = myselfUser.requestFrom.sort();
                  //myselfUser.friends.push(req.params.username);
                  
                  user.askedToBeFriend.splice(user.askedToBeFriend.indexOf(myselfUser.username),1);
                  user.askedToBeFriend = user.askedToBeFriend.sort();
                  user.bannedBy.push(myselfUser.username);
                  user.bannedBy = user.bannedBy.sort();

                  myselfUser.save(function(err) {
                    console.log(err);
                    if(!err) {
                      
                      user.save(function(err2) {
                        console.log(err2);
                        if(!err2) {
                          console.log('Updated');
                          res.statusCode = 200;
                          return res.send({ status: 200, user:myselfUser });
                          // TODO : SEND PUSH TO THE OTHER USER 
                        } else {
                          if(err2.name == 'ValidationError') {
                            res.statusCode = 400;
                            res.send({ status:400, message: 'Validation error' });
                          } else {
                            res.statusCode = 500;
                            res.send({ status: 500 });
                          }
                          console.log('Internal error(%d): %s',res.statusCode,err2.message);
                        }
                      });

                    } else {
                      if(err.name == 'ValidationError') {
                        res.statusCode = 400;
                        res.send({ status:400, message: 'Validation error' });
                      } else {
                        res.statusCode = 500;
                        res.send({ status: 500 });
                      }
                      console.log('Internal error(%d): %s',res.statusCode,err.message);
                    }
                  }); // 1st save
            
              }); // findOne    
            }
        
        }
        else {
          res.statusCode = 403;
          return res.send({status:403, message: 'Bad Authentication.'});
        }
    });
  };

  /**
   * Remove a friend
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  removeFriend = function(req, res) {
    console.log("POST - /friend/remove/:username");
    if(req.body.myUsername != null) { req.body.myUsername = req.body.myUsername.toLowerCase(); }
    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {
           
              if(!myselfUser.friends.contains(req.params.username.toLowerCase()))
              {
                res.statusCode = 400;
                return res.send({status:400, message:"You haven't this person as a friend"});
              }
              else
              {
                return User.findOne({username:req.params.username.toLowerCase()}, function(err,user) {

                  myselfUser.friends.splice(myselfUser.friends.indexOf(req.params.username.toLowerCase()), 1);
                  myselfUser.friends = myselfUser.friends.sort();
                  user.friends.splice(user.friends.indexOf(myselfUser.username),1);
                  user.friends = user.friends.sort();

                  myselfUser.save(function(err) {
                    console.log(err);
                    if(!err) {
                      
                      user.save(function(err2) {
                        console.log(err2);
                        if(!err2) {
                          console.log('Updated');
                          res.statusCode = 200;
                          return res.send({ status: 200, user:myselfUser });
                          // TODO : SEND PUSH TO THE OTHER USER 
                        } else {
                          if(err2.name == 'ValidationError') {
                            res.statusCode = 400;
                            res.send({ status:400, message: 'Validation error' });
                          } else {
                            res.statusCode = 500;
                            res.send({ status: 500 });
                          }
                          console.log('Internal error(%d): %s',res.statusCode,err2.message);
                        }
                      });

                    } else {
                      if(err.name == 'ValidationError') {
                        res.statusCode = 400;
                        res.send({ status:400, message: 'Validation error' });
                      } else {
                        res.statusCode = 500;
                        res.send({ status: 500 });
                      }
                      console.log('Internal error(%d): %s',res.statusCode,err.message);
                    }
                  }); // 1st save
            
              }); // findOne    
            }
        
        }
        else {
          res.statusCode = 403;
          return res.send({status:403, message: 'Bad Authentication.'});
        }
    });
  };

  //Link routes and actions
  app.post('/friend/add/username/:username'   , addFriend);
  app.post('/friend/add/email/:email', addFriendEmail);
  app.post('/friend/accept/:username', acceptFriend);
  app.post('/friend/refuse/:username', refuseFriend);
  app.post('/friend/remove/:username', removeFriend);

}