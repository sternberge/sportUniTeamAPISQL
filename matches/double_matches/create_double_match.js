const db = require('./../../db');
const PlayerController = require('./../../controllers/player_controller');
const DoubleRankingController = require('./../../controllers/double_ranking_controller');

const checkDoubleTeamExistency = (playerId1, playerId2) => {
  return new Promise(function (resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error){
        return reject(error);
      }
      var tmp1 = playerId1;
      var tmp2 = playerId2;
      //console.log("playerId1");
      if(playerId1>playerId2){
        tmp1 = playerId2;
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
}

const createDoubleTeam = (playerId1,playerId2) => {
  return new Promise(function (resolve, reject) {
    var tmp1 = playerId1;
    var tmp2 = playerId2;
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
}

const checkPlayersSameTeam = (playerId1,playerId2,playerId3,playerId4) => {
  return new Promise((resolve,reject) => {
    // On recupere les teamId de chacun des joueurs
    const teamsId = Promise.all([PlayerController.getPlayerTeamId(playerId1),PlayerController.getPlayerTeamId(playerId2),PlayerController.getPlayerTeamId(playerId3),PlayerController.getPlayerTeamId(playerId4)])
    //Si les couples de joeurs ne sont pas dans la meme equipe
    if(teamsId[0]!=teamsId[1] || teamsId[2]!=teamsId[3]){
      reject("Players of a double match should be in the same team");
    }
    else{
      resolve();
    }
  });
}

const createDoubleMatch = async (req,res) => {
  const playerId1 = req.body.playerId1;
  const playerId2 = req.body.playerId2;
  const playerId3 = req.body.playerId3;
  const playerId4 = req.body.playerId4;
  const date = req.body.date;
  try {
    //Check si les players de double son dans la meme equipe
    const teamId = await checkPlayersSameTeam(playerId1,playerId2,playerId3,playerId4);
    //Check de l'existance des deux couples de joueurs entres
    let doubleTeams = await Promise.all([checkDoubleTeamExistency(playerId1,playerId2),checkDoubleTeamExistency(playerId3,playerId4)]);
    // Si les deux couples n'existent pas --> Creation des deux nouvelles equipes
    if(doubleTeams[0] == false && doubleTeams[1] == false){
      console.log("Appel de la seconde methode");
      doubleTeams = await Promise.all([createDoubleTeam(playerId1,playerId2),createDoubleTeam(playerId3,playerId4)])
      // Creation des ranking initiaux pour les deux nouvelles equipes de double
      const rankingTeam1 = DoubleRankingController.create3InitialRanking(doubleTeams[0]);
      const rankingTeam2 = DoubleRankingController.create3InitialRanking(doubleTeams[1]);
    }
    // Si une des deux equipes existent deja
    else if(doubleTeams[0] != false && doubleTeams[1] == false){
      doubleTeams = await Promise.all([doubleTeams[0],createDoubleTeam(playerId3,playerId4)]);
      //Creation du ranking initial pour la nouvelle equipe de double
      const rankingTeam2 = DoubleRankingController.create3InitialRanking(doubleTeams[1]);
    }
    else if(doubleTeams[0] == false && doubleTeams[1] != false){
      doubleTeams = await Promise.all([createDoubleTeam(playerId1,playerId2),doubleTeams[1]]);
      //Creation du ranking initial pour la nouvelle equipe de double
      const rankingTeam1 = DoubleRankingController.create3InitialRanking(doubleTeams[0]);
    }
    else{
      // Check que le match saisi n'est pas un doublon
      await checkDoubleMatchUnicity(doubleTeams[0],doubleTeams[1],date);
    }
    // Creation du match double
    await createDoubleMatch2(req,doubleTeams[0],doubleTeams[1]);
    res.send(JSON.stringify({"status": 200, "error": null, "response": "Your match has been added"}));
  }
  catch(error){
    res.send(JSON.stringify({"status": 500, "error": error, "response": error}));
  }
}

const checkDoubleMatchUnicity = (winnerDoubleId,loserDoubleId,date) => {
  return new Promise((resolve,reject) => {
    db.pool.getConnection((error, connection) => {
      if (error){
        return reject(error);
      }
      var query = connection.query('Select 1 from DoubleMatches Where winnerDouble = ? And loserDouble = ? And date = ?',
      [winnerDoubleId,loserDoubleId,date], (error, results, fields) => {
        if (error){
          connection.release();
          return reject(error);
        }
        else if (results.length > 0){
          reject("Match already exist");
          connection.release(); // CLOSE THE CONNECTION
        }
        else{
          resolve(results);
          connection.release(); // CLOSE THE CONNECTION
        }
      });
    });
  });
}

// Creation du match double avec promise
const createDoubleMatch2 = (req,teamId1,teamId2) => {
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
}

module.exports = {
  createDoubleMatch
}
