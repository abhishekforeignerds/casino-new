<?php
session_start();
include '../db.php'; // Database connection ($conn)

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// Convert PHP errors/exceptions into JSON
ini_set('display_errors', '0');
error_reporting(E_ALL);
set_error_handler(function($sev, $msg, $file, $line) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'type' => 'PHP Error', 'message' => "$msg in $file on line $line"]);
    exit;
});
set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'type' => 'Exception', 'message' => $e->getMessage()]);
    exit;
});

$user_id = $_SESSION['user_id'];

// Parse JSON body
$input = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'type' => 'Bad JSON', 'message' => json_last_error_msg()]);
    exit;
}

// Validate
$withdrawTime = $input['withdrawTime'] ?? null;
if (!$withdrawTime) {
    http_response_code(422);
    echo json_encode(['status' => 'error', 'type' => 'Validation', 'message' => 'withdrawTime is required.']);
    exit;
}

// Combine with today's date
date_default_timezone_set('Asia/Kolkata');
$currentDate   = date('Y-m-d');
$fullTimestamp = date('Y-m-d H:i:s', strtotime("$currentDate $withdrawTime"));

// Get distinct indexes
$listSql = "
    SELECT DISTINCT choosenindex
    FROM overall_game_record
    WHERE withdraw_time = ?
";
$stmt = $conn->prepare($listSql);
$stmt->bind_param('s', $fullTimestamp);
$stmt->execute();
$result = $stmt->get_result();

$indexes = [];
while ($row = $result->fetch_assoc()) {
    $indexes[] = $row['choosenindex'];
}
$stmt->close();

if (empty($indexes)) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => "No records found for withdraw_time = $fullTimestamp"]);
    exit;
}

// Pick a random index
$randomIndex = $indexes[array_rand($indexes)];

// Fetch the selected record
$selectSql = "
    SELECT
        choosenindex,
        winningpoint,
        currentwinningPercentage,
        totalSaleToday,
        totalWinToday,
        winningPercentage,
        overrideChance,
        userwins,
        allSametxt,
        minvalue,
        withdraw_time
    FROM overall_game_record
    WHERE withdraw_time = ?
      AND choosenindex = ?
";
$stmt = $conn->prepare($selectSql);
$stmt->bind_param('si', $fullTimestamp, $randomIndex);
$stmt->execute();
$result = $stmt->get_result();
$record = $result->fetch_assoc();
$stmt->close();

if (!$record) {
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Record not found.']);
    exit;
}
// Insert into overall_gm_rec_cpy if not exists (only by withdraw_time)
// Insert into overall_gm_rec_cpy if not exists (only by withdraw_time)
$insertSql = "
    INSERT INTO overall_gm_rec_cpy (
        choosenindex,
        winningpoint,
        currentwinningPercentage,
        totalSaleToday,
        totalWinToday,
        winningPercentage,
        overrideChance,
        userwins,
        allSametxt,
        minvalue,
        withdraw_time
    )
    SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    FROM DUAL
    WHERE NOT EXISTS (
        SELECT 1
          FROM overall_gm_rec_cpy
         WHERE withdraw_time = ?
    )
";
$stmt = $conn->prepare($insertSql);

// Bind types: 
// 1: choosenindex (s)
// 2–7: six doubles (d × 6)
// 8: userwins (s)
// 9: allSametxt (s)
// 10: minvalue (s)
// 11: withdraw_time for INSERT (s)
// 12: withdraw_time for WHERE (s)
$stmt->bind_param(
    'sddddddsssss',
    $record['choosenindex'],
    $record['winningpoint'],
    $record['currentwinningPercentage'],
    $record['totalSaleToday'],
    $record['totalWinToday'],
    $record['winningPercentage'],
    $record['overrideChance'],
    $record['userwins'],
    $record['allSametxt'],
    $record['minvalue'],
    $record['withdraw_time'],   // INSERT
    $record['withdraw_time']    // WHERE
);

if ( ! $stmt->execute() ) {
    // Log the error
    error_log("overall_gm_rec_cpy insert failed: {$stmt->error}");
}



if (!$stmt->execute()) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Insert failed: ' . $stmt->error]);
    exit;
}
$stmt->close();

// Return the copied record
$selectSql = "
    SELECT *
    FROM overall_gm_rec_cpy
    WHERE withdraw_time = ? 
";
$stmt = $conn->prepare($selectSql);
$stmt->bind_param('s', $fullTimestamp);
$stmt->execute();
$result = $stmt->get_result();
$final = $result->fetch_assoc();
$stmt->close();

echo json_encode([
    'status' => 'success',
    'data'   => $final,
]);
?>
