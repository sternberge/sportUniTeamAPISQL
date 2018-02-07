var db = require('./../db');


module.exports = {
  findCollegeById (req, res) {
    const collegeId = req.params.college_id;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      // L'ajout du '?' permet d'éviter les injections sql
      var query = connection.query('SELECT * FROM Colleges WHERE collegeID = ?', collegeId, (error, results, fields) => {
        if (error){
          connection.release();
          res.send(JSON.stringify({"status": 500, "error": error, "response": null}));// Convertion de la réponse en format JSON
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

  createCollege(req, res, next) {
    const collegeProperties = req.body;
    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('INSERT INTO Colleges SET ?',
      collegeProperties, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
        console.log("test1");
        return (results.insertId);
      });
    });
  },

  editCollege(req, res, next) {
    const collegeId = req.params.college_id;
    const collegeProperties = req.body;
    db.pool.getConnection((error, connection) => {
      const collegeProp = req.body;
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('UPDATE Colleges SET ? WHERE collegeID = ?',[collegeProperties, collegeId], (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  deleteCollege(req, res, next) {
    const collegeId = req.params.college_id;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('DELETE FROM Colleges WHERE collegeID = ?', collegeId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  generateCollegeDropDownList(req,res,next){
    const coachId = req.params.coach_id;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT collegeId,name FROM Colleges;',(error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  getCollegeNameFromTeamId(req,res,next){
    const teamId = req.params.teamId;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('select name as collegeName from Colleges c inner join Teams t on c.collegeId = t.Colleges_collegeId where teamId = ?;',teamId,(error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  getCollegeNameFromCollegeId(req,res,next){
    const collegeId = req.params.collegeId ;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('select name as collegeName from Colleges where collegeId = ?;',collegeId,(error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  getCollegeRankingByCollegeIdGender(req,res,next){
    const collegeId = req.params.collegeId ;
    const gender = req.params.gender;
    const type = req.params.type;
    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT tr.*,temp.name as collegeName,temp.conferenceId,temp.conferenceLabel FROM TeamRanking tr
      INNER JOIN (SELECT * FROM Teams t INNER JOIN Colleges c on c.collegeId = t.Colleges_collegeId INNER JOIN Conferences conf on conf.conferenceId = c.Conferences_conferenceId WHERE c.collegeId = ? AND t.gender LIKE ?)
      as temp on temp.teamId = tr.Teams_teamId WHERE tr.type LIKE ?`,[collegeId,gender,type],(error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
      console.log(query.sql);
    });
  },


  getConferencesByCollegeId(req, res, next) {

    const collegeId = req.params.collegeId;

    db.pool.getConnection((error, connection) => {

      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query(`SELECT distinct Conferences_conferenceId as conferenceId FROM Colleges where Leagues_leagueId = (SELECT Leagues_leagueId FROM Colleges where collegeId  = ?)`,collegeId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });

      console.log(query.sql);
    });
  },


};
