

const createNewSingleRanking = async (req, res) => {
  const currentDate = new Date();
  let connection;

  try{
    console.log("Acquiring connection from pool");
    connection = await db.getConnectionForTransaction(db.pool);
    console.log("Connection acquired from pool");
  } catch(err){
    console.log(err);
    try{
      connection.rollback();
      connection.release();
    } catch(err){
      console.log(err);
    }
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Single Ranking Failed"}));
  }

  try{
    console.log("Initiating Single ranking archiving process");
    const archiveCurrentSingleRankingsPromise =
    await archiveRankings.archiveCurrentSingleRankings(connection);
    console.log(archiveCurrentSingleRankingsPromise);
  } catch(err){
    console.log(err);
    try{
      connection.rollback();
      connection.release();
    } catch(err){
      console.log(err);
    }
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Single Ranking Failed"}));
  }

  try{
    console.log("Initiating calculation of new Single Ranking Points");
    const calculateSingleRankingPromise = await calculateRanking.calculateSingleRanking(connection);
    console.log(calculateSingleRankingPromise);
  } catch(err){
    console.log(err);
    try{
      connection.rollback();
      connection.release();
    } catch(err){
      console.log(err);
    }
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Single Ranking Failed"}));
  }

  try{
    console.log("Initiating ordering of new Single Ranking");
    const orderSingleRankingPromise = await orderRanking.orderSingleRanking(connection);
    console.log(orderSingleRankingPromise);
  } catch(err){
    console.log(err);
    try{
      connection.rollback();
      connection.release();
    } catch(err){
      console.log(err);
    }
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Single Ranking Failed"}));
  }

  try{
    db.closeConnectionTransaction(connection);
    connection.release();
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Single Ranking Failed"}));
  }

  console.log("New Single Ranking Created");
  const currentDate2 = new Date();
  const time = currentDate2 - currentDate;
  console.log(time);

  res.send(JSON.stringify({"status": 200, "error": null, "response": "New Single Ranking Done"}));


}

module.exports = {
  createNewSingleRanking
}

const db = require('./../../db');
const calculateRanking = require("./calculate_single_rankings.js");
const orderRanking = require("./order_single_rankings.js");
const archiveRankings = require("./archive_single_ranking.js");
