const doubleRankingHistory = require('./archive_double_rankings.js');
const calculateRanking = require("./calculate_double_rankings.js");
const orderRanking = require("./order_double_rankings.js");
const db = require('./../../db');

const createNewDoubleRankings = async (req, res) => {
  let connection;
  try{
    console.log("Initiating double ranking archiving process");
    //Ouverture de la transaction
    connection = await db.getConnectionForTransaction(db.pool);
    console.log("Initiating double ranking archiving process");
    const archiveCurrentDoubleRankingsPromise =
    await doubleRankingHistory.archiveCurrentDoubleRankings(connection);
    console.log(archiveCurrentDoubleRankingsPromise);
  } catch(err){
    try{
      //Fermeture de la transaction avec rollback
      let closeConnection = await db.rollbackConnectionTransaction(connection);
      return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Double Ranking Failed"}));
    } catch(err){
      return res.send(JSON.stringify({"error":"Rollback failed"}));
    }
  }

  try{
    console.log("Initiating calculation of new Double Ranking Points");
    const calculateDoubleRankingPromise = await calculateRanking.calculateDoubleRanking(connection);
    console.log(calculateDoubleRankingPromise);
  } catch(err){
    try{
      //Fermeture de la transaction avec rollback
      let closeConnection = await db.rollbackConnectionTransaction(connection);
      return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Double Ranking Failed"}));
    } catch(err){
      return res.send(JSON.stringify({"error":"Rollback failed"}));
    }
  }

  try{
    console.log("Initiating ordering of new Double Ranking");
    const orderDoubleRankingPromise = await orderRanking.orderDoubleRanking(connection);
    console.log(orderDoubleRankingPromise);
  } catch(err){
    try{
      //Fermeture de la transaction avec rollback
      let closeConnection = await db.rollbackConnectionTransaction(connection);
      return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Double Ranking Failed"}));
    } catch(err){
      return res.send(JSON.stringify({"error":"Rollback failed"}));
    }
  }

  try{
    db.closeConnectionTransaction(connection);
  } catch(err){
    try{
      //Fermeture de la transaction avec rollback
      let closeConnection = await db.rollbackConnectionTransaction(connection);
      return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Double Ranking Failed"}));
    } catch(err){
      return res.send(JSON.stringify({"error":"Rollback failed"}));
    }
  }
  console.log("New Double Ranking Created");
  res.send(JSON.stringify({"status": 200, "error": null, "response": "New Double Ranking Done"}));
}

module.exports = {
  createNewDoubleRankings
}
