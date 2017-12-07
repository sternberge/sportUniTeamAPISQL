var express = require('express'); // Web Framework
var app = express();
const routes = require('./routes/routes');
const bodyParser = require('body-parser');
var mysql = require('mysql');

app.use(bodyParser.json());
routes(app);
// Connection string parameters.

var pool = mysql.createPool({
  host     : 'sutdbtest.ct79avbur6ul.us-east-1.rds.amazonaws.com',
  user     : 'SUTeam',
  password : '',
  database : 'mydb',
  port : '3306',
  connectionLimit : 10
});

/*connection.connect((err) => {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});*/


app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

module.exports = app;
exports.pool = pool;
