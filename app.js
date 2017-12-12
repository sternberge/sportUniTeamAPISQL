var express = require('express'); // Web Framework
var app = express();
const routes = require('./routes/routes');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
routes(app);

app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

module.exports = app;
