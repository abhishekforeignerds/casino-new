

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

        $win_value = ($result['claim_point'] == 0)
            ? 0
            : $result['claim_point'];

        $totalSellAmount += $result['balance'];
        $totalWinValue    += $win_value;
        $totalClaimed     += $result['claim_point'];
        $totalUnclaimed   += $result['unclaim_point'];
        $totalCommission  += $commission;
        $totalNetAmount   += $netAmount;
    }
?>

<div id="result-container" class="table--responsive--md">
    <h3>Game : Poker Roulette</h3>
    <table class="table">
        <thead>
            
            <tr>
           
                <th>Sell Amount</th>
                <th>Win Value</th>
                <!--<th>Claimed Points</th>-->
                <!--<th>Unclaimed Points</th>-->
                <!--<th>Commission (%)</th>-->
                <th>Commission Amt</th>
                <th>Net Amount</th>
            </tr>
        </thead>
        <tbody>
           <tr class="table-history">
              
                <td>₹<?= number_format($totalSellAmount, 2) ?></td>
                <td>₹<?= number_format($totalWinValue, 2) ?></td>
             
                <!--<td>3%</td>-->
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
