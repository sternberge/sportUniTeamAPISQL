var db = require('./../db');


module.exports = {

  find (req, res) {
    const simpleMatchId = req.params.simpleMatch_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM SimpleMatches WHERE simpleMatchId = ?', simpleMatchId, (error, results, fields) => {
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


      const winner = req.body.winner;
      const loser = req.body.loser;
      const score = req.body.score;
      const date = req.body.date;
      const time = req.body.time;
      const springFall = req.body.springFall;
      const springPosition = req.body.springPosition;
      const round = req.body.round;
      const locationCity = req.body.locationCity;
      const locationState = req.body.locationState;
      const Tournaments_tournamentId = req.body.Tournaments_tournamentId;
      const homeAway = req.body.homeAway;
      const isRanked = req.body.isRanked;
      const springMatchType =req.body.springMatchType;


      db.pool.getConnection((error, connection) => {
        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }

        var query = connection.query('INSERT INTO SimpleMatches (winner,loser,score,date,time,springFall,springPosition,round,locationCity,locationState,Tournaments_tournamentId,homeAway,isRanked,springMatchType) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [winner,loser,score,date,time,springFall,springPosition,round,locationCity,locationState,Tournaments_tournamentId,homeAway,isRanked,springMatchType], (error, results, fields) => {
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
    const simpleMatchId = req.params.simpleMatch_id;
    const simpleMatchProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE SimpleMatches SET ? WHERE simpleMatchId = ?',[simpleMatchProperties, simpleMatchId], (error, results, fields) => {
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
    const simpleMatchId = req.params.simpleMatch_id;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM SimpleMatches WHERE simpleMatchId = ?', simpleMatchId, (error, results, fields) => {
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
