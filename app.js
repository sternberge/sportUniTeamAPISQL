var express = require('express'); // Web Framework
var expressValidator = require('express-validator');
require('dotenv').config();
var app = express();
const routes = require('./routes/routes');
const bodyParser = require('body-parser');
//require('dotenv').config(); A VOIR !
app.use(bodyParser.json());
app.use(expressValidator());
routes(app);


// Message d'erreur pour les routes incorrectes
app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

module.exports = app;
