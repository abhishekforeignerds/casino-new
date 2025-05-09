<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include '../db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status'=> 'error', 'message'=>'Not logged in']);
    exit;
}

// read JSON
$in = json_decode(file_get_contents('php://input'), true);
$user_id = $_SESSION['user_id'];

$sql = "SELECT auto_claim FROM user WHERE id = ?";
$stmt = mysqli_prepare($conn, $sql);
mysqli_stmt_bind_param($stmt, 'i', $user_id);
mysqli_stmt_execute($stmt);
mysqli_stmt_bind_result($stmt, $auto_claim);
if(mysqli_stmt_fetch($stmt)){
    echo json_encode(['status'=>'success', 'auto_claim'=>(int)$auto_claim]);
} else {
    echo json_encode(['status'=>'error', 'message'=>'User not found']);
}
