var db = require('./../db');
var expressValidator = require('express-validator');
var promise = require('promise');
var bcrypt = require('bcrypt'); // algo de hash
const saltRounds = 10;

var fs = require('fs');

const upload = (req, res) => {
  var fstream;
    req.pipe(req.busboy);
    req.busboy.on('file', function (fieldname, file, filename) {
        console.log("Uploading: " + filename);
        fstream = fs.createWriteStream(__dirname + '/files/' + filename);
        file.pipe(fstream);
        fstream.on('close', function () {
            res.send('uploaded');
        });
    });
}


module.exports = {

  upload,

  findUserById (req, res) {
    const userId = req.params.user_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM Users WHERE userID = ?', userId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));// Convertion de la réponse en format JSON
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



  async createUser(req, res){
    try{
      //Ouverture de la transaction
      var connection = await db.getConnectionForTransaction(db.pool);
      // Check si l'email n'est pas deja en BDD
      var emailOk = await module.exports.checkEmailUnicity(connection,req.body.email);
      //Creation du profil utilisateur
      var create =  await module.exports.createUserWithPromise(connection,req);
      //Fermeture de la transaction
      var closeConnection = await db.closeConnectionTransaction(connection);
      res.send(JSON.stringify({"status": 200, "error": null, "response": "User has been created"}));
    }
    catch(error){
        res.send(JSON.stringify({"status": 500, "error": error, "response": error}));
    }
  },

  createUserWithPromise(connection,req){

    return new Promise(function (resolve, reject) {

      // rajouter le check si l'utilisateur n'est pas déja existant
      // different type of check of the informations
      req.checkBody('email','Email cannot be empty').notEmpty();
      req.checkBody('email','Your email is not valid').isEmail();
      req.checkBody('email','Your email should be between 4 and 100 characters').len(4,100);
      req.checkBody('firstName','FirstName cannot be empty').notEmpty();
      req.checkBody('lastName','Email cannot be empty').notEmpty();
      req.checkBody('password','Your password should be between 8 and 100 characters').len(8,100);
      req.checkBody('reEnterPassword','Your password is different').equals(req.body.password);
      var errors = req.validationErrors();

      if(errors){
        return reject(errors);
      }

      else{
        const firstName= req.body.firstName;
        const lastName=req.body.lastName;
        const gender= req.body.gender;
        const email= req.body.email;
        const password= req.body.password;
        const birthday= req.body.birthday;
        const userType= req.body.userType;
        const phone = req.body.phone;

          //hash of the password and insert in the database
          bcrypt.hash(password, saltRounds, function(err, hash) {
            // Store hash in your password DB.
            var query = connection.query('INSERT INTO Users (firstName,lastName,gender,email,password,birthday,userType,phone) VALUES(?, ?, ?, ?, ?, ?, ?, ?)',
            [firstName,lastName,gender,email,hash,birthday,userType,phone], (error, results, fields) => {
              if (error){
                return reject(error);
              }
              resolve(results.insertId);
            });
          });
      }
    })
  },

  editUser(req, res, next) {
    const userId = req.params.user_id;
    const userProperties = req.body;
    db.pool.getConnection((error, connection) => {
      const userProp = req.body;
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE Users SET ? WHERE userID = ?',[userProperties, userId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  deleteUser(req, res, next) {
    const userId = req.params.user_id;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM Users WHERE userID = ?', userId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  // check de l'email pour la création et l'update du User
  checkEmailUnicity(connection,email){
    return new Promise((resolve,reject) => {
        var query = connection.query('Select 1 from Users Where email = ?', email, (error, results, fields) => {
          if (error){
            return reject(error);
          }
          if(results.length > 0){
            reject("Email already used");
          }
          else{
            resolve();
          }
      });
    });
  },


  addPhoneBirthdateToUserId(req, res, next){
    const userId = req.params.userId;
    const phoneNumber = req.body.phoneNumber;
    const birthday = req.body.birthday;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`UPDATE Users SET phone = ?, birthday = ? WHERE UserId = ? `,[phoneNumber,birthday,Number(userId)], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  modifyPassword(req, res, next){
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const userId = req.params.userId;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }

      var query1 = connection.query(`SELECT password FROM Users WHERE UserId = ? `,[userId], (error, results1, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }

        let stringifyByJson = JSON.stringify(results1);
        let parseByJson = JSON.parse(stringifyByJson);
        let oldPasswordHash = parseByJson[0]['password'];

        bcrypt.compare(oldPassword, oldPasswordHash, function(err, compareRes) {
          if(compareRes == true)
          {
            bcrypt.hash(newPassword, saltRounds, function(err, hash) {
              // Store hash in your password DB.
              var query2 = connection.query(`UPDATE Users SET password = ? WHERE UserId = ? `,[hash,userId], (error, results2, fields) => {
                res.send(JSON.stringify({"status": 200, "error": null, "response": results2}));

                if (error){
                  connection.release();
                  return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
                }
              });
            });
          }
          else {
            console.log('Les mots de passe ne correspondent pas');
            connection.release(); // CLOSE THE CONNECTION
            return res.send(JSON.stringify({"status": 500, "error": 'Old password and new password are not the same', "response": null}));
          }
        });
        //connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

};
