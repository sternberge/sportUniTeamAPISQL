const ranking = require("./create_rankings.js");
const orderRanking = require("./order_rankings.js");
const archiveRankings = require("./archive_single_ranking.js");

module.exports = {
  createRanking: ranking.calculateRanking,
  orderRanking: orderRanking.orderSingleRanking,
  archiveRankings: archiveRankings.archiveCurrentSingleRankings
};
