<?php
session_start();
include '../db.php'; // This file should set up your database connection (e.g., $conn)

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$game_id = isset($_POST['game_id']) ? intval($_POST['game_id']) : 1;

// Validate required POST values
if (!isset($_POST['src']) || !isset($_POST['suiticon']) || !isset($_POST['wintimes'])) {
    echo json_encode(["success" => false, "message" => "Incomplete card data."]);
    exit;
}

$src = $_POST['src'];
$suiticon = $_POST['suiticon'];
$wintimes = $_POST['wintimes'];

// Attempt to retrieve an existing history record for this user and game
$query = "SELECT id, history FROM game_history WHERE user_id = ? AND game_id = ?";
$recordExists = false;
$historyJson = null;
$history_id = null;
if ($stmt = mysqli_prepare($conn, $query)) {
    mysqli_stmt_bind_param($stmt, "ii", $user_id, $game_id);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);
    mysqli_stmt_bind_result($stmt, $history_id, $historyJson);
    if (mysqli_stmt_fetch($stmt)) {
        $recordExists = true;
    }
    mysqli_stmt_close($stmt);
} else {
    echo json_encode(["success" => false, "message" => "Database error."]);
    exit;
}

// Decode existing history or start a new array
$historyArray = $historyJson ? json_decode($historyJson, true) : [];
if (!is_array($historyArray)) {
    $historyArray = [];
}

// Append the new card entry
$newEntry = [
    "src"      => $src,
    "suiticon" => $suiticon,
    "wintimes" => $wintimes
];
$historyArray[] = $newEntry;

// Ensure the history contains only the latest 12 cards
if (count($historyArray) > 12) {
    $historyArray = array_slice($historyArray, -12);
}

$updatedHistoryJson = json_encode($historyArray);

// Update the record if it exists; otherwise, insert a new record
if ($recordExists) {
    $updateQuery = "UPDATE game_history SET history = ? WHERE id = ?";
    if ($stmt2 = mysqli_prepare($conn, $updateQuery)) {
        mysqli_stmt_bind_param($stmt2, "si", $updatedHistoryJson, $history_id);
        if (mysqli_stmt_execute($stmt2)) {
            mysqli_stmt_close($stmt2);
            echo json_encode(["success" => true, "message" => "History updated successfully."]);
            exit;
        } else {
            mysqli_stmt_close($stmt2);
            echo json_encode(["success" => false, "message" => "Failed to update history."]);
            exit;
        }
    }
} else {
    $insertQuery = "INSERT INTO game_history (game_id, user_id, history) VALUES (?, ?, ?)";
    if ($stmt3 = mysqli_prepare($conn, $insertQuery)) {
        mysqli_stmt_bind_param($stmt3, "iis", $game_id, $user_id, $updatedHistoryJson);
        if (mysqli_stmt_execute($stmt3)) {
            mysqli_stmt_close($stmt3);
            echo json_encode(["success" => true, "message" => "History saved successfully."]);
            exit;
        } else {
            mysqli_stmt_close($stmt3);
            echo json_encode(["success" => false, "message" => "Failed to save history."]);
            exit;
        }
    }
}
?>