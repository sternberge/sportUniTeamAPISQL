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
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
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
  };
