<?php
require __DIR__ . '/vendor/autoload.php';

use Picqer\Barcode\BarcodeGeneratorPNG;

// Turn off HTML error display
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');
date_default_timezone_set('Asia/Kolkata');

// Convert PHP errors to exceptions
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// Catch fatal errors at shutdown
register_shutdown_function(function(){
    $err = error_get_last();
    if ($err && !headers_sent()) {
        http_response_code(500);
        echo json_encode([
            'status'  => 'error',
            'type'    => 'Fatal',
            'message' => $err['message']
        ]);
    }
});

try {
    // Include DB connection
    include '../db.php';

    // Input validation
    $withdrawTimeRaw = $_POST['withdrawTime'] ?? null;
    $ntrack = isset($_POST['n']) ? intval($_POST['n']) : null;
    $user_id = $_SESSION['user_id'] ?? null;

    if (!$withdrawTimeRaw) {
        http_response_code(422);
        throw new Exception('withdrawTime is required.', 422);
    }
    if ($ntrack === null) {
        http_response_code(422);
        throw new Exception('ntrack (n) is required.', 422);
    }


    // Normalize withdrawTime
    $currentDate = date('Y-m-d');
    $ts = strtotime("$currentDate $withdrawTimeRaw");
    if ($ts === false) {
        http_response_code(422);
        throw new Exception('withdrawTime format is invalid.', 422);
    }
    $withdrawTime = date('Y-m-d H:i:s', $ts);
    $sumSql = "SELECT SUM(bet_amount) AS null_bet_sum FROM total_bet_history WHERE card_bet_amounts IS NULL";
    $sumStmt = $conn->prepare($sumSql);
    if (!$sumStmt) {
        http_response_code(500);
        throw new Exception('SUM prepare failed: ' . $conn->error, 500);
    }
    $sumStmt->execute();
    $sumStmt->bind_result($nullBetSum);
    $sumStmt->fetch();
    $sumStmt->close();

    // Delete old rows with NULL bet amounts
    $sqlDel = "DELETE FROM total_bet_history WHERE card_bet_amounts IS NULL";
    $del = $conn->prepare($sqlDel);
    if (!$del) {
        http_response_code(500);
        throw new Exception('DELETE prepare failed: ' . $conn->error, 500);
    }

    $del->execute();
    $deletedRows = $del->affected_rows;
    $del->close();

    // Get sum of today's bets (with valid amounts)
    $stmt = $conn->prepare("
        SELECT SUM(bet_amount) AS total_bet 
        FROM total_bet_history 
        WHERE user_id = ? AND DATE(created_at) = CURDATE() AND card_bet_amounts IS NOT NULL
    ");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($bettingPoints);
    $stmt->fetch();
    $stmt->close();

    // Get user wallet points
    $stmt = $conn->prepare("SELECT points FROM user WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($points);
    $stmt->fetch();
    $stmt->close();

    // Final response
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'data'   => [
            'deletedRows'    => $deletedRows,
            'bettingPoints'  => $bettingPoints,
              'nullBetSum'     => $nullBetSum,
            'points'         => $points,
        ]
    ]);

    $conn->close();
}
catch (ErrorException $e) {
    $code = $e->getCode() >= 400 ? $e->getCode() : 500;
    http_response_code($code);
    echo json_encode([
        'status'  => 'error',
        'type'    => 'PHP',
        'message' => $e->getMessage()
    ]);
}
catch (Exception $e) {
    $code = $e->getCode() >= 400 ? $e->getCode() : 500;
    http_response_code($code);
    echo json_encode([
        'status'  => 'error',
        'type'    => $code < 500 ? 'Validation' : 'Database',
        'message' => $e->getMessage()
    ]);
}
