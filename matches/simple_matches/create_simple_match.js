const db = require('./../../db');


const createSimpleMatchPromise = (req) => {

  return new Promise((resolve,reject) => {

  const winner = req.body.winner;
  const loser = req.body.loser;
  const score = req.body.score;
  const date = req.body.date;
  const time = req.body.time;
  const springFall = req.body.springFall;
  const springPosition = req.body.springPosition;
  const round = req.body.round;
  const locationCity = req.body.locationCity;
  const locationState = req.body.locationState;
  const Tournaments_tournamentId = req.body.Tournaments_tournamentId;
  const homeAway = req.body.homeAway;
  const springMatchType =req.body.springMatchType;
  const springId = req.body.springId;


  db.pool.getConnection((error, connection) => {
    if (error){
      return reject(error);
    }

    var query = connection.query('INSERT INTO SimpleMatches (winner,loser,score,date,time,springFall,springPosition,round,locationCity,locationState,Tournaments_tournamentId,homeAway,springMatchType,springId) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [winner,loser,score,date,time,springFall,springPosition,round,locationCity,locationState,Tournaments_tournamentId,homeAway,springMatchType,springId], (error, results, fields) => {
      if (error){
        connection.release();
        return reject(error);
      }
      resolve("Match has been created");
      connection.release(); // CLOSE THE CONNECTION
    });
  });
});
}


const checkSimpleMatchUnicity = (winnerId,loserId,date) => {
  return new Promise((resolve,reject) => {
    db.pool.getConnection((error, connection) => {
      if (error){
        return reject(error);
      }
      var query = connection.query('Select 1 from SimpleMatches Where winner = ? And loser = ? And date = ?',
      [winnerId,loserId,date], (error, results, fields) => {
        if (error){
          connection.release();
          return reject(error);
        }
        else if (results.length > 0){
          reject("Match already exist");
          connection.release(); // CLOSE THE CONNECTION
        }
        else{
          resolve(results);
          connection.release(); // CLOSE THE CONNECTION
        }
      });
    });
  });
}

const createSimpleMatch = async (req, res, next) => {
  const winnerId = req.body.winner;
  const loserId = req.body.loser;
  const date = req.body.date;
  try{
    const checkMatch = await checkSimpleMatchUnicity(winnerId,loserId,date);
    console.log(checkMatch);
    await createSimpleMatchPromise(req);
    res.send("SimpleMatch has been created");
  }
  catch(err){
    res.send(err);
  }
}


module.exports = {
  createSimpleMatch
}
