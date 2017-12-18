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
const TournamentsController = require('../controllers/tournaments_controller');

module.exports = (app) => {
  //College
  app.post('/api/colleges', CollegeController.createCollege);
  app.put('/api/colleges/:college_id', CollegeController.editCollege);
  app.delete('/api/colleges/:college_id', CollegeController.deleteCollege);
  app.get('/api/colleges/:college_id', CollegeController.findCollegeById);

  /*app.post('/api/teams', TeamController.createTeam);
  app.put('/api/teams/:team_id', TeamController.editTeam);
  app.delete('/api/teams/:team_id', TeamController.deleteTeam);
  app.get('/api/teams/:team_id', TeamController.findTeamById);*/

  //Coaches
  app.post('/api/coaches', CoachController.createCoach);
  app.put('/api/coaches/:coach_id', CoachController.editCoach);
  app.delete('/api/coaches/:coach_id', CoachController.deleteCoach);
  app.get('/api/coaches/:coach_id', CoachController.findCoachById);

  /*app.post('/api/players', PlayerController.createPlayer);
  app.put('/api/players/:player_id', PlayerController.editPlayer);
  app.delete('/api/players/:player_id', PlayerController.deletePlayer);
  app.get('/api/players/:player_id', PlayerController.findPlayerById);*/

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
  app.post('/api/ranking', RankingController.create);
  app.delete('/api/ranking/:ranking_id',RankingController.delete);
  app.get('/api/ranking/:ranking_id', RankingController.find);
  app.put('/api/ranking/:ranking_id', RankingController.edit);

  //SimpleMatches
  app.post('/api/simpleMatches', SimpleMatchesController.create);
  app.delete('/api/simpleMatches/:simpleMatch_id',SimpleMatchesController.delete);
  app.get('/api/simpleMatches/:simpleMatch_id', SimpleMatchesController.find);
  app.put('/api/simpleMatches/:simpleMatch_id', SimpleMatchesController.edit);

  //Teams
  app.post('/api/teams', TeamsController.create);
  app.delete('/api/teams/:team_id',TeamsController.delete);
  app.get('/api/teams/:team_id', TeamsController.find);
  app.put('/api/teams/:team_id', TeamsController.edit);

  //Tournaments
  app.post('/api//', TournamentsController.create);
  app.delete('/api/tournaments/:tournament_id',TournamentsController.delete);
  app.get('/api/tournaments/:tournament_id', TournamentsController.find);
  app.put('/api/tournaments/:tournament_id', TournamentsController.edit);

};
