var express = require('express'); // Web Framework
var expressValidator = require('express-validator');
const jwt = require('jsonwebtoken');

require('dotenv').config();
var app = express();
const routes = require('./routes/routes');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(expressValidator());
routes(app);

// Validation Middleware
/*
app.use((req, res, next) =>{
  var token = req.body.token || req.headers['token'];
  if(token){
    jwt.verify(token, process.env.SECRET_TOKENKEY, (err, decode)=>{
      if(err){
        res.status(500).send("Invalid Token");
      }
      else{
        next();
      }
    });
    res.send("you have a token");
  }
  else {
    res.send("no token");
  }
});*/


// Message d'erreur pour les routes incorrectes
app.use(function(req, res) {
  res.status(404).send({url: req.originalUrl + ' not found'})
});

module.exports = app;
