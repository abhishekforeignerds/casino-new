<?php
require __DIR__ . '/vendor/autoload.php';

use Picqer\Barcode\BarcodeGeneratorPNG;

// 0) Turn off HTML error‐display and route everything through JSON:
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
error_reporting(E_ALL);
header('Content-Type: application/json');

// 0a) Convert PHP errors/warnings to exceptions
set_error_handler(function($severity, $message, $file, $line) {
    throw new ErrorException($message, 0, $severity, $file, $line);
});

// 0b) Catch any fatal at shutdown
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
    // 1) Bootstrap
    include '../db.php';  // adjust path to your database connection

    // 2) Grab & validate inputs
    $withdrawTimeRaw = $_POST['withdrawTime'] ?? null;
    $ntrack          = array_key_exists('n', $_POST) ? intval($_POST['n']) : null;

    if (!$withdrawTimeRaw) {
        http_response_code(422);
        throw new Exception('withdrawTime is required.', 422);
    }
    if ($ntrack === null) {
        http_response_code(422);
        throw new Exception('ntrack (n) is required.', 422);
    }

    // 3) Normalize withdrawTime (expects "H:i:s" or similar)
    $currentDate = date('Y-m-d');
    $ts = strtotime("$currentDate $withdrawTimeRaw");
    if ($ts === false) {
        http_response_code(422);
        throw new Exception('withdrawTime format is invalid.', 422);
    }
    $withdrawTime = date('Y-m-d H:i:s', $ts);

    // 4) Sum existing bets
    $sqlSum = "
        SELECT SUM(bet_amount) AS total_bet
          FROM total_bet_history
         WHERE withdraw_time = ?
           AND ntrack = ?
    ";
    $stmt = $conn->prepare($sqlSum);
    if (! $stmt) {
        http_response_code(500);
        throw new Exception('SUM prepare failed: ' . $conn->error, 500);
    }
    $stmt->bind_param('si', $withdrawTime, $ntrack);
    $stmt->execute();
    $stmt->bind_result($totalBet);
    $stmt->fetch();
    $stmt->close();
    $totalBet = $totalBet ?: 0.0;

    // Defaults (will be overridden if a random row exists)
    $user_id   = 1;        // TODO: replace with actual user_id
    $game_id   = 1;        // TODO: replace with actual game_id
    $card_type = 'pc';     // TODO: replace with actual card_type

    // Pick a random historical bet to override defaults
    $sqlPick = "
      SELECT user_id, game_id, card_type
        FROM total_bet_history
       WHERE withdraw_time = ?
         AND ntrack = ?
       ORDER BY RAND()
       LIMIT 1
    ";
    $pick = $conn->prepare($sqlPick)
        ?: throw new Exception('RANDOM‑ROW prepare failed: '.$conn->error, 500);
    $pick->bind_param('si', $withdrawTime, $ntrack);
    $pick->execute();
    $pick->bind_result($u, $g, $c);
    if ($pick->fetch()) {
        $user_id   = $u;
        $game_id   = $g;
        $card_type = $c;
    }
    $pick->close();

$sql = "
SELECT card_type, bet_amount
  FROM total_bet_history
 WHERE withdraw_time = ?
   AND ntrack = ?
   AND card_bet_amounts IS NULL
";


$stmt = $conn->prepare($sql);
if (!$stmt) {
    http_response_code(500);
    throw new Exception('Prepare failed: ' . $conn->error, 500);
}

$stmt->bind_param('si', $withdrawTime, $ntrack);
$stmt->execute();
$stmt->bind_result($cardType, $betAmount);

$cardBets = [];
while ($stmt->fetch()) {
    $cardBets[$cardType] = $betAmount;
}

$stmt->close();

// Convert to JSON
$cardBetJson = json_encode($cardBets);

