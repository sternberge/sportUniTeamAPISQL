var db = require('./../db');

//Get the different Conference ids from the Conferences Table in the DB
const getConferenceIds = (connection) => {
	return new Promise( (resolve, reject) => {
		db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var query = connection.query(`SELECT conferenceId FROM Conferences`, (error, results, fields) => {
			  if (error){
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

	getConferenceIds
};
