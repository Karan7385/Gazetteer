<?php
function getCities($countryCode) {
    $servername = "localhost";
    $username = "evang9sl_gazetteer";
    $password = "evang9sl_gazetteer";
    $database = "evang9sl_gazetteer";

    $conn = new mysqli($servername, $username, $password, $database);

    // Check the connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Prepare SQL statement with a prepared statement
    $sql = "SELECT * FROM `cities` WHERE `country_code` = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $countryCode); // Bind the parameter
    $stmt->execute();

    // Get result set
    $result = $stmt->get_result();

    // Fetch data from the result set
    $cities = [];
    while ($row = $result->fetch_assoc()) {
        $cities[] = $row;
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();

    // Return the city data as JSON
    return json_encode($cities);
}

// Check if the country code is provided in the request
if (isset($_GET['country_code'])) {
    // Get the country code from the AJAX request
    $countryCode = $_GET['country_code'];

    // Call the getCities function with the country code and echo the result
    header('Content-Type: application/json');
    echo getCities($countryCode);
} else {
    // Handle case when country code is not provided
    echo json_encode(array('error' => 'Country code is not provided'));
}
?>