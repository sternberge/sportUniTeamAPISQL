var db = require('./../db');
const RankRulesController = require('../controllers/rank_rules_controller');
const DoubleTeamsController = require('../controllers/double_teams_controller');
const RegionsController = require('../controllers/regions_controller');
const ConferencesController = require('../controllers/conferences_controller');
const DoubleRankingHistoryController = require('../controllers/double_ranking_history_controller');

const updateDoubleRankingOrder = (doubleRankingId, rank, differenceRank) => {
  return new Promise(function(resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`UPDATE DoubleRanking
        SET rank = ?, differenceRank = ?
        WHERE doubleRankingId = ?`, [rank, differenceRank, doubleRankingId], (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        resolve(results);
      });
    });
  });
}

const getNewNationalRankingOrder = (leagueId, gender) => {
  return new Promise(function(resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT doubleRankingId, rank
      FROM DoubleRanking dr
			INNER JOIN DoubleTeams dt on dt.doubleTeamId = dr.DoubleTeams_doubleTeamId
			INNER JOIN Players p on p.playerId = dt.Players_playerId
			INNER JOIN Users u on u.userId = p.Users_userId
			INNER JOIN Teams t on t.teamId = p.Teams_teamId
			INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
			WHERE dr.type = 'N' AND c.Leagues_leagueId = ? AND t.gender = ?
			ORDER BY dr.rankPoints DESC`, [leagueId, gender], (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        resolve(results);
      });
    });
  });
}

const getNewRegionalRankingOrder = (leagueId, gender, regionId) => {
  return new Promise(function(resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT doubleRankingId, rank
      FROM DoubleRanking dr
			INNER JOIN DoubleTeams dt on dt.doubleTeamId = dr.DoubleTeams_doubleTeamId
			INNER JOIN Players p on p.playerId = dt.Players_playerId
			INNER JOIN Users u on u.userId = p.Users_userId
			INNER JOIN Teams t on t.teamId = p.Teams_teamId
			INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
			WHERE dr.type = 'R' AND c.Leagues_leagueId = ? AND t.gender = ? AND c.Regions_regionId = ?
			ORDER BY dr.rankPoints DESC`, [leagueId, gender, regionId], (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        resolve(results);
      });
    });
  });
}

const getNewConferenceRankingOrder = (leagueId, gender, conferenceId) => {
  return new Promise(function(resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT doubleRankingId, rank
      FROM DoubleRanking dr
			INNER JOIN DoubleTeams dt on dt.doubleTeamId = dr.DoubleTeams_doubleTeamId
			INNER JOIN Players p on p.playerId = dt.Players_playerId
			INNER JOIN Users u on u.userId = p.Users_userId
			INNER JOIN Teams t on t.teamId = p.Teams_teamId
			INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
			WHERE dr.type = 'C' AND c.Leagues_leagueId = ? AND t.gender = ? AND c.Conferences_conferenceId
			ORDER BY dr.rankPoints DESC`, [leagueId, gender, conferenceId], (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        resolve(results);
      });
    });
  });
}

const getBestDoubleMatchesWon = (rankingType, doubleTeamId, limit, date) => {
  return new Promise(function(resolve, reject) {
    limit = Number(limit);
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT dm.homeAway, rpr.winOverRankPoints
        FROM DoubleMatches dm
        INNER JOIN DoubleTeams dt on dt.doubleTeamId = dm.loserDouble
        INNER JOIN DoubleRanking dr on dr.DoubleTeams_doubleTeamId = dt.doubleTeamId
        INNER JOIN RankPointsRules rpr on rpr.opponentRank = dr.rank
        WHERE dm.winnerDouble = ? and dr.type = ? and rpr.type = 'D' and dm.date > ?
        ORDER BY rpr.opponentRank ASC LIMIT ?`, [doubleTeamId, rankingType, date, limit], (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        return resolve(results);
      });
    });
  });
}

