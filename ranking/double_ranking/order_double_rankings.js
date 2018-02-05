const updateDoubleRankingOrder = (connection,doubleRankingId, rank, differenceRank) => {
  return new Promise(function(resolve, reject) {
      var query = connection.query(`UPDATE DoubleRanking
        SET rank = ?, differenceRank = ?
        WHERE doubleRankingId = ?`, [rank, differenceRank, doubleRankingId], (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        resolve(results);
      });
    });
}

const getNewNationalRankingOrder = (connection,leagueId, gender) => {
  return new Promise(function(resolve, reject) {
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
        resolve(results);
      });
    });
}

const getNewRegionalRankingOrder = (connection,leagueId, gender, regionId) => {
  return new Promise(function(resolve, reject) {
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
        resolve(results);
      });
  });
}

const getNewConferenceRankingOrder = (connection,leagueId, gender, conferenceId) => {
  return new Promise(function(resolve, reject) {
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
          return reject(error);
        }
        resolve(results);
      });
    });
}

const orderNationalRanking = async (connection,leagueId, gender) => {
  return new Promise( async (resolve, reject) => {
    let newNationalRanking = [];

    try{
      newNationalRanking = await getNewNationalRankingOrder(connection,leagueId, gender);
      console.log(`New national ranking order fetched for league ${leagueId} and gender ${gender}`);
    } catch(err){
      console.log(err);
      return reject(`Could not fetch new national ranking order for league ${leagueId} and gender ${gender}`);
    }

    try{
      const updateNationalDoubleRankingOrderPromises = newNationalRanking.map( (doubleTeamNationalRank, rank) =>
        updateDoubleRankingOrder(connection,doubleTeamNationalRank.doubleRankingId, rank + 1, rank + 1 - doubleTeamNationalRank.rank)
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

const orderRegionalRankingPerRegion = async (connection,leagueId, gender, regionId) => {
  return new Promise( async (resolve, reject) => {
    let newRegionalRanking = [];
    try{
      newRegionalRanking = await getNewRegionalRankingOrder(connection,leagueId, gender, regionId);
      console.log(`New regional ranking order fetched for league ${leagueId}, gender ${gender} and region ${regionId}`);
    } catch(err){
      console.log(err);
      return reject(`Could not fetch new regional ranking order for league ${leagueId}, gender ${gender} and region ${regionId}`);
    }

    try{
      const updateRegionalDoubleRankingOrderPromises = newRegionalRanking.map( (doubleTeamRegionalRank, rank) =>
        updateDoubleRankingOrder(connection,doubleTeamRegionalRank.doubleRankingId, rank + 1, rank + 1 - doubleTeamRegionalRank.rank)
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

const orderRegionalRanking = async (connection,leagueId, gender) => {
  return new Promise( async (resolve, reject) => {
    let regions = [];
    let orderRegionalRankingPerRegionPromises = [];
    try{
      regions = await RegionsController.getRegionIds(connection);
      console.log(`Region Ids fetched`);
    } catch(err){
      console.log(err);
      return reject(`Could not fetch Region Ids`);
    }

    try{
      const orderRegionalDoubleRankingOrderPromises = regions.map( region =>
        orderRegionalRankingPerRegion(connection,leagueId, gender, region.regionId)
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

const orderConferenceRankingPerConference = async (connection,leagueId, gender, conferenceId) => {
  return new Promise( async (resolve, reject) => {
    let newConferenceRanking = [];
    try{
      newConferenceRanking = await getNewConferenceRankingOrder(connection,leagueId, gender, conferenceId);
      console.log(`New conference ranking order fetched for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    } catch(err){
      console.log(err);
      return reject(`Could not fetch new conference ranking order for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    }


    try{
      const updateConferenceDoubleRankingOrderPromises = newConferenceRanking.map( (doubleTeamConferenceRank, rank) =>
        updateDoubleRankingOrder(connection,doubleTeamConferenceRank.doubleRankingId, rank + 1, rank + 1 - doubleTeamConferenceRank.rank)
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

const orderConferenceRanking = async (connection,leagueId, gender) => {
  return new Promise( async (resolve, reject) => {
    let conferences = [];
    let orderConferenceRankingPerConferencePromises = [];
    try{
      conferences = await ConferencesController.getConferenceIds(connection);
      console.log(`Conference Ids fetched`);
    } catch(err){
      console.log(err);
      return reject(`Could not fetch Conference Ids`);
    }

    try{
      const orderConferenceDoubleRankingOrderPromises = conferences.map( conference =>
        orderConferenceRankingPerConference(connection,leagueId, gender, conference.conferenceId)
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

const orderRankingPerGender = async (connection,leagueId) => {
  return new Promise( async (resolve, reject) => {
    const genders = ["M", "F"];

    const orderNationalRankingPerGenderPromises = genders.map(gender =>
      orderNationalRanking(connection,leagueId, gender)
    );

    const orderRegionalRankingPerGenderPromises = genders.map(gender =>
      orderRegionalRanking(connection,leagueId, gender)
    );

    const orderConferenceRankingPerGenderPromises = genders.map(gender =>
      orderConferenceRanking(connection,leagueId, gender)
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

const orderDoubleRanking = async (connection) => {
  return new Promise ( async (resolve, reject) => {
    const leagues = [1, 2, 3, 4, 5];

    try{
      const orderRankingPerLeaguePromises = leagues.map(leagueId =>
        orderRankingPerGender(connection,leagueId)
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
  orderDoubleRanking
}

const RegionsController = require('./../../controllers/regions_controller');
const ConferencesController = require('./../../controllers/conferences_controller');
