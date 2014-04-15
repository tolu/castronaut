
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
exports.subtitles = function (req, res, next, id) {
	var idd = req.id;
	console.log('req.id : ' + req.id);
	console.log('variable id : ' + id);
    var url = 'http://psapi.nrk.no/programs/{id}/subtitles/tt',
        output = '';

    /*http.get(url, function (response) {

        response.on('data', function (chunk) {
            output += chunk;
        });
        response.on('end', function () {
            res.send(output);
        });

    }).on('error', function (e) {
        console.log('Got error', e);
    });*/
}