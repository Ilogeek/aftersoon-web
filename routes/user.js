/**
 * User
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

  var User = require('../models/user');

  var Event = require('../models/event');

  /**
   * Find and retrieves all users
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  findAllUsers = function(req, res) {
    console.log("POST - /users");
    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

            // function findAllUsers
            return User.find(function(err, users) {
              if(!err) {
                return res.send(users);
              } else {
                res.statusCode = 500;
                console.log('Internal error(%d): %s',res.statusCode,err.message);
                return res.send({ error: 'Server error' });
              }
            });
        
        }
        else {
          return res.send({error: 'Bad Authentication.'});
        }
    });
  };



  /**
   * Find and retrieves a single user by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  findOne = function(req, res) {

    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

          //Solution by Username which is unique so its like an ID
          console.log("GET - /user/:username");
          return User.findOne({username:req.params.username}, function(err,user) {
          
          // Solution by ID
          //console.log("GET - /user/:id");
          //return User.findById(req.params.id, function(err, user) {

            if(!user) {
              res.statusCode = 404;
              return res.send({ error: 'Not found' });
            }

            if(!err) {
              return res.send({ status: 'OK', user:user });
            } else {

              res.statusCode = 500;
              console.log('Internal error(%d): %s', res.statusCode, err.message);
              return res.send({ error: 'Server error' });
            }
          });


          }
          else {
            return res.send({error: 'Bad Authentication.'});
          }
        });
  };




  /**
   * Creates a new user from the data request
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  addUser = function(req, res) {

    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was failure
        if (!myselfUser) {

            console.log('POST - /user');
            console.log(req.is('json'));
            console.log(req.body);

            var user = new User({
                email: req.body.email,
                password: req.body.password,
                username: req.body.username,
                adresse: req.body.adresse
            });

            if (req.body.gps != null) user.gps = req.body.gps;
            if (req.body.telephone != null) user.telephone = req.body.telephone;

            user.save(function(err) {

              if(err) {

                console.log('Error while saving user : ' + err);
                res.send({ error:err });
                return;

              } else {

                console.log("User created");
                return res.send({ status: 'OK', user:user });

              }

            });



      }
      else {
        return res.send({error: 'Already logged.'});
      }
    });

  };



  /**
   * Update a user by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  updateUser = function(req, res) {


    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser) {

              //Solution by Username which is unique so its like an ID
              console.log("PUT - /user/:username");
              return User.findOne({username:req.params.username}, function(err,user) {
              
              // Solution by ID
              //console.log("PUT - /user/:id");
              //return User.findById(req.params.id, function(err, user) {

                if(!user) {
                  res.statusCode = 404;
                  return res.send({ error: 'Not found' });
                }

                // we dont want the user to update its username right ?

                if (req.body.email != null) user.email = req.body.email;
                if (req.body.adresse != null) user.adresse = req.body.adresse;
                if (req.body.newPassword != null) user.password = req.body.newPassword;
                if (req.body.gps != null) user.gps = req.body.gps;
                if (req.body.telephone != null) user.telephone = req.body.telephone;

                return user.save(function(err) {
                  if(!err) {
                    console.log('Updated');
                    return res.send({ status: 'OK', user:user });
                  } else {
                    if(err.name == 'ValidationError') {
                      res.statusCode = 400;
                      res.send({ error: 'Validation error' });
                    } else {
                      res.statusCode = 500;
                      res.send({ error: 'Server error' });
                    }
                    console.log('Internal error(%d): %s',res.statusCode,err.message);
                  }

                  res.send(user);

                });
              });

          }
          else {
            return res.send({error: 'Bad Authentication.'});
          }
        });
  };



  /**
   * Delete a user by its ID
   * @param {Object} req HTTP request object.
   * @param {Object} res HTTP response object.
   */
  deleteUser = function(req, res) {

    User.getAuthenticated(req.body.myUsername, req.body.myPassword, function(err, myselfUser, reason) {
        if (err) throw err;
        
        // login was successful if we have a user
        if (myselfUser && myselfUser.username == req.params.username) {

            //Solution by Username which is unique so its like an ID
            console.log("DELETE - /user/:username");
            return User.findOne({username:req.params.username}, function(err,user) {
            
            // Solution by ID
            // console.log("DELETE - /user/:id");
            //return User.findById(req.params.id, function(err, user) {
              
              if(!user) {
                res.statusCode = 404;
                return res.send({ error: 'Not found' });
              }

              return user.remove(function(err) {
                if(!err) {
                  console.log('Removed user');
                  return res.send({ status: 'OK' });
                } else {
                  res.statusCode = 500;
                  console.log('Internal error(%d): %s',res.statusCode,err.message);
                  return res.send({ error: 'Server error' });
                }
              })
            });



          }
          else {
            return res.send({error: 'Bad Authentication.'});
          }
        });
  }

  //Link routes and actions
  app.post('/users', findAllUsers);
  // dont forget to change :username by :id if we switch in the fonction 
  app.post('/user/:username', findOne);
  app.post('/user', addUser);
  // dont forget to change :username by :id if we switch in the fonction 
  app.put('/user/:username', updateUser);
  // dont forget to change :username by :id if we switch in the fonction 
  app.delete('/user/:username', deleteUser);

}