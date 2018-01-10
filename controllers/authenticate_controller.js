const jwt = require('jsonwebtoken');
var promise = require('promise');
var jwtDecode = require('jwt-decode');

module.exports.authenticate = function (informations) {
  return new Promise(function (resolve, reject) {
  var user = {
    userId: informations[0].userId,
    gender: informations[0].gender,
    email: informations[0].email,
    firstName: informations[0].firstName,
    lastName: informations[0].lastName,
    birthday: informations[0].birthday,
    userType: informations[0].userType
  }
  var token = jwt.sign(user, process.env.SECRET_TOKENKEY, {
    expiresIn: 4000
  })
  var decoded = jwtDecode(token);
  console.log(decoded);
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
