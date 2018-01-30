var db = require('./../db');
const PlayerController = require('../controllers/player_controller');
const RegionsController = require('../controllers/regions_controller');
const ConferencesController = require('../controllers/conferences_controller');

        const updateSingleRankingOrder = (singleRankingId, rank) => {
          return new Promise(function(resolve, reject) {
            db.pool.getConnection((error, connection) => {
              if (error) {
                return reject(error);
              }
              var query = connection.query(`UPDATE SingleRanking SET rank = ? WHERE doubleRankingId = ?`, [rank, singleRankingId], (error, results, fields) => {
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


        const getNewRegionalRankingOrder = (leagueId, gender, regionId) => {
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
          }

          const getNewConferenceRankingOrder = (leagueId, gender, conferenceId) => {
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
            }

            const getNewNationalRankingOrder = (leagueId, gender) => {
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
              }

              const orderRegionalRanking = async (leagueId, gender) => {
                return new Promise( async (resolve, reject) => {
                  let regions = [];
                  let orderRegionalRankingPerRegionPromises = [];
                  try{
                    regions = await RegionsController.getRegionIds();
                    console.log(`Region Ids fetched`);
                  } catch(err){
                    console.log(err);
                    return reject(`Could not fetch Region Ids`);
                  }

                  try{
                    const orderRegionalDoubleRankingOrderPromises = regions.map( region =>
                      orderRegionalRankingPerRegion(leagueId, gender, region.regionId)
                    );
                    await Promise.all(orderRegionalDoubleRankingOrderPromises);
                    console.log(`Regional double ranking updated for league ${leagueId} and gender ${gender}`);
                  } catch(err){
                    console.log(err);
                    return reject(`Could not update regional double ranking for league ${leagueId} and gender ${gender}`);
                  }

                  resolve(`Regional Double Ranking ordering done for league ${leagueId} and gender ${gender}`);
                });
              }


              const orderNationalRankingByRankPoints = async (leagueId, gender) => {
                return new Promise( async (resolve, reject) => {
                  const newNationalRanking = [];
                  try{
                    newNationalRanking = await getNewNationalRankingOrder(leagueId, gender);
                    console.log(`New national ranking order fetched for league ${leagueId} and gender ${gender}`);
                  } catch(err){
                    console.log(err);
                    return reject(`Could not fetch new national ranking order for league ${leagueId} and gender ${gender}`);
                  }

                  try{
                    const updateSingleRankingOrderPromises = newNationalRanking.map( (doubleTeamNationalRank, rank) =>
                      updateSingleRankingOrder(doubleTeamNationalRank.singleRankingId, rank + 1)
                    );
                  } catch(err){

                  }
                  updateSingleRankingOrder = (doubleRankingId, rank);
                  resolve(`National Double Ranking ordering done for league ${leagueId} and gender ${gender}`);

            });
          }


          const orderConferenceRanking = async (leagueId, gender) => {
            return new Promise( async (resolve, reject) => {
              let conferences = [];
              let orderConferenceRankingPerConferencePromises = [];
              try{
                conferences = await ConferencesController.getConferenceIds();
                console.log(`Conference Ids fetched`);
              } catch(err){
                console.log(err);
                return reject(`Could not fetch Conference Ids`);
              }

              try{
                const orderConferenceDoubleRankingOrderPromises = conferences.map( conference =>
                  orderConferenceRankingPerConference(leagueId, gender, conference.conferenceId)
                );
                await Promise.all(orderConferenceDoubleRankingOrderPromises);
                console.log(`Conference double ranking updated for league ${leagueId} and gender ${gender}`);
              } catch(err){
                console.log(err);
                return reject(`Could not update conference double ranking for league ${leagueId} and gender ${gender}`);
              }

              resolve(`Conference Double Ranking ordering done for league ${leagueId} and gender ${gender}`);
            });
          }

          const orderRankingPerGender = async (leagueId) => {
            return new Promise( async (resolve, reject) => {
              const genders = ["M", "F"];

              const orderNationalRankingPerGenderPromises = genders.map(gender =>
                orderNationalRanking(leagueId, gender)
              );

              const orderRegionalRankingPerGenderPromises = genders.map(gender =>
                orderRegionalRanking(leagueId, gender)
              );

              const orderConferenceRankingPerGenderPromises = genders.map(gender =>
                orderConferenceRanking(leagueId, gender)
              );

              try{
                await Promise.all(orderNationalRankingPerGenderPromises);
                console.log(`National Double Ranking ordered for all genders and league ${leagueId}`);
              } catch(err){
                console.log(err);
                return reject(`National Double Ranking ordering failed for league ${leagueId}`);
              }

              try{
                await Promise.all(orderRegionalRankingPerGenderPromises);
                console.log(`Regional Double Ranking ordered for all genders and league ${leagueId}`);
              } catch(err){
                console.log(err);
                return reject(`Regional Double Ranking ordering failed for league ${leagueId}`);
              }

              try{
                await Promise.all(orderConferenceRankingPerGenderPromises);
                console.log(`Conference Double Ranking ordered for all genders and league ${leagueId}`);
              } catch(err){
                console.log(err);
                return reject(`Conference Double Ranking ordering failed for league ${leagueId}`);
              }

              resolve(`Double Ranking ordering done for league ${leagueId}`);
            });
          }



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


                createInitialRanking(connection,rank,playerId,type) {
                  return new Promise((reject,resolve)=> {

                    var query = connection.query('INSERT INTO SingleRanking (rank, rankPoints, Players_playerId,	differenceRank, differencePoints, type) VALUES(?, ?, ?, ?, ?, ?)',
                    [rank, 0, playerId, 0, 0, type], (error, results, fields) => {
                      if (error){
                        return reject(error)
                      }
                      resolve(results.insertId);
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


                getNewRegionalRankingOrder,
                getNewConferenceRankingOrder,
                updateSingleRankingOrder
              };
