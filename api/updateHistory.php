<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
include '../db.php';  // assumes this defines $conn = mysqli_connect(...);

header('Content-Type: application/json');

// 1) ensure user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}
$user_id = $_SESSION['user_id'];

// 2) collect & validate POST
$game_id  = isset($_POST['game_id'])  ? intval($_POST['game_id']) : 1;
$src      = $_POST['src']      ?? null;
$suiticon = $_POST['suiticon'] ?? null;
$wintimes = $_POST['wintimes'] ?? null;

if (!$src || !$suiticon || !$wintimes) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Incomplete card data."]);
    exit;
}

// 3) load existing history JSON (if any)
$historyArray = [];
$sqlFetch = "SELECT history 
             FROM game_history 
             WHERE user_id = ? AND game_id = ?";
if ($stmt = mysqli_prepare($conn, $sqlFetch)) {
    mysqli_stmt_bind_param($stmt, "ii", $user_id, $game_id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_bind_result($stmt, $historyJson);
    if (mysqli_stmt_fetch($stmt) && $historyJson) {
        $decoded = json_decode($historyJson, true);
        if (is_array($decoded)) {
            $historyArray = $decoded;
        }
    }
    mysqli_stmt_close($stmt);
}

// 4) append new entry + trim to last 12
$historyArray[] = [
    "src"      => $src,
    "suiticon" => $suiticon,
    "wintimes" => $wintimes
];
if (count($historyArray) > 12) {
    $historyArray = array_slice($historyArray, -12);
}
$updatedHistoryJson = json_encode($historyArray);

// 5) upsert in one statement
$sqlUpsert = "
    INSERT INTO game_history (game_id, user_id, history)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
       history = VALUES(history)
";
if ($stmt = mysqli_prepare($conn, $sqlUpsert)) {
    mysqli_stmt_bind_param($stmt, "iis", $game_id, $user_id, $updatedHistoryJson);
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["success" => true, "message" => "History saved/updated successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Database write error."]);
    }
    mysqli_stmt_close($stmt);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database prepare error."]);
}
