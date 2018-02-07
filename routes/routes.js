const CollegeController = require('../controllers/college_controller');
const TeamsController = require('../controllers/teams_controller');
const CoachController = require('../controllers/coach_controller');
const PlayerController = require('../controllers/player_controller');
const UserController = require('../controllers/user_controller');
const upload = require('../file_upload/index');

const RankRulesController = require('../controllers/rank_rules_controller');
const RankRulesPointsController = require('../controllers/rank_rules_points_controller');
const SpringResultController = require('../controllers/spring_result_controller');
const SimpleMatchesController = require('../controllers/simple_matches_controller');
const DoubleMatchesController = require('../controllers/double_matches_controller');
const TournamentsController = require('../controllers/tournaments_controller');
const LeaguesController = require('../controllers/leagues_controller');
const SpringMatchesController = require('../controllers/spring_matches_controller');
const DropDownListController = require ('../controllers/drop_down_list_controller');

const calculateRanking = require('../ranking/singleranking/index.js');
const calculateDoubleRanking = require('../ranking/double_ranking/index.js');
const TeamRanking = require('../ranking/team_ranking/index.js');


const AuthenticateController = require ('../middlewares/authentication/index.js');

const SingleRankingController = require ('../controllers/single_ranking_controller');
const DoubleRankingController = require ('../controllers/double_ranking_controller');
const TeamRankingController = require ('../controllers/team_ranking_controller');

const SingleRankingHistoryController = require ('../controllers/single_ranking_history_controller');
const DoubleRankingHistoryController = require ('../controllers/double_ranking_history_controller');
const TeamRankingHistoryController = require ('../controllers/team_ranking_history_controller');

const RegionsController = require ('../controllers/regions_controller');
const StatsController = require('../controllers/stats_controller');

//Very important : keep the order of the drop down list because the server will
//interpret the order, if you put the generateDropDownList at the end
//the server will first execute getCollege and will be stuck avoiding
//the drop down method to be called

