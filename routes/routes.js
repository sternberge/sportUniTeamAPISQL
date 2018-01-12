const CollegeController = require('../controllers/college_controller');
const TeamsController = require('../controllers/teams_controller');
const CoachController = require('../controllers/coach_controller');
const PlayerController = require('../controllers/player_controller');
const UserController = require('../controllers/user_controller');

const BudgetController = require('../controllers/budget_controller');
const RankDatesController = require('../controllers/rank_dates_controller');
const RankRulesController = require('../controllers/rank_rules_controller');
const RankRulesPointsController = require('../controllers/rank_rules_points_controller');
const RankingController = require('../controllers/ranking_controller');
const SimpleMatchesController = require('../controllers/simple_matches_controller');
const DoubleMatchesController = require('../controllers/double_matches_controller');
const TournamentsController = require('../controllers/tournaments_controller');
const LeaguesController = require('../controllers/leagues_controller');
const SpringMatchesController = require('../controllers/spring_matches_controller');

const DropDownListController = require ('../controllers/drop_down_list_controller');

const AuthenticateController = require ('../controllers/authenticate_controller');

//Very important : keep the order of the drop down list because the server will
//interpret the order, if you put the generateDropDownList at the end
//the server will first execute getCollege and will be stuck avoiding
//the drop down method to be called

