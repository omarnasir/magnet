//----Camera API
$(document).ready(function () {
  var video = document.querySelector('#video');

  // Put variables in global scope to make them available to the browser console.
  var constraints = window.constraints = {
    audio: false,
    video: true
    // video: { facingMode: { exact: "environment" } }
  };

  function handleSuccess(stream) {
    var videoTracks = stream.getVideoTracks();
    console.log('Got stream with constraints:', constraints);
    console.log('Using video device: ' + videoTracks[0].label);
    stream.oninactive = function () {
      console.log('Stream inactive');
    };
    window.stream = stream; // make variable available to browser console
    video.srcObject = stream;
  }
  navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess);
});

//----GPS API
var map;
var infowindow;
var here;
// var results_pois = [
//   {"geometry":{"location":{"lat":60.2054911,"lng":24.655899999999974},"viewport":{"south":60.0499087,"west":24.499656500000015,"north":60.3636105,"east":24.8505715}},"icon":"https://maps.gstatic.com/mapfiles/place_api/icons/geocode-71.png","id":"71675bb33b7c9dd3ce185f1fcb84cfe97a8c7127","name":"Espoo","photos":[{"height":2964,"html_attributions":["<a href=\"https://maps.google.com/maps/contrib/107812077117373232232/photos\">Vladimir Kourakevitch</a>"],"width":5269}],"place_id":"ChIJ4Us9pPryjUYRn1MzXbSQuPA","reference":"CmRbAAAAk3IwsrMz3KijWPyQkVVHWIYfQIZXF5UXS_WsqZRc-OnR78YWDfo7Eeg8tRUo_0F8rQiVdNFMC6IqHrWzPkLsks-K9U0B-9C2hkRD6rthVA7LbHl_BJycMY7xq4iQJfcnEhCQ7A31Tix4mftei_oeQLQCGhQ85pEVthlypO4VRAckS_FoIfv91A","scope":"GOOGLE","types":["locality","political"],"vicinity":"Espoo","html_attributions":[],"angle":-83.91153879524008}
// ];
var results_pois;
var heading_max = 0; var heading_min =0;

function pos() {
  if (navigator.geolocation) {
    var p = navigator.geolocation.getCurrentPosition(initMap);
  }
}

function initMap(p) {
  here = { lat: p.coords.latitude, lng: p.coords.longitude };
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
  // results = results_pois;
  if (status === google.maps.places.PlacesServiceStatus.OK) {
  // if(true){
    for (var i = 0; i < results.length; i++) {      
      var poi = results[i].geometry.location;
      var dx = poi.lng() - here.lng;
      var dy = poi.lat() - here.lat;
      var angle = Math.atan2(dx, dy) * 180 / Math.PI;
      results[i].angle = angle;
      console.log(results[i]);

      createMarker(results[i]);
    }
    results_pois = results;
  }
}

function createMarker(place) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location
  });

  google.maps.event.addListener(marker, 'click', function () {
    console.log(place.name, place.angle);
  });
}

function filterPOIs(pois, direction) {
  var fov = 90;
  // $('#infoContainer').clear();
  $('#infoContainer').empty();
  
  for (var i = pois.length - 1; i >= 0; i--) {
    var a = direction - pois[i].angle;
    a = (a + 180) % 360 - 180;
    if (a > -fov / 2 & a < fov / 2) {
      $('#infoContainer').append('<tr><td>' + pois[i].name + '</td>' + '<td>' + pois[i].angle + '</td><td>' + a + '</td><td>' + pois[i].types + '</td></tr>');
    }
  }
}

//------Compass API
document.addEventListener("DOMContentLoaded", function (event) {
  count = 0;

  if ('ondeviceorientationabsolute' in window) {
    // document.getElementById("supported").innerHTML = true;
    window.addEventListener('deviceorientationabsolute', function (eventData) {
      var heading = 0;
      if (eventData.absolute === true && eventData.alpha !== null) {
        heading = compassHeading(eventData.alpha, eventData.beta, eventData.gamma);
        if (heading > heading_max || heading < heading_min) {
          heading_max = heading + 5;
          heading_min = heading - 5;
          
          // Call the function to use the data on the page.
          filterPOIs(results_pois, heading);
        }
      }
      deviceOrientationHandler(heading);
    })
  }
  else if ('ondeviceorientation' in window) {
    // document.getElementById("supported").innerHTML = false;
  }

  function compassHeading(alpha, beta, gamma) {

    // Convert degrees to radians
    var alphaRad = alpha * (Math.PI / 180);
    var betaRad = beta * (Math.PI / 180);
    var gammaRad = gamma * (Math.PI / 180);

    // Calculate equation components
    var cA = Math.cos(alphaRad);
    var sA = Math.sin(alphaRad);
    var cB = Math.cos(betaRad);
    var sB = Math.sin(betaRad);
    var cG = Math.cos(gammaRad);
    var sG = Math.sin(gammaRad);

    // Calculate A, B, C rotation components
    var rA = - cA * sG - sA * sB * cG;
    var rB = - sA * sG + cA * sB * cG;
    var rC = - cB * cG;

    // Calculate compass heading
    var compassHeading = Math.atan(rA / rB);

    // Convert from half unit circle to whole unit circle
    if (rB < 0) {
      compassHeading += Math.PI;
    } else if (rA < 0) {
      compassHeading += 2 * Math.PI;
    }

    // Convert radians to degrees
    compassHeading *= 180 / Math.PI;
    return compassHeading;
  }

  function deviceOrientationHandler(res, alpha) {
    document.getElementById("heading").innerHTML = Math.ceil(res);
  }
});

