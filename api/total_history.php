<?php
// 1) Force JSON responses only
header('Content-Type: application/json; charset=utf-8');

// 2) Disable PHP’s HTML error output
ini_set('display_errors', '0');
ini_set('display_startup_errors', '0');
error_reporting(E_ALL);

// 3) Convert errors & exceptions into JSON
set_error_handler(function($severity, $message, $file, $line) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'type'    => 'PHP Error',
        'message' => "{$message} in {$file} on line {$line}"
    ]);
    exit;
});
set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'type'    => 'Exception',
        'message' => $e->getMessage(),
    ]);
    exit;
});

// 4) Include your DB connection (must define $conn)
include '../db.php';
// db.php should do something like:
//   $conn = mysqli_connect('localhost','dbuser','dbpass','dbname');
//   if (!$conn) { die(json_encode([...error...])); }

// 5) Read & validate input
$input = json_decode(file_get_contents('php://input'), true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'type'    => 'Bad JSON',
        'message' => json_last_error_msg()
    ]);
    exit;
}

// Pull in fields
$userId       = isset($input['userId'])       ? (int)$input['userId'] : null;
$gameId       = isset($input['gameId'])       ? (int)$input['gameId'] : 1;
$betKey       = $input['identifier'] ?? null;    // “identifier” from JS
$amount       = isset($input['amount'])       ? (float)$input['amount'] : null;
$withdrawTime = $input['withdrawTime'] ?? null;

if (!$withdrawTime) {
    http_response_code(422);
    echo json_encode([
        'status'  => 'error',
        'type'    => 'Validation',
        'message' => 'withdrawTime is required.'
    ]);
    exit;
}

// Combine current date with input time
$currentDate = date('Y-m-d');
$withdrawTime = date('Y-m-d H:i:s', strtotime("$currentDate $withdrawTime"));

// Basic validation
if (!$userId || !$amount || !$withdrawTime) {
    http_response_code(422);
    echo json_encode([
        'status'  => 'error',
        'type'    => 'Validation',
        'message' => 'userId, identifier, amount and withdrawTime are all required.'
    ]);
    exit;
}

// 6) Prepare & execute INSERT with mysqli
$sql = "
    INSERT INTO total_bet_history
      (user_id, game_id, card_type, bet_amount, withdraw_time, created_at)
    VALUES
      (?, ?, ?, ?, ?, NOW())
";

if (!$stmt = mysqli_prepare($conn, $sql)) {
    throw new Exception('Prepare failed: ' . mysqli_error($conn));
}

mysqli_stmt_bind_param(
    $stmt,
    'iisss',          // i = integer, s = string
    $userId,
    $gameId,
    $betKey,
    $amount,
    $withdrawTime
);

if (!mysqli_stmt_execute($stmt)) {
    throw new Exception('Execute failed: ' . mysqli_stmt_error($stmt));
}

// 7) Grab the insert ID
$insertId = mysqli_insert_id($conn);

// 8) Return success JSON
echo json_encode([
    'status'   => 'success',
    'insertId' => $insertId,
]);
