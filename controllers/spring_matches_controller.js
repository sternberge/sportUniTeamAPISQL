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
      var query = connection.query('SELECT fr.simpleMatchId as matchId,fr.score,fr.matchCategorie,fr.springPosition,c1.name as winnerCollegeSimple,c2.name as loserCollegeSimple,c3.name as winnerCollegeDouble,c4.name as loserCollegeDouble,fr.date FROM (SELECT *,\'simple\' as matchCategorie  FROM SimpleMatches sm UNION ALL  SELECT *,\'double\' as matchCategorie FROM DoubleMatches dm ) as fr LEFT JOIN Players p1 on p1.playerId = fr.winner AND matchCategorie = \'simple\' LEFT JOIN Teams t1 on t1.teamId = p1.Teams_teamId AND matchCategorie = \'simple\' LEFT JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId AND matchCategorie =\'simple\' LEFT JOIN Players p2 on p2.playerId = fr.loser AND matchCategorie = \'simple\' LEFT JOIN Teams t2 on t2.teamId = p2.Teams_teamId AND matchCategorie = \'simple\' LEFT JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId AND matchCategorie = \'simple\' LEFT JOIN Users u1 on u1.userId = p1.Users_userId AND matchCategorie = \'simple\' LEFT JOIN DoubleMatches dm1 on fr.winner = dm1.doubleMatchId AND  matchCategorie = \'double\' LEFT JOIN DoubleMatches dm2 on fr.loser = dm2.doubleMatchId AND  matchCategorie = \'double\' LEFT JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm1.winnerDouble AND matchCategorie = \'double\' LEFT JOIN DoubleTeams dt2 on dt2.doubleTeamId = dm2.loserDouble AND matchCategorie = \'double\' LEFT JOIN Players p3 on p3.playerId = dt1.Players_playerId AND matchCategorie = \'double\' LEFT JOIN Players p4 on p4.playerId= dt1.Players_playerId2 AND  matchCategorie = \'double\' LEFT JOIN Players p5 on p3.playerId = dt2.Players_playerId AND  matchCategorie = \'double\' LEFT JOIN Players p6 on p4.playerId= dt2.Players_playerId2 AND  matchCategorie = \'double\' LEFT JOIN Users u2 on u2.userId = p3.Users_userId AND  matchCategorie = \'double\' LEFT JOIN Teams t3 on t3.teamId = p3.playerId AND  matchCategorie = \'double\' LEFT JOIN Teams t4 on t4.teamId = p4.playerId AND  matchCategorie = \'double\' LEFT JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId AND matchCategorie = \'double\' LEFT JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId AND matchCategorie = \'double\' WHERE fr.springFall = \'S\' AND (u1.gender = ? OR u2.gender = ?) AND fr.date >= \'?-09-01\' AND fr.date <= \'?-06-30\' ORDER BY fr.date, fr.springPosition', [gender,gender,year,yearPlusOne], (error, results, fields) => {
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
