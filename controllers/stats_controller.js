var db = require('./../db');

module.exports = {

  getSimpleMatchsWonByPlayerId(req, res, next) {

    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT count(*) as result FROM SimpleMatches sm WHERE Winner = ?;`, playerId, (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }

        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },

  getSimpleMatchsLostByPlayerId(req, res, next) {

    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT count(*) as result FROM SimpleMatches sm WHERE Loser = ?;`, playerId, (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }

        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },

  getSimpleMatchsPlayedByPlayerId(req, res, next) {

    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT COUNT(*) as result FROM SimpleMatches sm WHERE Winner = ? OR Loser = ?;`, [playerId,playerId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }

        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },


  getDoubleMatchsWonByPlayerId(req, res, next) {

    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT count(*) as result FROM DoubleMatches dm
      INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.winnerDouble
      WHERE dt1.Players_playerId = ? OR dt1.Players_playerId2 = ?`, [playerId,playerId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }

        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },

  getDoubleMatchsLostByPlayerId(req, res, next) {

    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT count(*) as result FROM DoubleMatches dm
      INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.loserDouble
      WHERE dt1.Players_playerId = ? OR dt1.Players_playerId2 = ?;`, [playerId,playerId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }

        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },

  getDoubleMatchsPlayedByPlayerId(req, res, next) {

    const playerId = req.params.playerId;

    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`SELECT count(*) as result FROM DoubleMatches dm
      INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.winnerDouble
      INNER JOIN DoubleTeams dt2 on dt2.doubleTeamId = dm.loserDouble
      WHERE dt1.Players_playerId = ? OR dt1.Players_playerId2 = ? OR dt2.Players_playerId = ? OR dt2.Players_playerId2 = ?
      `, [playerId,playerId,playerId,playerId], (error, results, fields) => {
        if (error) {
          connection.release();
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }

        res.send(JSON.stringify({
          "status": 200,
          "error": null,
          "response": results
        }));
        connection.release(); // CLOSE THE CONNECTION

        console.log(query.sql);
      });
    });
  },


  getRatioStatsByPlayerId(req, res, next) {

    const playerId = req.params.playerId;
    const springFall = req.params.springFall;
    db.pool.getConnection((error, connection) => {
      if (error) {
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      var query = connection.query(`
        SELECT *,(simpleMatchsWon / simpleMatchsPlayed)*100 as victoryRatioSimple,(doubleMatchsWon/doubleMatchsPlayed)*100 as victoryRationDouble, ( (simpleMatchsWon+doubleMatchsWon)/(simpleMatchsPlayed+doubleMatchsPlayed))*100 as overallRatio  FROM
        (SELECT count(*) simpleMatchsWon FROM SimpleMatches sm
        WHERE Winner = ? AND sm.springFall LIKE ?) AS simpleMatchsWon,

        (SELECT count(*) simpleMatchsLost  FROM SimpleMatches sm
        WHERE Loser = ? AND sm.springFall LIKE ?) as simpleMatchsLost,

        (SELECT COUNT(*) simpleMatchsPlayed FROM SimpleMatches sm
        WHERE Winner = ? OR Loser = ? AND sm.springFall LIKE ?) as simpleMatchsPlayed,

        (SELECT count(*) doubleMatchsWon FROM DoubleMatches dm
        INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.winnerDouble
        WHERE dt1.Players_playerId = ? OR dt1.Players_playerId2 = ? AND dm.springFall LIKE ?) as doubleMatchsWon,

        (SELECT count(*) doubleMatchsLost  FROM DoubleMatches dm
        INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.loserDouble
        WHERE dt1.Players_playerId = ? OR dt1.Players_playerId2 = ? AND dm.springFall LIKE ?) as doubleMatchsLost,

        (SELECT count(*) doubleMatchsPlayed FROM DoubleMatches dm
        INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.winnerDouble
        INNER JOIN DoubleTeams dt2 on dt2.doubleTeamId = dm.loserDouble
        WHERE dt1.Players_playerId = ? OR dt1.Players_playerId2 = ? OR dt2.Players_playerId = ? OR dt2.Players_playerId2 = ? AND dm.springFall LIKE ?) as doubleMatchsPlayed

        `, [playerId,springFall,playerId,springFall,playerId,playerId,springFall,playerId,playerId,springFall,playerId,playerId,springFall,playerId,playerId,playerId,playerId,springFall],(error, results, fields) => {
          if (error) {
            connection.release();
            return res.send(JSON.stringify({
              "status": 500,
              "error": error,
              "response": null
            }));
          }

          console.log(query.sql);

          res.send(JSON.stringify({
            "status": 200,
            "error": null,
            "response": results
          }));
          connection.release(); // CLOSE THE CONNECTION

        });
      });
    },

    getWinRatioByTeam(req, res, next) {

      const springFall = req.params.springFall;
      const teamId = Number(req.params.teamId);

      db.pool.getConnection((error, connection) => {
        if (error) {
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        var query = connection.query(`SELECT *, (simpleMatchsWon/simpleMatchsPlayed)*100 as simpleMatchWonRatioByTeam,(doubleMatchsWon/doubleMatchsPlayed)*100  as doubleMatchWonRatioByTeam, ((simpleMatchsWon+doubleMatchsWon) / (simpleMatchsPlayed+doubleMatchsPlayed))*100 as overallRatio FROM
        (SELECT count(*) as simpleMatchsWon FROM SimpleMatches sm
        INNER JOIN Players p on p.playerId = sm.winner
        WHERE p.playerId in (SELECT p.playerId FROM Players p WHERE Teams_teamId = ?) AND springFall LIKE ? ) as simpleMatchsWon,(SELECT count(*) as simpleMatchsLost FROM SimpleMatches sm
        INNER JOIN Players p on p.playerId = sm.loser
        WHERE p.playerId in (SELECT p.playerId FROM Players p WHERE Teams_teamId = ?) AND springFall LIKE ?) as simpleMatchsLost,


        (SELECT count(*) simpleMatchsPlayed FROM SimpleMatches sm
        INNER JOIN Players p1 on p1.playerId = sm.winner
        INNER JOIN Players p2 on p2.playerId = sm.loser
        WHERE p1.playerId in (SELECT p.playerId FROM Players p WHERE Teams_teamId = ?)
        OR p2.playerId in (SELECT p.playerId FROM Players p WHERE Teams_teamId = ?) AND springFall LIKE ?) as simpleMatchsPlayed,

        (SELECT count(*) as doubleMatchsWon FROM DoubleMatches dm
        INNER JOIN DoubleTeams dt on dm.winnerDouble
        INNER JOIN Players p on p.playerId = dt.Players_playerId
        WHERE p.playerId in (SELECT p.playerId FROM Players p WHERE Teams_teamId = ?) AND springFall LIKE ?) as doubleMatchsWon,

        (SELECT count(*) as doubleMatchsLost FROM DoubleMatches dm
        INNER JOIN DoubleTeams dt on dm.loserDouble
        INNER JOIN Players p on p.playerId = dt.Players_playerId
        WHERE p.playerId in (SELECT p.playerId FROM Players p WHERE Teams_teamId = ?) AND springFall LIKE ?) as doubleMatchsLost,

        (SELECT count(*) as doubleMatchsPlayed FROM DoubleMatches dm
        INNER JOIN DoubleTeams dt1 on dm.winnerDouble
        INNER JOIN DoubleTeams dt2 on dm.loserDouble
        INNER JOIN Players p1 on p1.playerId = dt1.Players_playerId
        INNER JOIN Players p2 on p2.playerId = dt2.Players_playerId
        WHERE p1.playerId in (SELECT p.playerId FROM Players p WHERE Teams_teamId = ?)
        or p2.playerId in (SELECT p.playerId FROM Players p WHERE Teams_teamId = ?) AND springFall LIKE ?) as doubleMatchsPlayed
        `, [teamId,springFall,teamId,springFall,teamId,teamId,springFall,teamId,springFall,teamId,springFall,teamId,teamId,springFall],(error, results, fields) => {
          if (error) {
            connection.release();
            return res.send(JSON.stringify({
              "status": 500,
              "error": error,
              "response": null
            }));
          }

          console.log(query.sql);

          res.send(JSON.stringify({
            "status": 200,
            "error": null,
            "response": results
          }));
          connection.release(); // CLOSE THE CONNECTION

        });
      });
    },

    getSpringWinRatioByTeam(req, res, next) {

      const homeAway = req.params.homeAway;
      const teamId = Number(req.params.teamId);

      db.pool.getConnection((error, connection) => {
        if (error) {
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        var query = connection.query(`SELECT *, (springsHomeWonByTeam / springsPlayedByTeam)*100 springHomeWinRatio,
        (springsAwayWonByTeam / springsPlayedByTeam)*100 as springAwayWinRatio,
        (springsWonByTeam/springsPlayedByTeam)*100 as springOverallWinRatio

        FROM


        (SELECT count(*) as springsHomeWonByTeam FROM SpringResult sr
        WHERE winnerId LIKE ? AND homeAway LIKE ?) as springsHomeWonByTeam,

        (SELECT count(*) as springsAwayWonByTeam FROM SpringResult sr
        WHERE winnerId = ? AND homeAway = ?) as springsAwayWonByTeam,

        (SELECT count(*) as springsWonByTeam FROM SpringResult sr
        WHERE winnerId = ?) as springsWonByTeam,

        (SELECT count(*) as springsPlayedByTeam FROM SpringResult sr
        WHERE winnerId = ? or loserId = ?) as springsPlayedByTeam`
        ,[teamId,homeAway,teamId,homeAway,teamId,teamId,teamId],(error, results, fields) => {
          if (error) {
            connection.release();
            return res.send(JSON.stringify({
              "status": 500,
              "error": error,
              "response": null
            }));
          }

          console.log(query.sql);

          res.send(JSON.stringify({
            "status": 200,
            "error": null,
            "response": results
          }));
          connection.release(); // CLOSE THE CONNECTION

        });
      });
    },


    getTournamentsWinRatioByPlayer(req, res, next) {

      const springFall = req.params.springFall;
      const playerId = Number(req.params.playerId);

      db.pool.getConnection((error, connection) => {
        if (error) {
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        var query = connection.query(`SELECT *, (tournamentsSimpleWonByPlayer / tournamentSimplePlayedByPlayer)*100 as simpleWonRatio ,(tournamentsDoubleWonByPlayer/tournamentDoublePlayedByPlayer)*100 as doubleWonRatio, ( (tournamentsSimpleWonByPlayer+tournamentsDoubleWonByPlayer)/(tournamentSimplePlayedByPlayer+tournamentDoublePlayedByPlayer))*100 as overAllRatio FROM
        /*Nombre de tournois simple gagnés*/
        (SELECT count(*) as tournamentsSimpleWonByPlayer FROM SimpleMatches sm
        WHERE sm.round = 'Final' AND sm.Tournaments_tournamentId is not null AND  sm.winner = ? AND sm.springFall LIKE ?) as tournamentsSimpleWonByPlayer,

        /*Nombre de tournois doubles gagnés*/
        (SELECT count(*) as tournamentsDoubleWonByPlayer FROM DoubleMatches dm
        INNER JOIN DoubleTeams dt on dm.winnerDouble = dt.doubleTeamId
        WHERE dm.round = 'Final' AND dm.Tournaments_tournamentId is not null AND dt.Players_playerId = ? or dt.Players_playerId2 = ? AND dm.springFall LIKE ?) as tournamentsDoubleWonByPlayer,


        /*Nombre de tournois simples joués par le player*/
        (SELECT count(*) as tournamentSimplePlayedByPlayer FROM (SELECT Tournaments_tournamentId ,concat(group_concat(distinct sm.winner),',',group_concat(distinct sm.loser)) as tournamentPlayers
        FROM SimpleMatches sm
        where Tournaments_tournamentId is not null AND sm.springFall LIKE ?
        group by Tournaments_tournamentId) AS T
        where tournamentPlayers LIKE '?,%' or tournamentPlayers LIKE '%,?,%' or tournamentPlayers LIKE '%,?') as tournamentSimplePlayedByPlayer,


        /*Nombre de tournois doubles joués par le player*/
        (SELECT count(*) as tournamentDoublePlayedByPlayer FROM (SELECT Tournaments_tournamentId ,concat(group_concat(distinct dt1.Players_playerId),',',group_concat(distinct dt1.Players_playerId2),',',group_concat(distinct dt2.Players_playerId),',',group_concat(distinct dt2.Players_playerId2)) as tournamentPlayers
        FROM DoubleMatches dm
        INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.winnerDouble
        INNER JOIN DoubleTeams dt2 on dt2.doubleTeamId = dm.loserDouble
        where Tournaments_tournamentId is not null AND dm.springFall LIKE ?
        group by Tournaments_tournamentId) AS T
        where tournamentPlayers LIKE '?,%' or tournamentPlayers LIKE '%,?,%' or tournamentPlayers LIKE '%,?') as tournamentDoublePlayedByPlayer
        `
        ,[playerId,springFall,playerId,playerId,springFall,springFall,playerId,playerId,playerId,springFall,playerId,playerId,playerId],(error, results, fields) => {
          if (error) {
            connection.release();
            return res.send(JSON.stringify({
              "status": 500,
              "error": error,
              "response": null
            }));
          }

          console.log(query.sql);

          res.send(JSON.stringify({
            "status": 200,
            "error": null,
            "response": results
          }));
          connection.release(); // CLOSE THE CONNECTION

        });
      });
    },



    getTournamentsWinRatioByTeam(req, res, next) {


      const teamId = Number(req.params.teamId);

      db.pool.getConnection((error, connection) => {
        if (error) {
          return res.send(JSON.stringify({
            "status": 500,
            "error": error,
            "response": null
          }));
        }
        var query = connection.query(`
          SELECT *,(tournamentsSimpleWonByTeam / tournamentSimplePlayedByTeam )*100 as simpleWonRatio, (tournamentsDoubleWonByTeam / tournamentDoublePlayedByTeam)*100 as DoubleWonRatio, ( (tournamentsSimpleWonByTeam+tournamentsDoubleWonByTeam)/(tournamentSimplePlayedByTeam+tournamentDoublePlayedByTeam) )*100 as overAllRatio FROM
          /*Liste des tournois simples remportés par telle équipe */
          (SELECT count(*) as tournamentsSimpleWonByTeam FROM SimpleMatches sm
          INNER JOIN Players p1 on sm.winner = p1.playerId
          INNER JOIN Teams t on t.teamId = p1.Teams_teamId
          WHERE sm.round = 'Final' AND t.teamId = ? AND Tournaments_tournamentId is not null) as tournamentsSimpleWonByTeam,

          /*Liste des tournois doubles remportés par telle équipe */
          (SELECT count(*) as tournamentsDoubleWonByTeam FROM DoubleMatches dm
          INNER JOIN DoubleTeams dt on dm.winnerDouble = dt.doubleTeamId
          INNER JOIN Players p1 on dt.Players_playerId = p1.playerId
          INNER JOIN Teams t on t.teamId = p1.Teams_teamId
          WHERE dm.round = 'Final' AND t.teamId = ? AND Tournaments_tournamentId is not null) as tournamentsDoubleWonByTeam,

          /*Par tournois simple le nombre de de tounrois auquels l'équipe a participé*/
          (SELECT count(*) as tournamentSimplePlayedByTeam FROM (SELECT count(*) as simpleTournamentTeams, concat( group_concat(distinct p1.Teams_teamId),',',group_concat(distinct p2.Teams_teamId)) as tournamentTeams  FROM SimpleMatches sm
          INNER JOIN Players p1 on p1.playerId = sm.winner
          INNER JOIN Players p2 on p2.playerId = sm.loser
          where Tournaments_tournamentId is not null
          group by Tournaments_tournamentId) as t
          where tournamentTeams  Like '?,%' or tournamentTeams LIKE '%,?,%' or tournamentTeams LIKE '%,?') as tournamentSimplePlayedByTeam,

          /*Par tournois doubles le nombre de de tounrois auquels l'équipe a participé*/
          (SELECT count(*) as tournamentDoublePlayedByTeam  FROM (SELECT count(*) as doubleTournamentTeams, concat( group_concat(distinct p1.Teams_teamId),',',group_concat(distinct p2.Teams_teamId)) as tournamentTeams FROM DoubleMatches dm
          INNER JOIN DoubleTeams dt1 on dt1.doubleTeamId = dm.winnerDouble
          INNER JOIN DoubleTeams dt2 on dt2.doubleTeamId = dm.loserDouble
          INNER JOIN Players p1 on p1.playerId = dt1.Players_playerId
          INNER JOIN Players p2 on p2.playerId = dt2.Players_playerId2
          where Tournaments_tournamentId is not null
          group by Tournaments_tournamentId) as t
          where tournamentTeams  Like '?,%' or tournamentTeams LIKE '%,?,%' or tournamentTeams LIKE '%,?') as tournamentDoublePlayedByTeam
          `
          ,[teamId,teamId,teamId,teamId,teamId,teamId,teamId,teamId],(error, results, fields) => {
            if (error) {
              connection.release();
              return res.send(JSON.stringify({
                "status": 500,
                "error": error,
                "response": null
              }));
            }

            console.log(query.sql);

            res.send(JSON.stringify({
              "status": 200,
              "error": null,
              "response": results
            }));
            connection.release(); // CLOSE THE CONNECTION

          });
        });
      },


    };
