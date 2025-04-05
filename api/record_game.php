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

// Prepare the insert query
$query = "INSERT INTO game_results (user_id, game_id, winning_number, lose_number, bet, win_value) VALUES (?, ?, ?, ?, ?, ?)";
if ($stmt = mysqli_prepare($conn, $query)) {
    /*
      Bind parameters:
      - user_id: integer
      - game_id: integer
      - winning_number: integer (or NULL)
      - lose_number: integer (or NULL)
      - bet: decimal (we use double for binding)
    */
    
    // Using "iiidi" as type string: i=user_id, i=game_id, i=winning_number, i=lose_number, d=betTotal
    // For NULL values, mysqli will bind them correctly.
    mysqli_stmt_bind_param($stmt, "iiiidd", $user_id, $game_id, $winning_number, $lose_number, $betTotal, $win_value);

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
