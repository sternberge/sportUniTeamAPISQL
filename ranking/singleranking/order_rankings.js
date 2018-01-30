const db = require('./../../db');
const ConferencesController = require('./../../controllers/conferences_controller.js');


const orderSingleRanking = async (req, res) => {
  const leagues = [1, 2, 3, 4, 5];

  try{
    const orderRankingPerLeaguePromises = leagues.map(leagueId =>
      orderRankingPerGender(leagueId)
    );
    await Promise.all(orderRankingPerLeaguePromises);
    console.log("New Single Ranking ordered for all leagues");
    res.send(JSON.stringify({"status": 200, "error": null, "response": "New Single Ranking ordered for all leagues"}));
  } catch(err){
    console.log("New Single Ranking ordering failed");
    console.log(err);
    res.send(JSON.stringify({"status": 500, "error": err, "response": "New Single Ranking ordering failed"}));
  }
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
      console.log(`National Single Ranking ordered for all genders and league ${leagueId}`);
    } catch(err){
      console.log(err);
      return reject(`National Single Ranking ordering failed for league ${leagueId}`);
    }

    try{
      await Promise.all(orderRegionalRankingPerGenderPromises);
      console.log(`Regional Single Ranking ordered for all genders and league ${leagueId}`);
    } catch(err){
      console.log(err);
      return reject(`Regional Single Ranking ordering failed for league ${leagueId}`);
    }

    try{
      await Promise.all(orderConferenceRankingPerGenderPromises);
      console.log(`Conference Single Ranking ordered for all genders and league ${leagueId}`);
    } catch(err){
      console.log(err);
      return reject(`Conference Single Ranking ordering failed for league ${leagueId}`);
    }

    resolve(`Single Ranking ordering done for league ${leagueId}`);
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
      const updateNationalSingleRankingOrderPromises = newNationalRanking.map( (singleNationalRank, rank) =>
        updateSingleRankingOrder(singleNationalRank.singleRankingId, rank + 1, rank + 1 - singleNationalRank.rank)
      );
      await Promise.all(updateNationalSingleRankingOrderPromises);
      console.log(`National single ranking updated for league ${leagueId} and gender ${gender}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update national single ranking for league ${leagueId} and gender ${gender}`);
    }

    resolve(`National single Ranking ordering done for league ${leagueId} and gender ${gender}`);
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
      const orderRegionalSingleRankingOrderPromises = regions.map( region =>
        orderRegionalRankingPerRegion(leagueId, gender, region.regionId)
      );
      await Promise.all(orderRegionalSingleRankingOrderPromises);
      console.log(`Regional Single ranking updated for league ${leagueId} and gender ${gender}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update regional Single ranking for league ${leagueId} and gender ${gender}`);
    }

    resolve(`Regional Single Ranking ordering done for league ${leagueId} and gender ${gender}`);
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
      const updateRegionalSingleRankingOrderPromises = newRegionalRanking.map( (singleRegionalRank, rank) =>
        updateSingleRankingOrder(singleRegionalRank.SingleRankingId, rank + 1, rank + 1 - singleRegionalRank.rank)
      );
      await Promise.all(updateRegionalSingleRankingOrderPromises);
      console.log(`Regional Single ranking updated for league ${leagueId}, gender ${gender} and region ${regionId}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update regional Single ranking for league ${leagueId}, gender ${gender} and region ${regionId}`);
    }

    resolve(`Regional Single Ranking ordering done for league ${leagueId}, gender ${gender} and region ${regionId}`);
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
      const orderConferenceSingleRankingOrderPromises = conferences.map( conference =>
        orderConferenceRankingPerConference(leagueId, gender, conference.conferenceId)
      );
      await Promise.all(orderConferenceSingleRankingOrderPromises);
      console.log(`Conference Single ranking updated for league ${leagueId} and gender ${gender}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update conference Single ranking for league ${leagueId} and gender ${gender}`);
    }

    resolve(`Conference Single Ranking ordering done for league ${leagueId} and gender ${gender}`);
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
      const updateConferenceSingleRankingOrderPromises = newConferenceRanking.map( (singleConferenceRank, rank) =>
        updateSingleRankingOrder(singleConferenceRank.singleRankingId, rank + 1, rank + 1 - singleConferenceRank.rank)
      );
      await Promise.all(updateConferenceSingleRankingOrderPromises);
      console.log(`Conference Single ranking updated for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    } catch(err){
      console.log(err);
      return reject(`Could not update conference Single ranking for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    }

    resolve(`Conference Single Ranking ordering done for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
  });
}

const updateSingleRankingOrder = (singleRankingId, rank, differenceRank) => {
  return new Promise(function(resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`UPDATE SingleRanking
        SET rank = ?, differenceRank = ?
        WHERE singleRankingId = ?`, [rank, differenceRank, singleRankingId], (error, results, fields) => {
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
  return new Promise(function (resolve, reject) {
    db.pool.getConnection((error, connection) => {
      if (error){
        return reject(error);
      }
      var query = connection.query(`SELECT singleRankingId FROM SingleRanking sr
        INNER JOIN Players p on p.playerId = sr.Players_playerId
        INNER JOIN Teams t on t.teamId = p.Teams_teamId
        INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
        WHERE sr.type = 'R' AND c.Leagues_leagueId = ? AND t.gender LIKE ? AND c.Regions_regionId = ?
        ORDER BY sr.rankPoints DESC`,[leagueId, gender, regionId], (error, results, fields) => {
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
        var query = connection.query(`SELECT singleRankingId FROM SingleRanking sr
          INNER JOIN Players p on p.playerId = sr.Players_playerId
          INNER JOIN Teams t on t.teamId = p.Teams_teamId
          INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
          WHERE sr.type = 'C' AND c.Leagues_leagueId = ? AND t.gender = ? AND c.Conferences_conferenceId = ?
          ORDER BY sr.rankPoints DESC`,[leagueId, gender, conferenceId], (error, results, fields) => {
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
          var query = connection.query(`SELECT singleRankingId FROM SingleRanking sr
            INNER JOIN Players p on p.playerId = sr.Players_playerId
            INNER JOIN Teams t on t.teamId = p.Teams_teamId
            INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
            WHERE sr.type = 'N' AND c.Leagues_leagueId = ? AND t.gender LIKE ?
            ORDER BY sr.rankPoints DESC`,[leagueId, gender], (error, results, fields) => {
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


      module.exports = {
        orderSingleRanking
      }
