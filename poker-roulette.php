<?php
session_start();

// Restrict access if the user is not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: sign-in.php");
    exit();
}
include 'db.php'; // Database connection


$user_id = $_SESSION['user_id'];
$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1; // Adjust as needed
$stmt = $conn->prepare("SELECT 
SUM(claim_point) AS total_claim, 
SUM(unclaim_point) AS total_unclaim 
FROM claim_point_data 
WHERE user_id = ? AND DATE(created_at) = CURDATE()");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($totalClaim, $totalUnclaim);
$stmt->fetch();
$stmt->close();

$totalClaim = $totalClaim ?? 0;
$totalUnclaim = $totalUnclaim ?? 0;


// You must fetch this from DB or session


$stmt = $conn->prepare("SELECT SUM(win_value) AS total_win FROM game_results WHERE user_id = ? AND DATE(created_at) = CURDATE()");
$stmt->bind_param("i", $user_id);

$stmt->execute();
$stmt->bind_result($winningPoints);
$stmt->fetch();
$stmt->close();
$stmt = $conn->prepare("SELECT SUM(bet_amount) AS total_bet FROM total_bet_history WHERE user_id = ? AND DATE(created_at) = CURDATE()");
$stmt->bind_param("i", $user_id);

$stmt->execute();
$stmt->bind_result($bettingPoints);
$stmt->fetch();
$stmt->close();

// Ensure $winningPoints is at least 0 if null
$winningPoints = $winningPoints ?? 0;
$userId = $_SESSION['user_id'];

$stmt = $conn->prepare("SELECT points FROM user WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$stmt->bind_result($points);
$stmt->fetch();
$stmt->close();

$stmt = $conn->prepare("SELECT auto_claim FROM user WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$stmt->bind_result($autoClaim);
$stmt->fetch();
$stmt->close();

$game_id = 1;

$stmt = $conn->prepare("SELECT winning_percentage FROM user WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($winning_percentage);
$stmt->fetch();
$stmt->close();

$stmt = $conn->prepare("SELECT override_chance FROM user WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($override_chance);
$stmt->fetch();
$stmt->close();


$stmt = $conn->prepare("SELECT * FROM game_results WHERE user_id = ? AND game_id = 1 AND bet != 0");
$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

$gameResults = []; // Initialize empty array

while ($row = $result->fetch_assoc()) {
    $gameResults[] = $row; // Append each row to the array
}

$stmt->close();

if (isset($_GET['action']) && $_GET['action']==='getValues') {
    header('Content-Type: application/json');

    // Re-run exactly the same queries you did above to refresh each value:
    $user_id = $_SESSION['user_id'];

    // total wins
    $stmt = $conn->prepare("SELECT SUM(win_value) AS total_win FROM game_results WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute(); $stmt->bind_result($winningPoints); $stmt->fetch(); $stmt->close();
    $winningPoints = $winningPoints ?? 0;

    $stmt = $conn->prepare("SELECT SUM(win_value) AS total_win FROM game_results WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute(); $stmt->bind_result($winningPoints); $stmt->fetch(); $stmt->close();
    $winningPoints = $winningPoints ?? 0;

    $stmt = $conn->prepare("SELECT 
    SUM(claim_point) AS total_claim, 
    SUM(unclaim_point) AS total_unclaim 
FROM claim_point_data 
WHERE user_id = ? AND DATE(created_at) = CURDATE()");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($totalClaim, $totalUnclaim);
$stmt->fetch();
$stmt->close();

$totalClaim = $totalClaim ?? 0;
$totalUnclaim = $totalUnclaim ?? 0;

    // today’s bets
    $stmt = $conn->prepare("SELECT SUM(bet_amount) AS total_bet FROM total_bet_history WHERE user_id = ? AND DATE(created_at) = CURDATE()");
    $stmt->bind_param("i", $user_id);
    $stmt->execute(); $stmt->bind_result($bettingPoints); $stmt->fetch(); $stmt->close();

    // current balance
    $stmt = $conn->prepare("SELECT points, winning_percentage, override_chance FROM user WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $stmt->bind_result($points, $winning_percentage, $override_chance);
    $stmt->fetch();
    $stmt->close();

    // game results array
    $stmt = $conn->prepare("SELECT * FROM game_results WHERE user_id = ? AND game_id = 1 AND bet != 0");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $res = $stmt->get_result();
    $gameResults = [];
    while ($r = $res->fetch_assoc()) {
        $gameResults[] = $r;
    }
    $stmt->close();

    // any other variables
    $spinTimerDuration = intval($spinTimerDuration ?? 120);
    $maxBetamount      = intval($maxBetamount ?? 10000);

    // send it all back
    echo json_encode([
      'balance'           => intval($points),
      'winningPoints'     => intval($winningPoints),
      'bettingPoints'     => intval($bettingPoints),
      'winningPercentage' => floatval($winning_percentage),
      'overrideChance'    => floatval($override_chance),
      'spinTimerDuration' => $spinTimerDuration,
      'maxBetamount'      => $maxBetamount,
      'gameResults'       => $gameResults,
      'totalClaim'       => $totalClaim,
      'totalUnclaim'       => $totalUnclaim,
    ]);
    exit;
}


// Now $gameResults holds all the data



// Now $points contains the user's current points

?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Casino - Online Casino Platform</title>
    <link rel="icon" type="image/png" href="assets/images/favicon.png" sizes="16x16">
    <!-- bootstrap 5  -->
    <script>
    // PHP's time() returns seconds since Unix epoch.
    window.SERVER_TIMESTAMP = <?php echo time(); ?>;
    console.log('embedded SERVER_TIMESTAMP:', window.SERVER_TIMESTAMP);
  </script>
    <link rel="stylesheet" href="assets/css/lib/bootstrap.min.css">
    <!-- Icon Link  -->
    <link rel="stylesheet" href="assets/css/all.min.css">
    <link rel="stylesheet" href="assets/css/line-awesome.min.css">
    <link rel="stylesheet" href="assets/css/lib/animate.css">
    <script>
        let bankValue = <?php echo htmlspecialchars($_SESSION['points']); ?>;
    </script>
    <link href="./assets-normal/css/style.css" rel="stylesheet" type="text/css">
    <style>
        body {
            margin: 0px;
            padding: 0px;
            box-sizing: border-box;
        }

        div#container {
            margin: 10rem 2rem;
            height: 100vh;
        }

        #luck-thirty-six-time {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: radial-gradient(circle, #ff0000, #990000);
            color: white;
            font-size: 20px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }
    </style>
    <!-- Plugin Link -->
    <link rel="stylesheet" href="assets/css/lib/slick.css">

    <!-- Main css -->
    <link rel="stylesheet" href="assets/css/main.css">
</head>

<body data-bs-spy="scroll" data-bs-offset="170" data-bs-target=".privacy-policy-sidebar-menu"  style="height:100vh;">

    <div class="overlay"></div>
    <div class="preloader">
            <div class="scene" id="scene">
                <input type="checkbox" id="andicator" />
                <div class="cube">
                    <div class="cube__face cube__face--front"><i></i></div>
                    <div
                        class="cube__face cube__face--back"><i></i><i></i></div>
                    <div class="cube__face cube__face--right">
                        <i></i> <i></i> <i></i> <i></i> <i></i>
                    </div>
                    <div class="cube__face cube__face--left">
                        <i></i> <i></i> <i></i> <i></i> <i></i> <i></i>
                    </div>
                    <div class="cube__face cube__face--top">
                        <i></i> <i></i> <i></i>
                    </div>
                    <div class="cube__face cube__face--bottom">
                        <i></i> <i></i> <i></i> <i></i>
                    </div>
                </div>
            </div>
        </div>

    <style>
  /* Full‑page overlay */
 

</style>
<!-- Trigger Button -->


<!-- Full-screen, Scrollable Modal -->
<div
  class="modal fade"
  id="historyModal"
  tabindex="-1"
  aria-labelledby="historyModalLabel"
  aria-hidden="true"
>
  <div class="modal-dialog modal-fullscreen modal-dialog-scrollable" style="background: #350b2d;">
<div class="modal-content" style="
    background: #350b2d;
">
      <div class="modal-header">
        <h5 class="modal-title" id="historyModalLabel">History Log</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        style="color: #white;"></button>
      </div>
      <div class="modal-body">
      <?php

        ini_set('display_errors', '0');
error_reporting(E_ALL);
session_start();

// Restrict access if the user is not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: sign-in.php");
    exit();
}
include 'db.php'; // Database connection

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'claim_points') {
    header('Content-Type: application/json');
    $user_id = intval($_POST['user_id']);
    $claim_id = intval($_POST['claim_point_data_id']);

    // 1) fetch current unclaimed_point from claim_point_data
    $sql = "SELECT unclaim_point, claim_point FROM claim_point_data WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $claim_id);
    $stmt->execute();
    $stmt->bind_result($unclaimed, $already_claimed);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Claim record not found']);
        exit;
    }
    $stmt->close();

    if ($unclaimed <= 0) {
        echo json_encode(['success' => false, 'message' => 'No points left to claim']);
        exit;
    }

    // 2) update claim_point_data: add to claimed_point, zero out unclaimed_point
    $new_claimed = $already_claimed + $unclaimed;
    $sql = "UPDATE claim_point_data SET claim_point = ?, unclaim_point = 0 WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $new_claimed, $claim_id);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Failed updating claim data']);
        exit;
    }
    $stmt->close();

    // 3) fetch user’s existing points
    $sql = "SELECT points FROM user WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $stmt->bind_result($current_points);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    $stmt->close();

    // 4) update user’s points
    $new_points = $current_points + $unclaimed;
    $sql = "UPDATE user SET points = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $new_points, $user_id);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Failed updating user points']);
        exit;
    }
    $stmt->close();

    echo json_encode(['success' => true]);
    exit;
}

$user_id = $_SESSION['user_id'];
$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1; // Adjust as needed


$stmt = $conn->prepare("SELECT points FROM user WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($points);
$stmt->fetch();
$stmt->close();
$game_id = 1;

$stmt = $conn->prepare("SELECT retailer_id FROM user WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($retailer_id);
$stmt->fetch();
$stmt->close();




$stmt = $conn->prepare("SELECT * FROM user_points_claims WHERE from_id = ? ");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$user_points_claims = []; // Initialize empty array

while ($row = $result->fetch_assoc()) {
    $user_points_claims[] = $row; // Append each row to the array
}

$stmt->close();
// fetch winning game_results
$threshold = 0;
// 1) Fetch ALL wins
// $stmt1 = $conn->prepare("SELECT * FROM game_results WHERE win_value > 0 ORDER BY id ASC");
// $stmt1->execute();
// $res1 = $stmt1->get_result();
// $game_results = $res1->fetch_all(MYSQLI_ASSOC);

// // 2) Fetch ALL claim_point_data rows
// $stmt2 = $conn->prepare("SELECT * FROM claim_point_data ORDER BY id ASC");
// $stmt2->execute();
// $res2 = $stmt2->get_result();
// $claim_list  = $res2->fetch_all(MYSQLI_ASSOC);

// // 3) Merge by index
// $mapped = [];
// foreach ($game_results as $idx => $gr) {
//     // take the claim-data with the same zero-based index,
//     // or fall back to a “blank” if there’s no matching row
//     $cpd = $claim_list[$idx] ?? [
//         'id'            => 0,
//         'user_id'       => $gr['user_id'],
//         'claim_point'   => 0,
//         'unclaim_point' => 0,
//         'balance'       => 0,
//         'auto_claim'    => 0,
//         'created_at'    => null,
//         'updated_at'    => null,
//     ];

//     $gr['claim_point_data'] = $cpd;
//     $gr['serial']           = $idx + 1;  // serial starts at 1
//     $mapped[]               = $gr;
// }

// 1) Fetch ALL claim_point_data rows first
// 1) Fetch ALL claim_point_data rows for a specific user
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
       AND win_value   > 0
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
// echo '<pre>';
//                                 print_r($mapped[0]);die;
// echo '<pre>';
// print_r($mapped);die;
// $rows now holds each game_results row,
// with claim_point_data_* null for non‑winners

// $rows now contains one entry per game_results row.
// If win_value ≤ 0, all the cpd.* fields will be NULL.



    $stmt = $conn->prepare("SELECT SUM(bet_amount) AS total_bet FROM total_bet_history WHERE user_id = ? AND DATE(created_at) = CURDATE()");
$stmt->bind_param("i", $user_id);

$stmt->execute();
$stmt->bind_result($bettingPoints);
$stmt->fetch();
$stmt->close();

$stmt = $conn->prepare("SELECT * FROM game_results WHERE user_id = ? AND game_id = 1");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$gameResults = []; // Initialize empty array

while ($row = $result->fetch_assoc()) {
    $gameResults[] = $row; // Append each row to the array
}

$stmt->close();

$stmt = $conn->prepare("SELECT * FROM total_bet_history WHERE user_id = ? AND game_id = 1");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$total_bet_historys = [];
while ($row = $result->fetch_assoc()) {
    $total_bet_historys[] = $row;
}
$stmt->close();

// 2) Index mapped claim data by winning_number
$claimDataByNumber = [];
foreach ($mapped as $gameResult) {

    if($gameResult) {

        $num = $gameResult['winning_number'];
    } else {
         $num = 0;
    }
    $claimDataByNumber[$num] = $gameResult['claim_point_data'];
}

// 3) Merge all bets, defaulting unmatched entries to zero
$filteredBets = [];

foreach ($total_bet_historys as $bet) {
    // Determine lookup key (card_type matches winning_number)
    $key = $bet['card_type'];

    if (isset($claimDataByNumber[$key])) {
        $claim = $claimDataByNumber[$key];

        // populate from claim data
        $bet['claim_point']   = $claim['claim_point'];
        $bet['unclaim_point'] = $claim['unclaim_point'];
        $bet['id']            = $claim['id'];
        $bet['user_id']       = $claim['user_id'];
    } else {
        // default to zeros when no match
        $bet['claim_point']   = 0;
        $bet['unclaim_point'] = 0;
        $bet['id']            = 0;
        $bet['user_id']       = 0;
    }

    $filteredBets[] = $bet;
}


// now $filteredBets has only matching bets, each with claim_point & unclaim_point


// echo '<pre>';
// print_r($filteredBets);die;

    $stmt = $conn->prepare("SELECT 
    SUM(claim_point) AS total_claim, 
    SUM(unclaim_point) AS total_unclaim 
FROM claim_point_data 
WHERE user_id = ? AND DATE(created_at) = CURDATE()");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($totalClaim, $totalUnclaim);
$stmt->fetch();
$stmt->close();

$totalClaim = $totalClaim ?? 0;
$totalUnclaim = $totalUnclaim ?? 0;

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $amount = $totalUnclaim;
    $confirm = $totalUnclaim;
    if ($amount !== $confirm) {
        $error = 'Amounts do not match.';
    } elseif ($amount > $totalUnclaim) {
        $error = 'You do not have enough points to claim.';
    }
    else {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM user_points_claims WHERE user_id = ? AND DATE(created_at) = CURDATE()");
        $stmt->bind_param("i", $retailer_id);
        $stmt->execute();
        $stmt->bind_result($todayCount);
        $stmt->fetch();
        $stmt->close();
        
            do {
                $ref = '';
                $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                for ($i = 0; $i < 10; $i++) {
                    $ref .= $chars[random_int(0, strlen($chars) - 1)];
                }
                $stmt = $conn->prepare("SELECT COUNT(*) FROM user_points_claims WHERE reference_number = ?");
                $stmt->bind_param("s", $ref);
                $stmt->execute();
                $stmt->bind_result($refExists);
                $stmt->fetch();
                $stmt->close();
            } while ($refExists > 0);

            $now = date('Y-m-d H:i:s');
            $status = 'claimed';
            $stmt = $conn->prepare("INSERT INTO user_points_claims (from_id, user_id, amount, reference_number, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("iisssss", $user_id, $retailer_id, $amount, $ref, $status, $now, $now);
            if ($stmt->execute()) {
                  $updatePointsQuery = "UPDATE user SET points = points + ? WHERE id = ?";
                    $updateStmt = $conn->prepare($updatePointsQuery);
                    $updateStmt->bind_param("ii", $amount, $user_id);
                    $updateStmt->execute();

                    $deleteQuery = "DELETE FROM claim_point_data WHERE user_id = ? AND unclaim_point > 0";
    $deleteStmt = $conn->prepare($deleteQuery);
    $deleteStmt->bind_param("i", $user_id);
    $deleteStmt->execute();
                $success = 'Points claim requested successfully. Reference: ' . $ref;

            } else {
                $error = 'Database error. Please try again.';
            }
            $stmt->close();
        
    }
}
?>

<div class="dashboard-section padding-top padding-bottom">
            <div class="container">
                <div class="row">
                    <!-- <div class="col-lg-3">
                        <div class="dashboard-sidebar">
                            <div class="close-dashboard d-lg-none">
                                <i class="las la-times"></i>
                            </div>
                            <div class="dashboard-user">
                                <div class="user-thumb">
                                    <img src="assets/images/top/item1.png"
                                        alt="dashboard">
                                </div>
                                <div class="user-content">
                                    <span>Welcome</span>
                                    <h5 class="name">Munna Ahmed</h5>
                                    <h5 class="name">Your Balance <span style="color:#ffc124"><?php echo htmlspecialchars($points ?? 0); ?></span></h5>
                                    <h5 class="name">Claimed Points <span style="color:#ffc124"><?php echo htmlspecialchars($totalClaim ?? 0); ?></span></h5>
                                    <h5 class="name">Unclaimed Points <span style="color:#ffc124"><?php echo htmlspecialchars($totalUnclaim ?? 0); ?></span></h5>
                                    <ul class="user-option">
                                        <li>
                                            <a href="#0">
                                                <i class="las la-bell"></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#0">
                                                <i class="las la-pen"></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#0">
                                                <i class="las la-envelope"></i>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <ul class="user-dashboard-tab">
                                <li>
                                    <a href="dashboard.php"
                                        class="active">Dashboard</a>
                                </li>
                                <li>
                                    <a href="deposit-log.php">Deposit
                                        History</a>
                                </li>
                                <li>
                                    <a href="withdraw-log.php">Withdraw
                                        History</a>
                                </li>
                                <li>
                                    <a href="transection.php">Game
                                        History</a>
                                </li>
                                <li>
                                    <a href="profile.php">Account Settings</a>
                                </li>
                                <li>
                                    <a href="change-pass.php">Security
                                        Settings</a>
                                </li>
                                <li>
                                    <a href="#0">Sign Out</a>
                                </li>
                            </ul>
                        </div>
                    </div> -->
                    
                    <div class="table--responsive--md">

                        <table class="table" id="historytable">
                            <thead>
                                <tr>
                                    <th>Marker Card</th>
                                    <th>Ticket ID</th>
                                    <th>Bet Amount</th>
                                    <th>Win Value</th>
                                    <th>Claimed Points</th>
                                    <th>Unclaimed Points</th>
                                    <th>Status</th>
                                      <th>Withdraw Time</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody  id="historytablebody">
                                <?php foreach ($bethistory  as $result): ?>
                                 <tr class="table-history">
                                    <td data-label="Bet Amount">NA</td>
                                    <td data-label="Bet Amount">#<?= ($result['ticket_serial']) ?></td>
                                    <td data-label="Bet Amount">₹<?= number_format($result['bet_amount'], 2) ?></td>
                                    <td data-label="Win Value">NA</td>
                                    <td data-label="Claimed Points">NA</td>
                                    <td data-label="Unclaimed Points">NA</td>
                                    <td data-label="Unclaimed Points">  <small class="btn-sm btn-success">Bet Placed</small></td>
                                    <td data-label="Unclaimed Points"><?= ($result['withdraw_time']) ?? ''  ?></td>
                                      <td data-label="Unclaimed Points">  <small class="btn btn-success disabled">Unclaimable</small></td>
                                     <tr>
                                                          <?php endforeach; ?>
                            <?php foreach ($mapped as $result): 
                                $cpd = $result['claim_point_data'] ?? [
                                    'id'=>0, 'claim_point'=>0, 'unclaim_point'=>0
                                ];
                                // card to show
                               $win_value = ($result['unclaim_point'] == 0 && $result['claim_point'] == 0)
    ? 0
    : ($result['unclaim_point'] ? $result['unclaim_point'] : $result['claim_point']);

                                // status text
                                $userwins = $win_value > 0 ? 'Yes' : 'No';
                                
                            ?>
                                <tr class="table-history">
                                  
                                    <td class="image-tr d-flex" data-label="Bet Amount"><?php
                                    if ($result['game_result']['winning_number'] == NULL) {
                                       $index = $result['game_result']['lose_number'];
                                    } else {
                                         $index = $result['game_result']['winning_number'];
                                    }
                                    ?>

                                   <?php if ($index == 0): ?>
                                        <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Spades">
                                        <img class="card" src="/assets-normal/img/spades-golden.png" alt="King of Spades">
                                    <?php elseif ($index == 1): ?>
                                        <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Diamonds">
                                        <img class="card" src="/assets-normal/img/golden-diamond.png" alt="King of Diamonds">
                                    <?php elseif ($index == 2): ?>
                                        <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Clubs">
                                        <img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Clubs">
                                    <?php elseif ($index == 3): ?>
                                        <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Hearts">
                                        <img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Hearts">
                                    <?php elseif ($index == 4): ?>
                                        <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Spades">
                                        <img class="card" src="/assets-normal/img/spades-golden.png" alt="Queen of Spades">
                                    <?php elseif ($index == 5): ?>
                                        <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Diamonds">
                                        <img class="card" src="/assets-normal/img/golden-diamond.png" alt="Queen of Diamonds">
                                    <?php elseif ($index == 6): ?>
                                        <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Clubs">
                                        <img class="card" src="/assets-normal/img/clubs-golden.png" alt="Queen of Clubs">
                                    <?php elseif ($index == 7): ?>
                                        <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Hearts">
                                        <img class="card" src="/assets-normal/img/golden-hearts.png" alt="Queen of Hearts">
                                    <?php elseif ($index == 8): ?>
                                        <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Spades">
                                        <img class="card" src="/assets-normal/img/spades-golden.png" alt="Jack of Spades">
                                    <?php elseif ($index == 9): ?>
                                        <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Diamonds">
                                        <img class="card" src="/assets-normal/img/golden-diamond.png" alt="Jack of Diamonds">
                                    <?php elseif ($index == 10): ?>
                                        <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Clubs">
                                        <img class="card" src="/assets-normal/img/clubs-golden.png" alt="Jack of Clubs">
                                    <?php elseif ($index == 11): ?>
                                        <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Hearts">
                                        <img class="card" src="/assets-normal/img/golden-hearts.png" alt="Jack of Hearts">
                                    <?php endif; ?>



                                   
                                    </td>
                                    <td data-label="Bet Amount">#<?= ($result['ticket_serial']) ?></td>
                                    <td data-label="Bet Amount">₹<?= number_format($result['balance'], 2) ?></td>
                                    <td data-label="Win Value">₹<?= number_format($win_value, 2) ?? 0 ?></td>
                                    <td data-label="Claimed Points"><?= number_format($result['claim_point'], 0) ?? 0  ?></td>
                                    <td data-label="Unclaimed Points"><?= number_format($result['unclaim_point'], 0) ?? 0  ?></td>
                                    <td data-label="Status">
                                        <?php if ($userwins === 'Yes'): ?>
                                            <small class="btn-sm btn-success">Win</small>
                                        <?php else: ?>
                                            <small class="btn-sm btn-danger">Lose</small>
                                        <?php endif; ?>

                                        <?php if ($result['claim_point'] > 0): ?>
                                            <small class="btn-sm btn-danger">Claimed</small>
                                        <?php else: ?>
                                            <small class="btn-sm btn-success"><?php if($win_value <= 0): ?>
                                                    Unclaimable
                                                     <?php else: ?>

Unclaimed
                                                          <?php endif; ?></small>
                                        <?php endif; ?>
                                    </td>
                                     <?php
$created = $result['created_at'] ?? null;
if ($created) {
    $dt = new DateTime($created);
    $dt->modify('-2 minutes');
    $output = $dt->format('Y-m-d H:i:s');
} else {
    $output = 0;
}
?>
<td data-label="Unclaimed Points"><?= $output ?></td>

                                    <td data-label="Action">
                                        <?php if ($result['claim_point'] <= 0 && $win_value > 0): ?>
                                        <button 
                                            class="btn btn-sm btn-danger win-value claim-btn" 
                                            data-user-id="<?= $result['user_id'] ?>" 
                                            data-claim-id="<?= $result['id'] ?>">
                                            Claim
                                        </button>
                                        <?php else: ?>
                                            <button class="btn btn-sm btn-secondary" disabled>
                                                 <?php if($win_value <= 0): ?>
                                                    Unclaimable
                                                     <?php else: ?>

Claimed
                                                          <?php endif; ?>
                                            </button>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                            </tbody>
                        </table>
                  




                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Dashboard Section Ends Here -->

        <!-- Footer Section Starts Here -->
        
        <!-- Footer Section Ends Here -->
<!-- put this somewhere after you load jQuery on history‑log.php -->
<script>
  document.addEventListener('click', function(e) {
    // only run when a .claim-btn is clicked
    if (!e.target.matches('.claim-btn')) return;
    e.preventDefault();

    const btn     = e.target;
    const userId  = btn.dataset.userId;     // grabs data-user-id
    const claimId = btn.dataset.claimId;    // grabs data-claim-id

    fetch('history-log.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'claim_points',
        user_id: userId,
        claim_point_data_id: claimId
      })
    })
    .then(r => r.json())
    .then(resp => {
        location.reload();

      if (resp.success) {
        btn.textContent = 'Claimed';
        btn.disabled    = true;
        btn.classList.replace('btn-danger', 'btn-secondary');
      } else {
        alert('Error: ' + resp.message);
      }
    })
    .catch(err => {
      console.error(err);
    location.reload();

    });
  });
</script>
<style>
    tr.table-history img.card {
    width: 50px;
    height: 50px;
}
</style>
<div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Close
        </button>
      </div>
      
      </div>
    </div>
  </div>
</div>

<div
  class="modal fade"
  id="accountModal"
  tabindex="-1"
  aria-labelledby="accountModalLabel"
  aria-hidden="true"
>
  <div class="modal-dialog modal-fullscreen modal-dialog-scrollable">
    <div class="modal-content" style="
    background: #350b2d;
">
      <div class="modal-header">
        <h5 class="modal-title" id="accountModalLabel">Account Log</h5>
        <button
          type="button"
          class="btn-close"
          data-bs-dismiss="modal"
          aria-label="Close"
        ></button>
      </div>
      <div class="modal-body">
       <?php
ini_set('display_errors', '0');
error_reporting(E_ALL);
session_start();

// Restrict access if the user is not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: sign-in.php");
    exit();
}
include 'db.php'; // Database connection

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $_POST['action'] === 'claim_points') {
    header('Content-Type: application/json');
    $user_id = intval($_POST['user_id']);
    $claim_id = intval($_POST['claim_point_data_id']);

    // 1) fetch current unclaimed_point from claim_point_data
    $sql = "SELECT unclaim_point, claim_point FROM claim_point_data WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $claim_id);
    $stmt->execute();
    $stmt->bind_result($unclaimed, $already_claimed);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Claim record not found']);
        exit;
    }
    $stmt->close();

    if ($unclaimed <= 0) {
        echo json_encode(['success' => false, 'message' => 'No points left to claim']);
        exit;
    }

    // 2) update claim_point_data: add to claimed_point, zero out unclaimed_point
    $new_claimed = $already_claimed + $unclaimed;
    $sql = "UPDATE claim_point_data SET claim_point = ?, unclaim_point = 0 WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $new_claimed, $claim_id);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Failed updating claim data']);
        exit;
    }
    $stmt->close();

    // 3) fetch user’s existing points
    $sql = "SELECT points FROM user WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $stmt->bind_result($current_points);
    if (!$stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'User not found']);
        exit;
    }
    $stmt->close();

    // 4) update user’s points
    $new_points = $current_points + $unclaimed;
    $sql = "UPDATE user SET points = ? WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param('ii', $new_points, $user_id);
    if (!$stmt->execute()) {
        echo json_encode(['success' => false, 'message' => 'Failed updating user points']);
        exit;
    }
    $stmt->close();

    echo json_encode(['success' => true]);
    exit;
}

