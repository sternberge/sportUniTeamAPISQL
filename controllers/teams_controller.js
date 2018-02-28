var db = require('./../db');

const getTeamsByGender = (req, res) => {
  const gender = req.params.gender;
  db.pool.getConnection((error, connection) => {
    if (error){
      return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
    }
    var query = connection.query(`SELECT t.teamId, c.collegeId, c.name as collegeName
    FROM Teams t
    INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
    WHERE t.gender = ?`,
    gender, (error, results, fields) => {
      if (error){
        connection.release();
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
      connection.release(); // CLOSE THE CONNECTION
    });
  });
}

const getTeamUnrankedNumber = () => {
  return new Promise((resolve, reject) => {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT opponentRank FROM RankPointsRules
        WHERE type = 'T'
        ORDER BY opponentRank DESC LIMIT 1`, (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        resolve(results[0].opponentRank);
      });
    });
  });
}

const createDefaultTeamRankingByType = (teamId, unranked, rankingType) => {
  return new Promise((resolve, reject) => {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`INSERT INTO TeamRanking (Teams_teamId, rank, type)
      VALUES (?, ?, ?)`, [teamId, unranked, rankingType], (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        resolve(`DefaultRanking added for teamId ${teamId} and rankingType ${rankingType}`);
      });
    });
  });
}

const createDefaultTeamRankings = async (teamId, unranked) => {
  return new Promise(async (resolve, reject) => {
    rankingTypes = ["N", "R", "C"];

    try {
      const defaultTeamRankingsPromises = rankingTypes.map(rankingType =>
        createDefaultTeamRankingByType(teamId, unranked, rankingType)
      );
      await Promise.all(defaultTeamRankingsPromises);
      resolve(`Default Rankings added for teamId ${teamId}`);
    } catch (err) {
      console.log(err);
      return reject(`Could not add default rankings for teamId ${teamId}`);
    }
  });
}

const createTeam = (req) => {
  return new Promise ( (resolve, reject) => {
    const gender = req.body.gender;
    const Colleges_collegeId = req.body.Colleges_collegeId;
    const Coaches_headCoachId = req.body.Coaches_headCoachId;
    const Coaches_coachId = req.body.Coaches_coachId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }

      var query = connection.query('INSERT INTO Teams (gender,Colleges_collegeId,Coaches_headCoachId,Coaches_coachId) VALUES(?, ?, ?, ?)', [gender, Colleges_collegeId, Coaches_headCoachId, Coaches_coachId], (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        resolve(results.insertId);
      });
    });
  });
}

const createTeamWithDefaultRankings = async (req, res) => {
  let createTeamPromise;
  let getTeamUnrankedNumberPromise;
  try{
    createTeamPromise = await createTeam(req);
    console.log(`Team was created with teamId ${createTeamPromise}`);
  } catch(err){
    console.log(err);
    console.log(`Error while trying to create the Team`);
    return res.status(500).send(JSON.stringify({
      "error": "An error occured while trying to create the team"
    }));
  }

  try{
    getTeamUnrankedNumberPromise = await getTeamUnrankedNumber();
    console.log(`The unranked number for Teams is rank ${getTeamUnrankedNumberPromise}`);
  } catch(err){
    console.log(err);
    console.log(`Could not fetch the unranked number for Teams`);
    return res.status(500).send(JSON.stringify({
      "error": "An error occured while trying to create the team"
    }));
  }

  try{
    const createDefaultTeamRankingsPromise = await createDefaultTeamRankings(createTeamPromise,
      getTeamUnrankedNumberPromise);
    console.log(`Team has been created with teamId ${createTeamPromise} and its default rankings for each type (N, R, C)`);
    res.send(JSON.stringify({
      "status": 200,
      "error": null,
      "response": `Team has been created with teamId ${createTeamPromise} and its default rankings for each type (N, R, C)`
    }));
  } catch(err){
    console.log(err);
  }
}

module.exports = {

  createTeamWithDefaultRankings,

  getTeamsByGender,

  find(req, res) {
    const teamId = req.params.team_id;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM Teams WHERE teamId = ?', teamId, (error, results, fields) => {
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

  findTeamById(connection, req) {
    return new Promise((resolve, reject) => {
      const teamId = req.body.playerTeam;
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT gender FROM Teams WHERE teamId = ?', teamId, (error, results, fields) => {
        if (error) {
          return reject(error);
        } else if (results.length > 0) {
          resolve(results[0].gender);
        } else {
          reject("Id inexistant");
        }
      });
    });
  },

  edit(req, res, next) {
    const teamId = req.params.team_id;
    const teamProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query('UPDATE Teams SET ? WHERE teamId = ?', [teamProperties, teamId], (error, results, fields) => {
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
    const teamId = req.params.team_id;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query('DELETE FROM Teams WHERE teamId = ?', teamId, (error, results, fields) => {
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

  getTeamIdByGenderCollege(req, res, next) {
    const gender = req.params.gender;
    const collegeId = req.params.collegeId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query('SELECT t.teamId FROM Teams t WHERE t.Colleges_collegeId = ? AND t.gender = ?;', [collegeId, gender], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        console.log(query.sql);
        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  }
};
