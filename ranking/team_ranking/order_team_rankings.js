const updateTeamRankingOrder = (connection, teamRankingId, rank, previousRank) => {
    return new Promise(function (resolve, reject) {
      var query = connection.query(`UPDATE TeamRanking
        SET rank = ?, previousRank = ?
        WHERE teamRankingId = ?`, [rank, previousRank, teamRankingId], (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
}

const getNewNationalRankingOrder = (connection, leagueId, gender) => {
  return new Promise(function(resolve, reject) {
    var query = connection.query(`SELECT teamRankingId, rank
      FROM TeamRanking tr
			INNER JOIN Teams t on t.teamId = tr.Teams_teamId
			INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
			WHERE tr.type = 'N' AND c.Leagues_leagueId = ? AND t.gender = ?
			ORDER BY tr.rankPoints DESC`, [leagueId, gender], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

const getNewRegionalRankingOrder = (connection, leagueId, gender, regionId) => {
  return new Promise(function(resolve, reject) {
    var query = connection.query(`SELECT teamRankingId, rank
      FROM TeamRanking tr
			INNER JOIN Teams t on t.teamId = tr.Teams_teamId
			INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
			WHERE tr.type = 'R' AND c.Leagues_leagueId = ? AND t.gender = ? AND c.Regions_regionId
			ORDER BY tr.rankPoints DESC`, [leagueId, gender, regionId], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

const getNewConferenceRankingOrder = (connection, leagueId, gender, conferenceId) => {
  return new Promise(function(resolve, reject) {
    var query = connection.query(`SELECT teamRankingId, rank
      FROM TeamRanking tr
			INNER JOIN Teams t on t.teamId = tr.Teams_teamId
			INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
			WHERE tr.type = 'C' AND c.Leagues_leagueId = ? AND t.gender = ? AND c.Conferences_conferenceId
			ORDER BY tr.rankPoints DESC`, [leagueId, gender, conferenceId], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

const orderNationalRanking = async (connection, leagueId, gender) => {
  return new Promise(async (resolve, reject) => {
    let newNationalRanking = [];

    try {
      newNationalRanking = await getNewNationalRankingOrder(connection, leagueId, gender);
      console.log(`New national ranking order fetched for league ${leagueId} and gender ${gender}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not fetch new national ranking order for league ${leagueId} and gender ${gender}`);
    }

    try {
      const updateNationalTeamRankingOrderPromises = newNationalRanking.map((teamNationalRank, rank) =>
        updateTeamRankingOrder(connection, teamNationalRank.teamRankingId, rank + 1, teamNationalRank.rank)
      );
      await Promise.all(updateNationalTeamRankingOrderPromises);
      console.log(`National team ranking updated for league ${leagueId} and gender ${gender}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not update national team ranking for league ${leagueId} and gender ${gender}`);
    }

    resolve(`National Team Ranking ordering done for league ${leagueId} and gender ${gender}`);
  });
}

const orderRegionalRankingPerRegion = async (connection, leagueId, gender, regionId) => {
  return new Promise(async (resolve, reject) => {
    let newRegionalRanking = [];
    try {
      newRegionalRanking = await getNewRegionalRankingOrder(connection, leagueId, gender, regionId);
      console.log(`New regional ranking order fetched for league ${leagueId}, gender ${gender} and region ${regionId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not fetch new regional ranking order for league ${leagueId}, gender ${gender} and region ${regionId}`);
    }

    try {
      const updateRegionalTeamRankingOrderPromises = newRegionalRanking.map((teamRegionalRank, rank) =>
        updateTeamRankingOrder(connection, teamRegionalRank.teamRankingId, rank + 1, teamRegionalRank.rank)
      );
      await Promise.all(updateRegionalTeamRankingOrderPromises);
      console.log(`Regional team ranking updated for league ${leagueId}, gender ${gender} and region ${regionId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not update regional team ranking for league ${leagueId}, gender ${gender} and region ${regionId}`);
    }

    resolve(`Regional Team Ranking ordering done for league ${leagueId}, gender ${gender} and region ${regionId}`);
  });
}

const orderRegionalRanking = async (connection, leagueId, gender) => {
  return new Promise(async (resolve, reject) => {
    let regions = [];
    let orderRegionalRankingPerRegionPromises = [];
    try {
      regions = await RegionsController.getRegionIds(connection);
      console.log(`Region Ids fetched`);
    } catch (err) {
      console.log(err);
      return reject(`Could not fetch Region Ids`);
    }

    try {
      const orderRegionalTeamRankingOrderPromises = regions.map(region =>
        orderRegionalRankingPerRegion(connection, leagueId, gender, region.regionId)
      );
      await Promise.all(orderRegionalTeamRankingOrderPromises);
      console.log(`Regional team ranking updated for league ${leagueId} and gender ${gender}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not update regional team ranking for league ${leagueId} and gender ${gender}`);
    }

    resolve(`Regional Team Ranking ordering done for league ${leagueId} and gender ${gender}`);
  });
}

const orderConferenceRankingPerConference = async (connection, leagueId, gender, conferenceId) => {
  return new Promise(async (resolve, reject) => {
    let newConferenceRanking = [];
    try {
      newConferenceRanking = await getNewConferenceRankingOrder(connection,
        leagueId, gender, conferenceId);
      console.log(`New conference ranking order fetched for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not fetch new conference ranking order for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    }


    try {
      const updateConferenceTeamRankingOrderPromises = newConferenceRanking.map((teamConferenceRank, rank) =>
        updateTeamRankingOrder(connection, teamConferenceRank.teamRankingId, rank + 1, teamConferenceRank.rank)
      );
      await Promise.all(updateConferenceTeamRankingOrderPromises);
      console.log(`Conference team ranking updated for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not update conference team ranking for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
    }

    resolve(`Conference Team Ranking ordering done for league ${leagueId}, gender ${gender} and conference ${conferenceId}`);
  });
}

const orderConferenceRanking = async (connection, leagueId, gender) => {
  return new Promise(async (resolve, reject) => {
    let conferences = [];
    let orderConferenceRankingPerConferencePromises = [];
    try {
      conferences = await ConferencesController.getConferenceIds(connection);
      console.log(`Conference Ids fetched`);
    } catch (err) {
      console.log(err);
      return reject(`Could not fetch Conference Ids`);
    }

    try {
      const orderConferenceTeamRankingOrderPromises = conferences.map(conference =>
        orderConferenceRankingPerConference(connection, leagueId, gender, conference.conferenceId)
      );
      await Promise.all(orderConferenceTeamRankingOrderPromises);
      console.log(`Conference team ranking updated for league ${leagueId} and gender ${gender}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not update conference team ranking for league ${leagueId} and gender ${gender}`);
    }

    resolve(`Conference Team Ranking ordering done for league ${leagueId} and gender ${gender}`);
  });
}

const orderRankingPerGender = async (connection, leagueId) => {
  return new Promise(async (resolve, reject) => {
    const genders = ["M", "F"];

    const orderNationalRankingPerGenderPromises = genders.map(gender =>
      orderNationalRanking(connection, leagueId, gender)
    );

    const orderRegionalRankingPerGenderPromises = genders.map(gender =>
      orderRegionalRanking(connection, leagueId, gender)
    );

    const orderConferenceRankingPerGenderPromises = genders.map(gender =>
      orderConferenceRanking(connection, leagueId, gender)
    );

    try {
      await Promise.all(orderNationalRankingPerGenderPromises);
      console.log(`National Team Ranking ordered for all genders and league ${leagueId}`);
    } catch (err) {
      console.log(err);
      return reject(`National Team Ranking ordering failed for league ${leagueId}`);
    }

    try {
      await Promise.all(orderRegionalRankingPerGenderPromises);
      console.log(`Regional Team Ranking ordered for all genders and league ${leagueId}`);
    } catch (err) {
      console.log(err);
      return reject(`Regional Team Ranking ordering failed for league ${leagueId}`);
    }

    try {
      await Promise.all(orderConferenceRankingPerGenderPromises);
      console.log(`Conference Team Ranking ordered for all genders and league ${leagueId}`);
    } catch (err) {
      console.log(err);
      return reject(`Conference Team Ranking ordering failed for league ${leagueId}`);
    }

    resolve(`Team Ranking ordering done for league ${leagueId}`);
  });
}

const orderTeamRanking = async (connection) => {
  return new Promise(async (resolve, reject) => {
    const leagues = [1, 2, 3, 4, 5];

    try {
      const orderRankingPerLeaguePromises = leagues.map(leagueId =>
        orderRankingPerGender(connection, leagueId)
      );
      await Promise.all(orderRankingPerLeaguePromises);
      resolve("New Team Ranking ordered for all leagues");
    } catch (err) {
      console.log(err);
      reject("New Team Ranking ordering failed");
    }

  });
}

module.exports = {
  orderTeamRanking
}

const ConferencesController = require('./../../controllers/conferences_controller.js');
const RegionsController = require('./../../controllers/regions_controller.js');
