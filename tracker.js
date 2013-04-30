$(document).ready(getStarted);


function getStarted(){

	// watch the user's location
	navigator.geolocation.watchPosition(calculateDistance);

} // END indexBehaviour

// Our function to pass to watchPosition when it finds user
function calculateDistance(position){
		
	// What is "position" ???
	console.log(position);	
		
	// Extract the user's lat and lon from the position object
	var userLat = position.coords.latitude;
	var userLon = position.coords.longitude;
	
	// Save our location as matching variables		
	var destLat = 51.528534;
	var destLon = -0.091737;

	// Use Chris V's sample code to calculate the distance	
	var p1 = new LatLon(userLat, userLon);                                                    
	var p2 = new LatLon(destLat, destLon);                                                     
	var dist = p1.distanceTo(p2);          // in km    
	
	// Check var dist and see if it's less than .1
	console.log(dist);
	
	// define how close the user needs to get before we reward them
	var radius = 5000;

	if (dist < radius) {
		$('h3#message').html('You are here. Now check-in! ');
		$('form').show();
	} else {
		$('h3#message').html('You are not there. Maybe you need a little help from your friends?');
		$('form').hide();
	}

	// Turning the distance into meters and round
	var niceDistance = Math.round(dist * 1000);

	// place the distance into the H3 tag on the page
	$('p#distance').html('You are ' + niceDistance + 'm away');


} // END successCallback
