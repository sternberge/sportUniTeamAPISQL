const getCurrentTeamRankings = (connection) => {
  return new Promise(function(resolve, reject) {
    var query = connection.query(`SELECT * FROM TeamRanking`, (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

const archiveCurrentTeamRanking = (connection, teamId, rank, rankPoints, previousRank,
  differencePoints, type, currentDate) => {
  return new Promise(function(resolve, reject) {
    var query = connection.query(`INSERT INTO TeamRankingHistory
    (Teams_teamId, rank, rankPoints, previousRank,
      differencePoints, type, date)
    VALUES(?, ?, ?, ?, ?, ?, ?)`, [teamId, rank, rankPoints, previousRank,
      differencePoints, type, currentDate], (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}

const archiveCurrentTeamRankings = async (connection) => {
  return new Promise(async (resolve, reject) => {
    let currentTeamRankings = [];

    try {
      currentTeamRankings = await getCurrentTeamRankings(connection);
      console.log("Current Team Ranking fetched");
    } catch (err) {
      console.log(err);
      return reject("Could not fetch current Team Ranking");
    }

    try {
      const currentDate = new Date();
      archiveCurrentTeamRankingsPromises = currentTeamRankings.map(currentTeamRanking =>
        archiveCurrentTeamRanking(connection, currentTeamRanking.Teams_teamId,
          currentTeamRanking.rank, currentTeamRanking.rankPoints,
          currentTeamRanking.previousRank, currentTeamRanking.differencePoints,
          currentTeamRanking.type, currentDate)
      );

      await Promise.all(archiveCurrentTeamRankingsPromises);
      resolve("Current TeamRankings archived in History Table");
    } catch (err) {
      console.log(err);
      return reject("Current TeamRankings archiving failed");
    }

  });
}

module.exports = {
  archiveCurrentTeamRankings
}
