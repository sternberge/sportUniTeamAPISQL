var db = require('./../db');


module.exports = {

  find (req, res) {
    const tournamentId = req.params.tournament_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM Tournaments WHERE tournamentId = ?', tournamentId, (error, results, fields) => {
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
 
    req.checkBody('beginDate','Gender cannot be empty').notEmpty();
    req.checkBody('endDate','Gender cannot be empty').notEmpty();
    req.checkBody('gender','Gender cannot be empty').notEmpty();
    req.checkBody('name','Gender cannot be empty').notEmpty();
    var errors = req.validationErrors();

    if(errors){
      res.send(errors);
    }

    else{
      const beginDate = req.body.beginDate;
      const endDate = req.body.endDate;
      const gender = req.body.gender;
      const name = req.body.name;

      db.pool.getConnection((error, connection) => {
        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }

        var query = connection.query('INSERT INTO Tournaments (beginDate,endDate,gender,name) VALUES(?, ?, ?, ?)',
        [beginDate,endDate,gender,name], (error, results, fields) => {
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
    const tournamentId = req.params.tournament_id;
    const tournamentProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE Tournaments SET ? WHERE tournamentId = ?',[tournamentProperties, tournamentId], (error, results, fields) => {
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
    const tournamentId = req.params.tournament_id;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM Tournaments WHERE tournamentId = ?', tournamentId, (error, results, fields) => {
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
