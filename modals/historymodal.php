
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

// compute server‐side dates
$today = date('Y-m-d');               // e.g. "2025-05-19"
$now   = date('Y-m-d H:i:s');         // e.g. "2025-05-19 14:23:45"

// 1) Fetch all of today’s claim_point_data for this user
$stmt2 = $conn->prepare("
    SELECT *
      FROM claim_point_data
     WHERE user_id       = ?
       AND DATE(created_at) = ?
     ORDER BY created_at DESC, id DESC
");
$stmt2->bind_param("is", $user_id, $today);
$stmt2->execute();
$claim_list = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);

// 2) Fetch today’s game_results that actually have a win_value > 0
$stmt1 = $conn->prepare("
    SELECT *
      FROM game_results
     WHERE user_id          = ?
       AND DATE(created_at) = ?
       AND win_value        > 0
     ORDER BY created_at DESC, id DESC
");
$stmt1->bind_param("is", $user_id, $today);
$stmt1->execute();
$game_results = $stmt1->get_result()->fetch_all(MYSQLI_ASSOC);

// 3) Build a lookup from created_at → game_result row
$grByTimestamp = [];
foreach ($game_results as $gr) {
    $grByTimestamp[$gr['created_at']] = $gr;
}

// 4) Fetch today’s total_bet_history with ticket_serial > 0 and withdraw_time > now
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

// 5) Merge claim_list with game_results by exact timestamp
$mapped = [];
foreach ($claim_list as $idx => $cpd) {
    $ts = $cpd['created_at'];

    if (isset($grByTimestamp[$ts])) {
        $matchedGR = $grByTimestamp[$ts];
    } else {
        $matchedGR = [
            'id'             => 0,
            'user_id'        => $cpd['user_id'],
            'game_id'        => null,
            'winning_number' => null,
            'lose_number'    => null,
            'suiticonnum'    => null,
            'bet'            => 0.00,
            'win_value'      => 0,
            'created_at'     => null,
            'updated_at'     => null,
        ];
    }

    // determine display_index
    $index = empty($matchedGR['winning_number'])
           ? $matchedGR['lose_number']
           : $matchedGR['winning_number'];

    $cpd['game_result']   = $matchedGR;
    $cpd['display_index'] = $index;
    $cpd['serial']        = $idx + 1;

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



    $stmt = $conn->prepare("SELECT SUM(bet_amount) AS total_bet FROM total_bet_history WHERE user_id = ? AND DATE(created_at) = CURDATE() AND card_bet_amounts IS NOT NULL");
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

$stmt = $conn->prepare("SELECT * FROM total_bet_history WHERE user_id = ? AND game_id = 1 AND card_bet_amounts IS NOT NULL");
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
                                    <td data-label="Unclaimed Points"><small class="btn-sm btn-success">Bet Placed</small></td>
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
                                  
                                    <td class="image-tr d-flex" data-label="Card Win"><?php
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
                                    <td data-label="Ticket Serial">#<?= ($result['ticket_serial']) ?></td>
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
<td data-label="Withdraw Time"><?= $output ?></td>

                                    <td data-label="Action">
                                        <?php if ($result['claim_point'] <= 0 && $win_value > 0): ?>
                                       <button 
  type="button"                 
  class="btn btn-sm btn-danger win-value claim-btn" 
  data-user-id="<?= $result['user_id'] ?>" 
  data-unclaim-points="<?= $result['unclaim_point'] ?>" 
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
      
 
<script defer>
  document.addEventListener("DOMContentLoaded", function () {
    if (window.jQuery) {
      // Delegate click event to all .claim-btn buttons
      $(document).on('click', '.claim-btn', function() {
    let $btn = $(this);
    let $row = $btn.closest('tr');

    // Get the claim_point_data id from button data attribute
    let claimId = $btn.data('claim-id');
    let unclaim_points = $btn.data('unclaim-points');
    let userId = $btn.data('user-id'); // Set your current user id accordingly

    // Get current unclaimed points from the row before claim
    let unclaimedPoints = parseInt($row.find('td[data-label="Unclaimed Points"]').text().replace(/,/g, '')) || 0;

  

    $.ajax({
        url: '../history-log.php',
        method: 'POST',
        data: {
            action: 'claim_points',
            user_id: userId,
            claim_point_data_id: claimId,
            unclaim_points: unclaim_points,
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                // Update the row values on success:
                // Claimed Points += unclaimedPoints
                // Unclaimed Points = 0
                
                // Get current claimed points before update
                let claimedPointsCell = $row.find('td[data-label="Claimed Points"]');
                let statusCell = $row.find('td[data-label="Status"]');
                let actionCell = $row.find('td[data-label="Action"]');
                let claimedPoints = parseInt(claimedPointsCell.text().replace(/,/g, '')) || 0;

                claimedPointsCell.text(response.unclaim_points.toLocaleString());
                $row.find('td[data-label="Unclaimed Points"]').text('0');
                statusCell.html(' <small class="btn-sm btn-success">Win</small><small class="btn-sm btn-danger">Claimed</small>');

                // Update Action: disabled button with text 'Unclaimable'
                actionCell.html('<button class="btn btn-sm btn-secondary" disabled>Unclaimable</button>');

                
                const balanceDisplay = document.querySelector('#balance-display span');
                if (balanceDisplay) {
                    const currentBalance = parseFloat(balanceDisplay.textContent.replace(/[^\d.]/g, '')) || 0;
                    const newBalance = currentBalance + claimedPoints;
                    balanceDisplay.textContent = newBalance.toFixed(2);
                }
                const claimDisplay = document.querySelector('#claim-display span');
                if (claimDisplay) {
                    const currentBalance = parseFloat(claimDisplay.textContent.replace(/[^\d.]/g, '')) || 0;
                    const newBalance = currentBalance - claimedPoints;
                    claimDisplay.textContent = newBalance.toFixed(2);
                }
                const unclaimDisplay = document.querySelector('#unclaim-display span');
                if (unclaimDisplay) {
                    const currentBalance = parseFloat(unclaimDisplay.textContent.replace(/[^\d.]/g, '')) || 0;
                    const newBalance = currentBalance + claimedPoints;
                    unclaimDisplay.textContent = newBalance.toFixed(2);
                }

                
              
            } else {
                // alert(response.message || 'Failed to claim points');
            }
        },
        error: function() {
            // alert('Error processing request');
        }
    });
});
    } else {
      console.error("jQuery not loaded.");
    }
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