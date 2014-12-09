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
 }


module.exports = function(app) {

  var bodyParser = require('body-parser');

  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }))

  // parse application/json
  app.use(bodyParser.json())

  var User = require('../models/user');

  /**
   * Add a friend
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  addFriend = function(req, res) {
    console.log("POST - /friend/add/:username");
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
                user.requestFrom.push(myselfUser.username);

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
                return User.findOne({username:req.params.username}, function(err,user) {

                  myselfUser.requestFrom.splice(myselfUser.requestFrom.indexOf(req.params.username), 1);
                  myselfUser.friends.push(req.params.username);
                  
                  user.askedToBeFriend.splice(user.askedToBeFriend.indexOf(myselfUser.username),1);
                  user.friends.push(myselfUser.username)

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
   * Refuse a friend request
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  refuseFriend = function(req, res) {
    console.log("POST - /friend/refuse/:username");
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
                return User.findOne({username:req.params.username}, function(err,user) {

                  myselfUser.requestFrom.splice(myselfUser.requestFrom.indexOf(req.params.username), 1);
                  //myselfUser.friends.push(req.params.username);
                  
                  user.askedToBeFriend.splice(user.askedToBeFriend.indexOf(myselfUser.username),1);
                  user.bannedBy.push(myselfUser.username)

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
    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

         

           
              if(!myselfUser.friends.contains(req.params.username))
              {
                res.statusCode = 400;
                return res.send({status:400, message:"You haven't this person as a friend"});
              }
              else
              {
                return User.findOne({username:req.params.username}, function(err,user) {

                  myselfUser.friends.splice(myselfUser.friends.indexOf(req.params.username), 1);
                  user.friends.splice(user.friends.indexOf(myselfUser.username),1);

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
  app.post('/friend/add/:username', addFriend);
  app.post('/friend/accept/:username', acceptFriend);
  app.post('/friend/refuse/:username', refuseFriend);
  app.post('/friend/remove/:username', removeFriend);

}