<?php
session_start();
include '../db.php'; // This file should establish your database connection, e.g., $conn

// Ensure the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

$user_id = $_SESSION['user_id'];
$game_id = 1;  // Hard-coded game id

// Validate required POST parameters
if (!isset($_POST['winningSpin']) || !isset($_POST['betTotal'])) {
    echo json_encode(["success" => false, "message" => "Required parameters missing."]);
    exit;
}

$winningSpin = $_POST['winningSpin'];
$betTotal = $_POST['betTotal'];
$winValue = $_POST['winValue'];

// Make sure the values are numeric
if (!is_numeric($winningSpin) || !is_numeric($betTotal)) {
    echo json_encode(["success" => false, "message" => "Invalid parameters."]);
    exit;
}
if ($betTotal <= 0) {
    echo json_encode(["success" => true, "message" => "Game result recorded successfully."]);
    exit;
}
// Determine if it's a win or a loss
// If winValue is provided and greater than 0, treat as win; otherwise, treat as loss.
if (isset($_POST['winValue']) && is_numeric($_POST['winValue']) && $_POST['winValue'] > 0) {
    // Win scenario: store winningSpin in winning_number and leave lose_number as NULL
    $winning_number = $winningSpin;
    $win_value = $winValue;
    $lose_number = NULL;
} else {
    // Loss scenario: store winningSpin in lose_number and leave winning_number as NULL
    $winning_number = NULL;
    $lose_number = $winningSpin;
    $win_value = NULL;
}

// Get the current timestamp in the format "2025-04-07 01:54:50"
$currentTimestamp = date('Y-m-d H:i:s');

// Prepare the insert query with created_at and updated_at columns.
$query = "INSERT INTO game_results (user_id, game_id, winning_number, lose_number, bet, win_value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
if ($stmt = mysqli_prepare($conn, $query)) {
    /*  
        Bind parameters:
        - user_id: integer
        - game_id: integer
        - winning_number: integer (or NULL)
        - lose_number: integer (or NULL)
        - bet: decimal (we use double for binding)
        - win_value: decimal (or NULL)
        - created_at: string (current timestamp)
        - updated_at: string (current timestamp)
        
        The binding types string is updated to "iiiiddss":
        i = integer (user_id)
        i = integer (game_id)
        i = integer (winning_number)
        i = integer (lose_number)
        d = double (betTotal)
        d = double (win_value)
        s = string (created_at)
        s = string (updated_at)
    */
    
    mysqli_stmt_bind_param($stmt, "iiiiddss", $user_id, $game_id, $winning_number, $lose_number, $betTotal, $win_value, $currentTimestamp, $currentTimestamp);

    if (mysqli_stmt_execute($stmt)) {
        echo json_encode(["success" => true, "message" => "Game result recorded successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to record game result."]);
    }
    mysqli_stmt_close($stmt);
} else {
    echo json_encode(["success" => false, "message" => "Database error."]);
}
?>