const getBestDoubleMatchesLost = (rankingType, doubleTeamId, limit, date) => {
  return new Promise(function(resolve, reject) {
    limit = Number(limit);
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT dm.homeAway, rpr.lossToRankPoints
        FROM DoubleMatches dm
        INNER JOIN DoubleTeams dt on dt.doubleTeamId = dm.winnerDouble
        INNER JOIN DoubleRanking dr on dr.DoubleTeams_doubleTeamId = dt.doubleTeamId
        INNER JOIN RankPointsRules rpr on rpr.opponentRank = dr.rank
        WHERE dm.winnerDouble = ? and dr.type = ? and rpr.type = 'D' and dm.date > ?
        ORDER BY rpr.opponentRank ASC LIMIT ?`, [doubleTeamId, rankingType, date, limit], (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        return resolve(results);
      });
    });
  });
}

const getDoubleRankingByDoubleTeamIdAndRankingType = (doubleTeamId, rankingType) => {
  return new Promise((resolve, reject) => {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT dr.doubleRankingId, dr.rankPoints
        FROM DoubleRanking dr
        WHERE dr.DoubleTeams_doubleTeamId = ? and dr.type = ?`, [doubleTeamId, rankingType],
        (error, results, fields) => {
          if (error) {
            connection.release();
            return reject(error);
          }
          connection.release(); // CLOSE THE CONNECTION
          resolve(results);
        });
    });
  });
}

const updateDoubleTeamRankingPoints = (doubleRankingId, rankPoints,
  differencePoints) => {
  return new Promise((resolve, reject) => {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`UPDATE DoubleRanking
        SET rankPoints = ?, differencePoints = ?
        WHERE doubleRankingId = ?`, [rankPoints, differencePoints, doubleRankingId],
        (error, results, fields) => {
          if (error) {
            connection.release();
            return reject(error);
          }
          connection.release(); // CLOSE THE CONNECTION
          resolve(results);
        });
    });
  });
}

const calculateDoubleRankingPerTypeAndDoubleTeam = async (rankingType,
  doubleTeamId, limit, date) => {
  return new Promise(async (resolve, reject) => {
    let winPoints = 0;
    let losePoints = 0;
    let nbMatchesWon = 0;
    let nbMatchesLost = 0;
    let rankPoints = 0;
    let differencePoints = 0.0;
    let bestDoubleMatchesWon = [];
    let bestDoubleMatchesLost = [];
    let doubleRanking = [];

    try {
      bestDoubleMatchesWon = await getBestDoubleMatchesWon(rankingType,
        doubleTeamId, limit, date);
      console.log(`Best Double Matches Won retrieved for type ${rankingType} and doubleTeamId ${doubleTeamId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not retrieve best double matches won for type ${rankingType} and doubleTeamId ${doubleTeamId}`);
    }

    nbMatchesWon = bestDoubleMatchesWon.length;
    for (let i = 0; i < nbMatchesWon; i++) {
      winPoints += bestDoubleMatchesWon[i].winOverRankPoints;
      if(bestDoubleMatchesWon[i].homeAway = 'A'){
        winPoints *= 1.1;
      }
    }

    if ((nbMatchesWon < limit) && (nbMatchesWon > 0)) {
      const countableBestLostMatches = limit - nbMatchesWon;

      try {
        bestDoubleMatchesLost = await getBestDoubleMatchesLost(rankingType,
          doubleTeamId, limit, date);
        console.log(`Best Double Matches Lost retrieved for type ${rankingType} and doubleTeamId ${doubleTeamId}`);
      } catch (err) {
        console.log(err);
        return reject(`Could not retrieve best double matches lost for type ${rankingType} and doubleTeamId ${doubleTeamId}`);
      }

      const nbMatchesLost = bestDoubleMatchesLost.length;
      for (let i = 0; i < nbMatchesLost; i++) {
        losePoints += bestDoubleMatchesLost[i].lossToRankPoints;
      }

      //ITA Formula for rank points
      rankPoints = winPoints / (nbMatchesWon + losePoints);
      //rankPoints = 60; //For testing
    } else if (nbMatchesWon == 0) {
      console.log(`No match won for doubleTeamId ${doubleTeamId} and type ${rankingType}`);
    } else {
      console.log(`All countable matches are wins for doubleTeamId ${doubleTeamId} and type ${rankingType}`);
    }

    let doubleRankingId = 0;
    let oldRankPoints = 0.0;

    try {
      doubleRanking = await getDoubleRankingByDoubleTeamIdAndRankingType(doubleTeamId, rankingType);
      doubleRankingId = doubleRanking[0].doubleRankingId;
      oldRankPoints = doubleRanking[0].rankPoints;
      oldRank = doubleRanking[0].rank;
      differencePoints = parseFloat(rankPoints) - parseFloat(oldRankPoints);

      console.log(`doubleRankingId is ${doubleRankingId} for doubleTeamId ${doubleTeamId} and type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not retrieve doubleRankingId for doubleTeamId ${doubleTeamId} and type ${rankingType}`);
    }

    try {
      const updateDoubleTeamRankingPointsPromise = await updateDoubleTeamRankingPoints(doubleRankingId,
        rankPoints, differencePoints);
      console.log(`rankPoints and differencePoints updated for doubleRankingId ${doubleRankingId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not update rankPoints for doubleRankingId ${doubleRankingId}`);
    }

    resolve(`New doubleRanking Points computed for doubleTeamId ${doubleTeamId} and type ${rankingType}`);
  });
}

