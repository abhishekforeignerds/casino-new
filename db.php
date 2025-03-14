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