// Optional: Output or use as needed
// echo $cardBetJson;

    // 5) Delete old detail rows
    $sqlDel = "
        DELETE FROM total_bet_history
         WHERE withdraw_time = ?
           AND ntrack = ?
            AND card_bet_amounts IS NULL
    ";
    $del = $conn->prepare($sqlDel);
    if (! $del) {
        http_response_code(500);
        throw new Exception('DELETE prepare failed: ' . $conn->error, 500);
    }
    $del->bind_param('si', $withdrawTime, $ntrack);
    $del->execute();
    $deletedRows = $del->affected_rows;
    $del->close();

    // 6) Lookup retailer_id for this user
    $sqluser = "
      SELECT retailer_id
        FROM user
       WHERE id = ?
       LIMIT 1
    ";
    $ustmt = $conn->prepare($sqluser)
        ?: throw new Exception('RETAILER lookup prepare failed: '.$conn->error, 500);
    $ustmt->bind_param('i', $user_id);
    $ustmt->execute();
    $ustmt->bind_result($retailer_id);
    if (!$ustmt->fetch()) {
        // If no retailer found, you could default or throw—here we default to NULL
        $retailer_id = null;
    }
    $ustmt->close();

    // Generate identifiers
    $now           = date('Y-m-d H:i:s');
   $serial_number = strval(mt_rand(100000000, 999999999)); // 9-digit number

    // 7) Insert into tickets
    $sqlTickets = "
        INSERT INTO tickets 
            (user_id, serial_number, bar_code_scanner, amount, card_name, retailer_id, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ";
    $ticketStmt = $conn->prepare($sqlTickets);
    if (! $ticketStmt) {
        http_response_code(500);
        throw new Exception('TICKETS INSERT prepare failed: ' . $conn->error, 500);
    }

    // We'll bind a placeholder for bar_code_scanner; update it after generating the image
    $dummyPath = '';
    $ticketStmt->bind_param(
        'ississss',
        $user_id,
        $serial_number,
        $dummyPath,
        $totalBet,
        $card_type,
        $retailer_id,
        $now,
        $now
    );
    if (! $ticketStmt->execute()) {
        throw new Exception('TICKETS INSERT execute failed: ' . $ticketStmt->error, 500);
    }
    $ticketId = $ticketStmt->insert_id;
    $ticketStmt->close();


    // 8) Generate and save barcode PNG
    $barcodeGenerator = new BarcodeGeneratorPNG();
    $barcodeData = $barcodeGenerator->getBarcode($serial_number, $barcodeGenerator::TYPE_CODE_39);

    // Ensure barcodes directory exists
    $barcodeDir = __DIR__ . '/barcodes';
    if (! file_exists($barcodeDir)) {
        mkdir($barcodeDir, 0755, true);
    }

    $filename = $serial_number . '.png';
    $fullPath = $barcodeDir . '/' . $filename;
    file_put_contents($fullPath, $barcodeData);

    // Relative path to store in DB
    $relativePath = 'barcodes/' . $filename;

    // 9) Update the ticket with the correct barcode path
    $updateSql = "UPDATE tickets SET bar_code_scanner = ? WHERE id = ?";
    $up = $conn->prepare($updateSql);
    if (! $up) {
        throw new Exception('UPDATE barcode path prepare failed: ' . $conn->error, 500);
    }
    $up->bind_param('si', $relativePath, $ticketId);
    if (! $up->execute()) {
        throw new Exception('UPDATE barcode path execute failed: ' . $up->error, 500);
    }
    $up->close();

    // 10) Re‑insert aggregated record into total_bet_history
    $sqlIns = "
        INSERT INTO total_bet_history
            (user_id, game_id, card_type, bet_amount, withdraw_time,card_bet_amounts, ntrack, ticket_serial, created_at, updated_at)
        VALUES (?,       ?,       ?,         ?,          ?,            ?, ?, ?,      ?,          ?)
    ";
    $ins = $conn->prepare($sqlIns);
    if (! $ins) {
        http_response_code(500);
        throw new Exception('INSERT history prepare failed: ' . $conn->error, 500);
    }
    $ins->bind_param(
        'iisdssiiss',
        $user_id,
        $game_id,
        $card_type,
        $totalBet,
        $withdrawTime,
        $cardBetJson,
        $ntrack,
        $serial_number,
        $now,
        $now
    );
    if (! $ins->execute()) {
        throw new Exception('INSERT history execute failed: ' . $ins->error, 500);
    }

// Step 1: Get current points
$sqlGetPoints = "SELECT points FROM user WHERE id = ?";
$stmt = $conn->prepare($sqlGetPoints);
if (! $stmt) {
    http_response_code(500);
    throw new Exception('SELECT points prepare failed: ' . $conn->error, 500);
}
$stmt->bind_param('i', $user_id);
$stmt->execute();
$result = $stmt->get_result();
if ($result->num_rows === 0) {
    throw new Exception('User not found.', 404);
}
$row = $result->fetch_assoc();
$currentPoints = $row['points'];

// Step 2: Subtract totalBet
$newPoints = $currentPoints - $totalBet;

// Step 3: Update points
$sqlUpdatePoints = "UPDATE user SET points = ? WHERE id = ?";
$updateStmt = $conn->prepare($sqlUpdatePoints);
if (! $updateStmt) {
    http_response_code(500);
    throw new Exception('UPDATE points prepare failed: ' . $conn->error, 500);
}
$updateStmt->bind_param('di', $newPoints, $user_id);
if (! $updateStmt->execute()) {
    throw new Exception('UPDATE points execute failed: ' . $updateStmt->error, 500);
}

    // 11) Success response
    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'data'   => [
            'insertedId'  => $ins->insert_id,
            'ticketId'    => $ticketId,
            'serial'      => $serial_number,
            'barcodePath' => $relativePath,
            'totalBet'    => $totalBet,
            'totalBet'    => $totalBet,
            'deletedRows' => $deletedRows
        ]
    ]);
    $ins->close();
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
