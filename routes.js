var http = require("http");
/*
 * Get index page
 */
exports.index = function (req, res) {
    app.sendFile('./html/index.html');
}

/*
 * Get popular items list
 */
exports.popular = function (req, res) {
    var url = 'http://tv.nrk.no/listobjects/mostpopular/week',
        output = '';

    http.get(url, function (response) {

        response.on('data', function (chunk) {
            output += chunk;
        });
        response.on('end', function () {
            res.send(output);
        });

    }).on('error', function (e) {
        console.log('Got error', e);
    });
}

/*
 * Get TTML subtitles
 */
exports.subtitles = function (req, res, next) {
	var url = 'http://psapi.nrk.no/programs/{pid}/subtitles/tt', output = '';
	if(!req.params.pid){
		next();
	}
	
    res.header('Content-Type', 'text/xml');
	http.get(url.replace('{pid}', req.params.pid), function (response) {
        response.on('data', function (chunk) {
            output += chunk;
        });
        response.on('end', function () {
            res.send(output);
        });
    }).on('error', function (e) {
        console.log('Got error', e);
    });
}