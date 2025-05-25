<?php
// $// $host = "localhost";
// $user = "root"; // Change to your database username
// $pass = "";     // Change to your database password
// $dbname = "casino-game";

// $conn = new mysqli($host, $user, $pass, $dbname);

// if ($conn->connect_error) {
//     die("Connection failed: " . $conn->connect_error);
// }
?>

<?php
$host = "localhost";
$user = "u861477996_casinogame"; // Change to your database username
$pass = "F~m985!v0";     // Change to your database password
$dbname = "u861477996_casinogame";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
