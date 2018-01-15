var db = require('./../db');

module.exports = {
  create(req, res, next) {

    const springResultProperties = req.body;

    db.pool.getConnection((error, connection) => {
      if (error){
        return res.send(JSON.stringify({"status": 500, "error": error, "response": null}));
      }
      var query = connection.query('INSERT INTO SpringResult SET ?',
      springResultProperties, (error, results, fields) => {
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

  };
