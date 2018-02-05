const createNewTeamRankings = async (req, res) => {
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
    return res.status(500).send(JSON.stringify({
      "error": "New Team Rankings Failed"
    }));
  }

  try{
    console.log("Initiating team ranking archiving process");
    const archiveCurrentTeamRankingsPromise =
    await ArchiveTeamRankings.archiveCurrentTeamRankings(connection);
    console.log(archiveCurrentTeamRankingsPromise);
  } catch(err){
    console.log(err);
    try{
      connection.rollback();
      connection.release();
    } catch(err){
      console.log(err);
    }
    return res.status(500).send(JSON.stringify({
      "error": "New Team Rankings Failed"
    }));
  }

  try{
    console.log("Initiating calculation of new Team Ranking Points");
    const calculateTeamRankingPromise = await CalculateTeamRankings.calculateTeamRanking(connection);
    console.log(calculateTeamRankingPromise);
  } catch(err){
    console.log(err);
    try{
      connection.rollback();
      connection.release();
    } catch(err){
      console.log(err);
    }
    return res.status(500).send(JSON.stringify({
      "error": "New Team Rankings Failed"
    }));
  }

  try{
    console.log("Initiating ordering of new Team Ranking");
    const orderTeamRankingPromise = await OrderTeamRankings.orderTeamRanking(connection);
    console.log(orderTeamRankingPromise);
  } catch(err){
    console.log(err);
    try{
      connection.rollback();
      connection.release();
    } catch(err){
      console.log(err);
    }
    return res.status(500).send(JSON.stringify({
      "error": "New Team Rankings Failed"
    }));
  }

  try{
    db.closeConnectionTransaction(connection);
  } catch(err){
    console.log(err);
    return res.status(500).send(JSON.stringify({
      "error": "New Team Rankings Failed"
    }));
  }

  console.log("New Team Rankings Created");
  const currentDate2 = new Date();
  const time = currentDate2 - currentDate;
  console.log(time);

  res.send(JSON.stringify({"status": 200, "error": null, "response": "New Team Ranking Done"}));
}

module.exports = {
  createNewTeamRankings
}

const db = require('./../../db');
const CalculateTeamRankings = require("./calculate_team_rankings.js");
const OrderTeamRankings = require("./order_team_rankings.js");
const ArchiveTeamRankings = require("./archive_team_rankings.js");
