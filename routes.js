var request = require("request");
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
    var url = 'http://tv.nrk.no/listobjects/mostpopular/week';

    request(url, function (error, response, body) {
            if(!error && response.statusCode === 200){
                res.send(body);
            } else {
                console.log('Got error', error);
            }
        }
    );
}

exports.meta = function (req, res, next) {
    var url = 'http://psapi.nrk.no/mediaelement/';
    if(!req.params.pid) next();

    var options = {
        url: url + req.params.pid,
        headers : { // set user agent to iOS 6 to get correct meta
            'User-agent' : 'Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25'
        } 
    }

    res.header('Content-Type', 'application/json');
    request(options, function (error, response, body) {
            if(!error && response.statusCode === 200){
                res.send(body);
            } else {
                console.log('Got error', error);
            }
        }
    );
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
	request(url.replace('{pid}', req.params.pid), function (error, response, body) {
            if (!error && response.statusCode === 200) {
                res.send(body);
            } else {
                console.log('Got error', error);
            }
        }
    );
}