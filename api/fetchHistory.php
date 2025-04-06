<?php
session_start();
include '../db.php'; // Make sure this sets up your $conn connection

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1;

$query = "SELECT history FROM game_history WHERE user_id = ? AND game_id = ?";
if ($stmt = mysqli_prepare($conn, $query)) {
    mysqli_stmt_bind_param($stmt, "ii", $user_id, $game_id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);
    if (mysqli_stmt_num_rows($stmt) > 0) {
        mysqli_stmt_bind_result($stmt, $historyJson);
        mysqli_stmt_fetch($stmt);
        mysqli_stmt_close($stmt);
        echo $historyJson;
    } else {
        mysqli_stmt_close($stmt);
        // No record found; return an empty array
        echo json_encode([]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Database error."]);
}
?>
