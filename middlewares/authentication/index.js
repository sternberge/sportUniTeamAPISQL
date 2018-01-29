const authentication = require('./authenticate_controller.js');

module.exports = {
  ensureLoggedIn: authentication.ensureLoggedIn,
  authentication: authentication.authentication
};
