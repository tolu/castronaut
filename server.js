/**
Copyright (C) 2013 Google Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
**/
var express = require("express"),
	logfmt = require("logfmt"),
    app     = express(),
    port    = Number(process.env.PORT || 5000);

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
    app.use(express.static(__dirname));
});

app.listen(port, function () {
	console.log('Server active and listening on port ' + port);
});

//http://84.202.184.214:{port}


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