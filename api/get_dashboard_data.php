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

// assume $conn is your mysqli connection and $user_id is defined…

// 1) Fetch all of today’s claim_point_data for this user
$stmt2 = $conn->prepare("
    SELECT *
      FROM claim_point_data
     WHERE user_id      = ?
       AND DATE(created_at) = CURDATE()
     ORDER
        BY created_at DESC, id DESC
");
$stmt2->bind_param("i", $user_id);
$stmt2->execute();
$res2 = $stmt2->get_result();
$claim_list = $res2->fetch_all(MYSQLI_ASSOC);

// 2) Fetch today’s game_results that actually have a win_value > 0
$stmt1 = $conn->prepare("
    SELECT *
      FROM game_results
     WHERE user_id      = ?
       AND DATE(created_at) = CURDATE()
     ORDER BY created_at DESC, id DESC
");
$stmt1->bind_param("i", $user_id);
$stmt1->execute();
$res1 = $stmt1->get_result();
$game_results = $res1->fetch_all(MYSQLI_ASSOC);

// 3) Build a lookup from created_at → game_result row
$grByTimestamp = [];
foreach ($game_results as $gr) {
    // If there are multiple wins at the exact same timestamp,
    // you could push them into an array. Here we assume one‐to‐one.
    $grByTimestamp[$gr['created_at']] = $gr;
}
$stmt3 = $conn->prepare("
    SELECT *
      FROM total_bet_history
     WHERE user_id = ?
       AND DATE(created_at) = CURDATE()
       AND ticket_serial > 0
       AND withdraw_time  > NOW()
     ORDER BY id DESC
");
$stmt3->bind_param("i", $user_id);
$stmt3->execute();

$res3 = $stmt3->get_result(); // Corrected from $stmt2 to $stmt3
$bethistory = $res3->fetch_all(MYSQLI_ASSOC); 
// 4) Now merge, but matching by created_at instead of array index
$mapped = [];
foreach ($claim_list as $idx => $cpd) {
    $ts = $cpd['created_at'];

    if (isset($grByTimestamp[$ts])) {
        // We found a winning game_result at exactly the same timestamp
        $matchedGR = $grByTimestamp[$ts];
    } else {
        // No winning row for this timestamp → use a default “no‐win” template
        $matchedGR = [
            'id'         => 0,
            'user_id'    => $cpd['user_id'],
            'game_id'    => null,
            'winning_number' => null,
            'lose_number'    => null,
            'suiticonnum'    => null,
            'bet'            => 0.00,
            'win_value'      => 0,
            'created_at'     => null,
            'updated_at'     => null,
            // …and any other fields you expect from game_results
        ];
    }

    // Decide which “index” you want to display: if winning_number is null, use lose_number; else use winning_number
    if (empty($matchedGR['winning_number'])) {
        $index = $matchedGR['lose_number'];
    } else {
        $index = $matchedGR['winning_number'];
    }

    // Inject the game_result into the claim_row
    $cpd['game_result'] = $matchedGR;
    // Optionally store the computed “index” for your view:
    $cpd['display_index'] = $index;

    // Optionally assign a 1‐based serial number for UI
    $cpd['serial'] = $idx + 1;

    $mapped[] = $cpd;
}
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
    'grByTimestamp' => $grByTimestamp,
]);