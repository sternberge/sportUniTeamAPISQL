const app = require('./app');

// Start server and listen on http://localhost:8081/
var server = app.listen(8081, function () {
    console.log("app listening at port 8081");
});
