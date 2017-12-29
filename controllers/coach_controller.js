var db = require('./../db');
const UserController = require('../controllers/user_controller');
var expressValidator = require('express-validator');


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


  
  createCoach(req, res, next) {
    UserController.checkEmailUnicity(req.body.email)
    .then(() => UserController.createUserWithPromise(req, res, next))
    .then((userId)=>{
      db.pool.getConnection((error, connection) => {
        //erreur de connection
        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var coachType = req.body.coachType;
        //requete d'insertion
        var query = connection.query('INSERT INTO Coaches (Users_userId,coachType) VALUES  (?,?)',
        [userId, coachType], (error, results, fields) => {
          //erreur d'insertion
          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }

          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION

        });
      });
    })
    .catch((err) => {
      return res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
    });
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
  }


};