module.exports = (app) => {

  app.post('/api/users/authentication', UserController.authentication);

  // From now on all routes require authentication
  //app.all('/*', AuthenticateController.ensureLoggedIn);

  //College
  //Generate drop down lists for colleges
  app.get('/api/colleges/generateCollegeDropDownList', CollegeController.generateCollegeDropDownList);
  app.post('/api/colleges', CollegeController.createCollege);
  app.put('/api/colleges/:college_id', CollegeController.editCollege);
  app.delete('/api/colleges/:college_id', CollegeController.deleteCollege);
  app.get('/api/colleges/:college_id', CollegeController.findCollegeById);


  //Coaches
  app.post('/api/coaches', CoachController.createCoach);
  app.put('/api/coaches/:coach_id', CoachController.editCoach);
  app.delete('/api/coaches/:coach_id', CoachController.deleteCoach);
  app.get('/api/coaches/:coach_id', CoachController.findCoachById);

  //Players
  app.post('/api/players', PlayerController.createPlayer);
  app.put('/api/players/:player_id', PlayerController.editPlayer);
  app.delete('/api/players/:player_id', PlayerController.deletePlayer);
  app.get('/api/players/:player_id', PlayerController.findPlayerById);
  //Generate drop down lists for players
  app.get('/api/players/generateOtherPlayerDropDownList/:coach_id', PlayerController.generateOtherPlayerDropDownList);
  app.get('/api/players/generateMyPlayerDropDownList/:coach_id', PlayerController.generateMyPlayerDropDownList);



  //Users
  app.post('/api/users', UserController.createUser);
  app.delete('/api/users/:user_id', UserController.deleteUser);
  app.get('/api/users/:user_id', UserController.findUserById);
  app.put('/api/users/:user_id', UserController.editUser);

  //Budget
  /*
  app.post('/api/budget', BudgetController.create);
  app.delete('/api/budget/:budget_id', BudgetController.delete);
  app.get('/api/budget/:budget_id', BudgetController.find);
  app.put('/api/budget/:budget_id', BudgetController.edit);*/

  //RankDates
  /*
  app.post('/api/rankDates', RankDatesController.create);
  app.delete('/api/rankDates/:rankDates_id', RankDatesController.delete);
  app.get('/api/rankDates/:rankDates_id', RankDatesController.find);
  app.put('/api/rankDates/:rankDates_id', RankDatesController.edit);

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

  //Ranking
  //Get the ranking
  app.get('/api/ranking/getRanking', RankingController.getRanking);
  app.post('/api/ranking', RankingController.create);
  app.delete('/api/ranking/:ranking_id',RankingController.delete);
  app.get('/api/ranking/:ranking_id', RankingController.find);
  app.put('/api/ranking/:ranking_id', RankingController.edit);

  //SimpleMatches
  app.get('/api/simpleMatches/getAllMatchsByYear/:year/:springFall/:gender', SimpleMatchesController.getAllMatchsByYear);
  app.get('/api/simpleMatches/getMatchsByPlayer/:playerId', SimpleMatchesController.getMatchsByPlayer);
  app.get('/api/simpleMatches/getMatchsByPlayerSpringFall/:playerId/:springFall', SimpleMatchesController.getMatchsByPlayerSpringFall);
  app.get('/api/simpleMatches/getMatchsByPlayerSpringFallYear/:playerId/:springFall/:year', SimpleMatchesController.getMatchsByPlayerSpringFallYear);
  app.get('/api/simpleMatches/getMatchsByCollegeSpringFallYearGender/:collegeId/:springFall/:year/:gender', SimpleMatchesController.getMatchsByCollegeSpringFallYearGender);
  app.get('/api/simpleMatches/getMatchsByTournamentSpringFallYearGender/:tournamentId/:springFall/:year/:gender', SimpleMatchesController.getMatchsByTournamentSpringFallYearGender);
  app.get('/api/simpleMatches/getMatchsByTournamentCollegeSpringFallYearGender/:tournamentId/:collegeId/:springFall/:year/:gender', SimpleMatchesController.getMatchsByTournamentCollegeSpringFallYearGender);
  app.get('/api/simpleMatches/getMatchsByPlayerTournamentSpringFallYearGender/:playerId/:tournamentId/:springFall/:year/:gender', SimpleMatchesController.getMatchsByPlayerTournamentSpringFallYearGender);
  app.get('/api/simpleMatches/getMatchsByConferenceSpringFallYear/:conferenceId/:springFall/:year/:gender', SimpleMatchesController.getMatchsByConferenceSpringFallYear);

  app.get('/api/simpleMatches/getMatchsByCurrentYear',SimpleMatchesController.getMatchsByCurrentYear);

  app.post('/api/simpleMatches', SimpleMatchesController.create);
  app.delete('/api/simpleMatches/:simpleMatch_id',SimpleMatchesController.delete);
  app.get('/api/simpleMatches/:simpleMatch_id', SimpleMatchesController.find);
  app.put('/api/simpleMatches/:simpleMatch_id', SimpleMatchesController.edit);

  //DoublesMatches
  app.post('/api/doubleMatches', DoubleMatchesController.createDoubleMatch);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGender/:year/:springFall/:gender',DoubleMatchesController.getMatchsByYearSpringFallGender);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGenderConference/:year/:springFall/:gender/:conferenceId',DoubleMatchesController.getMatchsByYearSpringFallGenderConference);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGenderCollege/:year/:springFall/:gender/:collegeId',DoubleMatchesController.getMatchsByYearSpringFallGenderCollege);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGenderTournament/:year/:springFall/:gender/:tournamentId',DoubleMatchesController.getMatchsByYearSpringFallGenderTournament);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallPlayer1/:year/:springFall/:playerId',DoubleMatchesController.getMatchsByYearSpringFallPlayer1);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallPlayer1Player2/:year/:springFall/:playerId1/:playerId2',DoubleMatchesController.getMatchsByYearSpringFallPlayer1Player2);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGenderTournamentPlayer1/:year/:springFall/:tournamentId/:playerId1',DoubleMatchesController.getMatchsByYearSpringFallGenderTournamentPlayer1);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGenderTournamentPlayer1Player2/:year/:springFall/:tournamentId/:playerId1/:playerId2',DoubleMatchesController.getMatchsByYearSpringFallGenderTournamentPlayer1Player2);
  app.get('/api/doubleMatches/getMatchsByYearSpringFallGenderTournamentCollege/:year/:springFall/:gender/:tournamentId/:collegeId',DoubleMatchesController.getMatchsByYearSpringFallGenderTournamentCollege);
  //Teams
  app.post('/api/teams', TeamsController.create);
  app.delete('/api/teams/:team_id',TeamsController.delete);
  app.get('/api/teams/:team_id', TeamsController.find);
  app.put('/api/teams/:team_id', TeamsController.edit);



  //Tournaments
  app.get('/api/tournaments/generateTournamentDropDownList', TournamentsController.generateTournamentDropDownList);
  app.post('/api/', TournamentsController.create);
  app.delete('/api/tournaments/:tournament_id',TournamentsController.delete);
  app.get('/api/tournaments/:tournament_id', TournamentsController.find);
  app.put('/api/tournaments/:tournament_id', TournamentsController.edit);
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
  app.get('/api/dropDownList/getAllPlayers/:gender',DropDownListController.getAllPlayers)


  //SpringMatches
    app.get('/api/springMatches/getSpringMatchsByYearGender/:year/:gender',SpringMatchesController.getSpringMatchsByYearGender);
    app.get('/api/springMatches/getSingleSpringMatchsBySpringId/:springId',SpringMatchesController.getSingleSpringMatchsBySpringId);
    app.get('/api/springMatches/getDoubleSpringMatchsBySpringId/:springId',SpringMatchesController.getDoubleSpringMatchsBySpringId);
};
