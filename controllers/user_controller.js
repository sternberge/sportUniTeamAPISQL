var db = require('./../db');
var expressValidator = require('express-validator');
const AuthenticateController = require('../controllers/authenticate_controller');
var promise = require('promise');
var bcrypt = require('bcrypt'); // algo de hash
const saltRounds = 10;

module.exports = {

  findUserById (req, res) {
    const userId = req.params.user_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM Users WHERE userID = ?', userId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));// Convertion de la réponse en format JSON
        }
        else if (results.length > 0){
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        }
        else{
          res.send(JSON.stringify({"status": 500, "error": "Id does not exist", "response": null}));
          connection.release(); // CLOSE THE CONNECTION
        }
      });
    });
  },



  createUser(req, res, next){
    module.exports.checkEmailUnicity(req.body.email)
    .then(() => module.exports.createUserWithPromise(req, res, next))
    .then(() => {
      res.send(JSON.stringify({"status": 200, "error": null, "response": "User has been created"}));
    })
    .catch((error) => {
      res.send(JSON.stringify({"status": 500, "error": error, "response": error}));
    })
  },

  createUserWithPromise(req,res,next){

    return new Promise(function (resolve, reject) {

      // rajouter le check si l'utilisateur n'est pas déja existant
      // different type of check of the informations
      req.checkBody('email','Email cannot be empty').notEmpty();
      req.checkBody('email','Your email is not valid').isEmail();
      req.checkBody('email','Your email should be between 4 and 100 characters').len(4,100);
      req.checkBody('firstName','FirstName cannot be empty').notEmpty();
      req.checkBody('lastName','Email cannot be empty').notEmpty();
      req.checkBody('password','Your password should be between 8 and 100 characters').len(8,100);
      req.checkBody('reEnterPassword','Your password is different').equals(req.body.password);
      var errors = req.validationErrors();

      if(errors){
        reject(errors);
        return res.send(errors);
      }

      else{
        const firstName= req.body.firstName;
        const lastName=req.body.lastName;
        const gender= req.body.gender;
        const email= req.body.email;
        const password= req.body.password;
        const birthday= req.body.birthday;
        const userType= req.body.userType;
        const phone = req.body.phone;

        db.pool.getConnection((error, connection) => {
          if (error){
            reject(error);
            return; // Pour sortir de la methode
          }
          //hash of the password and insert in the database
          bcrypt.hash(password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            var query = connection.query('INSERT INTO Users (firstName,lastName,gender,email,password,birthday,userType,phone) VALUES(?, ?, ?, ?, ?, ?, ?, ?)',
            [firstName,lastName,gender,email,hash,birthday,userType,phone], (error, results, fields) => {
              if (error){
                connection.release();
                reject(error);
                return; // pour sortir de la methode
              }
              //res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
              connection.release(); // CLOSE THE CONNECTION
              resolve(results.insertId);
            });
          });
        });
      }
    })
  },

  editUser(req, res, next) {
    const userId = req.params.user_id;
    const userProperties = req.body;
    db.pool.getConnection((error, connection) => {
      const userProp = req.body;
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE Users SET ? WHERE userID = ?',[userProperties, userId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  deleteUser(req, res, next) {
    const userId = req.params.user_id;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM Users WHERE userID = ?', userId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  // check de l'email pour la création et l'update du User
  checkEmailUnicity(email){
    return new Promise((resolve,reject) => {
      db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var query = connection.query('Select 1 from Users Where email = ?', email, (error, results, fields) => {
          if (error){
            connection.release();
            return reject(error);
          }
          connection.release(); // CLOSE THE CONNECTION
          if(results.length > 0){
            reject("Email already used");

          }
          else{
            resolve();
          }
        });
      });
    });
  },

  // check de l'email pour la création et l'update du User
  checkEmailExistence(email){
    return new Promise((resolve,reject) => {

      db.pool.getConnection((error, connection) => {

        if (error){
          return reject(error);
        }
        var query = connection.query('Select userId, firstName, lastName, u.gender, email, password, birthday, userType, phone, p.playerId, p.status, c.coachId, c.coachType, count(Coaches_coachId) as teamNumberOfTheCoach from Users  u Left Join Players p on u.userId = p.Users_userId Left Join Coaches c on u.userId = c.Users_userId Left Join Teams t on t.Coaches_coachId = c.coachId Where email = ?', email, (error, results, fields) => {
          if (error){
            connection.release();
            return reject(error);
          }
          connection.release(); // CLOSE THE CONNECTION
          if(results.length > 0){
            resolve(JSON.stringify(results));
          }
          else{
            reject("Email doesn't exists");
          }
        });
      });
    });
  },

  // check de l'email pour la création et l'update du User
  checkPassword(results, req){
    return new Promise((resolve,reject) => {
      var objectValue = JSON.parse(results);
      bcrypt.compare(req.body.password, objectValue[0].password, function(err, res) {
        if(err){
          return reject(err);
        }
        if(res){
          resolve(objectValue);
        }
        else {
          reject("Password incorrect");
        }
      });
    });
  },

  authentication (req, res, next){
    module.exports.checkEmailExistence(req.body.email)
    .then((results) => module.exports.checkPassword(results, req))
    .then((results) => AuthenticateController.authenticate(results))
    .then((token) => res.send(JSON.stringify({"status": 200, "error": null, "response": token})))
    .catch((error) => {
      res.send(JSON.stringify({"status": 500, "error": error, "response": error}));
    })
  }

};
