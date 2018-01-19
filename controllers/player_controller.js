var db = require('./../db');
const UserController = require('../controllers/user_controller');
var expressValidator = require('express-validator');
const RankRulesController = require('../controllers/rank_rules_controller');

module.exports = {

  findPlayerById (req, res) {
    const playerId = req.params.player_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM Players WHERE playerID = ?', playerId, (error, results, fields) => {
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



  createPlayer(req, res, next) {
    // Check si l'email n'est pas deja dans la bdd
    UserController.checkEmailUnicity(req.body.email)
    //Creation du User
    .then(() => UserController.createUserWithPromise(req, res, next))
    //Creation du Player à l'aide du userId passé en parametre
    .then((userId)=>{
      return module.exports.insertPlayer(userId,req);
    })
    //
    .then((response)=>{
      //Recupere les derniers classements des 3 types
      var rankingType = ["S","D","T"];
      return Promise.all(rankingType.map((rank) => {
        RankRulesController.getLastRankingPerType(rank);
      }));

    })
    .then(function(response) {
      console.log(response);
      console.log("Second then");
      res.send(JSON.stringify({"status": 200, "error": null, "response": response}));
    })
    //Les erreurs survenues plus haut sont catch ici
    .catch((err) => {
      res.send(JSON.stringify({"status": 500, "error": err, "response": null}));
    });
  },

  insertPlayer(userId,req){
    return new Promise((resolve,reject) => {
    db.pool.getConnection((error, connection) => {
      //erreur de connection
      if (error){
        return reject(error);
      }
      var playerTeam = req.body.playerTeam;
      var playerStatus = req.body.playerStatus;

      //requete d'insertion
      var query = connection.query('INSERT INTO Players (Teams_teamId,Users_userId,status) VALUES  (?,?,?)',
      [playerTeam, userId, playerStatus], (error, results, fields) => {
        //erreur d'insertion
        if (error){
          connection.release();
          return reject(error);
        }
        resolve(results.insertId);
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  });
},

  editPlayer(req, res, next) {
    const playerId = req.params.player_id;
    const playerProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE Players SET ? WHERE PlayerID = ?',[playerProperties, playerId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  deletePlayer(req, res, next) {
    const playerId = req.params.player_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM Players WHERE PlayerID = ?', playerId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  generateMyPlayerDropDownList(req, res, next){
    const coachId = req.params.coach_id;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT p.playerId, u.firstName,u.lastName FROM Players p inner join Teams t on p.Teams_teamId = t.teamId inner join Users u on u.userId = p.Users_userId WHERE teamId = (SELECT teamId FROM Teams WHERE Coaches_coachId = ? or Coaches_headCoachId = ?);',[coachId,coachId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  generateOtherPlayerDropDownList(req, res, next){
    const coachId = req.params.coach_id;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT p.playerId, u.firstName,u.lastName FROM Players p inner join Teams t on p.Teams_teamId = t.teamId inner join Users u on u.userId = p.Users_userId WHERE teamId != (SELECT teamId FROM Teams WHERE Coaches_coachId = ? or Coaches_headCoachId = ?);',[coachId,coachId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  getPlayerNameFromId(req, res, next){
    const playerId = req.params.playerId;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT concat(u.firstName, ' ',u.lastName) as playerName FROM Players p INNER JOIN Users u on u.userId = p.Users_userId WHERE p.playerId = ?`,playerId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },


  getAllPlayerId(){
    return new Promise((resolve,reject) => {
    db.pool.getConnection((error, connection) => {

      if (error){
        return reject(error);
      }
      var query = connection.query(`SELECT playerId from Players`, (error, results, fields) => {
        if (error){
          connection.release();
          return reject(error);
        }
        resolve(results);
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  });
  }
};
