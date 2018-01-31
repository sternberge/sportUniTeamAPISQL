const getAllPlayersByTeamId = (req, res) => {
  const teamId = req.params.teamId;
  db.pool.getConnection((error, connection) => {

    if (error) {
      return res.send(JSON.stringify({
        "status": 500,
        "error": error,
        "response": null
      }));
    }
    var query = connection.query(`SELECT p.playerId, concat(u.firstName,' ',u.lastName) as fullName,
    p.status, c.name as collegeName, sr.rank as nationalSingleRank
    FROM Players p
    INNER JOIN Users u on p.Users_userId = u.userId
    INNER JOIN Teams t on t.teamId = p.Teams_teamId
    INNER JOIN Colleges c on t.Colleges_collegeId = c.collegeId
    INNER JOIN SingleRanking sr on sr.Players_playerId = p.playerId
    WHERE Teams_teamId = ? AND sr.type = 'N'
    ORDER BY p.status`, teamId, (error, results, fields) => {
      if (error) {
        connection.release();
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      res.send(JSON.stringify({
        "status": 200,
        "error": null,
        "response": results
      }));
      connection.release(); // CLOSE THE CONNECTION
    });
  });
}

module.exports = {

  getAllPlayersByTeamId,

  getPlayerTeamId(playerId) {
    return new Promise((resolve, reject) => {
      db.pool.getConnection((error, connection) => {
        if (error) {
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        // L'ajout du '?' permet d'éviter les injections sql
        var query = connection.query('SELECT Teams_teamId FROM Players WHERE playerId = ?', playerId, (error, results, fields) => {
          if (error) {
            connection.release();
            return reject(error);
          } else if (results.length > 0) {
            resolve(results[0].Teams_teamId);
            connection.release(); // CLOSE THE CONNECTION
          } else {
            reject();
            connection.release(); // CLOSE THE CONNECTION
          }
        });
      });
    });
  },

  findPlayerById(req, res) {
    const playerId = req.params.player_id;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM Players WHERE playerID = ?', playerId, (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        } else if (results.length > 0) {
          res.send(JSON.stringify({
            "status": 200,
            "error": null,
            "response": results
          }));
          connection.release(); // CLOSE THE CONNECTION
        } else {
          res.send(JSON.stringify({
            "status": 500,
            "error": "Id does not exist",
            "response": null
          }));
          connection.release(); // CLOSE THE CONNECTION
        }
      });
    });
  },


  async createPlayer(req, res) {
    try {
      //Ouverture de la transaction
      var connection = await db.getConnectionForTransaction(db.pool);
      //Check si l'email n'est pas deja existant
      await UserController.checkEmailUnicity(connection, req.body.email);
      // Check cohérence genre team du joueur et genre du joueur
      const gender = await TeamController.findTeamById(connection, req);
      if (gender != req.body.gender) {
        throw "Gender incorrect";
      }
      //Creation du profil utilisateur classique
      const userId = await UserController.createUserWithPromise(connection, req);
      //creation du player grace au userId crée juste avant
      const playerId = await module.exports.insertPlayer(connection, userId, req);
      console.log("Le joueur cree a le player Id :", playerId);
      // On récupère le classement unranked pour le classements simples
      var nonRankedValueSingle = await RankRulesController.getLastRankingPerType(connection, "S");
      console.log("Valeur unranked pour classement simple :", nonRankedValueSingle);
      //On cree 3 classements unranked Single pour le regional national et country
      var type = ["R", "N", "C"];
      const promisesPerType = type.map(type =>
        SingleRankingController.createInitialRanking(connection, nonRankedValueSingle, playerId, type)
        .catch((error) => {
          console.log(error);
        })
      );
      const resu = await Promise.all(promisesPerType);
      // Fermeture de la transaction
      await db.closeConnectionTransaction(connection);
      res.send(JSON.stringify({
        "status": 200,
        "error": null,
        "response": "Player has been created"
      }));
    } catch (error) {
      //console.log(error);
      res.status(500).send(JSON.stringify({
        "error": error
      }));
    }
  },

  insertPlayer(connection, userId, req) {
    return new Promise((resolve, reject) => {
      var playerTeam = req.body.playerTeam;
      var playerStatus = req.body.playerStatus;
      //requete d'insertion
      var query = connection.query('INSERT INTO Players (Teams_teamId,Users_userId,status) VALUES  (?,?,?)', [playerTeam, userId, playerStatus], (error, results, fields) => {
        //erreur d'insertion
        if (error) {
          return reject(error);
        }
        resolve(results.insertId);
      });
    });
  },

  editPlayer(req, res, next) {
    const playerId = req.params.player_id;
    const playerProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query('UPDATE Players SET ? WHERE PlayerID = ?', [playerProperties, playerId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  deletePlayer(req, res, next) {
    const playerId = req.params.player_id;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query('DELETE FROM Players WHERE PlayerID = ?', playerId, (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },



  generateMyPlayerDropDownList(req, res, next) {
    const coachId = req.params.coach_id;
    const gender = req.params.gender;
    db.pool.getConnection((error, connection) => {


      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }

      var query = connection.query('SELECT p.playerId, u.firstName,u.lastName,concat(u.firstName,\' \',u.lastName) as fullName FROM Players p inner join Teams t on p.Teams_teamId = t.teamId inner join Users u on u.userId = p.Users_userId WHERE teamId in (SELECT teamId FROM Teams WHERE Coaches_coachId = ? or Coaches_headCoachId = ?) AND u.gender = ?;', [coachId, coachId, gender], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },



  generateOtherPlayerDropDownList(req, res, next) {
    const coachId = req.params.coach_id;
    const gender = req.params.gender;
    db.pool.getConnection((error, connection) => {

      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }

      var query = connection.query('SELECT p.playerId, u.firstName,u.lastName,concat(u.firstName,\' \',u.lastName) as fullName  FROM Players p inner join Teams t on p.Teams_teamId = t.teamId inner join Users u on u.userId = p.Users_userId WHERE teamId not in (SELECT teamId FROM Teams WHERE Coaches_coachId = ? or Coaches_headCoachId = ?) AND u.gender = ?;', [coachId, coachId, gender], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
      });

    });
  },

  getPlayerNameFromId(req, res, next) {
    const playerId = req.params.playerId;
    db.pool.getConnection((error, connection) => {

      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT concat(u.firstName, ' ',u.lastName) as playerName FROM Players p INNER JOIN Users u on u.userId = p.Users_userId WHERE p.playerId = ?`, playerId, (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  getPlayerInformationByPlayerId(req, res, next) {
    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {

      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT * FROM Players p
        INNER JOIN Users u on p.Users_userId = u.userId
        INNER JOIN Teams t on t.teamId = p.Teams_teamId
        INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
        INNER JOIN Leagues l on l.leagueId = c.Leagues_leagueId
        INNER JOIN Conferences co on co.conferenceId = c.Conferences_conferenceId
        INNER JOIN Regions r on r.regionId = c.Regions_regionId
        WHERE p.playerId = ?`, playerId, (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },


  getPlayersByTeamId(req, res, next)
  {
    const teamId = req.params.teamId;
    db.pool.getConnection((error, connection) => {

      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT p.playerId, concat(u.firstName,' ',u.lastName) as fullName ,c.name as collegeName
      FROM Players p INNER JOIN Users u on p.Users_userId = u.userId
      INNER JOIN Teams t on t.teamId = p.Teams_teamId
      INNER JOIN Colleges c on t.Colleges_collegeId = c.collegeId
      WHERE Teams_teamId = ?`, teamId, (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  verifyPlayer(req, res, next) {

    var playerEmail = req.params.playerEmail;
    var password = "";
    var hashGenerated = "";

    let coachExist = false;

    db.pool.getConnection((error, connection) => {
      //erreur de connection
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var queryTest = connection.query('select *from Users where email = ? AND userType = player',playerEmail, (error, results, fields) => {
        console.log('Lenght de result : '+results.length);
        if(results.length > 0 )
        {
          coachExist = true;
          console.log('Le mail existe');
        }
        else {
          res.send(JSON.stringify({"status": 500, "error": 'The user does not exist', "response": 'the user does not exist'}));
          console.log('Le mail n\'existe pas');
        }
      });

      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 8; i++)
      password += possible.charAt(Math.floor(Math.random() * possible.length));


      bcrypt.hash(password, saltRounds, function(err, hash) {
        console.log("Hash : " + hash);
        hashGenerated = hash;

        var query = connection.query('UPDATE Users SET password = ? WHERE email = ?',
        [hashGenerated,playerEmail], (error, results, fields) => {

          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }

          if(coachExist)
          {

            console.log('coach existe ' + coachExist);
            if(coachExist)
            {
              transporter.sendMail({
                from: 'testservicenodemailer@gmail.com',
                to: playerEmail,
                subject: 'SUT Team : Your password for the application',
                text: 'Please find your password for the application ' + password
              }, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response + ' password = ' + password);
                }
              });
            }
            res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          }

          connection.release(); // CLOSE THE CONNECTION
        });

      });
    });
  },
};

var db = require('./../db');
const UserController = require('../controllers/user_controller');
var expressValidator = require('express-validator');
const RankRulesController = require('../controllers/rank_rules_controller');
const TeamController = require('../controllers/teams_controller');
const SingleRankingController = require('../controllers/single_ranking_controller');
