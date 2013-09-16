/*

	Decoded API

	Running on api.decoded.co 
	Raspberry Linux + node.js

	Checkin for Code in a Day
	Google filter for Data Viz in a Day

*/

// Load required libraries
var express = require('express'),
	fs = require('fs'),
	qs = require('querystring'),
	url = require('url'),
	request = require('request'),
	csv = require('csv'),	
	app = express();

// Set jsonp callback - mirrored in javascript calls
app.set('jsonp callback name', 'callback');

/*
	Twitter Checkins for CIAD2

	http://api.decoded.co/checkin/NAME returns all records
	http://api.decoded.co/checkin/NAME?username=twitterhandle stores checkin and returns number of checkins

*/

app.all('/checkin*', function(req, res){

	// parse the URL request
	var thisRequest = url.parse(req.url,true);
	var query = thisRequest.query;
	// strip out non-word characters \W and remove initial checkin
	var filename = thisRequest.pathname.replace(/\W/g,'').replace(/^checkin/,'');
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

	Google spreadsheet CSV to JSON
	Data Visualisation in a Day

*/

app.all('/cleanGoogle*', function(req, res){

	// Parse the URL for a key
	var thisRequest = url.parse(req.url,true);
	var key = thisRequest.pathname.replace(/\W/g,'').replace(/^cleanGoogle/,'');
	if (key.length==0) {
		res.send(404,"No key specified.");
		return;
	}

	// Grab the document from Google Docs
	request('https://docs.google.com/spreadsheet/pub?hl=en_US&hl=en_US&single=true&gid=0&output=csv&key=' + key, function (error, response, body) {
		
		if (!error && response.statusCode == 200) {
			// convert csv to JSON
			csv().from(body,{columns: true}).to.array( function (data) { 
				res.jsonp(data);
			});
		} else {
			res.send(response.statusCode,body);
		}
		
		// log the request
		console.log(key + ',' + response.statusCode + ',' + req.ip + ',' + req.headers['user-agent']);	

	});



});

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
