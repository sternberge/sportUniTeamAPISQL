var mysql = require('mysql');


// Connection string parameters.
var pool = mysql.createPool({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE,
  port : process.env.DB_PORT,
  connectionLimit : 10
});

exports.pool = pool;
