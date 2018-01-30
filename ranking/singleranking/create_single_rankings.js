

const createNewSingleRanking = async (req, res) => {
  try{
    console.log("Initiating Single ranking archiving process");
    const archiveCurrentSingleRankingsPromise =
    await archiveRankings.archiveCurrentSingleRankings();
    console.log(archiveCurrentSingleRankingsPromise);
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Single Ranking Failed"}));
  }

  try{
    console.log("Initiating calculation of new Single Ranking Points");
    const calculateSingleRankingPromise = await calculateRanking.calculateRanking();
    console.log(calculateSingleRankingPromise);
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Single Ranking Failed"}));
  }

  try{
    console.log("Initiating ordering of new Single Ranking");
    const orderSingleRankingPromise = await orderRanking.orderSingleRanking();
    console.log(orderSingleRankingPromise);
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Single Ranking Failed"}));
  }

  console.log("New Single Ranking Created");

  res.send(JSON.stringify({"status": 200, "error": null, "response": "New Single Ranking Done"}));


}

module.exports = {
  createNewSingleRanking
}

const calculateRanking = require("./calculate_single_rankings.js");
const orderRanking = require("./order_rankings.js");
const archiveRankings = require("./archive_single_ranking.js");
