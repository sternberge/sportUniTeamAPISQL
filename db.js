var mysql = require('mysql');


// Connection string parameters.
var pool = mysql.createPool({
  host     : 'sutdbtest.ct79avbur6ul.us-east-1.rds.amazonaws.com',
  user     : 'SUTeam',
  password : 'bddsutteam',
  database : 'mydb',
  port : '3306',
  connectionLimit : 10
});

exports.pool = pool;
