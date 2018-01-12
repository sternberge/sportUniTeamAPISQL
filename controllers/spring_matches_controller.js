var db = require('./../db');


module.exports = {

  getSpringMatchsByYearGender(req, res, next) {
    const gender = req.params.gender;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var query = connection.query('SELECT final.* ,length(final.simpleMatchWonId) - length(REPLACE(final.simpleMatchWonId, \',\', \'\'))+1 as simpleMatchWon FROM (SELECT c1.name as collegeWinnerName,c2.name as collegeLoserName,group_concat(simpleMatchId) as simpleMatchWonId, dMatch.doubleMatchWonId,sm.springId FROM (SELECT *,group_concat(doubleMatchId) as doubleMatchWonId  FROM DoubleMatches dm WHERE springId != \'null\'  AND dm.date >= \'?-09-01\'  AND dm.date <= \'?-06-30\'  GROUP BY dm.springId) as dMatch, SimpleMatches sm  INNER JOIN Players p1 on p1.playerId = sm.winner  INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId  INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Users u1 on u1.userId = p1.Users_userId  INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Teams t2 on t2.teamId= p2.Teams_teamId  INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId WHERE sm.springId != \'null\' AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND u1.gender = ? GROUP BY sm.springId, dMatch.springId,c1.name) as final',[year,yearPlusOne,year,yearPlusOne,gender], (error, results, fields) => {
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


  getSingleSpringMatchsBySpringId(req, res, next) {
    const springId = req.params.springId;


    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var query = connection.query('SELECT sm.*,concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as loserName2 FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Teams t1 on t1.teamId = p1.playerId INNER JOIN Teams t2 on t2.teamId = p2.playerId INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId WHERE sm.springId = ? ORDER BY sm.springPosition;',[springId], (error, results, fields) => {
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

  getDoubleSpringMatchsBySpringId(req, res, next) {
    const springId = req.params.springId;


    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var query = connection.query('SELECT dm.*,dt1.*,dt2.*,concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1,concat(u4.firstName,\' \',u4.lastName) as loserName2 FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.winnerDouble INNER JOIN DoubleTeams dt2 on dt2.doubleTeamId = dm.loserDouble INNER JOIN Players p1 on p1.playerId = dt1.Players_playerId INNER JOIN Players p2 on p2.playerId = dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId = dt2.Players_playerId INNER JOIN Players p4 on p4.playerId = dt2.Players_playerId2 INNER JOIN Teams t1 on t1.teamId = p1.playerId INNER JOIN Teams t2 on t2.teamId = p2.playerId INNER JOIN Teams t3 on t3.teamId = p3.playerId INNER JOIN Teams t4 on t4.teamId = p4.playerId INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId WHERE dm.springId = ? ORDER BY dm.springPosition',[springId], (error, results, fields) => {
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




};
