var db = require('./../db');


module.exports = {

  find (req, res) {
    const leagueId = req.params.team_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM leagues WHERE leagueId = ?', leagueId, (error, results, fields) => {
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
 
   
    var errors = req.validationErrors();

    if(errors){
      res.send(errors);
    }

    else{
        const leagueLabel = req.body.leagueLabel;
        const leagueShortName = req.body.leagueShortName;
        const show = req.body.show;
   

        db.pool.getConnection((error, connection) => {
          if (error){
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }

            var query = connection.query('INSERT INTO leagues (leagueLabel,leagueShortName,show) VALUES(?, ?, ?)',
            [leagueLabel,leagueShortName,show], (error, results, fields) => {
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
      const leagueId = req.params.team_id;
      const leagueProperties = req.body;
      db.pool.getConnection((error, connection) => {
        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var query = connection.query('UPDATE leagues SET ? WHERE leagueId = ?',[leagueProperties, leagueId], (error, results, fields) => {
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
      const leagueId = req.params.team_id;
      db.pool.getConnection((error, connection) => {

        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        var query = connection.query('DELETE FROM leagues WHERE leagueId = ?', leagueId, (error, results, fields) => {
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
