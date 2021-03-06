var db = require('./../db');
const SimpleMatchesController = require('../controllers/simple_matches_controller');
const DoubleMatchesController = require('../controllers/double_matches_controller');
module.exports = {

  create(req, res, next) {
    // const springResultProperties = req.body;

    const gender = req.params.gender;

    const springId = req.body.springId;
    const winnerId =  req.body.winnerId;
    const loserId = req.body.loserId;
    const winnerScore =  req.body.winnerScore;
    const loserScore =  req.body.loserScore;
    const homeAway = req.body.homeAway;
    const date = req.body.date;

    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('INSERT INTO SpringResult VALUES (?,(SELECT teamId FROM Teams WHERE Colleges_collegeId = ? AND gender = ?),(SELECT teamId FROM Teams WHERE Colleges_collegeId = ? AND gender = ?),?,?,?,?);',
      [springId,winnerId,gender,loserId,gender,winnerScore,loserScore, homeAway, date], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
        console.log("SpringResultAdded");
        return (results.insertId);
      });
    });
  },

  create2(req, res, next) {
    // const springResultProperties = req.body;

    const gender = req.params.gender;


    const winnerId =  req.body.winnerId;
    const loserId = req.body.loserId;
    const winnerScore =  req.body.winnerScore;
    const loserScore =  req.body.loserScore;
    const homeAway =  req.body.homeAway;
    const date = req.body.date;

    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('INSERT INTO SpringResult (winnerId, loserId, winnerScore,loserScore,homeAway,date) VALUES ((SELECT teamId FROM Teams WHERE Colleges_collegeId = ? AND gender = ?),(SELECT teamId FROM Teams WHERE Colleges_collegeId = ? AND gender = ?),?,?,?,?);',
      [winnerId,gender,loserId,gender,winnerScore,loserScore,homeAway,date], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
        console.log("SpringResultAdded");
        return (results.insertId);
      });
    });
  },



  checkWinnerLoserSpring(req,res){
    var nbPointsWinner = 0;
    var nbPointsLoser = 0;

    SimpleMatchesController.findSimpleMatchPerSpringId(req,res)
    .then((resu)=> {
      console.log("test");
      console.log(resu[0]);
    })
    .catch((error) => {
      console.log(error);
    })
  }

  };
