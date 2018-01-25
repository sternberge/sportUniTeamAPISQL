var db = require('./../db');

//Get the different DoubleTeam ids from the DoubleTeam Table in the DB
const getDoubleTeamIds = () => {
  return new Promise((resolve, reject) => {
    db.pool.getConnection((error, connection) => {
      if (error) {
        return reject(error);
      }
      var query = connection.query(`SELECT doubleTeamId FROM DoubleTeams`, (error, results, fields) => {
        if (error) {
          connection.release();
          return reject(error);
        }
        connection.release(); // CLOSE THE CONNECTION
        resolve(results);
      });
    });
  });
}


module.exports = {
  getDoubleTeamIds
};
