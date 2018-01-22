var db = require('./../db');


module.exports = {
getLastRankingPerType(type){
  return new Promise((resolve,reject) => {
  db.pool.getConnection((error, connection) => {
    if (error){
      return reject(error);
    }
    // L'ajout du '?' permet d'éviter les injections sql
    var query = connection.query('Select opponentRank from RankPointsRules where type = ? order by opponentRank desc Limit 1', type, (error, results, fields) => {
      if (error){
        connection.release();
        return reject(error);
      }
      else if (results.length > 0){
        resolve(results[0].opponentRank);
        connection.release(); // CLOSE THE CONNECTION
      }
      else{
        reject();
        connection.release(); // CLOSE THE CONNECTION
      }
    });
  });
  });
}

// getLastRankingPerType(type){
//
//   db.pool.getConnection((error, connection) => {
//     if (error){
//       console.log("Erreur de connection à la db");
//       throw new Error("Probleme de connection");
//     }
//     // L'ajout du '?' permet d'éviter les injections sql
//     var query = connection.query('Select opponentRank from RankPointsRules where type = ? order by opponentRank desc Limit 1', type, (error, results, fields) => {
//       if (error){
//         console.log("Erreur dans la requete");
//         connection.release();
//         throw new Error("Probleme de connection");
//       }
//       else if (results.length > 0){
//         console.log("Test2");
//         console.log(results);
//
//         connection.release(); // CLOSE THE CONNECTION
//         return results;
//       }
//       else{
//         console.log("Last test");
//         console.log(results);
//         connection.release(); // CLOSE THE CONNECTION
//         throw new Error("Probleme de connection");
//
//       }
//     });
//   });
//
// }

};