$user_id = $_SESSION['user_id'];
$game_id = isset($_GET['game_id']) ? intval($_GET['game_id']) : 1; // Adjust as needed


$stmt = $conn->prepare("SELECT points FROM user WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($points);
$stmt->fetch();
$stmt->close();
$game_id = 1;

$stmt = $conn->prepare("SELECT retailer_id FROM user WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($retailer_id);
$stmt->fetch();
$stmt->close();




$stmt = $conn->prepare("SELECT * FROM user_points_claims WHERE from_id = ? ");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$user_points_claims = []; // Initialize empty array

while ($row = $result->fetch_assoc()) {
    $user_points_claims[] = $row; // Append each row to the array
}

$stmt->close();
// fetch winning game_results
$threshold = 0;
// 1) Fetch ALL wins
// $stmt1 = $conn->prepare("SELECT * FROM game_results WHERE win_value > 0 ORDER BY id ASC");
// $stmt1->execute();
// $res1 = $stmt1->get_result();
// $game_results = $res1->fetch_all(MYSQLI_ASSOC);

// // 2) Fetch ALL claim_point_data rows
// $stmt2 = $conn->prepare("SELECT * FROM claim_point_data ORDER BY id ASC");
// $stmt2->execute();
// $res2 = $stmt2->get_result();
// $claim_list  = $res2->fetch_all(MYSQLI_ASSOC);

// // 3) Merge by index
// $mapped = [];
// foreach ($game_results as $idx => $gr) {
//     // take the claim-data with the same zero-based index,
//     // or fall back to a “blank” if there’s no matching row
//     $cpd = $claim_list[$idx] ?? [
//         'id'            => 0,
//         'user_id'       => $gr['user_id'],
//         'claim_point'   => 0,
//         'unclaim_point' => 0,
//         'balance'       => 0,
//         'auto_claim'    => 0,
//         'created_at'    => null,
//         'updated_at'    => null,
//     ];

//     $gr['claim_point_data'] = $cpd;
//     $gr['serial']           = $idx + 1;  // serial starts at 1
//     $mapped[]               = $gr;
// }

// 1) Fetch ALL claim_point_data rows first
date_default_timezone_set('Asia/Kolkata');

// assume $userId is already set (e.g. from session)
$stmt2 = $conn->prepare("
    SELECT *
      FROM claim_point_data
     WHERE user_id      = ?
       AND DATE(created_at) = CURDATE()
     ORDER
        BY id DESC
");
$stmt2->bind_param("i", $user_id);
$stmt2->execute();
$res2 = $stmt2->get_result();
$claim_list = $res2->fetch_all(MYSQLI_ASSOC);

// 2) Fetch ALL game_results rows for a specific user where win_value > 0
$stmt1 = $conn->prepare("SELECT * FROM game_results WHERE user_id = ? AND DATE(created_at) = CURDATE() AND win_value > 0 ORDER BY id DESC");
$stmt1->bind_param("i", $user_id);
$stmt1->execute();
$res1 = $stmt1->get_result();
$game_results = $res1->fetch_all(MYSQLI_ASSOC);


// 3) Merge by index, starting from each claim
$mapped = [];
foreach ($claim_list as $idx => $cpd) {
    // grab the “same-index” game-result, or fall back to a blank template
    $gr = $game_results[$idx] ?? [
        'id'         => 0,
        'user_id'    => $cpd['user_id'],
        'win_value'  => 0,
        'created_at' => null,
        'updated_at' => null,
        // …add any other game_results fields here
    ];

    // inject the game result into the claim
    $cpd['game_result'] = $gr;

    // optionally give each record a 1‑based serial
    $cpd['serial'] = $idx + 1;

    $mapped[] = $cpd;
}

// echo '<pre>';
// print_r($mapped);die;
// $rows now holds each game_results row,
// with claim_point_data_* null for non‑winners

// $rows now contains one entry per game_results row.
// If win_value ≤ 0, all the cpd.* fields will be NULL.



// 1) Fetch ALL claim_point_data rows for a specific user
$stmt2 = $conn->prepare("SELECT * FROM claim_point_data WHERE user_id = ? ORDER BY id DESC");
$stmt2->bind_param("i", $user_id);
$stmt2->execute();
$res2 = $stmt2->get_result();
$claim_list = $res2->fetch_all(MYSQLI_ASSOC);

// 2) Fetch ALL game_results rows for a specific user where win_value > 0
$stmt1 = $conn->prepare("SELECT * FROM game_results WHERE user_id = ? AND win_value > 0 ORDER BY id DESC");
$stmt1->bind_param("i", $user_id);
$stmt1->execute();
$res1 = $stmt1->get_result();
$game_results = $res1->fetch_all(MYSQLI_ASSOC);


$gameResults = []; // Initialize empty array

while ($row = $result->fetch_assoc()) {
    $gameResults[] = $row; // Append each row to the array
}



$stmt = $conn->prepare("SELECT * FROM total_bet_history WHERE user_id = ? AND game_id = 1");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$total_bet_historys = [];
while ($row = $result->fetch_assoc()) {
    $total_bet_historys[] = $row;
}
$stmt->close();

// 2) Index mapped claim data by winning_number
$claimDataByNumber = [];
foreach ($mapped as $gameResult) {

    if($gameResult) {

        $num = $gameResult['winning_number'];
    } else {
         $num = 0;
    }
    $claimDataByNumber[$num] = $gameResult['claim_point_data'];
}

// 3) Merge all bets, defaulting unmatched entries to zero
$filteredBets = [];

foreach ($total_bet_historys as $bet) {
    // Determine lookup key (card_type matches winning_number)
    $key = $bet['card_type'];

    if (isset($claimDataByNumber[$key])) {
        $claim = $claimDataByNumber[$key];

        // populate from claim data
        $bet['claim_point']   = $claim['claim_point'];
        $bet['unclaim_point'] = $claim['unclaim_point'];
        $bet['id']            = $claim['id'];
        $bet['user_id']       = $claim['user_id'];
    } else {
        // default to zeros when no match
        $bet['claim_point']   = 0;
        $bet['unclaim_point'] = 0;
        $bet['id']            = 0;
        $bet['user_id']       = 0;
    }

    $filteredBets[] = $bet;
}


// now $filteredBets has only matching bets, each with claim_point & unclaim_point


// echo '<pre>';
// print_r($filteredBets);die;

    $stmt = $conn->prepare("SELECT 
    SUM(claim_point) AS total_claim, 
    SUM(unclaim_point) AS total_unclaim 
FROM claim_point_data 
WHERE user_id = ? AND DATE(created_at) = CURDATE()");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($totalClaim, $totalUnclaim);
$stmt->fetch();
$stmt->close();

$totalClaim = $totalClaim ?? 0;
$totalUnclaim = $totalUnclaim ?? 0;

$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $amount = $totalUnclaim;
    $confirm = $totalUnclaim;
    if ($amount !== $confirm) {
        $error = 'Amounts do not match.';
    } elseif ($amount > $totalUnclaim) {
        $error = 'You do not have enough points to claim.';
    }
    else {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM user_points_claims WHERE user_id = ? AND DATE(created_at) = CURDATE()");
        $stmt->bind_param("i", $retailer_id);
        $stmt->execute();
        $stmt->bind_result($todayCount);
        $stmt->fetch();
        $stmt->close();
        
            do {
                $ref = '';
                $chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
                for ($i = 0; $i < 10; $i++) {
                    $ref .= $chars[random_int(0, strlen($chars) - 1)];
                }
                $stmt = $conn->prepare("SELECT COUNT(*) FROM user_points_claims WHERE reference_number = ?");
                $stmt->bind_param("s", $ref);
                $stmt->execute();
                $stmt->bind_result($refExists);
                $stmt->fetch();
                $stmt->close();
            } while ($refExists > 0);

            $now = date('Y-m-d H:i:s');
            $status = 'claimed';
            $stmt = $conn->prepare("INSERT INTO user_points_claims (from_id, user_id, amount, reference_number, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("iisssss", $user_id, $retailer_id, $amount, $ref, $status, $now, $now);
            if ($stmt->execute()) {
                  $updatePointsQuery = "UPDATE user SET points = points + ? WHERE id = ?";
                    $updateStmt = $conn->prepare($updatePointsQuery);
                    $updateStmt->bind_param("ii", $amount, $user_id);
                    $updateStmt->execute();

                    $deleteQuery = "DELETE FROM claim_point_data WHERE user_id = ? AND unclaim_point > 0";
    $deleteStmt = $conn->prepare($deleteQuery);
    $deleteStmt->bind_param("i", $user_id);
    $deleteStmt->execute();
                $success = 'Points claim requested successfully. Reference: ' . $ref;

            } else {
                $error = 'Database error. Please try again.';
            }
            $stmt->close();
        
    }
}
?>
<div class="dashboard-section padding-top padding-bottom">
            <div class="container">
                <h2 class="text-center mb-3">Account Section</h4>
                <div class="row">
                    <!-- <div class="col-lg-3">
                        <div class="dashboard-sidebar">
                            <div class="close-dashboard d-lg-none">
                                <i class="las la-times"></i>
                            </div>
                            <div class="dashboard-user">
                                <div class="user-thumb">
                                    <img src="assets/images/top/item1.png"
                                        alt="dashboard">
                                </div>
                                <div class="user-content">
                                    <span>Welcome</span>
                                    <h5 class="name">Munna Ahmed</h5>
                                    <h5 class="name">Your Balance <span style="color:#ffc124"><?php echo htmlspecialchars($points ?? 0); ?></span></h5>
                                    <h5 class="name">Claimed Points <span style="color:#ffc124"><?php echo htmlspecialchars($totalClaim ?? 0); ?></span></h5>
                                    <h5 class="name">Unclaimed Points <span style="color:#ffc124"><?php echo htmlspecialchars($totalUnclaim ?? 0); ?></span></h5>
                                    <ul class="user-option">
                                        <li>
                                            <a href="#0">
                                                <i class="las la-bell"></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#0">
                                                <i class="las la-pen"></i>
                                            </a>
                                        </li>
                                        <li>
                                            <a href="#0">
                                                <i class="las la-envelope"></i>
                                            </a>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <ul class="user-dashboard-tab">
                                <li>
                                    <a href="dashboard.php"
                                        class="active">Dashboard</a>
                                </li>
                                <li>
                                    <a href="deposit-log.php">Deposit
                                        History</a>
                                </li>
                                <li>
                                    <a href="withdraw-log.php">Withdraw
                                        History</a>
                                </li>
                                <li>
                                    <a href="transection.php">Game
                                        History</a>
                                </li>
                                <li>
                                    <a href="profile.php">Account Settings</a>
                                </li>
                                <li>
                                    <a href="change-pass.php">Security
                                        Settings</a>
                                </li>
                                <li>
                                    <a href="#0">Sign Out</a>
                                </li>
                            </ul>
                        </div>
                    </div> -->
                    
                    <?php
    $totalSellAmount = 0;
    $totalWinValue = 0;
    $totalClaimed = 0;
    $totalUnclaimed = 0;
    $totalCommission = 0;
    $totalNetAmount = 0;

    foreach ($mapped as $result) {
  

        $cpd = $result['claim_point_data'] ?? [
            'id' => 0,
            'claim_point' => 0,
            'unclaim_point' => 0
        ];

        $win_value = ($result['unclaim_point'] == 0 && $result['claim_point'] == 0)
            ? 0
            : ($result['unclaim_point'] ? $result['unclaim_point'] : $result['claim_point']);

        $totalSellAmount += $result['balance'];
        $totalWinValue    += $win_value;
        $totalClaimed     += $result['claim_point'];
        $totalUnclaimed   += $result['unclaim_point'];
        $totalCommission  += $commission;
        $totalNetAmount   += $netAmount;
    }
?>

<div class="table--responsive--md">
    <h3>Game : Poker Roulette</h3>
    <table class="table">
        <thead>
            
            <tr>
           
                <th>Sell Amount</th>
                <th>Win Value</th>
                <!--<th>Claimed Points</th>-->
                <!--<th>Unclaimed Points</th>-->
                <th>Commission (%)</th>
                <th>Commission Amt</th>
                <th>Net Amount</th>
            </tr>
        </thead>
        <tbody>
           <tr class="table-history">
              
                <td>₹<?= number_format($totalSellAmount, 2) ?></td>
                <td>₹<?= number_format($totalWinValue, 2) ?></td>
             
                <td>3%</td>
               <td>₹<?= number_format($totalSellAmount * 0.03, 2); ?></td>
<td>₹<?= number_format(
    $totalSellAmount            // total sell
  - $totalWinValue             // minus total wins
  - ($totalSellAmount * 0.03), // minus 3% fee
  2
); ?></td>
            </tr>
        </tbody>
    </table>
</div>
                </div>
            </div>
        </div>
        <!-- Dashboard Section Ends Here -->

        <!-- Footer Section Starts Here -->
        
        <!-- Footer Section Ends Here -->
<!-- put this somewhere after you load jQuery on history‑log.php -->
<script>
  document.addEventListener('click', function(e) {
    // only run when a .claim-btn is clicked
    if (!e.target.matches('.claim-btn')) return;
    e.preventDefault();

    const btn     = e.target;
    const userId  = btn.dataset.userId;     // grabs data-user-id
    const claimId = btn.dataset.claimId;    // grabs data-claim-id

    fetch('history-log.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        action: 'claim_points',
        user_id: userId,
        claim_point_data_id: claimId
      })
    })
    .then(r => r.json())
    .then(resp => {
        location.reload();

      if (resp.success) {
        btn.textContent = 'Claimed';
        btn.disabled    = true;
        btn.classList.replace('btn-danger', 'btn-secondary');
      } else {
        alert('Error: ' + resp.message);
      }
    })
    .catch(err => {
      console.error(err);
    location.reload();

    });
  });
</script>
<div class="modal-footer">
        <button
          type="button"
          class="btn btn-secondary"
          data-bs-dismiss="modal"
        >
          Close
        </button>
      </div>
      </div>
      
    </div>
  </div>
</div>

<div id="overlay">
    

</div>



    <div id="mini-nav">
       <!-- <button class="bordersboxes fullscreen-toggle"
        style="color:white; font-size:32px; border:none; background:none; z-index:1000; cursor:pointer;">
  <i class="fas fa-expand"></i>
</button> -->
  <a  class="cmn--btn active btn--md d-none d-sm-block" href="/poker-roulette.php">Refresh</a>
 <button
  type="button"
  class="cmn--btn active btn--md d-none d-sm-block"
  data-bs-toggle="modal"
  data-bs-target="#historyModal"
>
  History
</button>
  <a  class="cmn--btn active btn--md d-none d-sm-block" target="_blank" href="/dashboard.php">Go to Dashboard</a>
<button
  type="button"
  class="cmn--btn active btn--md d-none d-sm-block"
  data-bs-toggle="modal"
  data-bs-target="#accountModal"
>
  Account
</button>
          <a href="logout.php" class="cmn--btn active btn--md d-none d-sm-block">Logout</a>
        <!-- <div id="betPoints-display">Betting Points: 
            <span style='color: gold;font-weight:800;'> 
                <?php // echo htmlspecialchars($bettingPoints ?? 0); ?>
            </span>
        </div> -->
        <div class="bordersboxes">
        <label>
            <input
            type="checkbox"
            id="auto-claim-toggle"
            /> Auto‑claim Wins
        </label>
    </div>

    
                          
                        
        <div class="bordersboxes d-flex flex-column" id="claim-display"> Claimed <span style='color: gold;font-weight:800;'> <?php echo htmlspecialchars($totalClaim ?? 0); ?> </span> </div>
        <div class="bordersboxes d-flex flex-column" id="unclaim-display"> Unclaimed: <span style='color: gold;font-weight:800;'> <?php echo htmlspecialchars($totalUnclaim ?? 0); ?> </span> </div>

        <div class="bordersboxes d-flex flex-column" id="balance-display"> Balance: <span style='color: gold;font-weight:800;'> <?php echo htmlspecialchars($points ?? 0); ?> </span> </div>

        <div class="bordersboxes d-flex flex-column" id="currentbet-display"> Current Bet: <span style="color: gold; font-weight:800;">0</span> </div>
        <div class="bordersboxes d-flex flex-column" id="totalbet-display"> Today's Bet: <span style="color: gold; font-weight:800;"> <?php echo htmlspecialchars($bettingPoints ?? 0); ?></span> </div>


          
                <div id="time-info-container" >
                <div id="current-time" style="font-size: 18px;"></div>
          </div>
    </div>

       
   <link href="./assets-normal/css/poker-roulette.css" rel="stylesheet" type="text/css">
    </head>
    <body>
    <!-- Result Message Display -->
    <div id="result-display" class="custom-alert" style="font-size:18px; margin:10px 0;"></div>

<div id="image-roulette">


    <!-- Balance Display -->


    <!-- Main Container: Wheel and Grid -->
    <div id="main-container">
        <div id="stick-container"></div>
        <!-- Wheel Container -->
    <div id="wheel-container">
            <div id="wheel" style="transition: none; transform: rotate(180deg);">
                <!-- SVG segments and lines -->
                <svg id="segments-svg" width="100%" height="100%" viewBox="0 0 400 400"><path fill="#201cb2" d="M 200 200 L 393.18516525781365 148.23619097949586 A 200 200 0 0 1 393.18516525781365 251.76380902050414 Z" class=""></path><path fill="#5c1166" d="M 200 200 L 393.18516525781365 251.76380902050414 A 200 200 0 0 1 341.4213562373095 341.4213562373095 Z" class=""></path><path fill="#5c1110" d="M 200 200 L 341.4213562373095 341.4213562373095 A 200 200 0 0 1 251.76380902050414 393.18516525781365 Z" class=""></path><path fill="#201cb2" d="M 200 200 L 251.76380902050414 393.18516525781365 A 200 200 0 0 1 148.23619097949583 393.18516525781365 Z" class=""></path><path fill="#5c1166" d="M 200 200 L 148.23619097949583 393.18516525781365 A 200 200 0 0 1 58.57864376269052 341.4213562373095 Z"></path><path fill="#5c1110" d="M 200 200 L 58.57864376269052 341.4213562373095 A 200 200 0 0 1 6.814834742186349 251.7638090205042 Z" class=""></path><path fill="#201cb2" d="M 200 200 L 6.814834742186349 251.7638090205042 A 200 200 0 0 1 6.814834742186321 148.23619097949592 Z" class="blink"></path><path fill="#5c1166" d="M 200 200 L 6.814834742186321 148.23619097949592 A 200 200 0 0 1 58.57864376269046 58.57864376269052 Z" class=""></path><path fill="#5c1110" d="M 200 200 L 58.57864376269046 58.57864376269052 A 200 200 0 0 1 148.23619097949586 6.814834742186349 Z" class=""></path><path fill="#201cb2" d="M 200 200 L 148.23619097949586 6.814834742186349 A 200 200 0 0 1 251.76380902050423 6.814834742186349 Z"></path><path fill="#5c1166" d="M 200 200 L 251.76380902050423 6.814834742186349 A 200 200 0 0 1 341.4213562373095 58.57864376269046 Z" class=""></path><path fill="#5c1110" d="M 200 200 L 341.4213562373095 58.57864376269046 A 200 200 0 0 1 393.18516525781365 148.23619097949586 Z" class=""></path></svg>
                <svg id="lines-svg" width="100%" height="100%" viewBox="0 0 400 400"><line x1="227.0459231360939" y1="207.24693326287058" x2="393.18516525781365" y2="251.76380902050414" stroke="rgba(0,0,0,0.5)" stroke-width="2"></line><line x1="219.79898987322332" y1="219.79898987322332" x2="341.4213562373095" y2="341.4213562373095" stroke="rgba(0,0,0,0.5)" stroke-width="2"></line><line x1="207.24693326287058" y1="227.0459231360939" x2="251.76380902050414" y2="393.18516525781365" stroke="rgba(0,0,0,0.5)" stroke-width="2"></line><line x1="192.75306673712942" y1="227.0459231360939" x2="148.23619097949583" y2="393.18516525781365" stroke="rgba(0,0,0,0.5)" stroke-width="2"></line><line x1="180.20101012677668" y1="219.79898987322332" x2="58.57864376269052" y2="341.4213562373095" stroke="rgba(0,0,0,0.5)" stroke-width="2"></line><line x1="172.9540768639061" y1="207.24693326287058" x2="6.814834742186349" y2="251.7638090205042" stroke="rgba(0,0,0,0.5)" stroke-width="2"></line><line x1="172.9540768639061" y1="192.75306673712942" x2="6.814834742186321" y2="148.23619097949592" stroke="rgba(0,0,0,0.5)" stroke-width="2"></line><line x1="180.20101012677665" y1="180.20101012677668" x2="58.57864376269046" y2="58.57864376269052" stroke="rgba(0,0,0,0.5)" stroke-width="2"></line><line x1="192.75306673712942" y1="172.9540768639061" x2="148.23619097949586" y2="6.814834742186349" stroke="rgba(0,0,0,0.5)" stroke-width="2"></line><line x1="207.24693326287058" y1="172.9540768639061" x2="251.76380902050423" y2="6.814834742186349" stroke="rgba(0,0,0,0.5)" stroke-width="2"></line><line x1="219.79898987322332" y1="180.20101012677665" x2="341.4213562373095" y2="58.57864376269046" stroke="rgba(0,0,0,0.5)" stroke-width="2"></line><line x1="227.0459231360939" y1="192.75306673712942" x2="393.18516525781365" y2="148.23619097949586" stroke="rgba(0,0,0,0.5)" stroke-width="2"></line></svg>
                <!-- Card wrappers -->
                <!-- Kings Row -->
                <div class="card-wrapper" style="left: 46%;top: 7%;" data-initial-rotation="171">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Spades" style="transform: rotate(171deg);">
                </div>
                <div class="card-wrapper" style="left: 63%;top: 11%;" data-initial-rotation="205">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Diamonds" style="transform: rotate(205deg);">
                </div>
                <div class="card-wrapper" style="left: 75%;top: 25%;" data-initial-rotation="245">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Clubs" style="transform: rotate(245deg);">
                </div>
                <div class="card-wrapper" style="left: 79%;top: 44%;" data-initial-rotation="272">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Hearts" style="transform: rotate(272deg);">
                </div>
                <!-- Queens Row -->
                <div class="card-wrapper" style="left: 76%;top: 61%;" data-initial-rotation="298">
                       <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Spades" style="transform: rotate(298deg);">
                </div>
                <div class="card-wrapper" style="left: 64%;top: 76%;" data-initial-rotation="327">
                       <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Diamonds" style="transform: rotate(327deg);">
                </div>
                <div class="card-wrapper" style="left: 46%;to;top: 80%;" data-initial-rotation="3">
                       <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Clubs" style="transform: rotate(3deg);">
                </div>
                <div class="card-wrapper" style="left: 28%;top: 74%;" data-initial-rotation="30">
                       <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Hearts" style="transform: rotate(30deg);">
                </div>
                <!-- Jacks Row -->
                <div class="card-wrapper" style="left: 15%;top: 62%;" data-initial-rotation="61">
                     <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Spades" style="transform: rotate(61deg);">
                </div>
                <div class="card-wrapper" style="left: 12%;top: 43%;" data-initial-rotation="98">
                     <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Diamonds" style="transform: rotate(98deg);">
                </div>
                <div class="card-wrapper" style="left: 17%;top: 26%;" data-initial-rotation="116">
                     <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Clubs" style="transform: rotate(116deg);">
                </div>
                <div class="card-wrapper" style="left: 29%;to;top: 13%;" data-initial-rotation="153">
                     <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Hearts" style="transform: rotate(153deg);">
                </div>
            </div>

            <!-- Center Circle -->
            <div id="center-circle"><img src="/assets-normal/img/golden-q.png" style="width: 60px; height: auto;"><span style="font-size: 40px; display: block; text-align: center; color: black;">♣</span></div>

            <!-- Suit Ring -->
            <!--<div id="suit-ring" style="position: absolute; width: 100px; height: 100px; top: 50%; left: 50%; transform-origin: 50% 50%; margin-left: -50px; margin-top: -50px; transform: rotate(-30deg); transition: none;" bis_skin_checked="1">-->
            <!--    <span class="suit-segment" style="-->
            <!--    position: absolute;-->
            <!--    left: 107.572px;-->
            <!--    top: 99.7818px;-->
            <!--    transform: rotate(293deg);-->
            <!--    "><img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Spades"></span>-->
            <!--            <span class="suit-segment" style="-->
            <!--    position: absolute;-->
            <!--    left: 69.8509px;-->
            <!--    top: 116.944px;-->
            <!--    transform: rotate(332deg);-->
            <!--    "><img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Spades"></span>-->
            <!--    <span class="suit-segment" style="-->
            <!--    position: absolute;-->
            <!--    left: 55.6283px;-->
            <!--    top: 128.633px;-->
            <!--    transform: rotate(80deg);-->
            <!--    "><img class="card" src="/assets-normal/img/golden-diamond.png" alt="King of Spades"></span><span class="suit-segment" style="-->
            <!--    position: absolute;-->
            <!--    left: -17.78181px;-->
            <!--    top: 102.572px;-->
            <!--    transform: rotate(22deg);-->
            <!--    "><img class="card" src="/assets-normal/img/spades-golden.png" alt="King of Spades"></span><span class="suit-segment" style="-->
            <!--    position: absolute;-->
            <!--    left: -39.944px;-->
            <!--    top: 69.8509px;-->
            <!--    transform: rotate(54deg);-->
            <!--    "><img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Spades"></span><span class="suit-segment" style="-->
            <!--    position: absolute;-->
            <!--    left: -43.6327px;-->
            <!--    top: 19.6283px;-->
            <!--    transform: rotate(77deg);-->
            <!--    "><img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Spades"></span><span class="suit-segment" style="-->
            <!--    position: absolute;-->
            <!--    left: -44.5723px;-->
            <!--    top: 9.21819px;-->
            <!--    transform: rotate(200deg);-->
            <!--    "><img class="card" src="/assets-normal/img/golden-diamond.png" alt="King of Spades"></span><span class="suit-segment" style="-->
            <!--    position: absolute;-->
            <!--    left: 8.1491px;-->
            <!--    top: -41.944px;-->
            <!--    transform: rotate(146deg);-->
            <!--    "><img class="card" src="/assets-normal/img/spades-golden.png" alt="King of Spades"></span><span class="suit-segment" style="-->
            <!--    position: absolute;-->
            <!--    left: 55.3717px;-->
            <!--    top: -44.6327px;-->
            <!--    transform: rotate(175deg);-->
            <!--    "><img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Spades"></span><span class="suit-segment" style="-->
            <!--    position: absolute;-->
            <!--    left: 93.7818px;-->
            <!--    top: -25.5723px;-->
            <!--    transform: rotate(213deg);-->
            <!--    "><img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Spades"></span><span class="suit-segment" style="-->
            <!--    position: absolute;-->
            <!--    left: 108.944px;-->
            <!--    top: -17.8509px;-->
            <!--    transform: rotate(320deg);-->
            <!--    "><img class="card" src="/assets-normal/img/golden-diamond.png" alt="King of Spades"></span><span class="suit-segment" style="-->
            <!--    position: absolute;-->
            <!--    left: 121.633px;-->
            <!--    top: 55.3717px;-->
            <!--    transform: rotate(267deg);-->
            <!--    "><img class="card" src="/assets-normal/img/spades-golden.png" alt="King of Spades"></span>-->
                
                
            <!--</div>-->
<div id="suit-ring" style="position: absolute; width: 100px; height: 100px; top: 50%; left: 50%; transform-origin: 50% 50%; margin-left: -50px; margin-top: -50px; transform: rotate(-150deg); transition: none;" bis_skin_checked="1">
                <span class="suit-segment" style="
                position: absolute;
                left: 147%;
                top: 116%;
                transform: rotate(293deg);
                "><img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Spades"></span>
                        <span class="suit-segment" style="
                position: absolute;
                left: 84%;
                top: 146%;
                transform: rotate(332deg);
                "><img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Spades"></span>
                <span class="suit-segment" style="
                position: absolute;
                left: 60%;
                top: 160%;
                transform: rotate(80deg);
                "><img class="card" src="/assets-normal/img/golden-diamond.png" alt="King of Spades"></span><span class="suit-segment" style="
                position: absolute;
                left: -32%;
                top: 133%;
                transform: rotate(22deg);
                "><img class="card" src="/assets-normal/img/spades-golden.png" alt="King of Spades"></span><span class="suit-segment" style="
                position: absolute;
                left: -65%;
                top: 87%;
                transform: rotate(54deg);
                "><img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Spades"></span><span class="suit-segment" style="
                position: absolute;
                left: -80%;
                top: 21%;
                transform: rotate(77deg);
                "><img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Spades"></span><span class="suit-segment" style="
                position: absolute;
                left: -69%;
                top: -2%;
                transform: rotate(200deg);
                "><img class="card" src="/assets-normal/img/golden-diamond.png" alt="King of Spades"></span><span class="suit-segment" style="
                position: absolute;
                left: -3%;
                top: -66%;
                transform: rotate(146deg);
                "><img class="card" src="/assets-normal/img/spades-golden.png" alt="King of Spades"></span><span class="suit-segment" style="
                position: absolute;
                left: 56%;
                top: -78%;
                transform: rotate(175deg);
                "><img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Spades"></span><span class="suit-segment" style="
                position: absolute;
                left: 109%;
                top: -50%;
                transform: rotate(213deg);
                "><img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Spades"></span><span class="suit-segment" style="
                position: absolute;
                left: 134%;
                top: -37%;
                transform: rotate(320deg);
                "><img class="card" src="/assets-normal/img/golden-diamond.png" alt="King of Spades"></span><span class="suit-segment" style="
                position: absolute;
                left: 168%;
                top: 55.3717px;
                transform: rotate(267deg);
                "><img class="card" src="/assets-normal/img/spades-golden.png" alt="King of Spades"></span>
                
                
            </div>
            <!-- Marker -->
            <div id="marker"> 
                <!-- <img class="gem-marker" src="/assets-normal/img/gem-new.png"> -->
            </div>
              <div id="marker2"> 
               
            </div>
        </div>




        <div id="grid-outer">

            <div id="card-grid">
                <!-- Top header row -->
                <div class="grid-header empty" data-index="12">
                    <div id="withdraw-time" style="font-size: 15px;"></div>
                </div>
                <div class="grid-header d-flex align-items-center justify-content-around" id="suitIcon1" style="color:black" data-index="13">
                    <img class="card" src="/assets-normal/img/spades-golden.png" alt="King of Spades">
                    <div class="play-circle">Play</div>
                </div>
                <div class="grid-header d-flex align-items-center justify-content-around" id="suitIcon2" style="color:red" data-index="14">
                    <img class="card" src="/assets-normal/img/golden-diamond.png" alt="King of Diamonds">
                    <div class="play-circle">Play</div>
                </div>
                <div class="grid-header d-flex align-items-center justify-content-around" id="suitIcon3" style="color:black" data-index="15">
                    <img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Clubs">
                    <div class="play-circle">Play</div>
                </div>
                <div class="grid-header d-flex align-items-center justify-content-around" id="suitIcon4" style="color:red" data-index="16">
                    <img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Hearts">
                    <div class="play-circle">Play</div>
                </div>

                <!-- <div class="grid-header" id="suitIcon1" style="color:black" data-index="13">♠</div>
                <div class="grid-header" id="suitIcon2" style="color:red" data-index="14">♦</div>
                <div class="grid-header" id="suitIcon3" style="color:black" data-index="15">♣</div>
                <div class="grid-header" id="suitIcon4" style="color:red" data-index="16">♥</div> -->

                <!-- King Row -->
                <div class="grid-label d-flex align-items-center justify-content-around" id="grid-label-1" data-index="17">
                <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Spades">
                    <div class="play-circle">Play</div>
                </div>

                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="0">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Spades">
                    <img class="card" src="/assets-normal/img/spades-golden.png" alt="King of Spades">
                    <div class="cstm-ribbon">Play</div>
                 

                </div>

                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="1">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Diamonds">
                    <img class="card" src="/assets-normal/img/golden-diamond.png" alt="King of Diamonds">
                    <div class="cstm-ribbon">Play</div>
                </div>
                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="2">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Clubs">
                    <img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Clubs">
                    <div class="cstm-ribbon">Play</div>
                </div>
                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="3">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Hearts">
                    <img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Hearts">
                    <div class="cstm-ribbon">Play</div>
                </div>

                <!-- Queen Row -->
                <div class="grid-label d-flex align-items-center justify-content-around" id="grid-label-2" data-index="21">
                    <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Spades">
                    <div class="play-circle">Play</div>
                </div>
                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="4">
                     <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Spades">
                     <img class="card" src="/assets-normal/img/spades-golden.png" alt="Queen of Spades">
                     <div class="cstm-ribbon">Play</div>
                </div>
                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="5">
                    <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Diamonds">
                     <img class="card" src="/assets-normal/img/golden-diamond.png" alt="Queen of Diamonds">
                    <div class="cstm-ribbon">Play</div>
                </div>
                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="6">
                    <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Clubs">
                    <img class="card" src="/assets-normal/img/clubs-golden.png" alt="Queen of Clubs">
                    <div class="cstm-ribbon">Play</div>
                </div>
                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="7">
                    <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Hearts">
                    <img class="card" src="/assets-normal/img/golden-hearts.png" alt="Queen of Hearts">
                    <div class="cstm-ribbon">Play</div>
                </div>

                <!-- Jack Row -->
                <div class="grid-label d-flex align-items-center justify-content-around" id="grid-label-3" data-index="25">
                    <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Spades">
                    <div class="play-circle">Play</div>
                </div>
                
                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="8">
                    <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Spades">
                     <img class="card" src="/assets-normal/img/spades-golden.png" alt="Jack of Spades">
                        <div class="cstm-ribbon">Play</div>
                </div>
                
                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="9">
                <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Diamonds">
                     <img class="card" src="/assets-normal/img/golden-diamond.png" alt="Jack of Diamonds">
                        <div class="cstm-ribbon">Play</div>
                </div>
                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="10">
                <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Clubs">
                       <img class="card" src="/assets-normal/img/clubs-golden.png" alt="Jack of Clubs">
                          <div class="cstm-ribbon">Play</div>
                </div>
                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="11">
                <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Hearts">
                        <img class="card" src="/assets-normal/img/golden-hearts.png" alt="Jack of Hearts">
                           <div class="cstm-ribbon">Play</div>
                </div>

            </div>


        </div>
    </div>
    <div id="main-container">
        <!-- Wheel Container -->

        <button id="spinBtn" hidden>Spin</button>

        <div id="div-spin-btns">
            <div id="div-buttons">
                <button id="place-bets" class="cmn--btn active w-100 m-3" style="border:4px solid #ea1515;">Bet</button>
                <button id="clear-bets" class="cmn--btn active w-100 m-3" style="border:4px solid #ea1515;">Clear</button>
                <button id="double-bets" class="cmn--btn active w-100 m-3" style="border:4px solid #ea1515;">Double</button>
                <button id="repeat-bet" class="cmn--btn active w-100 m-3" style="border:4px solid #ea1515;">Repeat</button>
            </div>
            <div id="auto-spin-countdown" style="font-size: 18px; text-align: center;">
                <svg id="circular-timer" width="150" height="200" viewBox="0 0 200 200"></svg>
            </div>

        </div>


        <div style="width:48%;">
            <div class="container-chip-child">
                <div id="#073d91" class="coin" data-value="5"><span>5</span></div>

                <div id="#32a9f1" class="coin" data-value="10"><span>10</span></div>
                <div id="orange" class="coin" data-value="20"><span>20</span></div>
                <div id="#315a97" class="coin" data-value="50"><span>50</span></div>
                <div id="#ff9108" class="coin" data-value="100"><span>100</span></div>
                <div id="#FFD700" class="coin" data-value="500"><span>500</span></div>

            </div>
            <h3 style="margin-top:4px;">Last 12 Cards</h3>
            <div id="history-box">
                <div id="history-container"></div>
            </div>

        </div>
    </div>
  

    <!-- <img class="" src="/assets-normal/img/newsc.png" alt="King of Spades"> -->
    <script>
  // existing declarations
  let user_id           = <?php echo (int) $user_id; ?>;
  let balance           = <?php echo (int) $points; ?>;
  let winningPoints     = <?php echo (int) $winningPoints; ?>;
  let totalUnclaim     = <?php echo (int) $totalUnclaim; ?>;
  let totalClaim     = <?php echo (int) $totalClaim; ?>;
  let bettingPoints     = <?php echo (int) $bettingPoints; ?>;
  let winningPercentage = <?php echo (float) $winning_percentage; ?>;
  let overrideChance    = <?php echo (float) $override_chance; ?>;
  let spinTimerDuration = <?php echo (int) ($spinTimerDuration ?? 120); ?>;
  let maxBetamount      = <?php echo (int) ($maxBetamount ?? 10000); ?>;
  let gameResults       = <?php echo json_encode($gameResults); ?>;

  var auto_claim =  <?php echo($autoClaim); ?>; // Global JS variable

  const serverTimeAtLoad = window.SERVER_TIMESTAMP * 1000; // → ms
    console.log('serverTimeAtLoad (ms):', serverTimeAtLoad);

  // function to refresh all variables from server
  function updateGameVariables() {
    return fetch('poker-roulette.php?action=getValues')
      .then(response => {
        if (!response.ok) throw new Error('Network response was not OK');
        return response.json();
      })
      .then(data => {
        winningPoints     = data.winningPoints;
        bettingPoints     = data.bettingPoints;
        winningPercentage = data.winningPercentage;
        overrideChance    = data.overrideChance;
        spinTimerDuration = data.spinTimerDuration;
        maxBetamount      = data.maxBetamount;
        gameResults       = data.gameResults;
      })
      .catch(err => console.error('Failed to update game vars:', err));
  }

  document.getElementById("spinBtn").addEventListener("click", function () {
    // first, refresh all the server‐side values:
    updateGameVariables().then(() => {
  setTimeout(() => {
    // console.log('winningPoints:', winningPoints);
    // console.log('bettingPoints:', bettingPoints);
    // console.log('winningPercentage:', winningPercentage);
    // console.log('overrideChance:', overrideChance);
    // console.log('spinTimerDuration:', spinTimerDuration);
    // console.log('maxBetamount:', maxBetamount);
    // console.log('gameResults:', gameResults);
  }, 5000); // 5000 ms = 5 seconds
});


  });

</script>


<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js"></script>
<script>
 
</script>
<script
  src="https://code.jquery.com/jquery-3.6.4.min.js"
  crossorigin="anonymous"
></script>

<script>
$(document).ready(function(){


// 1) On page load, fetch current auto_claim state
$.ajax({
  url: '../../api/get_auto_claim.php',
  method: 'POST',
  data: JSON.stringify({ user_id: user_id }),
  contentType: 'application/json; charset=utf-8',
  dataType: 'json'
})
.done(function(res){
  if(res.status === 'success'){
    $('#auto-claim-toggle').prop('checked', res.auto_claim === 1);
  } else {
    console.error('Error fetching auto_claim:', res.message);
  }
})
.fail(function(err){
  console.error('AJAX error fetching auto_claim:', err);
});

// 2) When toggled, update auto_claim
$('#auto-claim-toggle').on('change', function(){
  const newVal = this.checked ? 1 : 0;
  $.ajax({
    url: '../../api/set_auto_claim.php',
    method: 'POST',
    data: JSON.stringify({
      user_id: user_id,
      auto_claim: newVal
    }),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json'
  })
  .done(function(res){
    if(res.status === 'success'){
      console.log('auto_claim updated to', newVal);
      location.reload();
    } else {
      alert('Update failed: ' + res.message);
      // revert checkbox
      $('#auto-claim-toggle').prop('checked', !newVal);
    }
  })
  .fail(function(err){
    console.error('AJAX error setting auto_claim:', err);
    $('#auto-claim-toggle').prop('checked', !newVal);
  });
});
});
</script>
<script src="./assets-normal/js/poker-roulette.js"></script>


        
<script>


    document.addEventListener("DOMContentLoaded", function () {
        // Select all coins
        document.querySelectorAll(".coin").forEach((coin, index) => {
            // Set background color based on ID
            const color = coin.id; 
            if (color.startsWith("#") || color === "orange") {  // Ensure valid color format
                coin.style.backgroundColor = color;
            }

            // Apply fade-in effect with delay
            setTimeout(() => {
                coin.style.opacity = 1;
                coin.style.transition = "opacity 1s ease-in-out";
            }, index * 200); // Staggered effect
        });

        // Add spin effect on hover
        document.querySelectorAll(".coin").forEach(coin => {
            coin.addEventListener("mouseenter", function () {
                this.classList.add("spin");
            });

            coin.addEventListener("mouseleave", function () {
                this.classList.remove("spin");
            });
        });
    });

</script>

   

        <!-- jQuery library -->
        <script src="assets/js/lib/jquery-3.6.0.min.js"></script>
        <!-- bootstrap 5 js -->
        <script src="assets/js/lib/bootstrap.min.js"></script>
        <!-- Pluglin Link -->
        <script src="assets/js/lib/slick.min.js"></script>
        <!-- main js -->
        <script src="assets/js/main.js"></script>
  
</body>

