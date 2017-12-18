var db = require('./../db');


module.exports = {

  find (req, res) {
    const teamId = req.params.team_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM teams WHERE teamId = ?', teamId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  create(req, res, next) {
 
    req.checkBody('gender','Gender cannot be empty').notEmpty();
    var errors = req.validationErrors();

    if(errors){
      res.send(errors);
    }

    else{
        const gender = req.body.gender;
        const Colleges_collegeId = req.body.Colleges_collegeId;
        const Coaches_headCoachId = req.body.Coaches_headCoachId;
        const Coaches_coachId = req.body.Coaches_coachId;

        db.pool.getConnection((error, connection) => {
          if (error){
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }

            var query = connection.query('INSERT INTO teams (gender,Colleges_collegeId,Coaches_headCoachId,Coaches_coachId) VALUES(?, ?, ?, ?)',
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
      }
  },

    edit(req, res, next) {
      const teamId = req.params.team_id;
      const teamProperties = req.body;
      db.pool.getConnection((error, connection) => {
        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var query = connection.query('UPDATE teams SET ? WHERE teamId = ?',[teamProperties, teamId], (error, results, fields) => {
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
        var query = connection.query('DELETE FROM teams WHERE teamId = ?', teamId, (error, results, fields) => {
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
