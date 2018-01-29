var db = require('./../db');
const RankRulesController = require('../controllers/rank_rules_controller');
const RegionsController = require('../controllers/regions_controller');
const ConferencesController = require('../controllers/conferences_controller');
const TeamRankingHistoryController = require('../controllers/team_ranking_history_controller');
const TeamsController = require('../controllers/teams_controller');

const updateTeamRankingOrder = (teamRankingId, rank, previousRank) => {
    return new Promise(function (resolve, reject) {
      db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var query = connection.query(`UPDATE TeamRanking
          SET rank = ?, previousRank = ?
          WHERE teamRankingId = ?`,[rank, previousRank, teamRankingId], (error, results, fields) => {
			  if (error){
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
    return new Promise(function (resolve, reject) {
      db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var query = connection.query(`SELECT teamRankingId, rank
        FROM TeamRanking tr
  			INNER JOIN Teams t on t.teamId = tr.Teams_teamId
  			INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
  			WHERE dr.type = 'N' AND c.Leagues_leagueId = ? AND t.gender = ?
  			ORDER BY dr.rankPoints DESC`,[leagueId, gender], (error, results, fields) => {
			  if (error){
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
    return new Promise(function (resolve, reject) {
      db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var query = connection.query(`SELECT teamRankingId, rank
        FROM TeamRanking tr
  			INNER JOIN Teams t on t.teamId = tr.Teams_teamId
  			INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
  			WHERE dr.type = 'R' AND c.Leagues_leagueId = ? AND t.gender = ? AND c.Regions_regionId
  			ORDER BY dr.rankPoints DESC`,[leagueId, gender, regionId], (error, results, fields) => {
			  if (error){
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
    return new Promise(function (resolve, reject) {
      db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var query = connection.query(`SELECT teamRankingId, rank
        FROM TeamRanking tr
  			INNER JOIN Teams t on t.teamId = tr.Teams_teamId
  			INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
  			WHERE dr.type = 'C' AND c.Leagues_leagueId = ? AND t.gender = ? AND c.Conferences_conferenceId
  			ORDER BY dr.rankPoints DESC`,[leagueId, gender, conferenceId], (error, results, fields) => {
			  if (error){
				connection.release();
				return reject(error);
			  }
			  connection.release(); // CLOSE THE CONNECTION
			  resolve(results);
			});
      });
    });
}

const getBestTeamMatchesWon = (rankingType, teamId, limit, date) => {
  return new Promise(function(resolve, reject) {
    limit = Number(limit);
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT sr.homeAway, rpr.winOverRankPoints
        FROM SpringResult sr
        INNER JOIN Teams t on t.teamId = sr.loserId
        INNER JOIN TeamRanking tr on tr.Teams_teamId = t.teamId
        INNER JOIN RankPointsRules rpr on rpr.opponentRank = tr.rank
        WHERE sr.winnerId = ? and tr.type = ? and rpr.type = 'T' and dm.date > ?
        ORDER BY rpr.opponentRank ASC LIMIT ?`, [teamId, rankingType, date, limit], (error, results, fields) => {
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

const getBestTeamMatchesLost = (rankingType, doubleTeamId, limit, date) => {
  return new Promise(function(resolve, reject) {
    limit = Number(limit);
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT sr.homeAway, rpr.lossToRankPoints
        FROM SpringResult sr
        INNER JOIN Teams t on t.teamId = sr.winnerId
        INNER JOIN TeamRanking tr on tr.Teams_teamId = t.teamId
        INNER JOIN RankPointsRules rpr on rpr.opponentRank = tr.rank
        WHERE sr.winnerId = ? and tr.type = ? and rpr.type = 'T' and dm.date > ?
        ORDER BY rpr.opponentRank ASC LIMIT ?`, [teamId, rankingType, date, limit], (error, results, fields) => {
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

const updateTeamRankingPoints = (teamRankingId, rankPoints,
  differencePoints) => {
  return new Promise((resolve, reject) => {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`UPDATE TeamRanking
        SET rankPoints = ?, differencePoints = ?
        WHERE teamRankingId = ?`, [rankPoints, differencePoints, teamRankingId],
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

const calculateTeamRankingPerTypeAndTeam = async (rankingType,
  teamId, limit, date) => {
  return new Promise(async (resolve, reject) => {
    let winPoints = 0;
    let losePoints = 0;
    let nbMatchesWon = 0;
    let nbMatchesLost = 0;
    let rankPoints = 0;
    let differencePoints = 0.0;
    let bestTeamMatchesWon = [];
    let bestTeamMatchesLost = [];
    let teamRanking = [];

    try {
      bestTeamMatchesWon = await getBestTeamMatchesWon(rankingType,
        teamId, limit, date);
      console.log(`Best Team Matches Won retrieved for type ${rankingType} and teamId ${teamId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not retrieve best team matches won for type ${rankingType} and teamId ${teamId}`);
    }

    nbMatchesWon = bestTeamMatchesWon.length;
    for (let i = 0; i < nbMatchesWon; i++) {
      winPoints += bestTeamMatchesWon[i].winOverRankPoints;
      if(bestTeamMatchesWon[i].homeAway = 'A'){
        winPoints *= 1.1;
      }
    }

    if ((nbMatchesWon < limit) && (nbMatchesWon > 0)) {
      const countableBestLostMatches = limit - nbMatchesWon;

      try {
        bestTeamMatchesLost = await getBestTeamMatchesLost(rankingType,
          teamId, limit, date);
        console.log(`Best Team Matches Lost retrieved for type ${rankingType} and teamId ${teamId}`);
      } catch (err) {
        console.log(err);
        return reject(`Could not retrieve best team matches lost for type ${rankingType} and teamId ${teamId}`);
      }

      const nbMatchesLost = bestTeamMatchesLost.length;
      for (let i = 0; i < nbMatchesLost; i++) {
        losePoints += bestTeamMatchesLost[i].lossToRankPoints;
      }

      //ITA Formula for rank points
      rankPoints = winPoints / (nbMatchesWon + losePoints);
      //rankPoints = 60; //For testing
    } else if (nbMatchesWon == 0) {
      console.log(`No match won for teamId ${teamId} and type ${rankingType}`);
    } else {
      console.log(`All countable matches are wins for teamId ${teamId} and type ${rankingType}`);
    }

    let teamRankingId = 0;
    let oldRankPoints = 0.0;

    try {
      teamRanking = await getTeamRankingByTeamIdAndRankingType(teamId, rankingType);
      teamRankingId = teamRanking[0].teamRankingId;
      oldRankPoints = doubleRanking[0].rankPoints;
      oldRank = teamRanking[0].rank;
      differencePoints = parseFloat(rankPoints) - parseFloat(oldRankPoints);

      console.log(`teamRankingId is ${teamRankingId} for teamId ${teamId} and type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not retrieve teamRankingId for teamId ${teamId} and type ${rankingType}`);
    }

    try {
      const updateTeamRankingPointsPromise = await updateTeamRankingPoints(teamRankingId,
        rankPoints, differencePoints);
      console.log(`rankPoints and differencePoints updated for teamRankingId ${teamRankingId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not update rankPoints for teamRankingId ${teamRankingId}`);
    }

    resolve(`New teamRanking Points computed for teamId ${teamId} and type ${rankingType}`);
  });
}

const calculateTeamRankingPerType = async (rankingType) => {
  return new Promise(async function(resolve, reject) {
    let teamsIds = [];
    try {
      teamsIds = await TeamsController.getTeamIds();
      console.log(`Teams IDs retrieved for type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject("Could not retrieve Teams IDs");
    }

    const limit = 5;
    const date = "2017-01-01";

    try {
      const promisesPerTeam = teamsIds.map(teamId =>
        calculateTeamRankingPerTypeAndTeam(rankingType, teamId.teamId, limit,
          date)
      );
      await Promise.all(promisesPerTeam);
      resolve(`New Team Ranking Points calculated for type ${rankingType}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not calculate new teamRanking Points for type ${rankingType}`);
    }

  });
}

const calculateTeamRanking = async () => {
  return new Promise ( async (resolve, reject) => {
    const rankingTypes = ["N", "R", "C"];

    try {
      const promisesPerTypeCalculation = rankingTypes.map(rankingType =>
        calculateTeamRankingPerType(rankingType)
      );
      await Promise.all(promisesPerTypeCalculation);
      resolve("New Team Ranking Points calculated for all types");

    } catch (err) {
      console.log(err);
      reject("New Team Ranking Points calculation failed");
    }

  });
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
      const updateNationalTeamRankingOrderPromises = newNationalRanking.map( (teamNationalRank, rank) =>
        updateTeamRankingOrder(teamNationalRank.teamRankingId, rank + 1, teamNationalRank.rank)
      );
      await Promise.all(updateNationalTeamRankingOrderPromises);
      console.log(`National team ranking updated for league ${leagueId} and gender ${gender}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update national team ranking for league ${leagueId} and gender ${gender}`);
    }

    resolve(`National Team Ranking ordering done for league ${leagueId} and gender ${gender}`);
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
      const updateRegionalTeamRankingOrderPromises = newRegionalRanking.map( (teamRegionalRank, rank) =>
        updateTeamRankingOrder(teamRegionalRank.teamRankingId, rank + 1, teamRegionalRank.rank)
      );
      await Promise.all(updateRegionalTeamRankingOrderPromises);
      console.log(`Regional team ranking updated for league ${leagueId}, gender ${gender} and region ${regionId}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update regional team ranking for league ${leagueId}, gender ${gender} and region ${regionId}`);
    }

    resolve(`Regional Team Ranking ordering done for league ${leagueId}, gender ${gender} and region ${regionId}`);
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
      const orderRegionalTeamRankingOrderPromises = regions.map( region =>
        orderRegionalRankingPerRegion(leagueId, gender, region.regionId)
      );
      await Promise.all(orderRegionalTeamRankingOrderPromises);
      console.log(`Regional team ranking updated for league ${leagueId} and gender ${gender}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update regional team ranking for league ${leagueId} and gender ${gender}`);
    }

    resolve(`Regional Team Ranking ordering done for league ${leagueId} and gender ${gender}`);
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
      const updateConferenceDoubleRankingOrderPromises = newConferenceRanking.map( (teamConferenceRank, rank) =>
        updateTeamRankingOrder(teamConferenceRank.teamRankingId, rank + 1, teamConferenceRank.rank)
      );
      await Promise.all(updateConferenceDoubleRankingOrderPromises);
      console.log(`Conference team ranking updated for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update conference team ranking for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    }

    resolve(`Conference Team Ranking ordering done for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
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
      const orderConferenceTeamRankingOrderPromises = conferences.map( conference =>
        orderConferenceRankingPerConference(leagueId, gender, conference.conferenceId)
      );
      await Promise.all(orderConferenceTeamRankingOrderPromises);
      console.log(`Conference team ranking updated for league ${leagueId} and gender ${gender}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update conference team ranking for league ${leagueId} and gender ${gender}`);
    }

    resolve(`Conference Team Ranking ordering done for league ${leagueId} and gender ${gender}`);
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
      console.log(`National Team Ranking ordered for all genders and league ${leagueId}`);
    } catch(err){
      console.log(err);
      return reject(`National Team Ranking ordering failed for league ${leagueId}`);
    }

    try{
      await Promise.all(orderRegionalRankingPerGenderPromises);
      console.log(`Regional Team Ranking ordered for all genders and league ${leagueId}`);
    } catch(err){
      console.log(err);
      return reject(`Regional Team Ranking ordering failed for league ${leagueId}`);
    }

    try{
      await Promise.all(orderConferenceRankingPerGenderPromises);
      console.log(`Conference Team Ranking ordered for all genders and league ${leagueId}`);
    } catch(err){
      console.log(err);
      return reject(`Conference Team Ranking ordering failed for league ${leagueId}`);
    }

    resolve(`Team Ranking ordering done for league ${leagueId}`);
  });
}

const orderTeamRanking = async () => {
  return new Promise ( async (resolve, reject) => {
    const leagues = [1, 2, 3, 4, 5];

    try{
      const orderRankingPerLeaguePromises = leagues.map(leagueId =>
        orderRankingPerGender(leagueId)
      );
      await Promise.all(orderRankingPerLeaguePromises);
      resolve("New Team Ranking ordered for all leagues");
    } catch(err){
      console.log(err);
      reject("New Team Ranking ordering failed");
    }

  });
}

const createNewTeamRanking = async (req, res) => {
  try{
    console.log("Initiating team ranking archiving process");
    const archiveCurrentTeamRankingsPromise =
    await TeamRankingHistoryController.archiveCurrentTeamRankings();
    console.log(archiveCurrentTeamRankingsPromise);
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Team Ranking Failed"}));
  }

  try{
    console.log("Initiating calculation of new Team Ranking Points");
    const calculateTeamRankingPromise = await calculateTeamRanking();
    console.log(calculateTeamRankingPromise);
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Team Ranking Failed"}));
  }

  try{
    console.log("Initiating ordering of new Team Ranking");
    const orderTeamRankingPromise = await orderTeamRanking();
    console.log(orderTeamRankingPromise);
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Team Ranking Failed"}));
  }

  console.log("New Team Ranking Created");

  res.send(JSON.stringify({"status": 200, "error": null, "response": "New Team Ranking Done"}));


}

module.exports = {

  createNewTeamRanking,

  find (req, res) {
    const teamRankingId = req.params.teamRankingId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM TeamRanking WHERE teamRankingId = ?', teamRankingId, (error, results, fields) => {
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
    const rank = req.body.rank;
    const rankPoints = req.body.rankPoints;
    const Teams_teamId = req.body.Teams_teamId;
	const previousRank = req.body.previousRank;
	const differencePoints = req.body.differencePoints;
	const type = req.body.type;

    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var query = connection.query('INSERT INTO TeamRanking (rank, rankPoints, Teams_teamId, previousRank, differencePoints, type) VALUES(?, ?, ?, ?, ?, ?)',
      [rank, rankPoints, Teams_teamId, previousRank, differencePoints, type], (error, results, fields) => {
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
    const teamRankingId = req.params.teamRankingId;
    const teamRankingProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE TeamRanking SET ? WHERE teamRankingId = ?',[teamRankingProperties, teamRankingId], (error, results, fields) => {
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
    const teamRankingId = req.params.teamRankingId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM TeamRanking WHERE teamRankingId = ?', teamRankingId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },
  //Get the current national ranking order
  getTeamRankingsNationalByDivisionGender(req, res, next){
	const leagueId = req.params.leagueId;
	const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT tr.teamRankingId, tr.Teams_teamId, tr.rank, tr.rankPoints, tr.previousRank, tr.differencePoints, conf.conferenceId, conf.conferenceLabel,
		col.collegeId, col.name as collegeName
		FROM TeamRanking tr
		inner join Teams t on t.teamId = tr.Teams_teamId
		inner join Colleges col on col.collegeId = t.Colleges_collegeId
		inner join Leagues l on l.leagueId = col.Leagues_leagueId
		inner join Conferences conf on conf.conferenceId = Conferences_conferenceId
		WHERE t.gender LIKE ? AND tr.type = 'N' AND l.leagueId LIKE ?
		ORDER BY tr.rank ASC`, [gender, leagueId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  //Get the current regional ranking order
  getTeamRankingsByRegionDivisionGender(req, res, next){
	const regionId = req.params.regionId;
	const leagueId = req.params.leagueId;
	const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT tr.teamRankingId, tr.Teams_teamId, tr.rank, tr.rankPoints, tr.previousRank, tr.differencePoints, conf.conferenceId, conf.conferenceLabel,
		col.collegeId, col.name as collegeName
		FROM TeamRanking tr
		inner join Teams t on t.teamId = tr.Teams_teamId
		inner join Colleges col on col.collegeId = t.Colleges_collegeId
		inner join Leagues l on l.leagueId = col.Leagues_leagueId
		inner join Conferences conf on conf.conferenceId = Conferences_conferenceId
		WHERE t.gender LIKE ? AND tr.type = 'R' AND col.Regions_regionId = ? AND l.leagueId LIKE ?
		ORDER BY tr.rank ASC`, [gender, regionId, leagueId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  //Get the current regional ranking order
  getTeamRankingsByConferenceDivisionGender(req, res, next){
	const conferenceId = req.params.conferenceId;
	const leagueId = req.params.leagueId;
	const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT tr.teamRankingId, tr.Teams_teamId, tr.rank, tr.rankPoints, tr.previousRank, tr.differencePoints, conf.conferenceId, conf.conferenceLabel,
		col.collegeId, col.name as collegeName
		FROM TeamRanking tr
		inner join Teams t on t.teamId = tr.Teams_teamId
		inner join Colleges col on col.collegeId = t.Colleges_collegeId
		inner join Leagues l on l.leagueId = col.Leagues_leagueId
		inner join Conferences conf on conf.conferenceId = Conferences_conferenceId
		WHERE t.gender LIKE ? AND tr.type = 'C' AND col.Conferences_conferenceId = ? AND l.leagueId LIKE ?
		ORDER BY tr.rank ASC`, [gender, conferenceId, leagueId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  getNewNationalRankingOrder,

  getNewRegionalRankingOrder,

  getNewConferenceRankingOrder,

  updateTeamRankingOrder,

  getNewConferenceRankingOrder
};
