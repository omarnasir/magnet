var map;
var infowindow;
var here;

function pos() {
	if (navigator.geolocation) {
		var p = navigator.geolocation.getCurrentPosition(initMap);
	}
}

function initMap(p) {

	here = {lat: p.coords.latitude, lng: p.coords.longitude};
	console.log(here);

	map = new google.maps.Map(document.getElementById('map'), {
		center: here,
		zoom: 13
	});

	var service = new google.maps.places.PlacesService(map);
	service.nearbySearch({
		location: here,
		radius: 500
	}, callback);
	console.log('done');
}

function callback(results, status) {
	console.log(results);
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0; i < results.length; i++) {

			var poi = results[i].geometry.location;
			var dx = poi.lng()-here.lng;
			var dy = poi.lat()-here.lat;
			var angle = Math.atan2(dx,dy)*180/Math.PI;
			results[i].angle = angle;
			console.log(results[i]);

			createMarker(results[i]);
		}
		filterPOIs(results,200);
	}
}

function createMarker(place) {
	var marker = new google.maps.Marker({
		map: map,
		position: place.geometry.location
	});

	google.maps.event.addListener(marker, 'click', function() {
		console.log(place.name,place.angle);
	});
}

function filterPOIs(pois,direction){
	var fov = 90;
	for (var i = pois.length - 1; i >= 0; i--) {
		var a = direction - pois[i].angle;
		a = (a + 180) % 360 - 180;
		if (a >-fov/2 & a<fov/2) {
			$('#infoContainer').append('<tr><td>'+pois[i].name+'</td>'+'<td>'+pois[i].angle+'</td><td>'+a+'</td><td>'+pois[i].types+'</td></tr>');
		}
	}
}