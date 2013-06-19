/*

	Decoded API

	Running on api.decoded.co 
	Raspberry Linux + node.js

*/

// Load the Express Framework for Node.js, and the file server, querystring and URL modules for express
var express = require('express'),
	fs = require('fs'),
	qs = require('querystring'),
	url = require('url'),
// Initiate an Express instance
	app = express();

/*
	Twitter Checkins for CIAD2

	http://api.decoded.co/checkin/NAME returns all records
	http://api.decoded.co/checkin/NAME?username=twitterhandle stores checkin and returns number of checkins

*/

app.all('/checkin*', function(req, res){

	// Set jsonp callback - mirrored in form.js
	app.set('jsonp callback name', 'callback');

	// parse the URL request
	var request = url.parse(req.url,true);
	var query = request.query;
	// strip out non-word characters \W and remove initial checkin
	var filename = request.pathname.replace(/\W/g,'').replace(/^checkin/,'');
	filename = (filename) ? filename + '.json' : 'default.json';

	// check if file exists
	fs.exists('./checkin/' + filename, function (exists) {

		if (!exists) {
	 		try {
	 			fs.writeFileSync('./checkin/' + filename, '{}');
	 			console.log('Created ' + filename);
	 		} catch(err) {
	 			errorHandler(res, err);
	 		}
		}

		// read the contents of the file
		fs.readFile('./checkin/' + filename, function (err, data) {
			
			if (err) errorHandler(res, err);

			// convert to JSON object
			try {
				data = JSON.parse(data);
			} catch (err) {
				errorHandler(res,err);
			}

			// if no query just return the file contents
			var username = (query.username) ? query.username.replace(/\W/g,'').toLowerCase() : null;
			
			if (!username) return res.send(data);

			// increment that username
			data[username] = data.hasOwnProperty(username) ? data[username] + 1 : 1;

			// write the file
			try {
				fs.writeFileSync('./checkin/' + filename , JSON.stringify(data));
			} catch (err) {
				errorHandler(res, err);
			};

			// output username and number of checkins
			var uniqueData = JSON.stringify({username: username, checkIns: data[username]});
			uniqueData = JSON.parse(uniqueData);
			res.jsonp(uniqueData);

			// log the request
			console.log(filename.replace(/.json/g,'') + ',' + username + ',' + data[username] + ',' + req.ip + ',' + req.headers['user-agent']);	

		}) // end read filename

	}); // end if file exists

}); // end checkin 

/*

	Default behaviour

*/

app.all('*', function(req,res) {
	res.redirect('http://decoded.co');
});

app.listen(80);

/*

	Error Handling

*/

function errorHandler (res, err) {
	res.send("<h1>Oops</h1><p>Sorry, there seems to be a problem!</p>\n\n<!--\n\n" + err.stack + "\n\n-->");
	throw err;
}