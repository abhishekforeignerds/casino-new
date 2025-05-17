<?php
$host = "localhost";
$user = "root"; // Change to your database username
$pass = "";     // Change to your database password
$dbname = "casino-game";

$conn = new mysqli($host, $user, $pass, $dbname);

if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>

<?php
// $host = "localhost";
// $user = "u861477996_casino"; // Change to your database username
// $pass = "Tm@1tlcQf/3";     // Change to your database password
// $dbname = "u861477996_casino";

// $conn = new mysqli($host, $user, $pass, $dbname);

// if ($conn->connect_error) {
//     die("Connection failed: " . $conn->connect_error);
// }
?>
