<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include '../db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status'=> 'error', 'message'=>'Not logged in']);
    exit;
}

// read JSON

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

$user_id = $_SESSION['user_id'];

$winsSql = "
    SELECT 
        COALESCE(SUM(claim_point), 0) AS total_claim,
        COALESCE(SUM(unclaim_point), 0) AS total_unclaim
    FROM claim_point_data
    WHERE user_id = $user_id
";
$winsResult = mysqli_query($conn, $winsSql);
if (! $winsResult) {
    throw new Exception('Claim point query failed: ' . mysqli_error($conn));
}
$winsRow = mysqli_fetch_assoc($winsResult);

// Total win is the sum of both claim_point and unclaim_point
$totalClaim = (float) $winsRow['total_claim'];
$totalUnclaim = (float) $winsRow['total_claim'];


if($winsRow){
    // Total win is the sum of both claim_point and unclaim_point
    $totalClaim = (float) $winsRow['total_claim'];
    $totalUnclaim = (float) $winsRow['total_claim'];
    echo json_encode(['status'=>'success', 'totalClaim'=> (int)$totalClaim, 'totalUnclaim'=>(int)$totalUnclaim]);
} else {
    echo json_encode(['status'=>'error', 'message'=>'User not found']);
}
