<?php
session_start();
include '../db.php'; // Ensure this file sets up your database connection (e.g., $conn)
if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "message" => "User not logged in."]);
    exit;
}
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
$user_id = $_SESSION['user_id'];
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

// $salesSql    = "
//     SELECT COALESCE(SUM(amount), 0) AS total_sales
//     FROM user_points_sales
//     WHERE DATE(created_at) = CURDATE()
// ";
// $salesResult = mysqli_query($conn, $salesSql);
// if (! $salesResult) {
//     throw new Exception('Sales query failed: ' . mysqli_error($conn));
// }
// $salesRow     = mysqli_fetch_assoc($salesResult);
// $totalSaleToday   = (float) $salesRow['total_sales'];

// $winsSql    = "
//     SELECT COALESCE(SUM(win_value), 0) AS total_wins
//     FROM game_results
//     WHERE DATE(created_at) = CURDATE()
// ";
// $winsResult = mysqli_query($conn, $winsSql);
// if (! $winsResult) {
//     throw new Exception('Sales query failed: ' . mysqli_error($conn));
// }
// $winsRow     = mysqli_fetch_assoc($winsResult);
// $totalWinToday   = (float) $winsRow['total_wins'];


$salesSql = "
    SELECT COALESCE(SUM(amount), 0) AS total_balance
    FROM user_points_sales
    WHERE user_id = $user_id
";
$salesResult = mysqli_query($conn, $salesSql);
if (! $salesResult) {
    throw new Exception('Balance query failed: ' . mysqli_error($conn));
}
$salesRow = mysqli_fetch_assoc($salesResult);
$totalSaleToday = (float) $salesRow['total_balance'];


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
$totalWinToday = (float) $winsRow['total_claim'] + (float) $winsRow['total_unclaim'];


