var db = require('./../db');
const UserController = require('../controllers/user_controller');
var expressValidator = require('express-validator');
var nodemailer = require('nodemailer');
var bcrypt = require('bcrypt');
const saltRounds = 10;

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'testservicenodemailer@gmail.com',
    pass: 'Super_PFE_2018'
  }
});

var mailOptions = {
  from: 'testservicenodemailer@gmail.com',
  to: 'testservicenodemailer@gmail.com',
  subject: 'Premier test d\'un email',
  text: 'ceci est les password :'
};

module.exports = {

  findCoachById (req, res) {
    const coachId = req.params.coach_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM Coaches WHERE CoachID = ?', coachId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        else if (results.length > 0){
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        }
        else{
          res.send(JSON.stringify({"status": 500, "error": "Id does not exist", "response": null}));
          connection.release(); // CLOSE THE CONNECTION
        }
      });
    });
  },

  async createCoach(req, res) {
    try{
      //Ouverture de la transaction
      var connection = await db.getConnectionForTransaction(db.pool);
      // Check si l'email n'est pas deja en BDD
      var emailOk = await UserController.checkEmailUnicity(connection,req.body.email);
      //Creation du profil utilisateur
      var userId =  await UserController.createUserWithPromise(connection,req);
      //Creation du coach
      await module.exports.createCoachProfile(connection,userId,req);
      // Fermeture de la transaction
      await db.closeConnectionTransaction(connection);
      res.send(JSON.stringify({"status": 200, "error": null, "response": "Coach has been created"}));
    }
    catch(error){
      return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
    }
  },


  createCoachProfile(connection,userId,req){
    return new Promise((resolve,reject)=>{
      var coachType = req.body.coachType;
      //requete d'insertion
      var query = connection.query('INSERT INTO Coaches (Users_userId,coachType) VALUES  (?,?)',
      [userId, coachType], (error, results, fields) => {
        //erreur d'insertion
        if (error){
          return reject(error);
        }
        resolve();
      });
    })
  },


  verifyCoach(req, res, next) {

    var coachEmail = req.params.coachEmail;
    var password = "";
    var hashGenerated = "";

    let coachExist = false;

    db.pool.getConnection((error, connection) => {
      //erreur de connection
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var queryTest = connection.query('select * from Users where email = ? ',coachEmail, (error, results, fields) => {

        //console.log('Lenght de result : '+results.length);
        if(results.length > 0 )
        {
          coachExist = true;
          console.log('Le mail existe');
        }
        else {
          res.send(JSON.stringify({"status": 500, "error": 'The user does not exist', "response": 'the user does not exist'}));
          console.log('Le mail n\'existe pas');
        }
      });

      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 8; i++)
      password += possible.charAt(Math.floor(Math.random() * possible.length));


      bcrypt.hash(password, saltRounds, function(err, hash) {
        console.log("Hash : " + hash);
        hashGenerated = hash;

        var query = connection.query('UPDATE Users SET password = ? WHERE email = ?',
        [hashGenerated,coachEmail], (error, results, fields) => {

          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }

          if(coachExist)
          {

            console.log('coach existe ' + coachExist);
            if(coachExist)
            {
              transporter.sendMail({
                from: 'testservicenodemailer@gmail.com',
                to: coachEmail,
                subject: 'SUT Team : Your password for the application',
                text: 'Please find your password for the application ' + password
              }, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email sent: ' + info.response + ' password = ' + password);
                }
              });
            }
            res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          }

          connection.release(); // CLOSE THE CONNECTION
        });

      });



    });

  },



  editCoach(req, res, next) {
    const coachId = req.params.coach_id;
    const coachProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE Coaches SET ? WHERE CoachID = ?',[coachProperties, coachId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  deleteCoach(req, res, next) {
    const coachId = req.params.coach_id;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM Coaches WHERE CoachID = ?', coachId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },


  getCoachTeamGender(req,res,next){

    const coachId = req.params.coachId;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT group_concat(gender) AS teamGender,length(group_concat(gender)) as length FROM Teams
      WHERE Coaches_coachId = ? OR Coaches_headCoachId = ?
      GROUP BY Colleges_collegeId
      `,[coachId,coachId],(error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        console.log(query.sql);
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },


  getCoachInformationByCoachId(req,res,next){
    const coachId = req.params.coachId;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT u.firstName,u.lastName,u.birthday,u.phone,co.name,conf.conferenceLabel,l.leagueName,t.gender as teamGender FROM Coaches c
        INNER JOIN Users u on c.Users_userId = u.userId
        INNER JOIN Teams t on t.Coaches_coachId = c.coachId or t.Coaches_headCoachId = c.coachId
        INNER JOIN Colleges co on co.collegeId = t.Colleges_collegeId
        INNER JOIN Conferences conf on conf.conferenceId = co.Conferences_conferenceId
        INNER JOIN Leagues l on l.leagueId = co.Leagues_leagueId
        WHERE c.coachId = ? `,coachId,(error, results, fields) => {
          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          console.log(query.sql);
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        });
      });
    },

    sendEmailForMatchReportToSystem(req,res,next){
      const message = req.body.message;

      transporter.sendMail({
        from: 'testservicenodemailer@gmail.com',
        to: 'testservicenodemailer@gmail.com',
        subject: 'Match report of ' + new Date(),
        text: message
      }, function(error, info){
        if (error) {
            res.send(JSON.stringify({"status": 500, "error": null, "response": 'error'}));
          console.log(error);
        } else {
          res.send(JSON.stringify({"status": 200, "error": null, "response": 'everything is fine'}));
          console.log('Email sent: ' + info.response);
        }
      });

    },


  };
