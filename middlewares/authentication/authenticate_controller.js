const jwt = require('jsonwebtoken');
var jwtDecode = require('jwt-decode');
var db = require('./../../db');
var bcrypt = require('bcrypt'); // algo de hash

const authenticateWithToken = (informations) => {
  return new Promise(function (resolve, reject) {
    // Set different informations in the token
      let user = {
        userId: informations[0].userId,
        gender : informations[0].gender,
        email : informations[0].email,
        firstName : informations[0].firstName,
        lastName : informations[0].lastName,
        birthday : informations[0].birthday,
        userType : informations[0].userType
      }

    if(informations[0].playerId != null){
      user.playerId = informations[0].playerId,
      user.Teams_teamId = informations[0].playerTeamId  ;
      user.status = informations[0].status;
      user.collegeId = informations[0].playerCollegeId;
    }
    if(informations[0].coachId != null){
      user.coachId = informations[0].coachId;
      user.coachType = informations[0].coachType;
      user.collegeId = informations[0].coachCollegeId;
      if(informations[0].coachTeamId != null && informations.length == 1){
        user.teamId =informations[0].coachTeamId;
        user.coachTeamNumber = informations.length;
      }
      else if (informations[0].coachTeamId == null){
        user.coachTeamNumber = 0;
      }
      else if(informations.length == 2){
        if(informations[1].teamGender == 'M'){
          user.coachTeamNumber = 2;
          user.teamIdM =informations[1].coachTeamId;
          user.teamIdF =informations[0].coachTeamId;
        }
        else{
          user.coachTeamNumber = 2;
          user.teamIdF = informations[1].coachTeamId;
          user.teamIdM =informations[0].coachTeamId;
        }
      }
    }
    // Encoding the data contained in the user object
    var token = jwt.sign(user, process.env.SECRET_TOKENKEY, {
      expiresIn: 4000
    })
    var decoded = jwtDecode(token);
    resolve(token);
  });
}

// Check token Middleware
const ensureLoggedIn = (req, res, next) => {
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

// Email check for loggin
const checkEmailExistence = (email) => {
  return new Promise((resolve,reject) => {

    db.pool.getConnection((error, connection) => {

      if (error){
        return reject(error);
      }
      var query = connection.query(`SELECT userId, firstName, lastName, t.teamId as coachTeamId, t3.teamId as playerTeamId,t.gender as teamGender,
        u.gender, email, password, birthday, userType, phone, p.playerId,
        p.status, c.coachId, c.coachType, t.Colleges_collegeId as coachCollegeId, t2.Colleges_collegeId as headCoachCollegeId, t3.Colleges_collegeId as playerCollegeId
        FROM Users u
        LEFT JOIN Players p on u.userId = p.Users_userId
        LEFT JOIN Coaches c on u.userId = c.Users_userId
        LEFT JOIN Teams t on t.Coaches_coachId = c.coachId
        LEFT JOIN Teams t2 on t2.Coaches_headCoachId = c.coachId
        LEFT JOIN Teams t3 on t3.teamId = p.Teams_teamId
        WHERE email = ?`, email, (error, results, fields) => {
        if (error){
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        if(results.length > 0){
          resolve(JSON.stringify(results));
        }
        else{
          reject("Email doesn't exists");
        }
      });
    });
  });
}

  // Compare entered password and hashed password
  const checkPassword = (hashedPassword, password) => {
    return new Promise((resolve,reject) => {
      bcrypt.compare(password, hashedPassword, function(err, res) {
        if(err){
          return reject(err);
        }
        if(res){
          resolve();
        }
        else {
          reject("Password incorrect");
        }
      });
    });
  }

const authentication = async (req, res, next) => {
  try{
    const email = req.body.email;
    const password = req.body.password;
    let userInformations = await checkEmailExistence(email);
    userInformations = JSON.parse(userInformations);
    hashedPassword = userInformations[0].password;
    await checkPassword(hashedPassword,password);
    const token = await authenticateWithToken(userInformations);
    res.send(JSON.stringify({"status": 200, "error": null, "response": token}));
  }
  catch(error){
    res.send(error);
  }
}

module.exports = {
  ensureLoggedIn,
  authentication
}
