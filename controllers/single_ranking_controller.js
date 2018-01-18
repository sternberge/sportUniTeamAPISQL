var db = require('./../db');
const PlayerController = require('../controllers/player_controller');
var blueBird = require('bluebird');
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


        getSingleBestMatches(playerId,limiteRequest,rankingType,date){
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
                Where s.winner = ? and sr.type = ? and r.type = 'S' and s.date > ?
                order by r.opponentRank Asc limit ?`, [playerId,rankingType,date,limiteRequest], (error, results, fields) => {
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


          getSingleBestLossesMatches(playerId,rankingType,date,nbMatch){
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
                  Where s.loser = ? and sr.type = ?  and r.type = 'S' and s.date > ?
                  order by r.opponentRank Asc limit ?`, [playerId,rankingType,date,limiteRequest], (error, results, fields) => {
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

            getSingleRankingPerPlayerId(playerId,rankingType){
              return new Promise(function (resolve, reject) {

                db.pool.getConnection((error, connection) => {
                  if (error){
                    return reject(error);
                  }
                  var query = connection.query(`Select sr.singleRankingId from SingleRanking sr
                    Left Outer Join Players p on sr.Players_playerId= p.playerId
                    Where p.playerId = ? and sr.type = ?`, [playerId,rankingType], (error, results, fields) => {
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


              calculateRankingPerPlayer(playerId,limiteRequest,rankingType,date,res){
                var winPoints = 0;
                var losePoints = 0;
                var nbWinMatches = 0;
                var nbLoseMatches = 0;
                var rankPoints = 0;
                var i = 0;
                module.exports.getSingleBestMatches(playerId,limiteRequest,rankingType,date)
                .then((results1) => {
                  console.log("-----------------------------------------------------------");
                  console.log("Nombre de match gagnés : ",results1.length, " pour le playerId : ",playerId);
                  for(i=0; i<results1.length; i++ ){
                    winPoints += results1[i].winOverRankPoints;
                  }
                  console.log("Points gangés au cours de ce(s) matchs : ",winPoints);
                  nbWinMatches = results1.length;
                  return Promise.resolve(results1);
                })
                .then((results) => {
                  console.log("-----------------------------------------------------------");
                  if(results.length < limiteRequest){
                    nbLoseMatches = limiteRequest - nbWinMatches;
                    console.log("Nombre de match perdus si le joeurs Id",playerId,"a joué plus de match que la limite : ",nbLoseMatches);
                    return module.exports.getSingleBestLossesMatches(playerId,rankingType,date,nbLoseMatches);
                  }
                  else{
                    return Promise.resolve(null);
                  }
                })
                .then((results2) => {
                  console.log("-----------------------------------------------------------");
                  if(results2 != null){
                    var i =0;
                    console.log("Le joueur id ",playerId," a perdu le nombre suivant de match : ",results2.length);
                    for(i=0; i<results2.length; i++ ){
                      console.log("Match perdu numero :", i+1);
                      losePoints += results2[i].lossToRankPoints;
                    }
                  }
                  rankPoints = winPoints / (nbWinMatches + losePoints);
                  rankPoints = 26;
                  console.log("Nombre points totaux : ",rankPoints,"pour le joueur",playerId);
                  return(module.exports.getSingleRankingPerPlayerId(playerId,rankingType));
                })
                .then((playerRankingId) => {
                  console.log("-----------------------------------------------------------");
                  console.log("Player Ranking Id par type selectionné (N,R,...) : ",playerRankingId,"pour le joueur ",playerId);
                  return(module.exports.editWithPromise(playerRankingId,rankPoints));
                })
                .then((results) => {
                  console.log("-----------------------------------------------------------");
                  console.log("Resultats du nouveau ranking : ",rankPoints," pour le playerId",playerId);
                  //res.send("Nouveau ranking MAJ !");
                  return Promise.resolve("OK");
                })
                .catch((error) => {
                  //res.send(error);
                });
              },

              calculateRanking(req,res){
                var playerId = 0;
                var i,j;
                PlayerController.getAllPlayerId()
                .then((allPlayers) => {
                  //console.log(allPlayers);
                  var testTab = [];
                  for(i=0; i<3; i++){
                    testTab.push(allPlayers[i]);
                  }
                  //testTab.reverse();
                  console.log(testTab);
                  //for(i=0; i<allPlayers.length; i++){
                  //for(i=0; i<3; i++){
                    /*playerId = allPlayers[i].playerId;
                    var rankingTypes = ["N", "R", "C"];*/
                    /*var rankingType = "";
                    for (i = 0; i < rankingTypes.length; i++){
                    rankingType = rankingTypes[i];
                  }*/
                  var rankingTypes = ["N", "R", "C"];
                  var rankingType = "R";
                  var playerId = 2;
                  var limiteRequest = 5;
                  var date = "2017-01-01";
                  var promise=[];

                  /*for(i=0;i<rankingType.length;i++){
                    blueBird.each(testTab,module.exports.calculateRankingPerPlayer(item,limiteRequest,rankingType,date,res));
                  }*/
                  return Promise.all(result.rows.map(function (row) {
                    return db.remove(row.doc);
                  }));
                  return Promise.all([testTab.map(player => { return module.exports.calculateRankingPerPlayer(player.playerId,limiteRequest,rankingType,date,res)})]);

              //  }

              })
              .then((param) => {

              })
              .catch((error) => {
                console.log(error);
              })

            }
          };
