var db = require('./../db');
var expressValidator = require('express-validator');
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
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  createUser(req, res, next) {
    // rajouter le check si l'utilisateur n'est pas déja existant
    //different type of check of the informations
    req.checkBody('email','Email cannot be empty').notEmpty();
    req.checkBody('email','Your email is not valid').isEmail();
    req.checkBody('email','Your email should be between 4 and 100 characters').len(4,100);
    req.checkBody('firstName','FirstName cannot be empty').notEmpty();
    req.checkBody('lastName','Email cannot be empty').notEmpty();
    req.checkBody('password','Your password should be between 8 and 100 characters').len(8,100);
    req.checkBody('reEnterPassword','Your password is different').equals(req.body.password);
    var errors = req.validationErrors();

    if(errors){
      res.send(errors);
    }

    else{
        const firstName= req.body.firstName;
        const lastName=req.body.lastName;
        const gender= req.body.gender;
        const email= req.body.email;
        const password= req.body.password;
        const birthday= req.body.birthday;
        const userType= req.body.userType;

        db.pool.getConnection((error, connection) => {
          if (error){
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          //hash of the password and insert in the database
          bcrypt.hash(password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            var query = connection.query('INSERT INTO Users (firstName,lastName,gender,email,password,birthday,userType) VALUES(?, ?, ?, ?, ?, ?, ?)',
            [firstName,lastName,gender,email,hash,birthday,userType], (error, results, fields) => {
              if (error){
                connection.release();
                return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
              }
              res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
              connection.release(); // CLOSE THE CONNECTION
              console.log("test1");
              return (results.insertId);
            });
          });
        });
      }
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
      db.pool.getConnection((error, connection) => {

        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var query = connection.query('Select 1 from Users Where email = ?', email, (error, results, fields) => {
          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        });
      });
    }
  };
