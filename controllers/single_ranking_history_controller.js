var db = require('./../db');


module.exports = {

  find (req, res) {
    const singleRankingHistoryId = req.params.singleRankingHistoryId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM SingleRankingHistory WHERE singleRankingId = ?', singleRankingHistoryId, (error, results, fields) => {
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
	const date = req.body.date;

    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var query = connection.query('INSERT INTO SingleRankingHistory (rank, rankPoints, Players_playerId,	differenceRank, differencePoints, type, date) VALUES(?, ?, ?, ?, ?, ?, ?)',
      [rank, rankPoints, Players_playerId, differenceRank, differencePoints, type, date], (error, results, fields) => {
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
    const singleRankingHistoryId = req.params.singleRankingHistoryId;
    const singleRankingHistoryProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE SingleRankingHistory SET ? WHERE singleRankingHistoryId = ?',[singleRankingHistoryProperties, singleRankingHistoryId], (error, results, fields) => {
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
    const singleRankingHistoryId = req.params.singleRankingHistoryId;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM SingleRankingHistory WHERE singleRankingHistoryId = ?', singleRankingHistoryId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },
  
  getCurrentSingleRankings(){
	return new Promise (function (resolve, reject) {
		db.pool.getConnection((error, connection) => {
		  if (error){
			return reject(error);
		  }
		  var query = connection.query(`SELECT * FROM SingleRanking`, (error, results, fields) => {
			if (error){
			  connection.release();
			  return reject(error);
			}
			resolve(results);
			connection.release(); // CLOSE THE CONNECTION
			});
		});
	});
  },
  
  
  archiveCurrentSingleRanking(req, res, next){
	module.exports.getCurrentSingleRankings()
	.then((currentSingleRankings) => {
		return new Promise ( (resolve, reject) => {
			//console.log(currentSingleRankings);
			const currentDate = new Date();
			db.pool.getConnection((error, connection) => {
			  if (error){
				console.log("erreur 1");
				reject(error);
				//return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
			  }
			  for (var i=0; i < currentSingleRankings.length; i++){
				var playerId = currentSingleRankings[i].Players_playerId;
				var rank = currentSingleRankings[i].rank;
				var rankPoints = currentSingleRankings[i].rankPoints;
				var differenceRank = currentSingleRankings[i].differenceRank;
				var differencePoints = currentSingleRankings[i].differencePoints;
				var type = currentSingleRankings[i].type;
				console.log(currentDate);
				
				var query = connection.query(`INSERT INTO SingleRankingHistory (Players_playerId, rank, rankPoints, differenceRank, differencePoints, type, date) 
				VALUES(?, ?, ?, ?, ?, ?, ?)`, [playerId, rank, rankPoints, differenceRank, differencePoints, type, currentDate], (error, results, fields) => {
				if (error){
				  console.log("erreur 2");
				  connection.release();
				  return reject(error);
				  //return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
				}
				});
			  }
			  
			//res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
			connection.release(); // CLOSE THE CONNECTION
			resolve();
			});
		});
		
	})
	.then((results) => {
		res.send("singleRankings have been archived");
	})
	.catch((error) => {
		console.log("erreur 3");
		console.log(error);
	});
  },
  
};
