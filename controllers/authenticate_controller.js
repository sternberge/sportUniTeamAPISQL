const jwt = require('jsonwebtoken');
var promise = require('promise');

module.exports.authenticate = function (informations) {
  return new Promise(function (resolve, reject) {
  var user = {
    firstName : informations.firstName,
    lastName: informations.lastName
  }
  var token = jwt.sign(user, process.env.SECRET_TOKENKEY, {
    expiresIn: 4000
  })
  resolve(token);
});
}
