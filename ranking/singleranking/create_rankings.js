const db = require('./../../db');

const calculateRankingPerPlayer = async (playerId,limiteRequest,rankingType,date,res) => {
  let winPoints = 0;
  let losePoints = 0;
  let nbWinMatches = 0;
  let nbLoseMatches = 0;
  let rankPoints = 0;
  let i = 0;
  let bestLoseMatchs = 0;
  try{
    // Recupere les matchs gagnés par le joueur ainsi que le nb de points gagnés selon les adversaires(nbmax de match = limiteRequest)
    const bestMatches = await getSingleBestMatches(playerId,limiteRequest,rankingType,date);
    nbWinMatches = bestMatches.length;
    console.log("Nombre de match gagnés : ",nbWinMatches, " pour le playerId : ",playerId);
    for(i=0; i<nbWinMatches; i++ ){
      // Calcul du nb de points total gagnés
      winPoints += bestMatches[i].winOverRankPoints;
    }
    console.log("Points gangés au cours de ce(s) matchs : ",winPoints);
    // Si le joueur a gagné moins de match que la limite demandée
    if(nbWinMatches < limiteRequest){
      nbLoseMatches = limiteRequest - nbWinMatches;
      console.log("Nombre de match perdus si le joeurs Id",playerId,"a joué plus de match que la limite : ",nbLoseMatches);
      //On recupere les "meilleurs" match perdu afin de completer
      bestLoseMatchs = await getSingleBestLossesMatches(playerId,rankingType,date,nbLoseMatches);
    }
    //Si le resultat n'est pas null, le joueur a perdu des matchs, on calcule les points perdus
    if(bestLoseMatchs != 0){
      let i =0;
      console.log("Le joueur id ",playerId," a perdu le nombre suivant de match : ",bestLoseMatchs.length);
      for(i=0; i<bestLoseMatchs.length; i++ ){
        console.log("Match perdu numero :", i+1);
        losePoints += bestLoseMatchs[i].lossToRankPoints;
      }
    }
    //On calcule ses ranking points à l'aide de la formule
    rankPoints = winPoints / (nbWinMatches + losePoints);
    rankPoints = 88;
    console.log("Nombre points totaux : ",rankPoints,"pour le joueur",playerId);
    //On recupere le ranking id du player
    let playerRankingId = await getSingleRankingPerPlayerId(playerId,rankingType);

    console.log("Player Ranking Id par type selectionné (N,R,...) : ",playerRankingId,"pour le joueur ",playerId);
    //on insert le nouveau ranking dans la table
    await editSingleRankingWithPromise(playerRankingId,rankPoints);
    console.log("Resultats du nouveau ranking : ",rankPoints," pour le playerId",playerId);
  }
  catch(error){
    //res.send(error);
  }
}

const getSingleBestMatches = (playerId,limiteRequest,rankingType,date) => {
  return new Promise(function (resolve, reject) {
    limiteRequest = Number(limiteRequest);
    db.pool.getConnection((error, connection) => {

      if (error){
        return reject(error);
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
  }

  const getSingleBestLossesMatches = (playerId,rankingType,date,nbMatch) => {
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
    }

    const getSingleRankingPerPlayerId = (playerId,rankingType) => {
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
      }

      const editSingleRankingWithPromise = (playerRankingId,rankPoints) => {
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
      }

      // Fonction de calculs de tous les ranking des players selon les trois types (R,N,C)
      const calculateRanking = async (req,res)=>{
        var rankingTypes = ["N", "R", "C"];
        try{
          const promisesPerTypeCalculation = rankingTypes.map(rankingType =>
            calculateRankingPerTypeAndPlayer(rankingType, res));
            await Promise.all(promisesPerTypeCalculation);
            console.log("New Double Ranking Points calculated for all types");
            res.send(JSON.stringify({"status": 200, "error": null, "response": null}));
            //var test = module.exports.orderNationalRankingByRankPoints()
            //var test = module.exports.orderRegionalRankingByRankPoints()
            //var test = module.exports.orderConferenceRankingByRankPoints()
          }
          catch(error){
            console.log(error);
            res.send(JSON.stringify({"status": 500, "error": null, "response": null}))
          }
        }

        const calculateRankingPerTypeAndPlayer = async (rankingType, res)=>{
          let playerId = 0;
          let i,j;
          try{
            let allPlayers = await getAllPlayerId();
            let testTab = [];
            for(i=0; i<3; i++){
              testTab.push(allPlayers[i]);
            }
            var limiteRequest = 5;
            var date = "2017-01-01";
            return Promise.all([testTab.map(player => { return calculateRankingPerPlayer(player.playerId,limiteRequest,rankingType,date,res)})]);
          }
          catch(error){
            res.send(JSON.stringify({"status": 500, "error": error, "response": null}))
            console.log(error);
          }
        }

        const getAllPlayerId = () => {
          return new Promise((resolve, reject) => {
            db.pool.getConnection((error, connection) => {

              if (error) {
                return reject(error);
              }
              var query = connection.query(`SELECT playerId from Players`, (error, results, fields) => {
                if (error) {
                  connection.release();
                  return reject(error);
                }
                resolve(results);
                connection.release(); // CLOSE THE CONNECTION
              });
            });
          });
        }


        module.exports = {
          calculateRanking
        }
