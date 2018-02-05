var db = require('./../db');

//Get the different Conference ids from the Conferences Table in the DB
const getConferenceIds = (connection) => {
  return new Promise((resolve, reject) => {
    var query = connection.query(`SELECT conferenceId FROM Conferences`, (error, results, fields) => {
      if (error) {
        return reject(error);
      }
      resolve(results);
    });
  });
}


module.exports = {

  getConferenceIds
};
