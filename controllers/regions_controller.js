var db = require('./../db');

//Get the different Region ids from the Regions Table in the DB
const getRegionIds = (connection) => {
  return new Promise((resolve, reject) => {
      var query = connection.query(`SELECT regionId FROM Regions`, (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
}

const getRegions = (req, res) => {
  db.pool.getConnection((error, connection) => {
    if (error) {
      return res.send(JSON.stringify({
        "status": 500,
        "error": error,
        "response": null
      }));
    }
    var query = connection.query(`SELECT regionId, regionName FROM Regions`, (error, results, fields) => {
      if (error) {
        connection.release();
        return res.send(JSON.stringify({
          "status": 500,
          "error": error,
          "response": null
        }));
      }
      res.send(JSON.stringify({
        "status": 200,
        "error": null,
        "response": results
      }));
      connection.release(); // CLOSE THE CONNECTION
    });
  });
}


module.exports = {
  getRegionIds,
	getRegions
};
