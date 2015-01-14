/**
 * User
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
   * Find and retrieves all users
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  findAllUsers = function(req, res) {
    console.log("POST - /users");
    User.getAuthenticated(req.body.myUsername.toLowerCase(), req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

            // function findAllUsers
            return User.find(function(err, users) {
              if(!err) {
                res.statusCode = 200;
                return res.send({status: 200, users:users});
              } else {
                res.statusCode = 500;
                console.log('Internal error(%d): %s',res.statusCode,err.message);
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
   * Find and retrieves a single user by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  findOneUser = function(req, res) {

    User.getAuthenticated(req.body.myUsername.toLowerCase(), req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

          //Solution by Username which is unique so its like an ID
          console.log("POST - /user/:username");
          return User.findOne({username:req.params.username.toLowerCase()}, function(err,user) {
          
          // Solution by ID
          //console.log("GET - /user/:id");
          //return User.findById(req.params.id, function(err, user) {

            if(!user) {
              res.statusCode = 404;
              return res.send({ status: 404 });
            }

            if(!err) {
              res.statusCode = 200;
              return res.send({ status: 200, user:user });
            } else {

              res.statusCode = 500;
              console.log('Internal error(%d): %s', res.statusCode, err.message);
              return res.send({ status: 500 });
            }
          });


          }
          else {
            res.statusCode = 403;
            return res.send({status:403, message : 'Bad Authentication.'});
          }
        });
  };




  /**
   * Creates a new user from the data request
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  addUser = function(req, res) {
    if(req.body.myUsername != null) { req.body.myUsername = req.body.myUsername.toLowerCase(); }
    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was failure
        if (!myselfUser) {

            console.log('POST - /user');
            console.log(req.is('json'));
            console.log(req.body);

            var user = new User({
                email    : req.body.email,
                password : req.body.password,
                username : req.body.username.toLowerCase(),
                adresse  : req.body.adresse,
                GCMid    : req.body.GCMid
            });

            if (req.body.gps != null)       user.gps       = req.body.gps;
            if (req.body.telephone != null) user.telephone = req.body.telephone;

            user.save(function(err) {

              if(err) {
                res.statusCode = 400;
                console.log('Error while saving user : ' + err);
                res.send({status:400, message:err });
                return;

              } else {
                res.statusCode = 200;
                console.log("User created");
                return res.send({ status: 200, user:user });

              }

            });



      }
      else {
        res.statusCode = 403;
        return res.send({status:403, message: 'Already logged.'});
      }
    });

  };



  /**
   * Update a user by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  updateUser = function(req, res) {


    User.getAuthenticated(req.body.myUsername.toLowerCase(), req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

              //Solution by Username which is unique so its like an ID
              console.log("PUT - /user");
              return User.findOne({username:req.body.myUsername.toLowerCase()}, function(err,user) {
              
              // Solution by ID
              //console.log("PUT - /user/:id");
              //return User.findById(req.params.id, function(err, user) {

                if(!user) {
                  res.statusCode = 404;
                  return res.send({ status: 404 });
                }

                // we dont want the user to update its username right ?

                if (req.body.email != null) user.email = req.body.email;
                if (req.body.adresse != null) user.adresse = req.body.adresse;
                if (req.body.newPassword != null) user.password = req.body.newPassword;
                if (req.body.gps != null) user.gps = req.body.gps;
                if (req.body.telephone != null) user.telephone = req.body.telephone;
                if (req.body.GCMid != null && !user.GCMid.contains(req.body.GCMid)) user.GCMid.push(req.body.GCMid);

                return user.save(function(err) {
                  console.log(err);
                  if(!err) {
                    console.log('Updated');
                    res.statusCode = 200;
                    return res.send({ status: 200, user:user });
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

                  //res.send(user);

                });
              });

          }
          else {
            res.statusCode = 403;
            return res.send({status:403, message: 'Bad Authentication.'});
          }
        });
  };



  /**
   * Delete a user by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  deleteUser = function(req, res) {

    User.getAuthenticated(req.body.myUsername.toLowerCase(), req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

            //Solution by Username which is unique so its like an ID
            console.log("DELETE - /user/:username");
            
              return myselfUser.remove(function(err) {
                if(!err) {
                  console.log('Removed user');
                  res.statusCode = 200;
                  return res.send({ status: 200 });
                } else {
                  res.statusCode = 500;
                  console.log('Internal error(%d): %s',res.statusCode,err.message);
                  return res.send({ status: 500 });
                }
              });



          }
          else {
            res.statusCode = 403;
            return res.send({status:403, message: 'Bad Authentication.'});
          }
        });
  }

  function isNicknameTaken(req, res){
      return User.findOne({username:req.params.username.toLowerCase()}, function(err,user) {
      
        if(!user) {
          res.statusCode = 200;
          return res.send({ status: 200, exist: 0 });
        }

        if(!err) {
          res.statusCode = 200;
          return res.send({ status: 200, exist: 1 });
        } else {

          res.statusCode = 500;
          console.log('Internal error(%d): %s', res.statusCode, err.message);
          return res.send({ status: 500, exist: -1 });
        }
      });
  }

  function deleteThisGCMid(req, res){
    User.getAuthenticated(req.body.myUsername.toLowerCase(), req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

            //Solution by Username which is unique so its like an ID
            console.log("POST - /user/logout");
            
             if(myselfUser.GCMid.contains(req.body.GCMid))
             {
                myselfUser.GCMid.splice(myselfUser.GCMid.indexOf(req.body.GCMid),1); 
                myselfUser.save(function(err) {});
                res.statusCode = 200;
                return res.send({status:200, message: 'GCMid Removed.'});  
             }

          }
          else {
            res.statusCode = 403;
            return res.send({status:403, message: 'Bad Authentication.'});
          }
        });
  }

  function addThisGCMid(req, res){
    User.getAuthenticated(req.body.myUsername.toLowerCase(), req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

            //Solution by Username which is unique so its like an ID
            console.log("POST - /user/login");
            
             if(!myselfUser.GCMid.contains(req.body.GCMid) && req.body.GCMid != null)
             {
                myselfUser.GCMid.push(req.body.GCMid); 
                myselfUser.save(function(err) {});
                res.statusCode = 200;
                return res.send({status:200, message: 'Connected, GCMid Added.'});
             }
             else if(req.body.GCMid != null)
             {
                res.statusCode = 400;
                return res.send({status:400, message: 'Connected, BUT GCMid already existed.'});
             }
             else
             {
                res.statusCode = 400;
                return res.send({status:400, message: 'Connected, BUT NO GCMID GIVEN !'});
             }

          }
          else {
            res.statusCode = 403;
            return res.send({status:403, message: 'Bad Authentication.'});
          }
        });
  }

  //Link routes and actions
  app.post('/users', findAllUsers);
  // dont forget to change :username by :id if we switch in the fonction 
  app.post('/user/show/:username', findOneUser);
  app.post('/user', addUser);
  // dont forget to change :username by :id if we switch in the fonction 
  app.put('/user', updateUser);
  // dont forget to change :username by :id if we switch in the fonction 
  app.delete('/user', deleteUser);
  app.get('/user/nick/:username', isNicknameTaken);
  app.post('/user/logout', deleteThisGCMid);
  app.post('/user/login', addThisGCMid);
}