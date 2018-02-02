var express = require('express'); // Web Framework
var expressValidator = require('express-validator');
const jwt = require('jsonwebtoken');
const queue = require('express-queue');

require('dotenv').config();
var app = express();
const routes = require('./routes/routes');
const bodyParser = require('body-parser');

var busboy = require('connect-busboy');

app.use(busboy());

app.use(bodyParser.json());
app.use(expressValidator());
// Using queue middleware
app.use(queue({ activeLimit: 30, queuedLimit: -1 }));
routes(app);

// Message d'erreur pour les routes incorrectes
app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

module.exports = app;
