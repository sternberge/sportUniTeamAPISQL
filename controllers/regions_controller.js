var db = require('./../db');

//Get the different Region ids from the Regions Table in the DB
const getRegionIds = () => {
	return new Promise( (resolve, reject) => {
		db.pool.getConnection((error, connection) => {
        if (error){
          return reject(error);
        }
        var query = connection.query(`SELECT regionId FROM Regions`, (error, results, fields) => {
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

	getRegionIds
};
