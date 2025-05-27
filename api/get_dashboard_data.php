<?php
session_start();
header('Content-Type: application/json; charset=utf-8');
include '../db.php';
date_default_timezone_set('Asia/Kolkata');
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
    AND DATE(created_at) = CURDATE()
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


date_default_timezone_set('Asia/Kolkata');


// 1) Fetch today’s total_bet_history rows
$stmtTBH = $conn->prepare("
    SELECT *
      FROM total_bet_history
     WHERE user_id        = ?
       AND DATE(created_at) = CURDATE()
       AND ticket_serial  > 0
     ORDER BY id DESC
");
$stmtTBH->bind_param("i", $user_id);
$stmtTBH->execute();
$totalbethistory = $stmtTBH->get_result()->fetch_all(MYSQLI_ASSOC);

// 2) Fetch today’s game_results (all rows)
$stmtGR = $conn->prepare("
    SELECT *
      FROM game_results
     WHERE user_id        = ?
       AND DATE(created_at) = CURDATE()
     ORDER BY created_at DESC, id DESC
");
$stmtGR->bind_param("i", $user_id);
$stmtGR->execute();
$game_results = $stmtGR->get_result()->fetch_all(MYSQLI_ASSOC);

// 3) Index game_results by timestamp
$grByTimestamp = [];
foreach ($game_results as $gr) {
    $datetime = new DateTime($gr['created_at']);
    $datetime->modify('-2 minutes');
    $adjustedTimestamp = $datetime->format('Y-m-d H:i:s');

    $grByTimestamp[$adjustedTimestamp] = $gr;
}


// 4) Prepare your “no-match” stub
$defaultGR = [
    'id'             => 0,
    'user_id'        => null,    // will set per row below
    'game_id'        => null,
    'winning_number' => null,    // as requested
    'lose_number'    => 0,       // as requested
    'suiticonnum'    => null,
    'bet'            => 0.00,
    'win_value'      => 0,
    'created_at'     => null,
    'updated_at'     => null,
];

// 5) Map every bet_history → game_result (real or stub)
$mapped = [];
foreach ($totalbethistory as $idx => $bh) {
    $ts = $bh['withdraw_time'];

    if (isset($grByTimestamp[$ts])) {
        $matchedGR = $grByTimestamp[$ts];
    } else {
        // use stub, but keep correct user_id
        $defaultGR['user_id'] = $bh['user_id'];
        $matchedGR = $defaultGR;
    }

    // attach game_result
    $bh['game_result'] = $matchedGR;

    $mapped[] = $bh;
}


$stmtCL = $conn->prepare("
    SELECT *
      FROM claim_point_data
     WHERE user_id        = ?
       AND DATE(created_at) = CURDATE()
     ORDER BY created_at DESC, id DESC
");
$stmtCL->bind_param("i", $user_id);
$stmtCL->execute();
$claim_list = $stmtCL->get_result()->fetch_all(MYSQLI_ASSOC);

$claimBySerial = [];
foreach ($claim_list as $cl) {
    $claimBySerial[$cl['ticket_serial']] = $cl;
}

// 7) Inject claim_point / unclaim_point into each mapped row
foreach ($mapped as &$row) {
    $serial = $row['ticket_serial'];

    if (isset($claimBySerial[$serial])) {
        $row['claim_id']   = $claimBySerial[$serial]['id'];
        $row['claim_point']   = $claimBySerial[$serial]['claim_point'];
        $row['unclaim_point'] = $claimBySerial[$serial]['unclaim_point'];
    } else {
        // no matching claim_point_data → zero defaults
        $row['claim_point']   = 0;
        $row['unclaim_point'] = 0;
    }
}
unset($row);
// Now $mapped is an array of today's total_bet_history rows,
// each with a ['game_result'] array—either the real match or
// a stub where winning_number=null and lose_number=0.



$today = date('Y-m-d');  
$now   = date('Y-m-d H:i:s');  
$stmt3 = $conn->prepare("
    SELECT *
      FROM total_bet_history
     WHERE user_id         = ?
       AND DATE(created_at) = ?
       AND ticket_serial   >  0
       AND withdraw_time   >= ?
       AND card_bet_amounts IS NOT NULL
     ORDER BY id DESC
");
$stmt3->bind_param("iss", $user_id, $today, $now);
$stmt3->execute();
$bethistory = $stmt3->get_result()->fetch_all(MYSQLI_ASSOC);

echo json_encode([
    'status'       => 'success',
    'totalClaim'   => $totalClaim,
    'totalUnclaim' => $totalUnclaim,
    'mapped' => $mapped,
    'bethistory' => $bethistory,
    'claim_list' => $claim_list,
]);