var db = require('./../db');


module.exports = {

  checkDoubleTeamExistency(playerId1, playerId2){
    return new Promise(function (resolve, reject) {

      db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var tmp1 = playerId1;
        var tmp2 = playerId2;
        //console.log("playerId1");
        if(playerId1>playerId2){
          tmp1 =playerId2;
          tmp2 = playerId1;
        }
        // L'ajout du '?' permet d'éviter les injections sql
        var query = connection.query('SELECT * FROM DoubleTeams WHERE Players_playerId = ? and Players_playerId2 = ?', [tmp1,tmp2], (error, results, fields) => {

          if (error){
            connection.release();
            return reject(error);
          }
          else if (results.length >0){
            connection.release(); // CLOSE THE CONNECTION
            return resolve(results[0].doubleTeamId);
          }
          else{
            connection.release(); // CLOSE THE CONNECTION
            console.log("method 1 OK");
            resolve(false);
          }
        });
      });
    });

  },

  createDoubleTeam(playerId1,playerId2){

    return new Promise(function (resolve, reject) {

      var tmp1 = playerId1;
      var tmp2 = playerId2;
      //console.log("playerId1");
      if(playerId1>playerId2){
        tmp1 =playerId2;
        tmp2 = playerId1;
      }

      db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        // L'ajout du '?' permet d'éviter les injections sql
        var query = connection.query('INSERT INTO DoubleTeams (Players_playerId, Players_playerId2) VALUES (?, ?)', [tmp1,tmp2], (error, results, fields) => {
          if (error){
            connection.release();
            reject(error);
          }
          else if (results){
            connection.release(); // CLOSE THE CONNECTION
            resolve(results.insertId);
          }
        });
      });
    });
  },

  createDoubleMatch(req,res,next){
    var playerId1 = req.body.playerId1;
    var playerId2 = req.body.playerId2;
    var playerId3 = req.body.playerId3;
    var playerId4 = req.body.playerId4;
    // Check de l'existance des deux couples de joueurs entres
    Promise.all([module.exports.checkDoubleTeamExistency(playerId1,playerId2),module.exports.checkDoubleTeamExistency(playerId3,playerId4)])
    .then((values) => {
      // Si les deux couples n'existent pas --> Creation des deux nouvelles equipes
      if(values[0] == false && values[1] == false){
        console.log("Appel de la seconde methode");
        return Promise.all([module.exports.createDoubleTeam(playerId1,playerId2),module.exports.createDoubleTeam(playerId3,playerId4)])
      }
      // Si une des deux equipes existent deja
      else if(values[0] != false && values[1] == false){
        return Promise.all([values[0],module.exports.createDoubleTeam(playerId3,playerId4)]);
      }
      else if(values[0] == false && values[1] != false){
        return Promise.all([module.exports.createDoubleTeam(playerId1,playerId2),values[1]]);
      }
      // Si les deux equipes existent
      else{
        console.log(values);
        return Promise.resolve(values);
      }
    })
    .then((resultats)=>{
      console.log(resultats[0]);
      module.exports.createDoubleMatch2(req,resultats[0],resultats[1]);
    })
    .then(() => {
      res.send(JSON.stringify({"status": 200, "error": null, "response": "Your match has been added"}));
    })
    .catch((error) => {
      res.send(JSON.stringify({"status": 500, "error": error, "response": error}));
    });
  },

  createDoubleMatch2(req,teamId1,teamId2){
    //const winnerDouble = req.body.winnerDouble;
    //const loserDouble = req.body.loserDouble;
    return new Promise(function (resolve, reject) {
    const winnerDouble = teamId1;
    const loserDouble = teamId2;
    const score = req.body.score;
    const date =  req.body.date;
    const time =  req.body.time;
    const springFall =  req.body.springFall;
    const springPosition = req.body.springPosition;
    const round = req.body.round;
    const locationCity =  req.body.locationCity;
    const locationState = req.body.locationState;
    const tournamentId = req.body.tournamentId;
    const homeAway = req.body.homeAway;
    const springMatchType = req.body.springMatchType;


    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('INSERT INTO DoubleMatches (winnerDouble, loserDouble, score, date, time,springFall, springPosition, round, locationCity, locationState, Tournaments_tournamentId, homeAway, springMatchType) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)', [winnerDouble,loserDouble,score,date,time,springFall,springPosition,round,locationCity, locationState, tournamentId,homeAway, springMatchType], (error, results, fields) => {

        if (error){
          connection.release();
          reject(error);
        }
        else if (results){
          connection.release(); // CLOSE THE CONNECTION
          return resolve("yes")// Convertion de la réponse en format JSON
        }
        else{
          connection.release(); // CLOSE THE CONNECTION
          reject("qsjdkld");
        }
      });
    });
    });
  },

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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,tour.name as tournamentName FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId = dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId  LEFT JOIN Tournaments tour on tour.tournamentId = dm.Tournaments_tournamentId WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' ORDER BY dm.date DESC', [gender,gender,gender,gender,springFall,year,yearPlusOne], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,tour.name as tournamentName,co.conferenceLabel,c1.Conferences_conferenceId FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId INNER JOIN Conferences co on co.conferenceId = c1.Conferences_conferenceId  LEFT JOIN Tournaments tour on tour.tournamentId = dm.Tournaments_tournamentId WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND c1.Conferences_conferenceId  = ? ORDER BY dm.date DESC', [gender,gender,gender,gender,springFall,year,yearPlusOne,conferenceId], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,tour.name as tournamentName FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId  LEFT JOIN Tournaments tour on tour.tournamentId = dm.Tournaments_tournamentId WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND (c1.collegeId = ? OR c1.collegeId = ? OR c1.collegeId = ? OR c1.collegeId = ?) ORDER BY dm.date DESC', [gender,gender,gender,gender,springFall,year,yearPlusOne,collegeId,collegeId,collegeId,collegeId], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,c1.Conferences_conferenceId,tou.name as tournamentName FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId INNER JOIN Tournaments tou on tou.tournamentId = dm.Tournaments_tournamentId WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND dm.Tournaments_tournamentId = ? ORDER BY dm.date DESC', [gender,gender,gender,gender,springFall,year,yearPlusOne,tournamentId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  getMatchsByYearSpringFallGenderTournamentCollege(req, res) {
    const gender = req.params.gender;
    const springFall = req.params.springFall;
    const year = Number(req.params.year);
    const yearPlusOne = Number(year)+1;
    const tournamentId = req.params.tournamentId;
    const collegeId = req.params.collegeId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,c1.Conferences_conferenceId,tou.name as tournamentName FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId INNER JOIN Tournaments tou on tou.tournamentId = dm.Tournaments_tournamentId WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND dm.Tournaments_tournamentId = ? AND (c1.collegeId = ? OR c2.collegeId = ? OR c3.collegeId = ? OR  c4.collegeId = ?) ORDER BY dm.date DESC', [gender,gender,gender,gender,springFall,year,yearPlusOne,tournamentId,collegeId,collegeId,collegeId,collegeId], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,tour.name as tournamentName,c1.Conferences_conferenceId FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId  LEFT JOIN Tournaments tour on tour.tournamentId = dm.Tournaments_tournamentId WHERE dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND (p1.playerId = ? OR p2.playerId = ? OR p3.playerId = ? OR p4.playerId = ?) ORDER BY dm.date DESC', [springFall,year,yearPlusOne,playerId,playerId,playerId,playerId], (error, results, fields) => {
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
      var query = connection.query(`SELECT concat(u1.firstName,' ',u1.lastName) as winnerName1,concat(u2.firstName,' ',u2.lastName) as winnerName2,concat(u3.firstName,' ',u3.lastName) as loserName1, concat(u4.firstName,' ',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,tour.name as tournamentName,c1.Conferences_conferenceId
FROM DoubleMatches dm
INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId
INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId
INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId
INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2
INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId
INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2
INNER JOIN Users u1 on u1.userId = p1.Users_userId
INNER JOIN Users u2 on u2.userId = p2.Users_userId
INNER JOIN Users u3 on u3.userId = p3.Users_userId
INNER JOIN Users u4 on u4.userId = p4.Users_userId
INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId
INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId
INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId
INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId
INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId
INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId
INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId
INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId
 LEFT JOIN Tournaments tour on tour.tournamentId = dm.Tournaments_tournamentId
WHERE dm.springFall = ? AND dm.date >= '?-09-01' AND dm.date <= '?-06-30'
AND (dt1.Players_playerId = ? AND dt1.Players_playerId2 = ?) OR (dt1.Players_playerId2 = ? AND dt1.Players_playerId = ?)
OR  (dt2.Players_playerId = ? AND dt2.Players_playerId2 = ?) OR (dt2.Players_playerId2 = ? AND dt2.Players_playerId = ?) ORDER BY dm.date DESC
`, [springFall,year,yearPlusOne,playerId1,playerId2,playerId2,playerId1,playerId1,playerId2,playerId2,playerId1], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1,concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,c1.Conferences_conferenceId,tou.name as tournamentName  FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId INNER JOIN Tournaments tou on tou.tournamentId = dm.Tournaments_tournamentId WHERE dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND dm.Tournaments_tournamentId = ? AND (p1.playerId = ? OR p2.playerId = ? OR p3.playerId = ? OR p4.playerId = ?) ORDER BY dm.date DESC', [springFall,year,yearPlusOne,tournamentId,playerId1,playerId1,playerId1,playerId1], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,tour.name as tournamentName,c1.Conferences_conferenceId FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId  LEFT JOIN Tournaments tour on tour.tournamentId = dm.Tournaments_tournamentId WHERE dm.springFall = ?  AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND dm.Tournaments_tournamentId = ?   AND (dt1.Players_playerId = ? AND dt1.Players_playerId2 = ?) OR (dt1.Players_playerId2 = ? AND dt1.Players_playerId = ?) OR (dt2.Players_playerId = ? AND dt2.Players_playerId2 = ?) OR (dt2.Players_playerId2 = ? AND dt2.Players_playerId = ?)  ORDER BY dm.date DESC', [springFall,year,yearPlusOne,tournamentId,playerId1,playerId2,playerId2,playerId1,playerId1,playerId2,playerId2,playerId1], (error, results, fields) => {
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
