document.addEventListener("DOMContentLoaded", function (event) {
	count = 0;

	if ('ondeviceorientationabsolute' in window) {
		document.getElementById("supported").innerHTML = true;
		window.addEventListener('deviceorientationabsolute', function (eventData) {
			var heading = 0;
			if (eventData.absolute === true && eventData.alpha !== null) {
				heading = compassHeading(eventData.alpha, eventData.beta, eventData.gamma);
				// Call the function to use the data on the page.
			}
			deviceOrientationHandler(heading);
		})
	}
	else if ('ondeviceorientation' in window) {
		document.getElementById("supported").innerHTML = false;
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

