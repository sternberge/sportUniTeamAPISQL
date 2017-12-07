const CollegeController = require('../controllers/college_controller');
const TeamController = require('../controllers/team_controller');
const CoachController = require('../controllers/coach_controller');
const PlayerController = require('../controllers/player_controller');
const UserController = require('../controllers/user_controller');

module.exports = (app) => {
  /*app.post('/api/colleges', CollegeController.createCollege);
  app.put('/api/colleges/:college_id', CollegeController.editCollege);
  app.delete('/api/colleges/:college_id', CollegeController.deleteCollege);
  app.get('/api/colleges/:college_id', CollegeController.findCollegeById);

  app.post('/api/teams', TeamController.createTeam);
  app.put('/api/teams/:team_id', TeamController.editTeam);
  app.delete('/api/teams/:team_id', TeamController.deleteTeam);
  app.get('/api/teams/:team_id', TeamController.findTeamById);

  app.post('/api/coaches', CoachController.createCoach);
  app.put('/api/coaches/:coach_id', CoachController.editCoach);
  app.delete('/api/coaches/:coach_id', CoachController.deleteCoach);
  app.get('/api/coaches/:coach_id', CoachController.findCoachById);

  app.post('/api/players', PlayerController.createPlayer);
  app.put('/api/players/:player_id', PlayerController.editPlayer);
  app.delete('/api/players/:player_id', PlayerController.deletePlayer);
  app.get('/api/players/:player_id', PlayerController.findPlayerById);*/

  app.post('/api/users', UserController.createUser);
  app.delete('/api/users/:user_id', UserController.deleteUser);
  app.get('/api/users/:user_id', UserController.findUserById);
  app.put('/api/users/:user_id', UserController.editUser);
};
