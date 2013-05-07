// Load the Express Framework for Node.js, and the file server, querystring and URL modules for express
var express = require('express'),
	fs = require('fs'),
	qs = require('querystring'),
	url = require('url'),
// Initiate an Express instance
	app = express();
// Enable jsonP
app.enable("jsonp callback");
// Respond to get requests:
app.get('/microsoft', function(req, res){
	//var workshopName = req.path.replace(/\W/g, '');
	//var fileName = './datamicrosoft.json';
	var fileToWrite = 'datamicrosoft.json';
	writeData(fileToWrite, req, res);
});
app.get('/', function(req, res){
	//var workshopName = req.path.replace(/\W/g, '');
	//var fileName = './datamicrosoft.json';
	var fileToWrite = 'data.json';
	writeData(fileToWrite, req, res);
});

app.listen(3000)

function writeData(fileToWrite, req, res) {

	// Read the data store
    fs.readFile(fileToWrite, function(error, json){
    	// Log any errors
    	if (error) { console.log(error) };
        // Get the JSON contents and ensure it's JSON
    	var existingData = JSON.parse(json);
		// Get any data from the GET request using the URL module
		var url_parts = url.parse(req.url,true);
		var query = url_parts.query;
		// Only carry on if there is in fact data
		if(query.username) { 
			// Make it lowercase and get rid of non alphanumeric characters
			var username = query.username; 
		    	username = username.toLowerCase();
		    	username = username.replace(/\W/g, '');
			// If already in list, increment checkinCount
			if ( existingData.hasOwnProperty(username) ) {
	                existingData[username] = existingData[username] + 1; 
				} else {
					existingData[username] = 1;
	            }
	        // Create JSON object of username and checkins:
        	var uniqueData = JSON.stringify({username: username, checkIns: existingData[username]});
        		uniqueData = JSON.parse(uniqueData);
	   			// Make the existingData JSON again:
    		var	newData = JSON.stringify(existingData);
	    	// Write the new data to the JSON file 
        	fs.writeFile(fileToWrite, newData, function(error){
        		if (error) { console.log(error) }
        		else { console.log('The file was saved') }
        		// Output the JSON
		   		res.type('application/json');
				res.jsonp(uniqueData);
				res.end();	
        	});
        } else {
        	// Output the JSON
    		res.type('application/json');
			res.jsonp(existingData);
			res.end();
        }
    });
}