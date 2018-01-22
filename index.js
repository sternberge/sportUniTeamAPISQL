var nodemailer = require('nodemailer');
const app = require('./app');


// Start server and listen on http://localhost:3000/
var server = app.listen(3000, function () {
    console.log("app listening at port 3000");
	
});

