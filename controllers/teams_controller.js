var db = require('./../db');

//Get the different Team ids from the Teams Table in the DB
const getTeamIds = () => {
  return new Promise((resolve, reject) => {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT teamId FROM Teams`, (error, results, fields) => {
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

module.exports = {

  getTeamIds,

  find (req, res) {
    const teamId = req.params.team_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM Teams WHERE teamId = ?', teamId, (error, results, fields) => {
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

  findTeamById (connection,req) {
    return new Promise((resolve,reject)=>{
      const teamId = req.body.playerTeam;
        // L'ajout du '?' permet d'éviter les injections sql
        var query = connection.query('SELECT gender FROM Teams WHERE teamId = ?', teamId, (error, results, fields) => {
          if (error){
            return reject(error);
          }
          else if (results.length > 0){
            resolve(results[0].gender);
          }
          else{
            reject("Id inexistant");
          }
      });
    });
  },

  create(req, res, next) {
        const gender = req.body.gender;
        const Colleges_collegeId = req.body.Colleges_collegeId;
        const Coaches_headCoachId = req.body.Coaches_headCoachId;
        const Coaches_coachId = req.body.Coaches_coachId;
        db.pool.getConnection((error, connection) => {
          if (error){
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }

            var query = connection.query('INSERT INTO Teams (gender,Colleges_collegeId,Coaches_headCoachId,Coaches_coachId) VALUES(?, ?, ?, ?)',
            [gender,Colleges_collegeId,Coaches_headCoachId,Coaches_coachId], (error, results, fields) => {
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
      const teamId = req.params.team_id;
      const teamProperties = req.body;
      db.pool.getConnection((error, connection) => {
        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var query = connection.query('UPDATE Teams SET ? WHERE teamId = ?',[teamProperties, teamId], (error, results, fields) => {
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
      const teamId = req.params.team_id;
      db.pool.getConnection((error, connection) => {
        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var query = connection.query('DELETE FROM Teams WHERE teamId = ?', teamId, (error, results, fields) => {
          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        });
      });
    },

    getTeamIdByGenderCollege(req, res, next) {
      const gender = req.params.gender;
      const collegeId = req.params.collegeId;

      db.pool.getConnection((error, connection) => {
        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var query = connection.query('SELECT t.teamId FROM Teams t WHERE t.Colleges_collegeId = ? AND t.gender = ?;', [collegeId,gender], (error, results, fields) => {
          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          console.log(query.sql);
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        });
      });
    }
  };
