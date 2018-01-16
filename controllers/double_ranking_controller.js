var db = require('./../db');


module.exports = {

  find (req, res) {
    const doubleRankingId = req.params.doubleRankingId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM DoubleRanking WHERE doubleRankingId = ?', doubleRankingId, (error, results, fields) => {
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
    const DoubleTeams_doubleTeamId = req.body.DoubleTeams_doubleTeamId;
	const differenceRank = req.body.differenceRank;
	const differencePoints = req.body.differencePoints;
	const type = req.body.type;

    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var query = connection.query('INSERT INTO DoubleRanking (DoubleTeams_doubleTeamId, rank, rankPoints, differenceRank, differencePoints, type) VALUES(?, ?, ?, ?, ?, ?)',
      [DoubleTeams_doubleTeamId, rank, rankPoints,	differenceRank, differencePoints, type], (error, results, fields) => {
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
    const doubleRankingId = req.params.doubleRankingId;
    const doubleRankingProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE DoubleRanking SET ? WHERE doubleRankingId = ?',[doubleRankingProperties, doubleRankingId], (error, results, fields) => {
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
    const doubleRankingId = req.params.doubleRankingId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM DoubleRanking WHERE doubleRankingId = ?', doubleRankingId, (error, results, fields) => {
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
  getDoubleRankingsNationalByDivisionGender(req, res, next){
	const leagueId = req.params.leagueId;
	const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT dr.doubleRankingId, dr.DoubleTeams_doubleTeamId, dr.rank, dr.rankPoints, dr.differenceRank, dr.differencePoints,
		u1.firstName as firstNamePlayer1, u1.lastName as lastNamePlayer1, p1.status as statusPlayer1, u2.firstName as firstNamePlayer2, u2.lastName as lastNamePlayer2, p2.status as statusPlayer2
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
  getDoubleRankingsByRegionDivisionGender(req, res, next){
	const regionId = req.params.regionId;
	const leagueId = req.params.leagueId;
	const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT dr.doubleRankingId, dr.DoubleTeams_doubleTeamId, dr.rank, dr.rankPoints, dr.differenceRank, dr.differencePoints,
		u1.firstName as firstNamePlayer1, u1.lastName as lastNamePlayer1, p1.status as statusPlayer1, u2.firstName as firstNamePlayer2, u2.lastName as lastNamePlayer2, p2.status as statusPlayer2
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
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },
  
  //Get the current ranking order by conference
  getDoubleRankingsByConferenceDivisionGender(req, res, next){
	const conferenceId = req.params.conferenceId;
	const leagueId = req.params.leagueId;
	const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT dr.doubleRankingId, dr.DoubleTeams_doubleTeamId, dr.rank, dr.rankPoints, dr.differenceRank, dr.differencePoints,
		u1.firstName as firstNamePlayer1, u1.lastName as lastNamePlayer1, p1.status as statusPlayer1, u2.firstName as firstNamePlayer2, u2.lastName as lastNamePlayer2, p2.status as statusPlayer2
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
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },
};
