const db = require('./../../db');


const orderSingleRanking = async (req, res) => {
  const leagues = [1, 2, 3, 4, 5];

  try{
    const orderRankingPerLeaguePromises = leagues.map(leagueId =>
      orderRankingPerGender(leagueId)
    );
    await Promise.all(orderRankingPerLeaguePromises);
    console.log("New Double Ranking ordered for all leagues");
    res.send(JSON.stringify({"status": 200, "error": null, "response": "New Double Ranking ordered for all leagues"}));
  } catch(err){
    console.log("New Double Ranking ordering failed");
    console.log(err);
    res.send(JSON.stringify({"status": 500, "error": err, "response": "New Double Ranking ordering failed"}));
  }

}
