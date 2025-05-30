<?php
session_start();
include '../db.php'; // Database connection

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}
date_default_timezone_set('Asia/Kolkata');
$user_id = $_SESSION['user_id'];
$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1; // Adjust as needed

$query = "SELECT history FROM game_history WHERE game_id = ?  LIMIT 12";
if ($stmt = mysqli_prepare($conn, $query)) {
    mysqli_stmt_bind_param($stmt, "i", $game_id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);
    if (mysqli_stmt_num_rows($stmt) > 0) {
        mysqli_stmt_bind_result($stmt, $historyJson);
        mysqli_stmt_fetch($stmt);
        mysqli_stmt_close($stmt);
        echo $historyJson;
    } else {
        mysqli_stmt_close($stmt);
        // No history record yet; return an empty array as JSON.
        echo json_encode([]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Database error."]);
}
?>
