var db = require('./../db');
const RegionsController = require('../controllers/regions_controller');
const ConferencesController = require('../controllers/conferences_controller');

const updateTeamRankingOrder = (teamRankingId, rank) => {
    return new Promise(function (resolve, reject) {
      db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var query = connection.query(`UPDATE TeamRanking SET rank = ? WHERE teamRankingId = ?`,[rank, teamRankingId], (error, results, fields) => {
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
        var query = connection.query(`SELECT teamRankingId FROM TeamRanking tr
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
        var query = connection.query(`SELECT teamRankingId FROM TeamRanking tr
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
        var query = connection.query(`SELECT teamRankingId FROM TeamRanking tr
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

module.exports = {

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
