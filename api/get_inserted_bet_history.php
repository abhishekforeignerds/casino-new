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

// 1) Get distinct indexes already used today
$listSql = "
    SELECT DISTINCT choosenindex
    FROM overall_game_record
    WHERE withdraw_time = ?
";
$stmt = $conn->prepare($listSql);
if (! $stmt) {
    throw new Exception('Prepare failed (listSql): ' . $conn->error);
}
$stmt->bind_param('s', $fullTimestamp);
$stmt->execute();
$result = $stmt->get_result();

$indexes = [];
while ($row = $result->fetch_assoc()) {
    $indexes[] = $row['choosenindex'];
}
$stmt->close();



    // 3) Fetch that record
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
    ";
    $stmt = $conn->prepare($selectSql);
    if (! $stmt) {
        throw new Exception('Prepare failed (select B): ' . $conn->error);
    }
    $stmt->bind_param('s', $fullTimestamp);
    $stmt->execute();
    $result = $stmt->get_result();
    $record = $result->fetch_assoc();
    $stmt->close();

  

if (empty($indexes) || (! $record)) {
    // --- Branch A: first time for this timestamp ---

    // 2) Pick a random index 0–11
    $ci   = rand(0, 11);
    $wp   = 0.0;
    $cwp  = 75.0;
    $ts   = 0.0;
    $tw   = 0.0;
    $wpct = 75.0;
    $oc   = 0.3;
    $uw   = 'no';
    $ast  = 'no';
    $minv = 0;
    $wt1  = $fullTimestamp;
    $wt2  = $fullTimestamp;

    // 3) Insert into overall_gm_rec_cpy if not exists
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
    if (! $stmt) {
        throw new Exception('Prepare failed (insert A): ' . $conn->error);
    }
    $stmt->bind_param(
        'iddddddissss',
        $ci, $wp, $cwp, $ts, $tw, $wpct, $oc, $uw, $ast, $minv, $wt1, $wt2
    );
    if (! $stmt->execute()) {
        error_log("overall_gm_rec_cpy insert failed: " . $stmt->error);
    }
    $stmt->close();

} else {
    // --- Branch B: reuse an existing index record ---

    // 2) Pick one at random
    $randomIndex = $indexes[array_rand($indexes)];

    // 3) Fetch that record
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
    if (! $stmt) {
        throw new Exception('Prepare failed (select B): ' . $conn->error);
    }
    $stmt->bind_param('si', $fullTimestamp, $randomIndex);
    $stmt->execute();
    $result = $stmt->get_result();
    $record = $result->fetch_assoc();
    $stmt->close();

    if (! $record) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Record not found.']);
        exit;
    }

    // 4) Unpack record into variables
    $ci   = $record['choosenindex'];
    $wp   = $record['winningpoint'];
    $cwp  = $record['currentwinningPercentage'];
    $ts   = $record['totalSaleToday'];
    $tw   = $record['totalWinToday'];
    $wpct = $record['winningPercentage'];
    $oc   = $record['overrideChance'];
    $uw   = $record['userwins'];
    $ast  = $record['allSametxt'];
    $minv = $record['minvalue'];
    $wt1  = $record['withdraw_time'];
    $wt2  = $record['withdraw_time'];

    // 5) Insert into overall_gm_rec_cpy if not exists
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
    if (! $stmt) {
        throw new Exception('Prepare failed (insert B): ' . $conn->error);
    }
    $stmt->bind_param(
        'sddddddsssss',
        $ci, $wp, $cwp, $ts, $tw, $wpct, $oc, $uw, $ast, $minv, $wt1, $wt2
    );
    if (! $stmt->execute()) {
        error_log("overall_gm_rec_cpy insert failed: " . $stmt->error);
    }
    $stmt->close();
}

// 6) Finally, return the inserted/copied record
$selectSql = "
    SELECT *
    FROM overall_gm_rec_cpy
    WHERE withdraw_time = ?
";
$stmt = $conn->prepare($selectSql);
if (! $stmt) {
    throw new Exception('Prepare failed (final select): ' . $conn->error);
}
$stmt->bind_param('s', $fullTimestamp);
$stmt->execute();
$result = $stmt->get_result();
$final  = $result->fetch_assoc();
$stmt->close();

echo json_encode([
    'status' => 'success',
    'data'   => $final,
]);
