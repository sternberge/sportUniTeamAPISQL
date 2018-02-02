var db = require('./../db');
const RankRulesController = require('../controllers/rank_rules_controller');
const DoubleRankingController = require('../controllers/double_ranking_controller');
const PlayerController = require('../controllers/player_controller');
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

  async checkPlayersSameTeam(playerId1,playerId2,playerId3,playerId4){
    // On recupere les teamId de chacun des joueurs
    var teamsId = await Promise.all([PlayerController.getPlayerTeamId(playerId1),PlayerController.getPlayerTeamId(playerId2),PlayerController.getPlayerTeamId(playerId3),PlayerController.getPlayerTeamId(playerId4)])
    //Si les couples de joeurs ne sont pas dans la meme equipe
    if(teamsId[0]!=teamsId[1] || teamsId[2]!=teamsId[3]){
      throw "Players of a double match should be in the same team";
    }
  },

  async createDoubleMatch(req,res){
    var playerId1 = req.body.playerId1;
    var playerId2 = req.body.playerId2;
    var playerId3 = req.body.playerId3;
    var playerId4 = req.body.playerId4;
    try {
      //Check si les players de double son dans la meme equipe
      var teamId = await module.exports.checkPlayersSameTeam(playerId1,playerId2,playerId3,playerId4);
      //Check de l'existance des deux couples de joueurs entres
      var doubleTeams = await Promise.all([module.exports.checkDoubleTeamExistency(playerId1,playerId2),module.exports.checkDoubleTeamExistency(playerId3,playerId4)])
      // Si les deux couples n'existent pas --> Creation des deux nouvelles equipes
      if(doubleTeams[0] == false && doubleTeams[1] == false){
        console.log("Appel de la seconde methode");
        doubleTeams = await Promise.all([module.exports.createDoubleTeam(playerId1,playerId2),module.exports.createDoubleTeam(playerId3,playerId4)])
        // Creation des ranking initiaux pour les deux nouvelles equipes de double
        const rankingTeam1 = DoubleRankingController.create3InitialRanking(doubleTeams[0]);
        const rankingTeam2 = DoubleRankingController.create3InitialRanking(doubleTeams[1]);
      }
      // Si une des deux equipes existent deja
      else if(doubleTeams[0] != false && doubleTeams[1] == false){
        doubleTeams = await Promise.all([doubleTeams[0],module.exports.createDoubleTeam(playerId3,playerId4)]);
        //Creation du ranking initial pour la nouvelle equipe de double
        const rankingTeam2 = DoubleRankingController.create3InitialRanking(doubleTeams[1]);
      }
      else if(doubleTeams[0] == false && doubleTeams[1] != false){
        doubleTeams = await Promise.all([module.exports.createDoubleTeam(playerId1,playerId2),doubleTeams[1]]);
        //Creation du ranking initial pour la nouvelle equipe de double
        const rankingTeam1 = DoubleRankingController.create3InitialRanking(doubleTeams[0]);
      }
      // Creation du match double
      var resultats = await module.exports.createDoubleMatch2(req,doubleTeams[0],doubleTeams[1]);
      console.log(resultats);
      res.send(JSON.stringify({"status": 200, "error": null, "response": "Your match has been added"}));
    }
    catch(error){
      res.send(JSON.stringify({"status": 500, "error": error, "response": error}));
    }
  },

  // Creation du match double avec promise
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
      const tournamentId = req.body.Tournaments_tournamentId;
      const homeAway = req.body.homeAway;
      const springMatchType = req.body.springMatchType;
      const springId = req.body.springId;


      db.pool.getConnection((error, connection) => {
        if (error){
          reject(error);
        }
        // L'ajout du '?' permet d'éviter les injections sql
        var query = connection.query('INSERT INTO DoubleMatches (winnerDouble, loserDouble, score, date, time,springFall, springPosition, round, locationCity, locationState, Tournaments_tournamentId, homeAway, springMatchType, springId) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [winnerDouble,loserDouble,score,date,time,springFall,springPosition,round,locationCity, locationState, tournamentId,homeAway, springMatchType,springId], (error, results, fields) => {

          if (error){
            connection.release();
            reject(error);
          }
          else if (results){
            connection.release(); // CLOSE THE CONNECTION
            return resolve(results);
          }
          else{
            connection.release(); // CLOSE THE CONNECTION
            reject();
          }
        });
      });
    });
  },

  findDoubleMatchPerSpringId (req, res) {
    return new Promise(function (resolve, reject) {
      const springId = req.params.springId;
      db.pool.getConnection((error, connection) => {
        if (error){
          reject(error);
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        // L'ajout du '?' permet d'éviter les injections sql
        var query = connection.query('SELECT * FROM DoubleMatches WHERE springId = ?', springId, (error, results, fields) => {
          if (error){
            connection.release();
            reject(error);
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          else if (results.length > 0){
            resolve(results);
            res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
            connection.release(); // CLOSE THE CONNECTION
          }
          else{
            reject();
            res.send(JSON.stringify({"status": 500, "error": "Id does not exist", "response": null}));
            connection.release(); // CLOSE THE CONNECTION
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,tour.name as tournamentName,dr1.rank as winnerRank,dr2.rank as loserRank,c1.collegeId as winnerCollege,c3.collegeId as loserColleger FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId = dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId  LEFT JOIN Tournaments tour on tour.tournamentId = dm.Tournaments_tournamentId LEFT JOIN DoubleRanking dr1 on dt1.doubleTeamId = dr1.DoubleTeams_doubleTeamId AND dr1.type = \'N\' LEFT JOIN DoubleRanking dr2 on dt2.doubleTeamId = dr2.DoubleTeams_doubleTeamId AND dr2.type = \'N\' WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' ORDER BY dm.date DESC', [gender,gender,gender,gender,springFall,year,yearPlusOne], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,tour.name as tournamentName,co.conferenceLabel,c1.Conferences_conferenceId,dr1.rank as winnerRank,dr2.rank as loserRank,c1.collegeId as winnerCollege,c3.collegeId as loserColleger FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId INNER JOIN Conferences co on co.conferenceId = c1.Conferences_conferenceId  LEFT JOIN Tournaments tour on tour.tournamentId = dm.Tournaments_tournamentId LEFT JOIN DoubleRanking dr1 on dt1.doubleTeamId = dr1.DoubleTeams_doubleTeamId AND dr1.type = \'N\' LEFT JOIN DoubleRanking dr2 on dt2.doubleTeamId = dr2.DoubleTeams_doubleTeamId AND dr2.type = \'N\' WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND c1.Conferences_conferenceId  = ? ORDER BY dm.date DESC', [gender,gender,gender,gender,springFall,year,yearPlusOne,conferenceId], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,tour.name as tournamentName,dr1.rank as winnerRank,dr2.rank as loserRank,c1.collegeId as winnerCollege,c3.collegeId as loserColleger FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId  LEFT JOIN Tournaments tour on tour.tournamentId = dm.Tournaments_tournamentId LEFT JOIN DoubleRanking dr1 on dt1.doubleTeamId = dr1.DoubleTeams_doubleTeamId AND dr1.type = \'N\' LEFT JOIN DoubleRanking dr2 on dt2.doubleTeamId = dr2.DoubleTeams_doubleTeamId AND dr2.type = \'N\' WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND (c1.collegeId = ? OR c1.collegeId = ? OR c1.collegeId = ? OR c1.collegeId = ?) ORDER BY dm.date DESC', [gender,gender,gender,gender,springFall,year,yearPlusOne,collegeId,collegeId,collegeId,collegeId], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,c1.Conferences_conferenceId,tou.name as tournamentName,dr1.rank as winnerRank,dr2.rank as loserRank,c1.collegeId as winnerCollege,c3.collegeId as loserColleger FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId INNER JOIN Tournaments tou on tou.tournamentId = dm.Tournaments_tournamentId LEFT JOIN DoubleRanking dr1 on dt1.doubleTeamId = dr1.DoubleTeams_doubleTeamId AND dr1.type = \'N\' LEFT JOIN DoubleRanking dr2 on dt2.doubleTeamId = dr2.DoubleTeams_doubleTeamId AND dr2.type = \'N\' WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND dm.Tournaments_tournamentId = ? ORDER BY dm.date DESC', [gender,gender,gender,gender,springFall,year,yearPlusOne,tournamentId], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,c1.Conferences_conferenceId,tou.name as tournamentName,dr1.rank as winnerRank,dr2.rank as loserRank,c1.collegeId as winnerCollege,c3.collegeId as loserColleger FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId INNER JOIN Tournaments tou on tou.tournamentId = dm.Tournaments_tournamentId LEFT JOIN DoubleRanking dr1 on dt1.doubleTeamId = dr1.DoubleTeams_doubleTeamId AND dr1.type = \'N\' LEFT JOIN DoubleRanking dr2 on dt2.doubleTeamId = dr2.DoubleTeams_doubleTeamId AND dr2.type = \'N\' WHERE (t1.gender LIKE ? AND t2.gender LIKE ? AND t3.gender LIKE ? AND t4.gender LIKE ?) AND dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND dm.Tournaments_tournamentId = ? AND (c1.collegeId = ? OR c2.collegeId = ? OR c3.collegeId = ? OR  c4.collegeId = ?) ORDER BY dm.date DESC', [gender,gender,gender,gender,springFall,year,yearPlusOne,tournamentId,collegeId,collegeId,collegeId,collegeId], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,tour.name as tournamentName,c1.Conferences_conferenceId,dr1.rank as winnerRank,dr2.rank as loserRank,c1.collegeId as winnerCollege,c3.collegeId as loserColleger FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId  LEFT JOIN Tournaments tour on tour.tournamentId = dm.Tournaments_tournamentId LEFT JOIN DoubleRanking dr1 on dt1.doubleTeamId = dr1.DoubleTeams_doubleTeamId AND dr1.type = \'N\' LEFT JOIN DoubleRanking dr2 on dt2.doubleTeamId = dr2.DoubleTeams_doubleTeamId AND dr2.type = \'N\' WHERE dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND (p1.playerId = ? OR p2.playerId = ? OR p3.playerId = ? OR p4.playerId = ?) ORDER BY dm.date DESC', [springFall,year,yearPlusOne,playerId,playerId,playerId,playerId], (error, results, fields) => {
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
      var query = connection.query(`SELECT concat(u1.firstName,' ',u1.lastName) as winnerName1,concat(u2.firstName,' ',u2.lastName) as winnerName2,concat(u3.firstName,' ',u3.lastName) as loserName1, concat(u4.firstName,' ',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,tour.name as tournamentName,c1.Conferences_conferenceId,dr1.rank as winnerRank,dr2.rank as loserRank,c1.collegeId as winnerCollege,c3.collegeId as loserColleger FROM DoubleMatches dm
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
      LEFT JOIN DoubleRanking dr1 on dt1.doubleTeamId = dr1.DoubleTeams_doubleTeamId AND dr1.type = \'N\' LEFT JOIN DoubleRanking dr2 on dt2.doubleTeamId = dr2.DoubleTeams_doubleTeamId AND dr2.type = \'N\'
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1,concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,c1.Conferences_conferenceId,tou.name as tournamentName,dr1.rank as winnerRank,dr2.rank as loserRank,c1.collegeId as winnerCollege,c3.collegeId as loserColleger  FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId INNER JOIN Tournaments tou on tou.tournamentId = dm.Tournaments_tournamentId LEFT JOIN DoubleRanking dr1 on dt1.doubleTeamId = dr1.DoubleTeams_doubleTeamId AND dr1.type = \'N\' LEFT JOIN DoubleRanking dr2 on dt2.doubleTeamId = dr2.DoubleTeams_doubleTeamId AND dr2.type = \'N\' WHERE dm.springFall = ? AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND dm.Tournaments_tournamentId = ? AND (p1.playerId = ? OR p2.playerId = ? OR p3.playerId = ? OR p4.playerId = ?) ORDER BY dm.date DESC', [springFall,year,yearPlusOne,tournamentId,playerId1,playerId1,playerId1,playerId1], (error, results, fields) => {
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
      var query = connection.query('SELECT concat(u1.firstName,\' \',u1.lastName) as winnerName1,concat(u2.firstName,\' \',u2.lastName) as winnerName2,concat(u3.firstName,\' \',u3.lastName) as loserName1, concat(u4.firstName,\' \',u4.lastName) as loserName2,p1.playerId as winner1Id,p2.playerId as winner2Id,p3.playerId as loser1Id,p4.playerId as loser2Id,dm.*,tour.name as tournamentName,c1.Conferences_conferenceId,dr1.rank as winnerRank,dr2.rank as loserRank,c1.collegeId as winnerCollege,c3.collegeId as loserColleger FROM DoubleMatches dm INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId INNER JOIN Players p1 on p1.playerId =  dt1.Players_playerId INNER JOIN Players p2 on p2.playerId =  dt1.Players_playerId2 INNER JOIN Players p3 on p3.playerId =  dt2.Players_playerId INNER JOIN Players p4 on p4.playerId =  dt2.Players_playerId2 INNER JOIN Users u1 on u1.userId = p1.Users_userId INNER JOIN Users u2 on u2.userId = p2.Users_userId INNER JOIN Users u3 on u3.userId = p3.Users_userId INNER JOIN Users u4 on u4.userId = p4.Users_userId INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId INNER JOIN Teams t3 on t3.teamId = p3.Teams_teamId INNER JOIN Teams t4 on t4.teamId = p4.Teams_teamId INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId INNER JOIN Colleges c3 on c3.collegeId = t3.Colleges_collegeId INNER JOIN Colleges c4 on c4.collegeId = t4.Colleges_collegeId  LEFT JOIN Tournaments tour on tour.tournamentId = dm.Tournaments_tournamentId LEFT JOIN DoubleRanking dr1 on dt1.doubleTeamId = dr1.DoubleTeams_doubleTeamId AND dr1.type = \'N\' LEFT JOIN DoubleRanking dr2 on dt2.doubleTeamId = dr2.DoubleTeams_doubleTeamId AND dr2.type = \'N\' WHERE dm.springFall = ?  AND dm.date >= \'?-09-01\' AND dm.date <= \'?-06-30\' AND dm.Tournaments_tournamentId = ?   AND (dt1.Players_playerId = ? AND dt1.Players_playerId2 = ?) OR (dt1.Players_playerId2 = ? AND dt1.Players_playerId = ?) OR (dt2.Players_playerId = ? AND dt2.Players_playerId2 = ?) OR (dt2.Players_playerId2 = ? AND dt2.Players_playerId = ?)  ORDER BY dm.date DESC', [springFall,year,yearPlusOne,tournamentId,playerId1,playerId2,playerId2,playerId1,playerId1,playerId2,playerId2,playerId1], (error, results, fields) => {
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

  getMatchSimpleOrDoubleByMatchId (req, res) {

    const matchId = req.params.matchId;
    const matchType = req.params.matchType;

    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      if(matchType == 'S')
      {
        var query = connection.query(`SELECT sm.simpleMatchId, sm.date,c1.name as collegeWinner,c2.name as collegeLoser,t1.Coaches_headCoachId as coachIdCollegeWinner,t2.Coaches_headCoachId as coachIdCollegeLoser,concat(u3.firstName,' ',u3.lastName) as coachNameCollegeWinner,concat(u4.firstName,' ',u4.lastName) as coachNameCollegeLoser,sm.Tournaments_tournamentId,t.name,sm.score,concat(u1.firstName,' ',u1.lastName) as winnerName, concat(u2.firstName,' ',u2.lastName) as loserName,p1.playerId as winnerId,p2.playerId as loserId
        FROM  SimpleMatches sm
        INNER JOIN Players p1 on sm.winner = p1.playerId
        INNER JOIN Players p2 on sm.loser = p2.playerId
        INNER JOIN Users u1 on u1.userId = p1.Users_userId
        INNER JOIN Users u2 on u2.userId = p2.Users_userId
        INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId
        INNER JOIN Teams t2 on t2.teamId = p2.Teams_teamId
        INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId
        INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId
        LEFT JOIN Tournaments t on t.tournamentId = sm.Tournaments_tournamentId
        INNER JOIN Coaches co1 on co1.coachId = t1.Coaches_headCoachId
        INNER JOIN Coaches co2 on co2.coachId = t2.Coaches_headCoachId
        INNER JOIN Users u3 on u3.userId = co1.Users_userId
        INNER JOIN Users u4 on u4.userId = co2.Users_userId
        WHERE sm.simpleMatchId = ?
        `, matchId, (error, results, fields) => {
          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        });
      }
      else if (matchType == 'D')
      {
        var query = connection.query(`SELECT dm.doubleMatchId,c1.name as collegeWinner,c2.name as collegeLoser,co1.coachId as coachIdCollegeWinner,co2.coachId as coachIdCollegeLoser,concat(u5.firstName,' ',u5.lastName) as coachNameCollegeWinner,concat(u6.firstName,' ',u6.lastName) as coachNameCollegeLoser,dm.Tournaments_tournamentId,t.name,dm.score,concat(u1.firstName,' ',u1.lastName) as winnerName1, concat(u2.firstName,' ',u2.lastName) as winnerName2,concat(u3.firstName,' ',u3.lastName) as loserName1, concat(u4.firstName,' ',u4.lastName) as loserName2,p1.playerId as winnerId1,p2.playerId as winnerId2,p3.playerId as loserId1,p4.playerId as loserId2
        FROM  DoubleMatches dm
        INNER JOIN DoubleTeams dt1 on dm.winnerDouble = dt1.doubleTeamId
        INNER JOIN DoubleTeams dt2 on dm.loserDouble = dt2.doubleTeamId
        INNER JOIN Players p1 on dt1.Players_playerId = p1.playerId
        INNER JOIN Players p2 on dt1.Players_playerId2 = p2.playerId
        INNER JOIN Players p3 on dt2.Players_playerId = p3.playerId
        INNER JOIN Players p4 on dt2.Players_playerId2 = p4.playerId
        INNER JOIN Users u1 on p1.Users_userId = u1.userId
        INNER JOIN Users u2 on p2.Users_userId = u2.userId
        INNER JOIN Users u3 on p3.Users_userId = u3.userId
        INNER JOIN Users u4 on p4.Users_userId = u4.userId
        INNER JOIN Teams t1 on t1.teamId = p1.Teams_teamId
        INNER JOIN Teams t2 on t2.teamId = p3.Teams_teamId
        LEFT JOIN Tournaments t on t.tournamentId = dm.Tournaments_tournamentId
        INNER JOIN Coaches co1 on co1.coachId = t1.Coaches_headCoachId
        INNER JOIN Coaches co2 on co2.coachId = t2.Coaches_headCoachId
        INNER JOIN Users u5 on u5.userId = co1.Users_userId
        INNER JOIN Users u6 on u6.userId = co2.Users_userId
        INNER JOIN Colleges c1 on c1.collegeId = t1.Colleges_collegeId
        INNER JOIN Colleges c2 on c2.collegeId = t2.Colleges_collegeId
        where doubleMatchId = ?
        `, matchId, (error, results, fields) => {
          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        });
      }

    });
  },

};