module.exports = (app) => {

  app.post('/api/users/authentication', AuthenticateController.authentication);

  // From now on all routes require authentication
  //app.all('/*', AuthenticateController.ensureLoggedIn);
  app.post('/api/users/upload', upload.download);
  //College
  //Generate drop down lists for colleges
  app.get('/api/colleges/generateCollegeDropDownList', CollegeController.generateCollegeDropDownList);
  app.post('/api/colleges', CollegeController.createCollege);
  app.put('/api/colleges/:college_id', CollegeController.editCollege);
  app.delete('/api/colleges/:college_id', CollegeController.deleteCollege);
  app.get('/api/colleges/:college_id', CollegeController.findCollegeById);
  app.get('/api/colleges/getCollegeNameFromTeamId/:teamId',CollegeController.getCollegeNameFromTeamId);
  app.get('/api/colleges/getCollegeNameFromCollegeId/:collegeId',CollegeController.getCollegeNameFromCollegeId);
  app.get('/api/colleges/getCollegeRankingByCollegeIdGender/:collegeId/:gender/:type',CollegeController.getCollegeRankingByCollegeIdGender);
  app.get('/api/colleges/getConferencesByCollegeId/:collegeId',CollegeController.getConferencesByCollegeId);


  //Coaches
  app.get('/api/coaches/getCoachTeamGender/:coachId',CoachController.getCoachTeamGender);
  app.get('/api/coaches/verifyCoach/:coachEmail',CoachController.verifyCoach);
  app.get('/api/coaches/getCoachInformationByCoachId/:coachId',CoachController.getCoachInformationByCoachId);
  app.post('/api/coaches', CoachController.createCoach);
  app.put('/api/coaches/:coach_id', CoachController.editCoach);
  app.delete('/api/coaches/:coach_id', CoachController.deleteCoach);
  app.get('/api/coaches/:coach_id', CoachController.findCoachById);
  app.post('/api/coaches/sendEmailForMatchReportToSystem', CoachController.sendEmailForMatchReportToSystem);

  //Players
  app.post('/api/players', PlayerController.createPlayer);
  app.put('/api/players/:player_id', PlayerController.editPlayer);
  app.delete('/api/players/:player_id', PlayerController.deletePlayer);
  app.get('/api/players/:player_id', PlayerController.findPlayerById);

  app.get('/api/players/getSingleRankingByPlayerId/:playerId/:type', PlayerController.getSingleRankingByPlayerId);
  app.get('/api/players/getDoubleRankingByPlayerId/:playerId/:type', PlayerController.getDoubleRankingByPlayerId);
  app.get('/api/players/getTeamRankingByPlayerId/:playerId/:type', PlayerController.getTeamRankingByPlayerId);


  //Generate drop down lists for players
  app.get('/api/players/generateOtherPlayerDropDownList/:coach_id/:gender', PlayerController.generateOtherPlayerDropDownList);
  app.get('/api/players/generateMyPlayerDropDownList/:coach_id/:gender', PlayerController.generateMyPlayerDropDownList);
  app.get('/api/players/getPlayerNameFromId/:playerId',PlayerController.getPlayerNameFromId)
  app.get('/api/players/getPlayerInformationByPlayerId/:playerId',PlayerController.getPlayerInformationByPlayerId);
  app.get('/api/players/getPlayersByTeamId/:teamId',PlayerController.getPlayersByTeamId);
  app.get('/api/players/getAllPlayersByTeamId/:teamId',PlayerController.getAllPlayersByTeamId);
  app.get('/api/players/verifyPlayer/:playerEmail',PlayerController.verifyPlayer);
  app.get('/api/players/getPlayerInformationByUserId/:userId',PlayerController.getPlayerInformationByUserId);

  //Users
  app.post('/api/users', UserController.createUser);
  app.put('/api/users/modifyPassword/:userId',UserController.modifyPassword);
  app.put('/api/users/addPhoneBirthdateToUserId/:userId',UserController.addPhoneBirthdateToUserId)
  app.delete('/api/users/:user_id', UserController.deleteUser);
  app.get('/api/users/:user_id', UserController.findUserById);
  app.put('/api/users/:user_id', UserController.editUser);
  app.get('/api/users/getUserInformationByUserId/:userId', UserController.getUserInformationByUserId);

  //Budget
  /*
  app.post('/api/budget', BudgetController.create);
  app.delete('/api/budget/:budget_id', BudgetController.delete);
  app.get('/api/budget/:budget_id', BudgetController.find);
  app.put('/api/budget/:budget_id', BudgetController.edit);*/

  /*
  //RankRules
  app.post('/api/rankRules', RankRulesController.create);
  app.delete('/api/rankRules/:rankRules_id', RankRulesController.delete);
  app.get('/api/rankRules/:rankRules_id', RankRulesController.find);
  app.put('/api/rankRules/:rankRules_id', RankRulesController.edit);

  //RankRulesPoints
  app.post('/api/rankRulesPoints', RankRulesPointsController.create);
  app.delete('/api/rankRulesPoints/:rankRulesPoints_id', RankRulesPointsController.delete);
  app.get('/api/rankRulesPoints/:rankRulesPoints_id', RankRulesPointsController.find);
  app.put('/api/rankRulesPoints/:rankRulesPoints_id', RankRulesPointsController.edit);*/



  //Rankings

  //SingleRanking
  app.post('/api/singleRanking/getRanking', calculateRanking.createRanking);
  app.post('/api/singleRanking', SingleRankingController.create);
  app.delete('/api/singleRanking/:singleRankingId', SingleRankingController.delete);
  app.get('/api/singleRanking/:singleRankingId', SingleRankingController.find);
  app.put('/api/singleRanking/:singleRankingId', SingleRankingController.edit);
  app.get('/api/singleRanking/getSingleRankingsNationalByDivisionGender/:leagueId/:gender', SingleRankingController.getSingleRankingsNationalByDivisionGender);
  app.get('/api/singleRanking/getSingleRankingsByRegionDivisionGender/:leagueId/:gender/:regionId', SingleRankingController.getSingleRankingsByRegionDivisionGender);
  app.get('/api/singleRanking/getSingleRankingsByConferenceDivisionGender/:leagueId/:gender/:conferenceId', SingleRankingController.getSingleRankingsByConferenceDivisionGender);

  //DoubleRanking
  app.get('/api/doubleRanking/createNewDoubleRanking', calculateDoubleRanking.createNewDoubleRankings);
  app.post('/api/doubleRanking', DoubleRankingController.create);
  app.delete('/api/doubleRanking/:doubleRankingId', DoubleRankingController.delete);
  app.get('/api/doubleRanking/:doubleRankingId', DoubleRankingController.find);
  app.put('/api/doubleRanking/:doubleRankingId', DoubleRankingController.edit);
  app.get('/api/doubleRanking/getDoubleRankingsNationalByDivisionGender/:leagueId/:gender', DoubleRankingController.getDoubleRankingsNationalByDivisionGender);
  app.get('/api/doubleRanking/getDoubleRankingsByRegionDivisionGender/:leagueId/:gender/:regionId', DoubleRankingController.getDoubleRankingsByRegionDivisionGender);
  app.get('/api/doubleRanking/getDoubleRankingsByConferenceDivisionGender/:leagueId/:gender/:conferenceId', DoubleRankingController.getDoubleRankingsByConferenceDivisionGender);

  //TeamRanking
  app.get('/api/teamRanking/createNewTeamRankings', TeamRanking.createNewTeamRankings);
  app.post('/api/teamRanking', TeamRankingController.create);
  app.delete('/api/teamRanking/:teamRankingId', TeamRankingController.delete);
  app.get('/api/teamRanking/:teamRankingId', TeamRankingController.find);
  app.put('/api/teamRanking/:teamRankingId', TeamRankingController.edit);
  app.get('/api/teamRanking/getTeamRankingsNationalByDivisionGender/:leagueId/:gender', TeamRankingController.getTeamRankingsNationalByDivisionGender);
  app.get('/api/teamRanking/getTeamRankingsByRegionDivisionGender/:leagueId/:gender/:regionId', TeamRankingController.getTeamRankingsByRegionDivisionGender);
  app.get('/api/teamRanking/getTeamRankingsByConferenceDivisionGender/:leagueId/:gender/:conferenceId', TeamRankingController.getTeamRankingsByConferenceDivisionGender);

  //Ranking Histories

  //SingleRankingHistory
  app.post('/api/singleRankingHistory', SingleRankingHistoryController.create);
  app.delete('/api/singleRankingHistory/:singleRankingHistoryId', SingleRankingHistoryController.delete);
  app.get('/api/singleRankingHistory/:singleRankingHistoryId', SingleRankingHistoryController.find);
  app.put('/api/singleRankingHistory/:singleRankingHistoryId', SingleRankingHistoryController.edit);

  //DoubleRankingHistory
  app.post('/api/doubleRankingHistory', DoubleRankingHistoryController.create);
  app.delete('/api/doubleRankingHistory/:doubleRankingHistoryId', DoubleRankingHistoryController.delete);
  app.get('/api/doubleRankingHistory/:doubleRankingHistoryId', DoubleRankingHistoryController.find);
  app.put('/api/doubleRankingHistory/:doubleRankingHistoryId', DoubleRankingHistoryController.edit);

  //TeamRankingHistory
  app.post('/api/teamRankingHistory', TeamRankingHistoryController.create);
  app.delete('/api/teamRankingHistory/:teamRankingHistoryId', TeamRankingHistoryController.delete);
  app.get('/api/teamRankingHistory/:teamRankingHistoryId', TeamRankingHistoryController.find);
  app.put('/api/teamRankingHistory/:teamRankingHistoryId', TeamRankingHistoryController.edit);


  //SimpleMatches
  app.get('/api/simpleMatches/getMatchesBySpringId/:springId', SimpleMatchesController.findSimpleMatchPerSpringId);
  app.get('/api/simpleMatches/getAllMatchsByYear/:year/:springFall/:gender', SimpleMatchesController.getAllMatchsByYear);
  app.get('/api/simpleMatches/getMatchsByPlayer/:playerId', SimpleMatchesController.getMatchsByPlayer);
  app.get('/api/simpleMatches/getMatchsByPlayerSpringFall/:playerId/:springFall', SimpleMatchesController.getMatchsByPlayerSpringFall);
  app.get('/api/simpleMatches/getMatchsByPlayerSpringFallYear/:playerId/:springFall/:year', SimpleMatchesController.getMatchsByPlayerSpringFallYear);
  app.get('/api/simpleMatches/getMatchsByCollegeSpringFallYearGender/:collegeId/:springFall/:year/:gender', SimpleMatchesController.getMatchsByCollegeSpringFallYearGender);
  app.get('/api/simpleMatches/getMatchsByTournamentSpringFallYearGender/:tournamentId/:springFall/:year/:gender', SimpleMatchesController.getMatchsByTournamentSpringFallYearGender);
  app.get('/api/simpleMatches/getMatchsByTournamentCollegeSpringFallYearGender/:tournamentId/:collegeId/:springFall/:year/:gender', SimpleMatchesController.getMatchsByTournamentCollegeSpringFallYearGender);
  app.get('/api/simpleMatches/getMatchsByPlayerTournamentSpringFallYearGender/:playerId/:tournamentId/:springFall/:year/:gender', SimpleMatchesController.getMatchsByPlayerTournamentSpringFallYearGender);
  app.get('/api/simpleMatches/getMatchsByConferenceSpringFallYear/:conferenceId/:springFall/:year/:gender', SimpleMatchesController.getMatchsByConferenceSpringFallYear);

  app.get('/api/simpleMatches/getMatchsByCurrentYear/:gender/:springFall',SimpleMatchesController.getMatchsByCurrentYear);

  app.post('/api/simpleMatches', SimpleMatchesController.create);
  app.delete('/api/simpleMatches/:simpleMatch_id',SimpleMatchesController.delete);
  app.get('/api/simpleMatches/:simpleMatch_id', SimpleMatchesController.find);
  app.put('/api/simpleMatches/:simpleMatch_id', SimpleMatchesController.edit);

  //DoublesMatches
  app.post('/api/doubleMatches', DoubleMatchesController.createDoubleMatch);
  app.get('/api/doubleMatches/getMatchesBySpringId/:springId', DoubleMatchesController.findDoubleMatchPerSpringId);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGender/:year/:springFall/:gender',DoubleMatchesController.getMatchsByYearSpringFallGender);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGenderConference/:year/:springFall/:gender/:conferenceId',DoubleMatchesController.getMatchsByYearSpringFallGenderConference);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGenderCollege/:year/:springFall/:gender/:collegeId',DoubleMatchesController.getMatchsByYearSpringFallGenderCollege);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGenderTournament/:year/:springFall/:gender/:tournamentId',DoubleMatchesController.getMatchsByYearSpringFallGenderTournament);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallPlayer1/:year/:springFall/:playerId',DoubleMatchesController.getMatchsByYearSpringFallPlayer1);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallPlayer1Player2/:year/:springFall/:playerId1/:playerId2',DoubleMatchesController.getMatchsByYearSpringFallPlayer1Player2);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGenderTournamentPlayer1/:year/:springFall/:tournamentId/:playerId1',DoubleMatchesController.getMatchsByYearSpringFallGenderTournamentPlayer1);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGenderTournamentPlayer1Player2/:year/:springFall/:tournamentId/:playerId1/:playerId2',DoubleMatchesController.getMatchsByYearSpringFallGenderTournamentPlayer1Player2);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGenderTournamentCollege/:year/:springFall/:gender/:tournamentId/:collegeId',DoubleMatchesController.getMatchsByYearSpringFallGenderTournamentCollege);
  app.get('/api/doubleMatches/getMatchSimpleOrDoubleByMatchId/:matchId/:matchType',DoubleMatchesController.getMatchSimpleOrDoubleByMatchId);

  //Teams
  app.get('/api/teams/getTeamIdByGenderCollege/:gender/:collegeId',TeamsController.getTeamIdByGenderCollege);
  app.post('/api/teams', TeamsController.createTeamWithDefaultRankings);
  app.delete('/api/teams/:team_id',TeamsController.delete);
  app.get('/api/teams/:team_id', TeamsController.find);
  app.put('/api/teams/:team_id', TeamsController.edit);



  //Tournaments
  app.get('/api/tournaments/generateTournamentDropDownList', TournamentsController.generateTournamentDropDownList);
  app.post('/api/create', TournamentsController.create);
  app.delete('/api/tournaments/:tournament_id',TournamentsController.delete);
  app.get('/api/tournaments/:tournament_id', TournamentsController.find);
  app.put('/api/tournaments/:tournament_id', TournamentsController.edit);
  app.get('/api/tournaments/generateTournamentDropDownListbyGender/:gender', TournamentsController.generateTournamentDropDownListbyGender);

  //Generate drop down lists for tournaments


  //Leagues
  app.post('/api/', LeaguesController.create);
  app.delete('/api/leagues/:league_id',LeaguesController.delete);
  app.get('/api/leagues/:league_id', LeaguesController.find);
  app.put('/api/leagues/:league_id', LeaguesController.edit);

  //DropDownList
  app.get('/api/dropDownList/collegesFromConference/:conferenceId', DropDownListController.collegesFromConference);
  app.get('/api/dropDownList/playersFromCollege/:collegeId/:gender', DropDownListController.playersFromCollege);
  app.get('/api/dropDownList/playersFromTournament/:tournamentId/:gender', DropDownListController.playersFromTournament);
  app.get('/api/dropDownList/playersFromConference/:conferenceId/:gender', DropDownListController.playersFromConference);
  app.get('/api/dropDownList/getConferences', DropDownListController.getConferences);
  app.get('/api/dropDownList/getOpponentCollege/:conferenceId/:coachId', DropDownListController.getOpponentCollege);
  app.get('/api/dropDownList/getAllPlayers/:gender',DropDownListController.getAllPlayers);
  app.get('/api/dropDownList/getAllRegions',DropDownListController.getAllRegions);
  app.get('/api/dropDownList/getPlayersFromConferenceCollegeTournamentGender/:conferenceId/:collegeId/:tournamentId/:gender',DropDownListController.getPlayersFromConferenceCollegeTournamentGender);

  //SpringMatches
  app.get('/api/springMatches/getSpringMatchsByYearGender/:year/:gender',SpringMatchesController.getSpringMatchsByYearGender);
  app.get('/api/springMatches/getSingleSpringMatchsBySpringId/:springId',SpringMatchesController.getSingleSpringMatchsBySpringId);
  app.get('/api/springMatches/getDoubleSpringMatchsBySpringId/:springId',SpringMatchesController.getDoubleSpringMatchsBySpringId);

  app.get('/api/springMatches/getSpringMatchesByDateGenderCollegeConference/:year/:gender/:collegeId/:conferenceId',SpringMatchesController.getSpringMatchesByDateGenderCollegeConference);
  app.get('/api/springMatches/getSpringMatchesByDateGenderCollegeConferencePlayer/:year/:gender/:collegeId/:conferenceId/:playerId',SpringMatchesController.getSpringMatchesByDateGenderCollegeConferencePlayer);


  app.get('/api/springMatches/test/:springId',SpringMatchesController.test);
  app.get('/api/springMatches/testFinal/:gender/:springId/:conferenceId/:year',SpringMatchesController.testFinal);

  //SpringResult
  app.post('/api/springResult/:gender',SpringResultController.create);
  app.post('/api/springResult2/:gender',SpringResultController.create2);
  app.get('/api/springResult/calculateWinnerLoser/:springId',SpringResultController.checkWinnerLoserSpring);

  //Regions
  app.get('/api/regions/getRegions', RegionsController.getRegions);


  //Stats
  app.get('/api/stats/getSimpleMatchsWonByPlayerId/:playerId',StatsController.getSimpleMatchsWonByPlayerId);
  app.get('/api/stats/getSimpleMatchsLostByPlayerId/:playerId',StatsController.getSimpleMatchsLostByPlayerId);
  app.get('/api/stats/getSimpleMatchsPlayedByPlayerId/:playerId',StatsController.getSimpleMatchsPlayedByPlayerId);
  app.get('/api/stats/getDoubleMatchsWonByPlayerId/:playerId',StatsController.getDoubleMatchsWonByPlayerId);
  app.get('/api/stats/getDoubleMatchsLostByPlayerId/:playerId',StatsController.getDoubleMatchsLostByPlayerId);
  app.get('/api/stats/getDoubleMatchsPlayedByPlayerId/:playerId',StatsController.getDoubleMatchsPlayedByPlayerId);
  app.get('/api/stats/getRatioStatsByPlayerId/:springFall/:playerId',StatsController.getRatioStatsByPlayerId);
  app.get('/api/stats/getWinRatioByTeam/:springFall/:teamId',StatsController.getWinRatioByTeam);
  app.get('/api/stats/getSpringWinRatioByTeam/:teamId',StatsController.getSpringWinRatioByTeam);
  app.get('/api/stats/getTournamentsWinRatioByPlayer/:springFall/:playerId',StatsController.getTournamentsWinRatioByPlayer);
  app.get('/api/stats/getTournamentsWinRatioByTeam/:teamId',StatsController.getTournamentsWinRatioByTeam);
  app.get('/api/stats/getSpringHomeAwayWinByPlayer/:homeAway/:playerId',StatsController.getSpringHomeAwayWinByPlayer);
  app.get('/api/stats/getTeamStatsVsRanked/:teamId', StatsController.getTeamStatsVsRanked);



  //app.post('/api/upload',UserController.upload);

};