const calculateDoubleRankingPerType = async (rankingType) => {
  return new Promise(async function(resolve, reject) {
    let doubleTeamsIds = [];
    try {
      doubleTeamsIds = await DoubleTeamsController.getDoubleTeamIds();
      console.log(`DoubleTeams IDs retrieved for type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject("Could not retrieve DoubleTeams IDs");
    }

    const limit = 5;
    const date = "2017-01-01";

    try {
      const promisesPerDoubleTeam = doubleTeamsIds.map(doubleTeamId =>
        calculateDoubleRankingPerTypeAndDoubleTeam(rankingType, doubleTeamId.doubleTeamId, limit,
          date)
      );
      await Promise.all(promisesPerDoubleTeam);
      resolve(`New Double Ranking Points calculated for type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not calculate new doubleRanking Points for type ${rankingType}`);
    }

  });
}

const calculateDoubleRanking = async () => {
  return new Promise ( async (resolve, reject) => {
    const rankingTypes = ["N", "R", "C"];

    try {
      const promisesPerTypeCalculation = rankingTypes.map(rankingType =>
        calculateDoubleRankingPerType(rankingType)
      );
      await Promise.all(promisesPerTypeCalculation);
      resolve("New Double Ranking Points calculated for all types");

    } catch (err) {
      console.log(err);
      reject("New Double Ranking Points calculation failed");
    }

  });
}

const createNewDoubleRanking = async (req, res) => {
  try{
    console.log("Initiating double ranking archiving process");
    const archiveCurrentDoubleRankingsPromise =
    await DoubleRankingHistoryController.archiveCurrentDoubleRankings();
    console.log(archiveCurrentDoubleRankingsPromise);
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Double Ranking Failed"}));
  }

  try{
    console.log("Initiating calculation of new Double Ranking Points");
    const calculateDoubleRankingPromise = await calculateDoubleRanking();
    console.log(calculateDoubleRankingPromise);
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Double Ranking Failed"}));
  }

  try{
    console.log("Initiating ordering of new Double Ranking");
    const orderDoubleRankingPromise = await orderDoubleRanking();
    console.log(orderDoubleRankingPromise);
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Double Ranking Failed"}));
  }

  console.log("New Double Ranking Created");

  res.send(JSON.stringify({"status": 200, "error": null, "response": "New Double Ranking Done"}));


}

const orderNationalRanking = async (leagueId, gender) => {
  return new Promise( async (resolve, reject) => {
    let newNationalRanking = [];

    try{
      newNationalRanking = await getNewNationalRankingOrder(leagueId, gender);
      console.log(`New national ranking order fetched for league ${leagueId} and gender ${gender}`);
    } catch(err){
      console.log(err);
      return reject(`Could not fetch new national ranking order for league ${leagueId} and gender ${gender}`);
    }

    try{
      const updateNationalDoubleRankingOrderPromises = newNationalRanking.map( (doubleTeamNationalRank, rank) =>
        updateDoubleRankingOrder(doubleTeamNationalRank.doubleRankingId, rank + 1, rank + 1 - doubleTeamNationalRank.rank)
      );
      await Promise.all(updateNationalDoubleRankingOrderPromises);
      console.log(`National double ranking updated for league ${leagueId} and gender ${gender}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update national double ranking for league ${leagueId} and gender ${gender}`);
    }

    resolve(`National Double Ranking ordering done for league ${leagueId} and gender ${gender}`);
  });
}

const orderRegionalRankingPerRegion = async (leagueId, gender, regionId) => {
  return new Promise( async (resolve, reject) => {
    let newRegionalRanking = [];
    try{
      newRegionalRanking = await getNewRegionalRankingOrder(leagueId, gender, regionId);
      console.log(`New regional ranking order fetched for league ${leagueId}, gender ${gender} and region ${regionId}`);
    } catch(err){
      console.log(err);
      return reject(`Could not fetch new regional ranking order for league ${leagueId}, gender ${gender} and region ${regionId}`);
    }

    try{
      const updateRegionalDoubleRankingOrderPromises = newRegionalRanking.map( (doubleTeamRegionalRank, rank) =>
        updateDoubleRankingOrder(doubleTeamRegionalRank.doubleRankingId, rank + 1, rank + 1 - doubleTeamRegionalRank.rank)
      );
      await Promise.all(updateRegionalDoubleRankingOrderPromises);
      console.log(`Regional double ranking updated for league ${leagueId}, gender ${gender} and region ${regionId}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update regional double ranking for league ${leagueId}, gender ${gender} and region ${regionId}`);
    }

    resolve(`Regional Double Ranking ordering done for league ${leagueId}, gender ${gender} and region ${regionId}`);
  });
}

const orderRegionalRanking = async (leagueId, gender) => {
  return new Promise( async (resolve, reject) => {
    let regions = [];
    let orderRegionalRankingPerRegionPromises = [];
    try{
      regions = await RegionsController.getRegionIds();
      console.log(`Region Ids fetched`);
    } catch(err){
      console.log(err);
      return reject(`Could not fetch Region Ids`);
    }

    try{
      const orderRegionalDoubleRankingOrderPromises = regions.map( region =>
        orderRegionalRankingPerRegion(leagueId, gender, region.regionId)
      );
      await Promise.all(orderRegionalDoubleRankingOrderPromises);
      console.log(`Regional double ranking updated for league ${leagueId} and gender ${gender}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update regional double ranking for league ${leagueId} and gender ${gender}`);
    }

    resolve(`Regional Double Ranking ordering done for league ${leagueId} and gender ${gender}`);
  });
}

const orderConferenceRankingPerConference = async (leagueId, gender, conferenceId) => {
  return new Promise( async (resolve, reject) => {
    let newConferenceRanking = [];
    try{
      newConferenceRanking = await getNewConferenceRankingOrder(leagueId, gender, conferenceId);
      console.log(`New conference ranking order fetched for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    } catch(err){
      console.log(err);
      return reject(`Could not fetch new conference ranking order for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    }


    try{
      const updateConferenceDoubleRankingOrderPromises = newConferenceRanking.map( (doubleTeamConferenceRank, rank) =>
        updateDoubleRankingOrder(doubleTeamConferenceRank.doubleRankingId, rank + 1, rank + 1 - doubleTeamConferenceRank.rank)
      );
      await Promise.all(updateConferenceDoubleRankingOrderPromises);
      console.log(`Conference double ranking updated for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update conference double ranking for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    }

    resolve(`Conference Double Ranking ordering done for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
  });
}

const orderConferenceRanking = async (leagueId, gender) => {
  return new Promise( async (resolve, reject) => {
    let conferences = [];
    let orderConferenceRankingPerConferencePromises = [];
    try{
      conferences = await ConferencesController.getConferenceIds();
      console.log(`Conference Ids fetched`);
    } catch(err){
      console.log(err);
      return reject(`Could not fetch Conference Ids`);
    }

    try{
      const orderConferenceDoubleRankingOrderPromises = conferences.map( conference =>
        orderConferenceRankingPerConference(leagueId, gender, conference.conferenceId)
      );
      await Promise.all(orderConferenceDoubleRankingOrderPromises);
      console.log(`Conference double ranking updated for league ${leagueId} and gender ${gender}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update conference double ranking for league ${leagueId} and gender ${gender}`);
    }

    resolve(`Conference Double Ranking ordering done for league ${leagueId} and gender ${gender}`);
  });
}

const orderRankingPerGender = async (leagueId) => {
  return new Promise( async (resolve, reject) => {
    const genders = ["M", "F"];

    const orderNationalRankingPerGenderPromises = genders.map(gender =>
      orderNationalRanking(leagueId, gender)
    );

    const orderRegionalRankingPerGenderPromises = genders.map(gender =>
      orderRegionalRanking(leagueId, gender)
    );

    const orderConferenceRankingPerGenderPromises = genders.map(gender =>
      orderConferenceRanking(leagueId, gender)
    );

    try{
      await Promise.all(orderNationalRankingPerGenderPromises);
      console.log(`National Double Ranking ordered for all genders and league ${leagueId}`);
    } catch(err){
      console.log(err);
      return reject(`National Double Ranking ordering failed for league ${leagueId}`);
    }

    try{
      await Promise.all(orderRegionalRankingPerGenderPromises);
      console.log(`Regional Double Ranking ordered for all genders and league ${leagueId}`);
    } catch(err){
      console.log(err);
      return reject(`Regional Double Ranking ordering failed for league ${leagueId}`);
    }

    try{
      await Promise.all(orderConferenceRankingPerGenderPromises);
      console.log(`Conference Double Ranking ordered for all genders and league ${leagueId}`);
    } catch(err){
      console.log(err);
      return reject(`Conference Double Ranking ordering failed for league ${leagueId}`);
    }

    resolve(`Double Ranking ordering done for league ${leagueId}`);
  });
}

const orderDoubleRanking = async () => {
  return new Promise ( async (resolve, reject) => {
    const leagues = [1, 2, 3, 4, 5];

    try{
      const orderRankingPerLeaguePromises = leagues.map(leagueId =>
        orderRankingPerGender(leagueId)
      );
      await Promise.all(orderRankingPerLeaguePromises);
      resolve("New Double Ranking ordered for all leagues");
    } catch(err){
      console.log(err);
      reject("New Double Ranking ordering failed");
    }

  });
}

module.exports = {

 createNewDoubleRanking,

  find(req, res) {
    const doubleRankingId = req.params.doubleRankingId;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM DoubleRanking WHERE doubleRankingId = ?', doubleRankingId, (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        } else if (results.length > 0) {
          res.send(JSON.stringify({
            "status": 200,
            "error": null,
            "response": results
          }));
          connection.release(); // CLOSE THE CONNECTION
        } else {
          res.send(JSON.stringify({
            "status": 500,
            "error": "Id does not exist",
            "response": null
          }));
          connection.release(); // CLOSE THE CONNECTION
        }
      });
    });
  },

  createInitialRanking(rank, teamId, type) {
    return new Promise((reject, resolve) => {
      db.pool.getConnection((error, connection) => {
        if (error) {
          return reject(error);
        }
        var query = connection.query('INSERT INTO DoubleRanking (rank, rankPoints, DoubleTeams_doubleTeamId,	differenceRank, differencePoints, type) VALUES(?, ?, ?, ?, ?, ?)', [rank, 0, teamId, 0, 0, type], (error, results, fields) => {
          if (error) {
            connection.release();
            return reject(error)
          }
          connection.release(); // CLOSE THE CONNECTION
          resolve(results.insertId);
        });
      });
    });
  },

  async create3InitialRanking(teamId) {
    var nonRankedValueDouble = await RankRulesController.getLastRankingPerType2("D");
    console.log("Valeur unranked pour classement simple :", nonRankedValueDouble);
    //On cree 3 classements unranked Single pour le regional national et country
    var type = ["R", "N", "C"];
    const promisesPerType = type.map(type =>
      module.exports.createInitialRanking(nonRankedValueDouble, teamId, type)
      .catch((error) => {
        console.log(error);
      })
    );
    await Promise.all(promisesPerType);
  },


  create(req, res, next) {
    const rank = req.body.rank;
    const rankPoints = req.body.rankPoints;
    const DoubleTeams_doubleTeamId = req.body.DoubleTeams_doubleTeamId;
    const differenceRank = req.body.differenceRank;
    const differencePoints = req.body.differencePoints;
    const type = req.body.type;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }

      var query = connection.query('INSERT INTO DoubleRanking (DoubleTeams_doubleTeamId, rank, rankPoints, differenceRank, differencePoints, type) VALUES(?, ?, ?, ?, ?, ?)', [DoubleTeams_doubleTeamId, rank, rankPoints, differenceRank, differencePoints, type], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
        return (results.insertId);
      });
    });
  },

  edit(req, res, next) {
    const doubleRankingId = req.params.doubleRankingId;
    const doubleRankingProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query('UPDATE DoubleRanking SET ? WHERE doubleRankingId = ?', [doubleRankingProperties, doubleRankingId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  delete(req, res, next) {
    const doubleRankingId = req.params.doubleRankingId;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query('DELETE FROM DoubleRanking WHERE doubleRankingId = ?', doubleRankingId, (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  //Get the current national ranking order
  getDoubleRankingsNationalByDivisionGender(req, res, next) {
    const leagueId = req.params.leagueId;
    const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT dr.doubleRankingId, dr.DoubleTeams_doubleTeamId, dr.rank, dr.rankPoints, dr.differenceRank, dr.differencePoints,
		u1.firstName as firstNamePlayer1, u1.lastName as lastNamePlayer1, p1.status as statusPlayer1, u2.firstName as firstNamePlayer2, u2.lastName as lastNamePlayer2, p2.status as statusPlayer2,
		c.name as collegeName
		FROM DoubleRanking dr
		inner join DoubleTeams dt on dt.doubleTeamId = dr.DoubleTeams_doubleTeamId
		inner join Players p1 on p1.playerId = dt.Players_playerId
		inner join Players p2 on p2.playerId = dt.Players_playerId2
		inner join Users u1 on u1.userId = p1.Users_userId
		inner join Users u2 on u2.userId = p2.Users_userId
		inner join Teams t on t.teamId = p1.Teams_teamId
		inner join Colleges c on c.collegeId = t.Colleges_collegeId
		inner join Leagues l on l.leagueId = c.Leagues_leagueId
		WHERE u1.gender LIKE ? AND dr.type = 'N' AND l.leagueId LIKE ?
		ORDER BY dr.rank ASC`, [gender, leagueId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  //Get the current regional ranking order
  getDoubleRankingsByRegionDivisionGender(req, res, next) {
    const regionId = req.params.regionId;
    const leagueId = req.params.leagueId;
    const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT dr.doubleRankingId, dr.DoubleTeams_doubleTeamId, dr.rank, dr.rankPoints, dr.differenceRank, dr.differencePoints,
		u1.firstName as firstNamePlayer1, u1.lastName as lastNamePlayer1, p1.status as statusPlayer1, u2.firstName as firstNamePlayer2, u2.lastName as lastNamePlayer2, p2.status as statusPlayer2,
		c.name as collegeName
		FROM DoubleRanking dr
		inner join DoubleTeams dt on dt.doubleTeamId = dr.DoubleTeams_doubleTeamId
		inner join Players p1 on p1.playerId = dt.Players_playerId
		inner join Players p2 on p2.playerId = dt.Players_playerId2
		inner join Users u1 on u1.userId = p1.Users_userId
		inner join Users u2 on u2.userId = p2.Users_userId
		inner join Teams t on t.teamId = p1.Teams_teamId
		inner join Colleges c on c.collegeId = t.Colleges_collegeId
		inner join Leagues l on l.leagueId = c.Leagues_leagueId
		WHERE u1.gender LIKE ? AND dr.type = 'R' AND c.Regions_regionId = ? AND l.leagueId LIKE ?
		ORDER BY dr.rank ASC`, [gender, regionId, leagueId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  //Get the current ranking order by conference
  getDoubleRankingsByConferenceDivisionGender(req, res, next) {
    const conferenceId = req.params.conferenceId;
    const leagueId = req.params.leagueId;
    const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT dr.doubleRankingId, dr.DoubleTeams_doubleTeamId, dr.rank, dr.rankPoints, dr.differenceRank, dr.differencePoints,
		u1.firstName as firstNamePlayer1, u1.lastName as lastNamePlayer1, p1.status as statusPlayer1, u2.firstName as firstNamePlayer2, u2.lastName as lastNamePlayer2, p2.status as statusPlayer2,
		c.name as collegeName
		FROM DoubleRanking dr
		inner join DoubleTeams dt on dt.doubleTeamId = dr.DoubleTeams_doubleTeamId
		inner join Players p1 on p1.playerId = dt.Players_playerId
		inner join Players p2 on p2.playerId = dt.Players_playerId2
		inner join Users u1 on u1.userId = p1.Users_userId
		inner join Users u2 on u2.userId = p2.Users_userId
		inner join Teams t on t.teamId = p1.Teams_teamId
		inner join Colleges c on c.collegeId = t.Colleges_collegeId
		inner join Leagues l on l.leagueId = c.Leagues_leagueId
		WHERE u1.gender LIKE ? AND dr.type = 'C' AND c.Conferences_conferenceId = ? AND l.leagueId LIKE ?
		ORDER BY dr.rank ASC`, [gender, conferenceId, leagueId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

};
