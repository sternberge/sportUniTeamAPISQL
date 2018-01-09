var db = require('./../db');


module.exports = {

  find (req, res) {
    const simpleMatchId = req.params.simpleMatch_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM SimpleMatches WHERE simpleMatchId = ?', simpleMatchId, (error, results, fields) => {
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

  create(req, res, next) {


    const winner = req.body.winner;
    const loser = req.body.loser;
    const score = req.body.score;
    const date = req.body.date;
    const time = req.body.time;
    const springFall = req.body.springFall;
    const springPosition = req.body.springPosition;
    const round = req.body.round;
    const locationCity = req.body.locationCity;
    const locationState = req.body.locationState;
    const Tournaments_tournamentId = req.body.Tournaments_tournamentId;
    const homeAway = req.body.homeAway;
    const isRanked = req.body.isRanked;
    const springMatchType =req.body.springMatchType;


    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var query = connection.query('INSERT INTO SimpleMatches (winner,loser,score,date,time,springFall,springPosition,round,locationCity,locationState,Tournaments_tournamentId,homeAway,isRanked,springMatchType) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [winner,loser,score,date,time,springFall,springPosition,round,locationCity,locationState,Tournaments_tournamentId,homeAway,isRanked,springMatchType], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
        return (results.insertId);
      });

    });

  },

  edit(req, res, next) {
    const simpleMatchId = req.params.simpleMatch_id;
    const simpleMatchProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE SimpleMatches SET ? WHERE simpleMatchId = ?',[simpleMatchProperties, simpleMatchId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  delete(req, res, next) {
    const simpleMatchId = req.params.simpleMatch_id;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM SimpleMatches WHERE simpleMatchId = ?', simpleMatchId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  getAllMatchsByYear(req, res, next) {
    const year = Number(req.params.year); //Convert to number to avoid having '2018' but 2018
    const springFall = req.params.springFall;
    const yearPlusOne = Number(year)+1;
    const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT sm.simpleMatchId, concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName, sm.score,sm.round,sm.date,sm.homeAway,t.name as TournamentName FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId WHERE sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND sm.springFall = ? AND u1.gender LIKE ? AND u2.gender LIKE ?  ', [year,yearPlusOne,springFall,gender,gender], (error, results, fields) => {
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

  getMatchsByPlayer(req, res, next) {
    const playerId = req.params.playerId;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT sm.simpleMatchId,concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.date,t.name  as TournamentName,sm.score FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId WHERE sm.winner = ? OR sm.loser = ? ;', [playerId,playerId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });


    });
  },

  getMatchsByPlayerSpringFall(req, res, next) {
    const playerId = req.params.playerId;
    const springFall = req.params.springFall;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT sm.simpleMatchId, concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.date,t.name  as TournamentName,sm.score FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId WHERE (sm.winner = ? OR sm.loser = ?) AND sm.springFall = ?;', [playerId,playerId,springFall], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });


    });
  },

  getMatchsByConferenceSpringFallYear(req, res, next) {
    const conference = req.params.conferenceId;
    const springFall = req.params.springFall;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT sm.simpleMatchId, concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.date,t.name  as TournamentName,sm.score FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId WHERE sm.springFall = ? AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND (c1.Conferences_conferenceId = ? OR c2.Conferences_conferenceId = ?);'
      , [springFall,year,yearPlusOne,conference,conference], (error, results, fields) => {
        if (error){
          console.log("test");
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });


    });
  },

  getMatchsByPlayerSpringFallYear(req, res, next) {
    const playerId = req.params.playerId;
    const springFall = req.params.springFall;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT sm.simpleMatchId,concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.date,t.name  as TournamentName,sm.score FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId WHERE (sm.winner = ? OR sm.loser = ?) AND sm.springFall = ? AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' ', [playerId,playerId,springFall,year,yearPlusOne], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });


    });
  },

  getMatchsByCollegeSpringFallYearGender(req, res, next) {
    const collegeId = req.params.collegeId;
    const springFall = req.params.springFall;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    const gender= req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT sm.simpleMatchId, concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.date,sm.date,t.name as TournamentName,sm.score FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId WHERE (t1.Colleges_collegeId = ? OR t2.Colleges_collegeId = ?) AND sm.springFall = ? AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND u1.gender LIKE ? AND u2.gender LIKE ?; ', [collegeId,collegeId,springFall,year,yearPlusOne,gender,gender], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });

    });
  },

  getMatchsByTournamentSpringFallYearGender(req, res, next) {
    const tournamentId = req.params.tournamentId;
    const springFall = req.params.springFall;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT sm.simpleMatchId,concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.date,sm.round,t.name as TournamentName,sm.score FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId WHERE sm.Tournaments_tournamentId = ? AND sm.springFall = ? AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND t.gender LIKE ? ;', [tournamentId,springFall,year,yearPlusOne,gender], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });

    });
  },

  getMatchsByTournamentCollegeSpringFallYearGender(req, res, next) {
    const collegeId = req.params.collegeId;
    const tournamentId = req.params.tournamentId;
    const springFall = req.params.springFall;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT sm.simpleMatchId,concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.date,sm.round,t.name as TournamentName,sm.score  FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId WHERE (t1.Colleges_collegeId = ? OR t2.Colleges_collegeId = ?) AND sm.Tournaments_tournamentId = ? AND sm.springFall = ? AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\'AND t.gender LIKE ? ;', [collegeId,collegeId,tournamentId,springFall,year,yearPlusOne,gender], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });

    });
  },

  getMatchsByPlayerTournamentSpringFallYearGender(req, res, next) {
    const playerId =req.params.playerId;
    const tournamentId =req.params.tournamentId;
    const springFall =req.params.springFall;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT sm.simpleMatchId,concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,t.name as TournamentName,sm.score,sm.date,sm.round FROM SimpleMatches sm INNER JOIN Players p1 on sm.winner = p1.playerId INNER JOIN Players p2 on sm.loser = p2.playerId INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId WHERE (p1.playerId = ? or p2.playerId = ?) AND t.tournamentId = ? AND sm.springFall = ? AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND t.gender LIKE ?', [playerId,playerId,tournamentId,springFall,year,yearPlusOne,gender], (error, results, fields) => {
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
