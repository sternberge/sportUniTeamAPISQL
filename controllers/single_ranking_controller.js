var db = require('./../db');


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

  editWithPromise(playerRankingId,rankPoints) {
    return new Promise(function (resolve, reject) {
    const singleRankingId = playerRankingId;
    const singleRankingProperties = rankPoints;
    db.pool.getConnection((error, connection) => {
      if (error){
        return reject(error);
      }
      var query = connection.query('UPDATE SingleRanking SET rankPoints = ? WHERE singleRankingId = ?',[singleRankingProperties, singleRankingId], (error, results, fields) => {
        if (error){
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        resolve(results);
      });
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


  getSingleBestMatches(playerId,limiteRequest,singleRankingType,rankingType,date){
    return new Promise(function (resolve, reject) {
    limiteRequest = Number(limiteRequest);
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`Select s.homeAway, r.winOverRankPoints from SimpleMatches s
Left Outer Join Players p on s.loser = p.playerId
Left Outer Join SingleRanking sr on sr.Players_playerId = p.playerId
Left Outer Join RankPointsRules r on r.opponentRank=sr.rank
Where s.winner = ? and sr.type = ? and r.type = ? and s.date > ?
order by r.opponentRank Asc limit ?`, [playerId,singleRankingType,rankingType,date,limiteRequest], (error, results, fields) => {
        if (error){
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        return resolve(results);
      });
    });
  });
  },


  getSingleBestLossesMatches(playerId,singleRankingType,rankingType,date,nbMatch){
    return new Promise(function (resolve, reject) {
    limiteRequest = Number(nbMatch);
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`Select s.homeAway, r.lossToRankPoints from SimpleMatches s
Left Outer Join Players p on s.winner = p.playerId
Left Outer Join SingleRanking sr on sr.Players_playerId = p.playerId
Left Outer Join RankPointsRules r on r.opponentRank=sr.rank
Where s.loser = ? and sr.type = ?  and r.type = ? and s.date > ?
order by r.opponentRank Asc limit ?`, [playerId,singleRankingType,rankingType,date,limiteRequest], (error, results, fields) => {
        if (error){
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        //console.log(results);
        return resolve(results);
      });
    });
  });
},

getSingleRankingPerPlayerId(playerId,singleRankingType){
  return new Promise(function (resolve, reject) {

  db.pool.getConnection((error, connection) => {
    if (error){
      return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
    }
    var query = connection.query(`Select sr.singleRankingId from SingleRanking sr
Left Outer Join Players p on sr.Players_playerId= p.playerId
Where p.playerId = ? and sr.type = ?`, [playerId,singleRankingType], (error, results, fields) => {
      if (error){
        connection.release();
        return reject(error);
      }
      connection.release(); // CLOSE THE CONNECTION
      //console.log(results);
      return resolve(results[0].singleRankingId);
    });
  });
});
},


  calculateRankingPerPlayer(playerId,limiteRequest,singleRankingType,rankingType,date,res){
    var winPoints = 0;
    var losePoints = 0;
    var nbWinMatches = 0;
    var nbLoseMatches = 0;
    var rankPoints = 0;
    var i = 0;
    module.exports.getSingleBestMatches(playerId,limiteRequest,singleRankingType,rankingType,date)
    .then((results1) => {
      console.log("Nombre de match gagnés : ",results1.length);
      for(i=0; i<results1.length; i++ ){
        winPoints += results1[i].winOverRankPoints;
      }
      console.log("Points gangés au cours de ce(s) matchs : ",winPoints);
      nbWinMatches = results1.length;
      return Promise.resolve(results1);
    })
    .then((results) => {
      if(results.length < limiteRequest){
        nbLoseMatches = limiteRequest - nbWinMatches;
        console.log("Nombre de match perdus si le joeurs a joué plus de match que la limite : ",nbLoseMatches);
        return module.exports.getSingleBestLossesMatches(playerId,singleRankingType,rankingType,date,nbLoseMatches);
      }
      else{
        return Promise.resolve(null);
      }
    })
    .then((results2) => {
      if(results2 != null){
        var i =0;
        console.log("Le joeur a perdu le nombre suivant de match : ",results2.length);
        for(i=0; i<nbLoseMatches; i++ ){
          console.log("Match perdu numero :", i+1);
          losePoints += results2[i].lossToRankPoints;
        }
      }
      rankPoints = winPoints / (nbWinMatches + losePoints);
      console.log("Nombre points totaux : ",rankPoints);
      return(module.exports.getSingleRankingPerPlayerId(playerId,singleRankingType));
    })
    .then((playerRankingId) => {
      console.log("Player Ranking Id par type selectionné (N,R,...) : ",playerRankingId);
      return(module.exports.editWithPromise(playerRankingId,rankPoints));
    })
    .then((results) => {
      console.log("Resultats du nouveau ranking : ",rankPoints);
      res.send("Nouveau ranking MAJ !");
    })
    .catch((error) => {
      res.send(error);
    });
  },

  calculateRanking(req,res){
    var playerId = 2;
    var limiteRequest = 5;
    var singleRankingType = "N";
    var rankingType = "S";
    var date = "2017-01-01";
    module.exports.calculateRankingPerPlayer(playerId,limiteRequest,singleRankingType,rankingType,date,res);
  }
};
