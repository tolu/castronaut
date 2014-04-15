/**

**/
var express = require("express");
var routes = require('./routes');
var http = require("http");
var logfmt = require("logfmt");
var path = require('path');
var app = express();
var port = Number(process.env.PORT || 5000);

//CORS middleware
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); // NOT SAFE FOR PRODUCTION
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
}

app.use(logfmt.requestLogger());

app.configure(function() {
    app.use(allowCrossDomain);
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(express.static(path.join(__dirname, 'html')));
});

app.listen(port, function () {
	console.log('Server active and listening on port ' + port);
});

//app.get('/', routes.index);
app.get('/popular', routes.popular);
app.get('/ttml/:id', routes.subtitles);

/* HTTPS Server
 * http://stackoverflow.com/questions/11744975/enabling-https-on-express-js
 * https://devcenter.heroku.com/articles/ssl-certificate-self
 * https://devcenter.heroku.com/articles/ssl-endpoint

var fs = require('fs');
var http = require('http');
var https = require('https');
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8');
var certificate = fs.readFileSync('sslcert/server.crt', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var express = require('express');
var app = express();

// your express configuration here

var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials, app);

httpServer.listen(80);
httpsServer.listen(443);

*/