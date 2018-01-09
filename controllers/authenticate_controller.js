const jwt = require('jsonwebtoken');

module.exports.authenticate = function (req, res, next) {
  var user = {
    firstName : 'firstName',
    lastName: 'lastName'
  }
  var token = jwt.sign(user, process.env.SECRET_TOKENKEY, {
    expiresIn: 4000
  })
  res.json({
    success: true,
    token: token
  })
}
