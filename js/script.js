document.addEventListener("DOMContentLoaded", function (event) {
    count = 0;
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function (eventData) {
            var isTrue = eventData.absolute;
            if(isTrue == 1)
                count++;
            // gamma: Tilting the device from left to right. Tilting the device to the right will result in a positive value.
            var tiltLR = eventData.gamma;

            // beta: Tilting the device from the front to the back. Tilting the device to the front will result in a positive value.
            var tiltFB = eventData.beta;

            // alpha: The direction the compass of the device aims to in degrees.
            var dir = eventData.alpha

            // Call the function to use the data on the page.
            deviceOrientationHandler(count, tiltLR, tiltFB, dir);
        }, false);
    };

    function deviceOrientationHandler(count, tiltLR, tiltFB, dir) {
        document.getElementById("isTrue").innerHTML = Math.ceil(count);
        document.getElementById("tiltLR").innerHTML = Math.ceil(tiltLR);
        document.getElementById("tiltFB").innerHTML = Math.ceil(tiltFB);
        document.getElementById("direction").innerHTML = Math.ceil(dir);

        // Rotate the disc of the compass.
        var compassDisc = document.getElementById("compassDiscImg");
        compassDisc.style.webkitTransform = "rotate(" + dir + "deg)";
        compassDisc.style.MozTransform = "rotate(" + dir + "deg)";
        compassDisc.style.transform = "rotate(" + dir + "deg)";
    }
});