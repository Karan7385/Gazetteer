<?php

function weatherAPI($latitude, $longitude) {

    // Initialize cURL session
    $ch = curl_init();

    // Set the URL to fetch
    curl_setopt($ch, CURLOPT_URL, "http://api.geonames.org/findNearByWeatherJSON?lat=" . $latitude . "&lng=" . $longitude . "&username=evangeline_daniel");

    // Set the HTTP method (GET, POST, etc.)
    curl_setopt($ch, CURLOPT_HTTPGET, true);

    // Return the response instead of outputting it
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Execute the request and fetch the response
    $response = curl_exec($ch);

    // Check for errors
    if ($response === false) {
        // If there's an error, return an error message
        return 'cURL error: ' . curl_error($ch);
    }

    // Close cURL session
    curl_close($ch);

    // Return the response data
    return $response;
}

// Call the function to fetch weather data and echo the result
echo weatherAPI($_REQUEST['latitude'], $_REQUEST['longitude']);

?>
