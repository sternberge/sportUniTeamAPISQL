var db = require('./../db');


module.exports = {

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
  };
