var db = require('./../db');
const PlayerController = require('../controllers/player_controller');
const RegionsController = require('../controllers/regions_controller');
const ConferencesController = require('../controllers/conferences_controller');


module.exports = {

  find (req, res) {
    const singleRankingId = req.params.singleRankingId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM SingleRanking WHERE singleRankingId = ?', singleRankingId, (error, results, fields) => {
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
    const Players_playerId = req.body.Players_playerId;
    const differenceRank = req.body.differenceRank;
    const differencePoints = req.body.differencePoints;
    const type = req.body.type;

    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var query = connection.query('INSERT INTO SingleRanking (rank, rankPoints, Players_playerId,	differenceRank, differencePoints, type) VALUES(?, ?, ?, ?, ?, ?)',
      [rank, rankPoints, Players_playerId, differenceRank, differencePoints, type], (error, results, fields) => {
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

  // Creation of an unrank ranking for a new player
  createInitialRanking(connection,rank,playerId,type) {
    return new Promise((reject,resolve)=> {

      var query = connection.query('INSERT INTO SingleRanking (rank, rankPoints, Players_playerId,	differenceRank, differencePoints, type) VALUES(?, ?, ?, ?, ?, ?)',
      [rank, 0, playerId, 0, 0, type], (error, results, fields) => {
        if (error){
          return reject(error);
        }
        resolve(results.insertId);
      });
    });
  },

  edit(req, res, next) {
    const singleRankingId = req.params.singleRankingId;
    const singleRankingProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE SingleRanking SET ? WHERE singleRankingId = ?',[singleRankingProperties, singleRankingId], (error, results, fields) => {
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
    const singleRankingId = req.params.singleRankingId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM SingleRanking WHERE singleRankingId = ?', singleRankingId, (error, results, fields) => {
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
getSingleRankingsNationalByDivisionGender(req, res, next){
  const leagueId = req.params.leagueId;
  const gender = req.params.gender;

  db.pool.getConnection((error, connection) => {

    if (error){
      return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
    }
    var query = connection.query(`SELECT sr.singleRankingId, sr.Players_playerId, sr.rank, sr.rankPoints, sr.differenceRank, sr.differencePoints,
      u.firstName, u.lastName, p.status, c.name as collegeName
      FROM SingleRanking sr
      inner join Players p on sr.Players_playerId = p.playerId
      inner join Users u on u.userId = p.Users_userId
      inner join Teams t on t.teamId = p.Teams_teamId
      inner join Colleges c on c.collegeId = t.Colleges_collegeId
      inner join Leagues l on l.leagueId = c.Leagues_leagueId
      WHERE u.gender LIKE ? AND sr.type LIKE 'N' AND l.leagueId LIKE ?
      ORDER BY sr.rank ASC`, [gender, leagueId], (error, results, fields) => {
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
  getSingleRankingsByRegionDivisionGender(req, res, next){
    const regionId = req.params.regionId;
    const leagueId = req.params.leagueId;
    const gender = req.params.gender;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT sr.singleRankingId, sr.Players_playerId, sr.rank, sr.rankPoints, sr.differenceRank, sr.differencePoints,
        u.firstName, u.lastName, p.status, c.name as collegeName
        FROM SingleRanking sr
        inner join Players p on sr.Players_playerId = p.playerId
        inner join Users u on u.userId = p.Users_userId
        inner join Teams t on t.teamId = p.Teams_teamId
        inner join Colleges c on c.collegeId = t.Colleges_collegeId
        inner join Leagues l on l.leagueId = c.Leagues_leagueId
        WHERE u.gender LIKE ? AND sr.type = 'R' AND c.Regions_regionId = ? AND l.leagueId LIKE ?
        ORDER BY sr.rank ASC`, [gender, regionId, leagueId], (error, results, fields) => {
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
    getSingleRankingsByConferenceDivisionGender(req, res, next){
      const conferenceId = req.params.conferenceId;
      const leagueId = req.params.leagueId;
      const gender = req.params.gender;

      db.pool.getConnection((error, connection) => {

        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var query = connection.query(`SELECT sr.singleRankingId, sr.Players_playerId, sr.rank, sr.rankPoints, sr.differenceRank, sr.differencePoints,
          u.firstName, u.lastName, p.status, c.name as collegeName
          FROM SingleRanking sr
          inner join Players p on sr.Players_playerId = p.playerId
          inner join Users u on u.userId = p.Users_userId
          inner join Teams t on t.teamId = p.Teams_teamId
          inner join Colleges c on c.collegeId = t.Colleges_collegeId
          inner join Leagues l on l.leagueId = c.Leagues_leagueId
          WHERE u.gender LIKE ? AND sr.type = 'C' AND c.Conferences_conferenceId = ? AND l.leagueId LIKE ?
          ORDER BY sr.rank ASC`, [gender, conferenceId, leagueId], (error, results, fields) => {
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