if ($totalSaleToday > 0) {
    $currentwinningPercentage = ($totalWinToday / $totalSaleToday) * 100;
} else {
    $currentwinningPercentage = 0;
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
    card_bet_amounts,
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
// Build unique card types with aggregated amounts
$uniqueCardTypes = [];

foreach ($rows as $row) {
    $bets = json_decode($row['card_bet_amounts'], true);
    if (!is_array($bets)) {
        continue;
    }
    foreach ($bets as $type => $amt) {
        $ct     = (int) $type;
        $amount = (float) $amt;
        if (!isset($uniqueCardTypes[$ct])) {
            $uniqueCardTypes[$ct] = 0.0;
        }
        $uniqueCardTypes[$ct] += $amount;
    }
}

$allIndexes      = range(0, 11);
$excluded        = array_keys($uniqueCardTypes);
$availableIndexes = array_diff($allIndexes, $excluded);

$choosenindex = null;
$userwins     = null;
$allPresent   = false;
$allSame      = false;
$minvalue;


$conditionTaken = '';

// Case A: No data at all
if (empty($uniqueCardTypes)) {
    $choosenindex     = rand(0, 11);
    $userwins         = 'no';
    $conditionTaken   = sprintf(
        'Case A (no data): winningPercentage=%s, currentwinningPercentage=%s',
        $winningPercentage,
        $currentwinningPercentage
    );

// Case B: We have some data
} else {
    // Check if every card 0–11 is present
    $allPresent = (count($uniqueCardTypes) === 12);

    if ($allPresent) {
        $amounts  = array_values($uniqueCardTypes);
        $allSame  = (count(array_unique($amounts)) === 1);

        if ($allSame) {
            // all amounts equal → random pick among 0–11
            $choosenindex   = rand(0, 11);
            $conditionTaken = sprintf(
                'Case B1 (allPresent & allSame): winning=%s, current=%s',
                $winningPercentage,
                $currentwinningPercentage
            );
        } else {
            // pick the card_type key that has the minimum amount
            $minAmount     = min($amounts);
            $typesWithMin  = array_keys($uniqueCardTypes, $minAmount, true);
            $choosenindex  = $typesWithMin[array_rand($typesWithMin)];
            $conditionTaken = sprintf(
                'Case B2 (allPresent & differing amounts – minAmount=%s): winning=%s, current=%s',
                $minAmount,
                $winningPercentage,
                $currentwinningPercentage
            );
        }

        // if we got here, user “wins”
        $userwins = 'yes';

    } else {
        // Not all cards are present
        if ($currentwinningPercentage < ($winningPercentage / 2)) {
            $choosenindex   = array_rand($uniqueCardTypes);
            $userwins       = 'yes';
            $conditionTaken = sprintf(
                'Case C1 (low current < half): winning=%s, current=%s',
                $winningPercentage,
                $currentwinningPercentage
            );

        } elseif (
            $currentwinningPercentage > ($winningPercentage / 2)
            && $currentwinningPercentage < ($winningPercentage - 10)
        ) {
            $choosenindex   = rand(0, 11);
            $userwins       = 'random';
            $conditionTaken = sprintf(
                'Case C2 (mid-range current): winning=%s, current=%s',
                $winningPercentage,
                $currentwinningPercentage
            );

        } elseif (
            $currentwinningPercentage > ($winningPercentage - 10)
            && $currentwinningPercentage < $winningPercentage
        ) {
            // pick a random from those already present
            $choosenindex   = array_rand($uniqueCardTypes);
            $userwins       = 'yes';
            $conditionTaken = sprintf(
                'Case C3 (approaching win threshold): winning=%s, current=%s',
                $winningPercentage,
                $currentwinningPercentage
            );

        } elseif ($currentwinningPercentage > $winningPercentage) {
            // pick from the missing ones, if any
            if (!empty($availableIndexes)) {
                $choosenindex = $availableIndexes[array_rand($availableIndexes)];
            }
            $userwins       = 'no';
            $conditionTaken = sprintf(
                'Case C4 (current > winning): winning=%s, current=%s, userwins=%s,choosenindex=%s',
                $winningPercentage,
                $currentwinningPercentage,
                $userwins,
                $choosenindex,
            );
        }
    }
}


// Finally, compute the “allSametxt” and “minvalue” only if we have data:
if (!empty($uniqueCardTypes)) {
    if ($allSame) {
        $allSametxt = 'yes';
        // there is no “min” because they’re all equal; pick any
        $minvalue = array_keys($uniqueCardTypes)[0];
    } else {
        $allSametxt = 'no';
        // the minimum key
         $amounts = array_values($uniqueCardTypes);
         $minAmount     = min($amounts);
        // Get all card types with the minimum amount
        $typesWithMin  = array_keys($uniqueCardTypes, $minAmount, true);

        // Pick one at random instead of always taking the first
        if ($userwins == 'no') {
           
            $choosenindex  = $choosenindex;
            $minvalue      = $choosenindex ?? 0;
        } else {

            $choosenindex  = $typesWithMin[array_rand($typesWithMin)];
            $minvalue      = $choosenindex;
        }

    }
} else {
    // no data → set defaults
    $allSametxt = 'no';
    $minvalue   = 0;
}

// Now you have $choosenindex, $userwins, $allSametxt, $minvalue


    // Make sure $choosenindex and $user_id are integers (or cast them explicitly)
    $choosenindex = (int)$choosenindex;
    $user_id       = (int)$user_id;

    // Corrected SQL: only one WHERE, then AND
    $winningamountSql = "
    SELECT bet_amount
      FROM total_bet_history
     WHERE card_type = {$choosenindex}
       AND withdraw_time = '{$fullTimestamp}'
     LIMIT 1
";




    $winningamountResult = mysqli_query($conn, $winningamountSql);
    if (!$winningamountResult) {
        throw new Exception('Query failed: ' . mysqli_error($conn));
    }

    $row = mysqli_fetch_assoc($winningamountResult);
    // echo json_encode([
    //     'status'       => 'success',
    //     'data'         => [
    //         'row'=>$row,
    //         'winningamountSql'=>$winningamountSql,
    //     ],
    // ]);
    // exit;

    if (!$row) {
        $winningpoint = 0;
    } else {
        
        $winningpoint = $row['bet_amount'];
    }


$insertSql = "
    INSERT INTO overall_game_record (
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($insertSql);
$stmt->bind_param(
    'idddddsssss',
    $choosenindex,
    $winningpoint,
    $currentwinningPercentage,
    $totalSaleToday,
    $totalWinToday,
    $winningPercentage,
    $overrideChance,
    $userwins,
    $allSametxt,
    $minvalue,
    $fullTimestamp
);

if (!$stmt->execute()) {
    die("Insert failed: " . $stmt->error);
}

$stmt->close();
echo json_encode([
    'status'       => 'success',
    'data'         => $conditionTaken,
   
]);
