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

      var query = connection.query('SELECT *, (CASE when finalRequest.doubleMatchWonID > finalRequest.doubleMatchPlayed/2 AND finalRequest.doubleMatchPlayed <> 0 THEN \'1\' END) as pointsFromDoubleMatchs FROM (SELECT test2.*,count(*)as doubleMatchPlayed FROM DoubleMatches dm2,(SELECT final.* ,length(final.simpleMatchWonId) - length(REPLACE(final.simpleMatchWonId, \',\', \'\'))+1 as simpleMatchWon FROM (SELECT c1.name as collegeWinnerName,c2.name as collegeLoserName,group_concat(simpleMatchId) as simpleMatchWonId, dMatch.doubleMatchWonId,sm.springId FROM (SELECT *,group_concat(doubleMatchId) as doubleMatchWonId FROM DoubleMatches dm WHERE springId != \'null\' AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' GROUP BY dm.springId) as dMatch, SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Teams t2 on t2.teamId= p2.Teams_teamId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId WHERE sm.springId != \'null\' AND sm.date >= \'?-09-01\' AND sm.date <= \'?-06-30\' AND u1.gender = ? GROUP BY sm.springId, dMatch.springId,c1.name) as final) as test2 where dm2.springId = test2.springId) finalRequest;',[year,yearPlusOne,year,yearPlusOne,gender], (error, results, fields) => {
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

      var query = connection.query('SELECT sm.*,concat(u1.firstName,\' \',u1.lastName) as WinnerName,concat(u2.firstName,\' \',u2.lastName) as LoserName FROM SimpleMatches sm INNER JOIN Players p1 on p1.playerId = sm.winner INNER JOIN Players p2 on p2.playerId = sm.loser INNER JOIN Teams t1 on t1.teamId = p1.playerId INNER JOIN Teams t2 on t2.teamId = p2.playerId INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId WHERE sm.springId = ? ORDER BY sm.springPosition;',[springId], (error, results, fields) => {
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

      var query = connection.query('SELECT dm.*,dt1.*,dt2.*,concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1,concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.winnerDouble INNER JOIN DoubleTeams dt2 on dt2.doubleTeamId = dm.loserDouble INNER JOIN Players p1 on p1.playerId = dt1.Players_playerId INNER JOIN Players p2 on p2.playerId = dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId = dt2.Players_playerId INNER JOIN Players p4 on p4.playerId = dt2.Players_playerId2 INNER JOIN Teams t1 on t1.teamId = p1.playerId INNER JOIN Teams t2 on t2.teamId = p2.playerId INNER JOIN Teams t3 on t3.teamId = p3.playerId INNER JOIN Teams t4 on t4.teamId = p4.playerId INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId WHERE dm.springId = ? ORDER BY dm.springPosition',[springId], (error, results, fields) => {
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


  test(req, res, next) {
    const gender = req.params.gender;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    const springId =req.params.springId;


    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var query = connection.query(`select final5.college1Name,final5.college1Score, final5.college2Name,final5.college2Score,final5.springId from (SELECT *,final4.collegeName1 as college1Name,final4.finalWinnerScore as college1Score, final4.collegeName2 as college2Name , 7-final4.finalWinnerScore as college2Score FROM (SELECT *,sum(info) as finalWinnerScore,group_concat(IdMatchPlayed) as allMatchPlayed FROM
(SELECT *, CASE
     WHEN final2.matchWon > TotalDoublematchesPlayed / 2  AND final2.matchCategorie = 'DoubleMatches' THEN 1
     WHEN final2.matchWon < TotalDoublematchesPlayed  / 2  AND final2.matchCategorie = 'DoubleMatches' THEN 0
     ELSE final2.matchWon
     END as info
FROM
(SELECT * ,sum(matchWon) as TotalDoublematchesPlayed  ,group_concat(matchesPlayed) as IdmatchPlayed FROM
(SELECT  * FROM
(SELECT sm.*, group_concat(sm.simpleMatchId) as matchesPlayed,c1.name as collegeName1,c2.name as CollegeName2,
(length(group_concat(sm.simpleMatchId)) - length(REPLACE(group_concat(sm.simpleMatchId), ',', ''))+1) as MatchWon , 'SimpleMatches' as matchCategorie
FROM SimpleMatches sm
INNER JOIN Players p1 on sm.winner = p1.playerId
INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId
INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId
INNER JOIN Players p2 on sm.loser = p2.playerId
INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId
INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId
WHERE sm.springId is not null
GROUP BY sm.winner,sm.springId,sm.date
ORDER BY sm.springPosition) as tempo
WHERE tempo.springId like ?

UNION ALL

SELECT  *  FROM
(SELECT dm.*, group_concat(dm.doubleMatchId) as matchesPlayed, c3.name as collegeName1,c4.name as CollegeName2,
length(group_concat(dm.doubleMatchId)) - length(REPLACE(group_concat(dm.doubleMatchId), ',', ''))+1 as MatchWon, 'DoubleMatches' as matchCategorie
FROM DoubleMatches dm
INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.winnerDouble
INNER JOIN DoubleTeams dt2 on dt2.doubleTeamId = dm.loserDouble
INNER JOIN Players p3 on dt1.Players_playerId = p3.playerId
INNER JOIN Players p4 on dt2.Players_playerId = p4.playerId
INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId
INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId
INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId
INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId
WHERE dm.springId is not null
GROUP BY dm.winnerDouble, dm.springId, matchCategorie
ORDER BY dm.springPosition) as tempo2
WHERE tempo2.springId LIKE ?) as final
GROUP BY  final.matchCategorie) as final2) as final3
GROUP BY final3.CollegeName1, springId) final4
GROUP BY final4.springId) as final5
`,[springId,springId],(error, results, fields) => {
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

  testFinal(req, res, next) {
    const gender = req.params.gender;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    const springId =req.params.springId;
    const conferenceId = req.params.conferenceId;




    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var query = connection.query(`select final5.college1Name,final5.college1Score, final5.college2Name,final5.college2Score,final5.springId from (SELECT *,final4.collegeName1 as college1Name,final4.finalWinnerScore as college1Score, final4.collegeName2 as college2Name , 7-final4.finalWinnerScore as college2Score FROM (SELECT *,sum(info) as finalWinnerScore,group_concat(IdMatchPlayed) as allMatchPlayed FROM
(SELECT *, CASE
     WHEN final2.matchWon > TotalDoublematchesPlayed / 2  AND final2.matchCategorie = 'DoubleMatches' THEN 1
     WHEN final2.matchWon < TotalDoublematchesPlayed  / 2  AND final2.matchCategorie = 'DoubleMatches' THEN 0
     ELSE final2.matchWon
     END as info
FROM
(SELECT * ,sum(matchWon) as TotalDoublematchesPlayed  ,group_concat(matchesPlayed) as IdmatchPlayed FROM
(SELECT  * FROM
(SELECT sm.*, group_concat(sm.simpleMatchId) as matchesPlayed,c1.name as collegeName1,c2.name as CollegeName2,
(length(group_concat(sm.simpleMatchId)) - length(REPLACE(group_concat(sm.simpleMatchId), ',', ''))+1) as MatchWon , 'SimpleMatches' as matchCategorie
FROM SimpleMatches sm
INNER JOIN Players p1 on sm.winner = p1.playerId
INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId
INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId
INNER JOIN Players p2 on sm.loser = p2.playerId
INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId
INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId
INNER JOIN Users u1 on u1.userId = p1.Users_userId
WHERE sm.springId is not null  AND u1.gender LIKE ?
GROUP BY sm.winner,sm.springId,sm.date
ORDER BY sm.springPosition) as tempo
WHERE tempo.springId like ?

UNION ALL

SELECT  *  FROM
(SELECT dm.*, group_concat(dm.doubleMatchId) as matchesPlayed, c3.name as collegeName1,c4.name as CollegeName2,
length(group_concat(dm.doubleMatchId)) - length(REPLACE(group_concat(dm.doubleMatchId), ',', ''))+1 as MatchWon, 'DoubleMatches' as matchCategorie
FROM DoubleMatches dm
INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.winnerDouble
INNER JOIN DoubleTeams dt2 on dt2.doubleTeamId = dm.loserDouble
INNER JOIN Players p3 on dt1.Players_playerId = p3.playerId
INNER JOIN Players p4 on dt2.Players_playerId = p4.playerId
INNER JOIN Users u2 on u2.userId = p3.Users_userId
INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId
INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId
INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId
INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId
WHERE dm.springId is not null  AND u2.gender LIKE ?
GROUP BY dm.winnerDouble, dm.springId, matchCategorie
ORDER BY dm.springPosition) as tempo2
WHERE tempo2.springId LIKE ?) as final
GROUP BY  final.matchCategorie) as final2) as final3
GROUP BY final3.CollegeName1, springId) final4
GROUP BY final4.springId) as final5
INNER JOIN Colleges co1 on co1.name = final5.college1Name
INNER JOIN Colleges co2 on co2.name = final5.college2Name
WHERE co1.Conferences_conferenceId LIKE ? AND final5.date >= \'?-09-01\' AND final5.date <= \'?-06-30\'
`,  [gender,springId,gender,springId,conferenceId,year,yearPlusOne],(error, results, fields) => {
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
