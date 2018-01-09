var db = require('./../db');


module.exports = {

  collegesFromConference(req, res, next) {
    const conferenceId = req.params.conferenceId;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT c.collegeId, c.name as name FROM Colleges c WHERE Conferences_conferenceId = ?;', [conferenceId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });

    });
  },

  playersFromCollege(req, res, next) {

    const collegeId = req.params.collegeId;
    const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT p.playerId, concat(u.firstName,\' \',u.lastName) as playerName FROM Players p  INNER JOIN Teams t on p.Teams_teamId = t.teamId   INNER JOIN Users u on p.Users_userId = u.userId  WHERE Colleges_collegeId = ? AND u.gender LIKE ?;', [collegeId,gender], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });

    });
  },

  playersFromTournament(req, res, next) {
    const tournamentId = req.params.tournamentId;
    const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT DISTINCT request.playerId, request.PlayerName as playerName from (SELECT DISTINCT p1.playerId, concat(u1.firstName,\'  \',lastName) as PlayerName FROM SimpleMatches sm INNER JOIN Players p1 on sm.winner = p1.playerId INNER JOIN Users u1 on u1.userId = p1.playerId WHERE sm.Tournaments_tournamentId = ?  AND u1.gender LIKE ? UNION ALL SELECT DISTINCT p2.playerId, concat(u2.firstName,\'  \',u2.lastName) as PlayerName FROM  SimpleMatches sm INNER JOIN Players p2 on sm.loser = p2.playerId INNER JOIN Users u2 on u2.userId = p2.playerId WHERE sm.Tournaments_tournamentId = ? AND u2.gender LIKE ?) as request', [tournamentId,gender,tournamentId,gender], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });

    });
  },

  playersFromConference(req, res, next) {
    const conferenceId = req.params.conferenceId;
    const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT p.playerId, concat(u.firstName,\' \',u.lastName) as playerName FROM Players p INNER JOIN Teams t on p.Teams_teamId = t.teamId INNER JOIN Colleges c ON c.collegeId = t.Colleges_collegeId INNER JOIN Users u on p.Users_userId = u.userId WHERE c.Conferences_conferenceId = ? AND u.gender LIKE ?;', [conferenceId,gender], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });

    });
  },

  getConferences(req, res, next) {
    const conferenceId = req.params.conferenceId;
    const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT conferenceId,conferenceLabel as name FROM mydb.Conferences WHERE isDeleted = 0;', [conferenceId,gender], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });

    });
  },

  getOpponentCollege(req, res, next) {
    const conferenceId = req.params.conferenceId;
    const coachId = req.params.coachId;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT DISTINCT c.collegeId,c.name FROM Colleges c INNER JOIN Teams t on c.collegeId = t.Colleges_collegeId INNER JOIN Coaches co on co.coachId = t.Coaches_coachId WHERE c.Conferences_conferenceId = ? AND t.Coaches_coachId != ? ;', [conferenceId,coachId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });

      console.log(query.sql);

    });
  },

  getAllPlayers(req, res, next) {

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT p.playerId, concat(u.firstName,\' \',u.lastName) as playerName FROM Players p INNER JOIN Users u on p.Users_userId = u.userId;', (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });

    });
  },



};
