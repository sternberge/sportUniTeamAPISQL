var db = require('./../db');


module.exports = {
getLastRankingPerType(type){
  return new Promise((resolve,reject) => {
  db.pool.getConnection((error, connection) => {
    if (error){
      console.log("test");
      return reject(error);
    }
    // L'ajout du '?' permet d'éviter les injections sql
    var query = connection.query('Select opponentRank from RankPointsRules where type = ? order by opponentRank desc Limit 1', type, (error, results, fields) => {
      if (error){
        connection.release();
        return reject(error);
      }
      else if (results.length > 0){
        console.log("test");
        console.log(results);
        resolve(results);
        connection.release(); // CLOSE THE CONNECTION
      }
      else{
        console.log("test");
        reject();
        connection.release(); // CLOSE THE CONNECTION
      }
    });
  });
  });
}

};
