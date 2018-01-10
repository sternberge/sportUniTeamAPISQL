const jwt = require('jsonwebtoken');
var promise = require('promise');

module.exports.authenticate = function (informations) {
  return new Promise(function (resolve, reject) {
  var user = {
    userId: informations.userId,
    gender: informations.gender,
    email: informations.email,
    firstName: informations.firstName,
    lastName: informations.lastName,
    birthday: informations.birthday,
    userType: informations.userType
  }
  var token = jwt.sign(user, process.env.SECRET_TOKENKEY, {
    expiresIn: 4000
  })
  resolve(token);
});
}

// Validation Middleware
module.exports.ensureLoggedIn = (req, res, next) => {
  var token = req.body.token || req.headers['token'];
  if(token){
    jwt.verify(token, process.env.SECRET_TOKENKEY, (err, decode)=>{
      if(err){
        res.status(403).send("Invalid Token");
      }
      else{
        next();
      }
    });
  }
  else {
    res.status(403).send("Invalid Token");
  }
}
