var db = require('./../db');
const PlayerController = require('../controllers/player_controller');
const RegionsController = require('../controllers/regions_controller');
const ConferencesController = require('../controllers/conferences_controller');
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


  createInitialRanking(rank,playerId,type) {
    return new Promise((reject,resolve)=> {
    db.pool.getConnection((error, connection) => {
      if (error){
        return reject(error);
      }

      var query = connection.query('INSERT INTO SingleRanking (rank, rankPoints, Players_playerId,	differenceRank, differencePoints, type) VALUES(?, ?, ?, ?, ?, ?)',
      [rank, 0, playerId, 0, 0, type], (error, results, fields) => {
        if (error){
          connection.release();
          return reject(error)
        }
        connection.release(); // CLOSE THE CONNECTION
        resolve(results.insertId);
      });
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

  getNewNationalRankingOrder(leagueId, gender) {
    return new Promise(function (resolve, reject) {
      db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var query = connection.query(`SELECT singleRankingId FROM SingleRanking sr
			INNER JOIN Players p on p.playerId = sr.Players_playerId
			INNER JOIN Teams t on t.teamId = p.Teams_teamId
			INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
			WHERE sr.type = 'N' AND c.Leagues_leagueId = ? AND t.gender LIKE ?
			ORDER BY sr.rankPoints DESC`,[leagueId, gender], (error, results, fields) => {
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

  updateSingleRankingOrder(singleRankingId, rank) {
    return new Promise(function (resolve, reject) {
      db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var query = connection.query(`UPDATE SingleRanking SET rank = ? WHERE singleRankingId = ?`,[rank, singleRankingId], (error, results, fields) => {
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



  getNewRegionalRankingOrder(leagueId, gender, regionId) {
    return new Promise(function (resolve, reject) {
      db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var query = connection.query(`SELECT singleRankingId FROM SingleRanking sr
			INNER JOIN Players p on p.playerId = sr.Players_playerId
			INNER JOIN Teams t on t.teamId = p.Teams_teamId
			INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
			WHERE sr.type = 'R' AND c.Leagues_leagueId = ? AND t.gender LIKE ? AND c.Regions_regionId = ?
			ORDER BY sr.rankPoints DESC`,[leagueId, gender, regionId], (error, results, fields) => {
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

  getNewConferenceRankingOrder(leagueId, gender, conferenceId) {
    return new Promise(function (resolve, reject) {
      db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var query = connection.query(`SELECT singleRankingId FROM SingleRanking sr
			INNER JOIN Players p on p.playerId = sr.Players_playerId
			INNER JOIN Teams t on t.teamId = p.Teams_teamId
			INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId
			WHERE sr.type = 'C' AND c.Leagues_leagueId = ? AND t.gender = ? AND c.Conferences_conferenceId = ?
			ORDER BY sr.rankPoints DESC`,[leagueId, gender, conferenceId], (error, results, fields) => {
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

  orderNationalRankingByRankPoints() {
    return new Promise(function (resolve, reject) {

		var leagues = [1, 2, 3, 4, 5];
		var genders = ["M", "F"];

		//Create a new promise for each league
		const promisesPerLeague = leagues.map( leagueId =>
			new Promise( (resolve, reject) => {

				//Order National Ranking for each gender
				const promisesPerGender = genders.map( gender =>
					new Promise( (resolve, reject) => {
						module.exports.getNewNationalRankingOrder(leagueId, gender)
							.then( (nationalRankingByLeagueGender) => {

								//Update each player's national singleRanking Rank
								const promisesPerPlayer = nationalRankingByLeagueGender.map( (playerNationalRank, rank) =>
									new Promise( (resolve, reject) => {
										module.exports.updateSingleRankingOrder(playerNationalRank.singleRankingId, rank + 1)
										.then( () => resolve() )
										.catch((error) => {
											console.log(error);
										});
									})
								);

								//When the national ranking has been updated for the players in the database
								Promise.all(promisesPerPlayer).then( () => {
									console.log(`National ranking done for league ${leagueId} and gender ${gender}`);
									resolve();
								});
							})
							.catch((error) => {
								console.log(error);
							});


					})
				);

				//When the national ranking has been update for both genders
				Promise.all(promisesPerGender).then( () => {
					console.log(`National ranking done for league ${leagueId}`);
					resolve();
				});

			}).catch((error) => {
				console.log(error);
			})
		);

		//When the national ranking has been updated for all leagues
		Promise.all(promisesPerLeague).then( () => console.log("National ranking done") );

	}).catch((error) => {
			console.log(error);
		});

  },

  orderRegionalRankingByRankPoints() {
    return new Promise(function (resolve, reject) {

		var leagues = [1, 2, 3, 4, 5];
		var genders = ["M", "F"];

		RegionsController.getRegionIds()
		.then( (regions) => {
			//Create a new promise for each league
			const promisesPerLeague = leagues.map( leagueId =>
				new Promise( (resolve, reject) => {

					//Order Regional Ranking for each gender
					const promisesPerGender = genders.map( gender =>
						new Promise( (resolve, reject) => {

							//Order Regional Ranking for each region
							const promisesPerRegion = regions.map( region =>
								new Promise( (resolve, reject) => {
									module.exports.getNewRegionalRankingOrder(leagueId, gender, region.regionId)
									.then( (regionalRankingByLeagueGenderRegion) => {

										//Update each player's regional singleRanking Rank
										const promisesPerPlayer = regionalRankingByLeagueGenderRegion.map( (playerRegionalRank, rank) =>
											new Promise( (resolve, reject) => {
												module.exports.updateSingleRankingOrder(playerRegionalRank.singleRankingId, rank + 1)
												.then( () => resolve() )
												.catch((error) => {
													console.log(error);
												});
											})
										);

										//When the regional ranking has been updated for the players in the database
										Promise.all(promisesPerPlayer).then( () => {
											console.log(`Regional ranking done for league ${leagueId}, gender ${gender} and region ${region.regionId}`);
											resolve();
										});
									})
									.catch((error) => {
										console.log(error);
									});
								})
							);

							//When the regional ranking has been updated for all regions
							Promise.all(promisesPerRegion).then( () => {
								console.log(`Regional ranking done for league ${leagueId} and gender ${gender}`);
								resolve();
							});


						})
					);

					//When the regional ranking has been update for both genders
					Promise.all(promisesPerGender).then( () => {
						console.log(`Regional ranking done for league ${leagueId}`);
						resolve();
					});

				}).catch((error) => {
					console.log(error);
				})
			);

			//When the regional ranking has been updated for all leagues
			Promise.all(promisesPerLeague).then( () => console.log("Regional ranking done") );

		}).catch((error) => {
				console.log(error);
			});
	})

  },

  orderConferenceRankingByRankPoints() {
    return new Promise(function (resolve, reject) {

		var leagues = [1, 2, 3, 4, 5];
		var genders = ["M", "F"];

		ConferencesController.getConferenceIds()
		.then( (conferences) => {
			//Create a new promise for each league
			const promisesPerLeague = leagues.map( leagueId =>
				new Promise( (resolve, reject) => {

					//Order Conference Ranking for each gender
					const promisesPerGender = genders.map( gender =>
						new Promise( (resolve, reject) => {

							//Order Conference Ranking for each conference
							const promisesPerConference = conferences.map( conference =>
								new Promise( (resolve, reject) => {
									module.exports.getNewConferenceRankingOrder(leagueId, gender, conference.conferenceId)
									.then( (conferenceRankingByLeagueGenderConference) => {

										//Update each player's conference singleRanking Rank
										const promisesPerPlayer = conferenceRankingByLeagueGenderConference.map( (playerConferenceRank, rank) =>
											new Promise( (resolve, reject) => {
												module.exports.updateSingleRankingOrder(playerConferenceRank.singleRankingId, rank + 1)
												.then( () => resolve() )
												.catch((error) => {
													console.log(error);
												});
											})
										);

										//When the national ranking has been updated for the players in the database
										Promise.all(promisesPerPlayer).then( () => {
											console.log(`Conference ranking done for league ${leagueId}, gender ${gender} and conference ${conference.conferenceId}`);
											resolve();
										});
									})
									.catch((error) => {
										console.log(error);
									});
								})
							);

							//When the conference ranking has been updated for all regions
							Promise.all(promisesPerConference).then( () => {
								console.log(`Conference ranking done for league ${leagueId} and gender ${gender}`);
								resolve();
							});


						})
					);

					//When the conference ranking has been update for both genders
					Promise.all(promisesPerGender).then( () => {
						console.log(`Conference ranking done for league ${leagueId}`);
						resolve();
					});

				}).catch((error) => {
					console.log(error);
				})
			);

			//When the conference ranking has been updated for all leagues
			Promise.all(promisesPerLeague).then( () => console.log("Conference ranking done") );

		}).catch((error) => {
				console.log(error);
			});
	})

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
                // Recupere les matchs gagnés par le joueur ainsi que le nb de points gagnés selon les adversaires(nbmax de match = limiteRequest)
                module.exports.getSingleBestMatches(playerId,limiteRequest,rankingType,date)
                .then((results1) => {
                  console.log("-----------------------------------------------------------");
                  console.log("Nombre de match gagnés : ",results1.length, " pour le playerId : ",playerId);
                  for(i=0; i<results1.length; i++ ){
                    // Calcul du nb de points total gagnés
                    winPoints += results1[i].winOverRankPoints;
                  }
                  console.log("Points gangés au cours de ce(s) matchs : ",winPoints);
                  nbWinMatches = results1.length;
                  return Promise.resolve(results1);// on envoie les matchs gagnés à la fonction suivante
                })
                .then((results) => {
                  console.log("-----------------------------------------------------------");
                  // Si le joueur a gagné moins de match que la limite demandée
                  if(results.length < limiteRequest){
                    nbLoseMatches = limiteRequest - nbWinMatches;
                    console.log("Nombre de match perdus si le joeurs Id",playerId,"a joué plus de match que la limite : ",nbLoseMatches);
                    //On recupere les "meilleurs" match perdu afin de completer
                    return module.exports.getSingleBestLossesMatches(playerId,rankingType,date,nbLoseMatches);
                  }
                  else{
                    return Promise.resolve(null);
                  }
                })
                .then((results2) => {
                  console.log("-----------------------------------------------------------");
                  //Si le resultat n'est pas null, le joueur a perdu des matchs, on calcule les points perdus
                  if(results2 != null){
                    var i =0;
                    console.log("Le joueur id ",playerId," a perdu le nombre suivant de match : ",results2.length);
                    for(i=0; i<results2.length; i++ ){
                      console.log("Match perdu numero :", i+1);
                      losePoints += results2[i].lossToRankPoints;
                    }
                  }
                  //On calcule ses ranking points à l'aide de la formule
                  rankPoints = winPoints / (nbWinMatches + losePoints);
                  rankPoints = 13;
                  console.log("Nombre points totaux : ",rankPoints,"pour le joueur",playerId);
                  //On recupere le ranking id du player
                  return(module.exports.getSingleRankingPerPlayerId(playerId,rankingType));
                })
                .then((playerRankingId) => {
                  console.log("-----------------------------------------------------------");
                  console.log("Player Ranking Id par type selectionné (N,R,...) : ",playerRankingId,"pour le joueur ",playerId);
                  //on insert le nouveau ranking dans la table
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


			  calculateRanking(res){
				var rankingTypes = ["N", "R", "C"];
				/*var results = Promise.all([rankingTypes.map(rankingType => { return module.exports.calculateRankingPerTypeAndPlayer(rankingType, res)})]);

				results.then(function () {console.log("les rankings ont été mis à jour !");})
				  .catch((error) => {
					console.log(error);
				  }).then( (resolve) => {
					return module.exports.orderNationalRankingByRankPoints();
					}).catch((error) => {
					console.log(error);
				  })*/

				  //var test = module.exports.orderNationalRankingByRankPoints()
				  //var test = module.exports.orderRegionalRankingByRankPoints()
				  var test = module.exports.orderConferenceRankingByRankPoints()
				  .catch((error) => {
					console.log(error);
				  });
			  },

              calculateRankingPerTypeAndPlayer(rankingType, res){
                var playerId = 0;
                var i,j;
                PlayerController.getAllPlayerId()
                .then((allPlayers) => {
                  //console.log(allPlayers);
                  var testTab = [];
                  for(i=0; i<3; i++){
                    testTab.push(allPlayers[i]);
                  }

                  var limiteRequest = 5;
                  var date = "2017-01-01";

                  return Promise.all([testTab.map(player => { return module.exports.calculateRankingPerPlayer(player.playerId,limiteRequest,rankingType,date,res)})]);

                })
                .catch((error) => {
                  console.log(error);
                })

              }
            };
