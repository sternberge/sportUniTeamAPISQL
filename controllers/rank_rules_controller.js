var db = require('./../db');


module.exports = {
  getLastRankingPerType(connection,type){
    return new Promise((resolve,reject) => {

      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('Select opponentRank from RankPointsRules where type = ? order by opponentRank desc Limit 1', type, (error, results, fields) => {
        if (error){
          return reject(error);
        }
        else if (results.length > 0){
          resolve(results[0].opponentRank);
        }
        else{
          reject();
        }
      });
    });
  },

  // Same function mais avec ouverture du pool de co
  getLastRankingPerType2(type){
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


};
