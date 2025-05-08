<?php
// Force JSON responses
header('Content-Type: application/json; charset=utf-8');

// Turn off HTML errors
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Convert PHP errors/exceptions into JSON
set_error_handler(function($sev, $msg, $file, $line) {
    http_response_code(500);
    echo json_encode([
        'status'  => 'error',
        'type'    => 'PHP Error',
        'message' => "$msg in $file on line $line"
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

// Include DB connection (defines $conn)
include '../db.php';

// Read JSON body
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

// Validate
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

// Combine with today’s date
$currentDate   = date('Y-m-d');
$fullTimestamp = date('Y-m-d H:i:s', strtotime("$currentDate $withdrawTime"));

$salesSql    = "
    SELECT COALESCE(SUM(amount), 0) AS total_sales
    FROM user_points_sales
    WHERE DATE(created_at) = CURDATE()
";
$salesResult = mysqli_query($conn, $salesSql);
if (! $salesResult) {
    throw new Exception('Sales query failed: ' . mysqli_error($conn));
}
$salesRow     = mysqli_fetch_assoc($salesResult);
$totalSaleToday   = (float) $salesRow['total_sales'];

$winsSql    = "
    SELECT COALESCE(SUM(win_value), 0) AS total_wins
    FROM game_results
    WHERE DATE(created_at) = CURDATE()
";
$winsResult = mysqli_query($conn, $winsSql);
if (! $winsResult) {
    throw new Exception('Sales query failed: ' . mysqli_error($conn));
}
$winsRow     = mysqli_fetch_assoc($winsResult);
$totalWinToday   = (float) $winsRow['total_wins'];

if ($totalSaleToday > 0) {
    $currentwinningPercentage = ($totalWinToday / $totalSaleToday) * 100;
} else {
    $currentwinningPercentage = 0; // avoid division by zero
}




$gameSettingsSql    = "SELECT winning_percentage, override_chance FROM games WHERE id = 1";
$gameSettingsResult = mysqli_query($conn, $gameSettingsSql);
if (!$gameSettingsResult) {
    throw new Exception('Query failed: ' . mysqli_error($conn));
}
$gameSettings = mysqli_fetch_assoc($gameSettingsResult);
if (!$gameSettings) {
    throw new Exception('No game settings found for game ID 1');
}

$winningPercentage = (float)$gameSettings['winning_percentage'];
$overrideChance = (float)$gameSettings['override_chance'];

// Prepare your history query
$sql = "
  SELECT
    user_id,
    card_type,
    SUM(bet_amount) AS total_bet_amount,
    DATE_FORMAT(withdraw_time, '%H:%i:%s') AS withdraw_time
  FROM total_bet_history
  WHERE withdraw_time = ?
  GROUP BY user_id, card_type, withdraw_time
  ORDER BY user_id, card_type
";
$stmt = mysqli_prepare($conn, $sql)
    or throw new Exception('Prepare failed: ' . mysqli_error($conn));

mysqli_stmt_bind_param($stmt, 's', $fullTimestamp);
mysqli_stmt_execute($stmt)
    or throw new Exception('Execute failed: ' . mysqli_stmt_error($stmt));

$result = mysqli_stmt_get_result($stmt);
$rows   = [];
while ($row = mysqli_fetch_assoc($result)) {
    $rows[] = $row;  // now an associative array
}

// Build unique card types
$uniqueCardTypes = [];
foreach ($rows as $row) {
    $ct = (int)$row['card_type'];
    $uniqueCardTypes[$ct] = true;
}
$uniqueCardTypes = array_keys($uniqueCardTypes);

// Decide chosen index
$allPresent = true;
for ($i = 0; $i <= 11; $i++) {
    if (!in_array($i, $uniqueCardTypes, true)) {
        $allPresent = false;
        break;
    }
}

$choosenindex = null;
if ($allPresent) {
    // pick the card_type 0–11 with the lowest total_bet_amount
    $minAmount = null;
    foreach ($rows as $row) {
        $ct  = (int)$row['card_type'];
        $amt = (float)$row['total_bet_amount'];
        if ($ct >= 0 && $ct <= 11 && ($minAmount === null || $amt < $minAmount)) {
            $minAmount    = $amt;
            $choosenindex = $ct;
        }
    }
} else {
    // just take the first one you saw
    $choosenindex = $uniqueCardTypes[0] ?? null;
}
if($allPresent) {
    $userwins = 'yes';
} else {
    $userwins = 'no';
}
$userwins = 'random';

// Return JSON
echo json_encode([
    'status'       => 'success',
    'data'         => $rows,
   'meta'   => [
        'choosenindex'            => $choosenindex,
        'currentwinningPercentage'=> $currentwinningPercentage,
        'totalSaleToday'          => $totalSaleToday,
        'totalWinToday'          => $totalWinToday,
        'winningPercentage'       => $winningPercentage,
        'overrideChance'          => $overrideChance,
        'userwins'                => $userwins,
    ],
]);
