var db = require('./../db');


module.exports = {

  getMatchsByYearSpringFallGender (req, res) {

    const gender = req.params.gender;
    const springFall = req.params.springFall;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,dm.* FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId = dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\'', [gender,gender,gender,gender,springFall,year,yearPlusOne], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  getMatchsByYearSpringFallGenderConference (req, res) {

    const gender = req.params.gender;
    const springFall = req.params.springFall;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    const conferenceId = req.params.conferenceId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,dm.*,co.conferenceLabel,c1.Conferences_conferenceId FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId INNER JOIN Conferences co on co.conferenceId = c1.Conferences_conferenceId WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND c1.Conferences_conferenceId  = ?', [gender,gender,gender,gender,springFall,year,yearPlusOne,conferenceId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  getMatchsByYearSpringFallGenderCollege (req, res) {

    const gender = req.params.gender;
    const springFall = req.params.springFall;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    const collegeId = req.params.collegeId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,dm.* FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND (c1.collegeId = ? OR c1.collegeId = ? OR c1.collegeId = ? OR c1.collegeId = ?)', [gender,gender,gender,gender,springFall,year,yearPlusOne,collegeId,collegeId,collegeId,collegeId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  getMatchsByYearSpringFallGenderTournament(req, res) {
    const gender = req.params.gender;
    const springFall = req.params.springFall;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    const tournamentId = req.params.tournamentId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,dm.*,c1.Conferences_conferenceId,tou.name as tournamentName FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId INNER JOIN Tournaments tou on tou.tournamentId = dm.Tournaments_tournamentId WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND dm.Tournaments_tournamentId = ?', [gender,gender,gender,gender,springFall,year,yearPlusOne,tournamentId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  getMatchsByYearSpringFallPlayer1(req, res) {

    const springFall = req.params.springFall;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    const playerId = req.params.playerId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,dm.*,c1.Conferences_conferenceId FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId WHERE dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND (p1.playerId = ? OR p2.playerId = ? OR p3.playerId = ? OR p4.playerId = ?)', [springFall,year,yearPlusOne,playerId,playerId,playerId,playerId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

getMatchsByYearSpringFallPlayer1Player2(req, res) {

  const springFall = req.params.springFall;
  const year = Number(req.params.year);
  const yearPlusOne = Number(year)+1;
  const playerId1 = req.params.playerId1;
  const playerId2 = req.params.playerId2;
  db.pool.getConnection((error, connection) => {
    if (error){
      return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
    }
    // L'ajout du '?' permet d'éviter les injections sql
    var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,dm.*,c1.Conferences_conferenceId FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId WHERE dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND (p1.playerId = ? OR p2.playerId = ? OR p3.playerId = ? OR p4.playerId = ? ) AND (p1.playerId = ? OR p2.playerId = ? OR p3.playerId = ? OR p4.playerId = ? )', [springFall,year,yearPlusOne,playerId1,playerId1,playerId1,playerId1,playerId2,playerId2,playerId2,playerId2], (error, results, fields) => {
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

getMatchsByYearSpringFallGenderTournamentPlayer1(req, res) {

  const springFall = req.params.springFall;
  const year = Number(req.params.year);
  const yearPlusOne = Number(year)+1;
  const playerId1 = req.params.playerId1;
  const tournamentId = req.params.tournamentId;

  db.pool.getConnection((error, connection) => {
    if (error){
      return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
    }
    // L'ajout du '?' permet d'éviter les injections sql
    var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1,concat(u4.firstName,\' \',u4.lastName) as loserName2,dm.*,c1.Conferences_conferenceId,tou.name as tournamentName  FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId INNER JOIN Tournaments tou on tou.tournamentId = dm.Tournaments_tournamentId WHERE dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND dm.Tournaments_tournamentId = ? AND (p1.playerId = ? OR p2.playerId = ? OR p3.playerId = ? OR p4.playerId = ?)', [springFall,year,yearPlusOne,tournamentId,playerId1,playerId1,playerId1,playerId1], (error, results, fields) => {
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

getMatchsByYearSpringFallGenderTournamentPlayer1Player2(req, res) {

  const springFall = req.params.springFall;
  const year = Number(req.params.year);
  const yearPlusOne = Number(year)+1;
  const playerId1 = req.params.playerId1;
  const playerId2 = req.params.playerId2;
  const tournamentId = req.params.tournamentId;

  db.pool.getConnection((error, connection) => {
    if (error){
      return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
    }
    // L'ajout du '?' permet d'éviter les injections sql
    var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,dm.*,c1.Conferences_conferenceId FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId WHERE dm.springFall = ?  AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND dm.Tournaments_tournamentId = ?  AND (p1.playerId = ?  OR p2.playerId = ? OR p3.playerId = ? OR p4.playerId = ? ) AND (p1.playerId = ? OR p2.playerId = ? OR p3.playerId = ? OR p4.playerId = ? )', [springFall,year,yearPlusOne,tournamentId,playerId1,playerId1,playerId1,playerId1,playerId2,playerId2,playerId2,playerId2], (error, results, fields) => {
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
