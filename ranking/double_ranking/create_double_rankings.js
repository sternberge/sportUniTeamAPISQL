const createNewDoubleRanking = async (req, res) => {
  try{
    console.log("Initiating double ranking archiving process");
    const archiveCurrentDoubleRankingsPromise =
    await DoubleRankingHistoryController.archiveCurrentDoubleRankings();
    console.log(archiveCurrentDoubleRankingsPromise);
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Double Ranking Failed"}));
  }

  try{
    console.log("Initiating calculation of new Double Ranking Points");
    const calculateDoubleRankingPromise = await calculateDoubleRanking();
    console.log(calculateDoubleRankingPromise);
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Double Ranking Failed"}));
  }

  try{
    console.log("Initiating ordering of new Double Ranking");
    const orderDoubleRankingPromise = await orderDoubleRanking();
    console.log(orderDoubleRankingPromise);
  } catch(err){
    console.log(err);
    return res.send(JSON.stringify({"status": 500, "error": err, "response": "New Double Ranking Failed"}));
  }

  console.log("New Double Ranking Created");

  res.send(JSON.stringify({"status": 200, "error": null, "response": "New Double Ranking Done"}));


}

module.exports = {
  createNewDoubleRanking
}
