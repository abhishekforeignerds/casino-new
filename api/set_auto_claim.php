<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include '../db.php';
date_default_timezone_set('Asia/Kolkata');
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status'=> 'error', 'message'=>'Not logged in']);
    exit;
}

$in = json_decode(file_get_contents('php://input'), true);
$user_id    = $_SESSION['user_id'];
$newClaim   = isset($in['auto_claim']) ? (int)$in['auto_claim'] : null;

if (!in_array($newClaim, [0,1], true)) {
    echo json_encode(['status'=>'error','message'=>'Invalid value']);
    exit;
}

$sql = "UPDATE user SET auto_claim = ? WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'ii', $newClaim, $user_id);
if (mysqli_stmt_execute($stmt)) {
    echo json_encode(['status'=>'success']);
} else {
    echo json_encode(['status'=>'error','message'=>'DB Error: '.mysqli_error($conn)]);
}
