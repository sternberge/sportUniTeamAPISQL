var db = require('./../db');
var expressValidator = require('express-validator');
var bcrypt = require('bcrypt');
const saltRounds = 10;

module.exports = {

  findCoachById (req, res) {
    const coachId = req.params.coach_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM Coaches WHERE CoachID = ?', coachId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  createCoach(req, res, next) {
    // rajouter le check si l'utilisateur n'est pas déja existant
    //different type of check of the informations
    req.checkBody('email','Email cannot be empty').notEmpty();
    req.checkBody('email','Your email is not valid').isEmail();
    req.checkBody('email','Your email should be between 4 and 100 characters').len(4,100);
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
        const CoachType= req.body.CoachType;

        db.pool.getConnection((error, connection) => {
          if (error){
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          //hash of the password and insert in the database
          bcrypt.hash(password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            var query = connection.query('INSERT INTO Coachs (firstName,lastName,gender,email,password,birthday,CoachType) VALUES(?, ?, ?, ?, ?, ?, ?)',
            [firstName,lastName,gender,email,hash,birthday,CoachType], (error, results, fields) => {
              if (error){
                connection.release();
                return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
              }
              res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
              connection.release(); // CLOSE THE CONNECTION
            });
          });
        });
      }
    },

    editCoach(req, res, next) {
      const coachId = req.params.coach_id;
      const coachProperties = req.body;
      db.pool.getConnection((error, connection) => {
        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var query = connection.query('UPDATE Coaches SET ? WHERE CoachID = ?',[coachProperties, coachId], (error, results, fields) => {
          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        });
      });
    },

    deleteCoach(req, res, next) {
      const coachId = req.params.coach_id;
      db.pool.getConnection((error, connection) => {

        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var query = connection.query('DELETE FROM Coaches WHERE CoachID = ?', coachId, (error, results, fields) => {
          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        });
      });
    },

    // check de l'email pour la création et l'update du Coach
    checkEmailUnicity(email){
      db.pool.getConnection((error, connection) => {

        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var query = connection.query('Select 1 from Coachs Where email = ?', email, (error, results, fields) => {
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
