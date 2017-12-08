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
var results_pois = {
  {
    name: "Aalto",
    angle: "90",
  }
};
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
  if (status === google.maps.places.PlacesServiceStatus.OK) {
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

