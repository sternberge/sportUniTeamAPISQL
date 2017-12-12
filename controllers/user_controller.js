var db = require('./../db');

module.exports = {

  findUserById (req, res) {
    const userId = req.params.user_id;
    db.pool.getConnection((error, connection) => {
      const userProp = req.body;
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('SELECT * FROM Users WHERE userID = ?', userId, (error, results, fields) => {
        if (error){
          connection.release();
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }
        res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
        connection.release(); // CLOSE THE CONNECTION
      });
    });
  },

  createUser(req, res, next) {
    var post  = {firstName: req.body.firstName,
      lastName:req.body.lastName,
      gender: req.body.gender,
      email: req.body.email,
      password: req.body.password,
      birthday: req.body.birthday,
      userType: req.body.userType};

      db.pool.getConnection((error, connection) => {
        const userProp = req.body;
        if (error){
          return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
        }

        var query = connection.query('INSERT INTO Users SET ?', post, (error, results, fields) => {
          if (error){
            connection.release();
            return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
          }
          res.send(JSON.stringify({"status": 200, "error": null, "response": results}));
          connection.release(); // CLOSE THE CONNECTION
        });
      });
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
        const userProp = req.body;
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
    }
  };
