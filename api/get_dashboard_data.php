<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include '../db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode([ 'status'=> 'error', 'message'=>'Not logged in' ]);
    exit;
}

// Read JSON body
$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode([
        'status'  => 'error',
        'type'    => 'Bad JSON',
        'message' => json_last_error_msg()
    ]);
    exit;
}

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

// Build full timestamp using Kolkata timezone
date_default_timezone_set('Asia/Kolkata');
$currentDate   = date('Y-m-d');
$fullTimestamp = date('Y-m-d H:i:s', strtotime("$currentDate $withdrawTime"));

$user_id = (int) $_SESSION['user_id'];

// Sum claim_point and unclaim_point
$sql = "
    SELECT 
        COALESCE(SUM(claim_point),   0) AS total_claim,
        COALESCE(SUM(unclaim_point), 0) AS total_unclaim
    FROM claim_point_data
    WHERE user_id = $user_id
";
$result = mysqli_query($conn, $sql);
if (! $result) {
    http_response_code(500);
    echo json_encode([
      'status'  => 'error',
      'message' => 'Database error: ' . mysqli_error($conn)
    ]);
    exit;
}

$row = mysqli_fetch_assoc($result);
$totalClaim   = (int) $row['total_claim'];
$totalUnclaim = (int) $row['total_unclaim'];

echo json_encode([
    'status'       => 'success',
    'totalClaim'   => $totalClaim,
    'totalUnclaim' => $totalUnclaim
]);