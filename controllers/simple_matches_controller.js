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

  findSimpleMatchPerSpringId (req, res) {
    return new Promise(function (resolve, reject) {
      const springId = req.params.springId;
      db.pool.getConnection((error, connection) => {
        if (error){
          reject(error);
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        // L'ajout du '?' permet d'éviter les injections sql
        var query = connection.query('SELECT * FROM SimpleMatches WHERE springId = ?', springId, (error, results, fields) => {
          if (error){
            connection.release();
            reject(error);
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          else if (results.length > 0){
            resolve(results);
            connection.release(); // CLOSE THE CONNECTION
          }
          else{
            reject(error);
            res.send(JSON.stringify({"status": 500, "error": "Id does not exist", "response": null}));
            connection.release(); // CLOSE THE CONNECTION
          }
        });
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName, sm.*,t.name as TournamentName,c1.name as winnerCollege,c2.name as loserCollege,sr1.rank as winnerRank,sr2.rank as loserRank,c1.collegeId as winnerCollege,c2.collegeId as loserColleger FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId LEFT join SingleRanking sr1 ON  sr1.Players_playerId = p1.playerId LEFT join SingleRanking sr2 ON  sr2.Players_playerId = p2.playerId WHERE sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND sm.springFall = ? AND u1.gender LIKE ? AND u2.gender LIKE ? AND  sr1.type = \'N\' AND sr2.type = \'N\' ORDER BY sm.date DESC ', [year,yearPlusOne,springFall,gender,gender], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.*,t.name as TournamentName,sm.score,c1.name as winnerCollege,c2.name as loserCollege,sr1.rank as winnerRank,sr2.rank as loserRank,c1.collegeId as winnerCollege,c2.collegeId as loserColleger FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId LEFT join SingleRanking sr1 ON  sr1.Players_playerId = p1.playerId LEFT join SingleRanking sr2 ON  sr2.Players_playerId = p2.playerId WHERE (sm.winner = ? OR sm.loser = ?) AND sr1.type = \'N\' AND sr2.type = \'N\' ORDER BY sm.date DESC;', [playerId,playerId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        console.log(query.sql);
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.*,t.name as TournamentName,sm.score,c1.name as winnerCollege,c2.name as loserCollege,sr1.rank as winnerRank,sr2.rank as loserRank,c1.collegeId as winnerCollege,c2.collegeId as loserColleger FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN  Tournaments t on t.tournamentId = sm.Tournaments_tournamentId LEFT join SingleRanking sr1 ON  sr1.Players_playerId = p1.playerId LEFT join SingleRanking sr2 ON  sr2.Players_playerId = p2.playerId WHERE (sm.winner = ? OR sm.loser = ?) AND sm.springFall = ?AND sr1.type = \'N\' AND sr2.type = \'N\' ORDER BY sm.date DESC;', [playerId,playerId,springFall], (error, results, fields) => {
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
    const gender = req.params.gender;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.*,t.name  as TournamentName,c1.name as winnerCollege,c2.name as loserCollege,sr1.rank as winnerRank,sr2.rank as loserRank,c1.collegeId as winnerCollege,c2.collegeId as loserColleger FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER join SingleRanking sr1 ON  sr1.Players_playerId = p1.playerId INNER join SingleRanking sr2 ON sr2.Players_playerId = p2.playerId WHERE sm.springFall = ? AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND (c1.Conferences_conferenceId = ? OR c2.Conferences_conferenceId = ?) AND (t1.gender = ? AND t2.gender = ?) AND sr1.type = \'N\' AND sr2.type = \'N\' ORDER BY sm.date DESC ;'
      , [springFall,year,yearPlusOne,conference,conference,gender,gender], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.*,t.name  as TournamentName,c1.name as winnerCollege,c2.name as loserCollege,sr1.rank as winnerRank,sr2.rank as loserRank,c1.collegeId as winnerCollege,c2.collegeId as loserColleger FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId LEFT join SingleRanking sr1 ON sr1.Players_playerId = p1.playerId LEFT join SingleRanking sr2 ON sr2.Players_playerId = p2.playerId WHERE (sm.winner = ? OR sm.loser = ?) AND sm.springFall = ? AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND sr1.type = \'N\' AND sr2.type = \'N\' ORDER BY sm.date DESC', [playerId,playerId,springFall,year,yearPlusOne], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.*,t.name as TournamentName,c1.name as winnerCollege,c2.name as loserCollege,sr1.rank as winnerRank,sr2.rank as loserRank,c1.collegeId as winnerCollege,c2.collegeId as loserColleger FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId LEFT join SingleRanking sr1 ON sr1.Players_playerId = p1.playerId LEFT join SingleRanking sr2 ON sr2.Players_playerId = p2.playerId WHERE (t1.Colleges_collegeId = ? OR t2.Colleges_collegeId = ?) AND sm.springFall = ? AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND u1.gender LIKE ? AND u2.gender LIKE ? AND sr1.type = \'N\' AND sr2.type = \'N\' ORDER BY sm.date DESC ', [collegeId,collegeId,springFall,year,yearPlusOne,gender,gender], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.*,t.name as TournamentName,c1.name as winnerCollege,c2.name as loserCollege,sr1.rank as winnerRank,sr2.rank as loserRank,c1.collegeId as winnerCollege,c2.collegeId as loserColleger FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId LEFT join SingleRanking sr1 ON sr1.Players_playerId = p1.playerId LEFT join SingleRanking sr2 ON sr2.Players_playerId = p2.playerId WHERE sm.Tournaments_tournamentId = ? AND sm.springFall = ? AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND u1.gender LIKE ? AND sr1.type = \'N\' AND sr2.type = \'N\' ORDER BY sm.date DESC;', [tournamentId,springFall,year,yearPlusOne,gender], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        console.log(query.sql);
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,sm.*,t.name as TournamentName,sm.score,c1.name as winnerCollege,c2.name as loserCollege,sr1.rank as winnerRank,sr2.rank as loserRank,c1.collegeId as winnerCollege,c2.collegeId as loserColleger FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId  INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId LEFT join SingleRanking sr1 ON sr1.Players_playerId = p1.playerId LEFT join SingleRanking sr2 ON sr2.Players_playerId = p2.playerId WHERE (t1.Colleges_collegeId = ? OR t2.Colleges_collegeId = ?) AND sm.Tournaments_tournamentId = ? AND sm.springFall = ? AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\'AND  u1.gender  LIKE ? AND sr1.type = \'N\' AND sr2.type = \'N\'  ORDER BY sm.date DESC;', [collegeId,collegeId,tournamentId,springFall,year,yearPlusOne,gender], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName,t.name as TournamentName,sm.*,c1.name as winnerCollege,c2.name as loserCollege,sr1.rank as winnerRank,sr2.rank as loserRank,c1.collegeId as winnerCollege,c2.collegeId as loserColleger FROM SimpleMatches sm INNER JOIN Players p1 on sm.winner = p1.playerId INNER JOIN Players p2 on sm.loser = p2.playerId INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId LEFT join SingleRanking sr1 ON sr1.Players_playerId = p1.playerId LEFT join SingleRanking sr2 ON sr2.Players_playerId = p2.playerId WHERE (p1.playerId = ? or p2.playerId = ?) AND t.tournamentId = ? AND sm.springFall = ? AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND t.gender LIKE ? AND sr1.type = \'N\' AND sr2.type = \'N\' ORDER BY sm.date DESC', [playerId,playerId,tournamentId,springFall,year,yearPlusOne,gender], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });


    });

  },

  getMatchsByCurrentYear(req, res, next) {
    const gender = req.params.gender;
    const springFall = req.params.springFall;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT sm.*,sr1.rank as winnerRank,sr2.rank as loserRank,c1.collegeId as winnerCollege,c2.collegeId as loserColleger,c1.name,c2.name FROM SimpleMatches sm
        INNER JOIN Players p1 on p1.playerId = sm.winner
        INNER JOIN Players p2 on p2.playerId = sm.loser
        INNER JOIN Teams t1 on t1.teamId= p1.Teams_teamId
        INNER JOIN Teams t2 on t2.teamId= p2.Teams_teamId
        INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId
        INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId
        LEFT join SingleRanking sr1 ON sr1.Players_playerId = p1.playerId
        LEFT join SingleRanking sr2 ON sr2.Players_playerId = p2.playerId
        INNER JOIN Users u on p1.Users_userId= u.userId
        WHERE YEAR(sm.date) = YEAR(now()) AND u.gender = ? AND sm.springFall = ?
        AND sr1.type = 'N' AND sr2.type = 'N'
        ORDER BY sm.date DESC`,[gender,springFall] ,(error, results, fields) => {
          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        });


      });

    },

    getSimpleFallMatchsByTeamId(req, res, next) {
      let year = Number(req.params.year);
      const teamId = req.params.teamId;
      const yearPlusOne = Number(year)+1;

      db.pool.getConnection((error, connection) => {

        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var query = connection.query(`SELECT concat(u1.firstName,' ',u1.lastName) as WinnerName,concat(u2.firstName,' ',u2.lastName) as LoserName,sm.*,t.name as TournamentName,sm.score,c1.name as winnerCollege,c2.name as loserCollege,sr1.rank as winnerRank,sr2.rank as loserRank,c1.collegeId as winnerCollege,c2.collegeId as loserColleger
        FROM SimpleMatches sm
        INNER JOIN Players p1 on p1.playerId = sm.winner
        INNER JOIN Players p2 on p2.playerId = sm.loser
        INNER JOIN Users u1 on u1.userId = p1.Users_userId
        INNER JOIN Users u2 on u2.userId = p2.Users_userId
        INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId
        INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId
        INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId
        INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId
        INNER JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId
        LEFT join SingleRanking sr1 ON sr1.Players_playerId = p1.playerId
        LEFT join SingleRanking sr2 ON sr2.Players_playerId = p2.playerId
        WHERE(p1.Teams_teamId = ? OR p2.Teams_teamId = ?) AND sm.date >= '?-09-01' AND sm.date <= '?-06-30' AND sr1.type = 'N' AND sr2.type = 'N'
        ORDER BY sm.date DESC;
        `,[teamId,teamId,year,yearPlusOne] ,(error, results, fields) => {
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


  };
