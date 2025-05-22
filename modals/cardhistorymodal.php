
<!-- Full-screen, Scrollable Modal -->
<div
  class="modal fade"
  id="cardHistory"
  tabindex="-1"
  aria-labelledby="cardHistoryLabel"
  aria-hidden="true"
>
  <div class="modal-dialog modal-fullscreen modal-dialog-scrollable" style="background: #350b2d;">
<div class="modal-content" style="
    background: #350b2d;
">
      <div class="modal-header">
        <h5 class="modal-title" id="cardHistoryLabel">History Log</h5>
              
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
<?php
$groupedData = [];

foreach ($mapped as $result) {
    // Get index from winning or losing number
    $gameResult = $result['game_result'];
    $index = $gameResult['winning_number'] ?? $gameResult['lose_number'];

    // Calculate output time
    $created = $result['created_at'] ?? null;
    if ($created) {
        $dt = new DateTime($created);
        $dt->modify('-2 minutes');
        $output = $dt->format('Y-m-d H:i:s');
    } else {
        $output = '0';
    }

    // Build group key using both index and output time
    $groupKey = $index . '|' . $output;

    // Values to sum
    $claim_point = $result['claim_point'] ?? 0;
    $unclaim_point = $result['unclaim_point'] ?? 0;
    $balance = $result['balance'] ?? 0;

    // Calculate win_value
    $win_value = ($unclaim_point == 0 && $claim_point == 0) ? 0 : ($unclaim_point ?: $claim_point);

    // Initialize if not exists
    if (!isset($groupedData[$groupKey])) {
        $groupedData[$groupKey] = [
            'index' => $index,
            'output' => $output,
            'total_balance' => 0,
            'total_win_value' => 0,
            'total_claim_point' => 0,
            'total_unclaim_point' => 0,
            'ticket_ids' => [],
        ];
    }

    // Aggregate sums
    $groupedData[$groupKey]['total_balance'] += $balance;
    $groupedData[$groupKey]['total_win_value'] += $win_value;
    $groupedData[$groupKey]['total_claim_point'] += $claim_point;
    $groupedData[$groupKey]['total_unclaim_point'] += $unclaim_point;
    $groupedData[$groupKey]['ticket_ids'][] = $result['ticket_serial'];
}
?>


<div class="dashboard-section padding-top padding-bottom">
            <div class="container">
                <div class="row">
                    
                    
                    <div id="div-card-historytable" class="table--responsive--md">

                        <table class="table" id="card-historytable">
    <thead>
        <tr>
            <th>Marker Card</th>

            <th>Bet Amount</th>
            <th>Win Value</th>
            <th>Claimed Points</th>
            <th>Unclaimed Points</th>
            <th>Withdraw Time</th>
        </tr>
    </thead>
    <tbody id="card-historytablebody">
        <?php foreach ($groupedData as $group): ?>
            <tr class="table-history">
                <td data-label="Card Index" class="d-flex">
                    <?php if ($group['index'] == 0): ?>
                                        <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Spades">
                                        <img class="card" src="/assets-normal/img/spades-golden.png" alt="King of Spades">
                                    <?php elseif ($group['index'] == 1): ?>
                                        <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Diamonds">
                                        <img class="card" src="/assets-normal/img/golden-diamond.png" alt="King of Diamonds">
                                    <?php elseif ($group['index'] == 2): ?>
                                        <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Clubs">
                                        <img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Clubs">
                                    <?php elseif ($group['index'] == 3): ?>
                                        <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Hearts">
                                        <img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Hearts">
                                    <?php elseif ($group['index'] == 4): ?>
                                        <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Spades">
                                        <img class="card" src="/assets-normal/img/spades-golden.png" alt="Queen of Spades">
                                    <?php elseif ($group['index'] == 5): ?>
                                        <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Diamonds">
                                        <img class="card" src="/assets-normal/img/golden-diamond.png" alt="Queen of Diamonds">
                                    <?php elseif ($group['index'] == 6): ?>
                                        <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Clubs">
                                        <img class="card" src="/assets-normal/img/clubs-golden.png" alt="Queen of Clubs">
                                    <?php elseif ($group['index'] == 7): ?>
                                        <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Hearts">
                                        <img class="card" src="/assets-normal/img/golden-hearts.png" alt="Queen of Hearts">
                                    <?php elseif ($group['index'] == 8): ?>
                                        <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Spades">
                                        <img class="card" src="/assets-normal/img/spades-golden.png" alt="Jack of Spades">
                                    <?php elseif ($group['index'] == 9): ?>
                                        <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Diamonds">
                                        <img class="card" src="/assets-normal/img/golden-diamond.png" alt="Jack of Diamonds">
                                    <?php elseif ($group['index'] == 10): ?>
                                        <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Clubs">
                                        <img class="card" src="/assets-normal/img/clubs-golden.png" alt="Jack of Clubs">
                                    <?php elseif ($group['index'] == 11): ?>
                                        <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Hearts">
                                        <img class="card" src="/assets-normal/img/golden-hearts.png" alt="Jack of Hearts">
                                    <?php endif; ?>
                </td>
                
                <td data-label="Bet Amount">₹<?= number_format($group['total_balance'], 2) ?></td>
                <td data-label="Win Value">₹<?= number_format($group['total_win_value'], 2) ?></td>
                <td data-label="Claimed Points"><?= number_format($group['total_claim_point'], 0) ?></td>
                <td data-label="Unclaimed Points"><?= number_format($group['total_unclaim_point'], 0) ?></td>
                <td data-label="Withdraw Time"><?= htmlspecialchars($group['output']) ?></td>
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
                    const newBalance = currentBalance + claimedPoints;
                    claimDisplay.textContent = newBalance.toFixed(2);
                }
                const unclaimDisplay = document.querySelector('#unclaim-display span');
                if (unclaimDisplay) {
                    const currentBalance = parseFloat(unclaimDisplay.textContent.replace(/[^\d.]/g, '')) || 0;
                    const newBalance = currentBalance - claimedPoints;
                    unclaimDisplay.textContent = newBalance.toFixed(2);
                }

       let now   = new Date();
  let dd    = String(now.getDate()).padStart(2,'0');
  let mm    = String(now.getMonth()+1).padStart(2,'0');
  let yyyy  = now.getFullYear();
  let dateStr = `${yyyy}-${mm}-${dd}`;  // adjust format if your PHP uses dd/mm/yyyy

  // find the matching row in the account table
  let $acctRow = $('#accountdailyTableBody tr').filter(function(){
    return $(this).find('td[data-label="Date"]').text().trim() === dateStr;
  });
  if (!$acctRow.length) return; // no row today? bail

  // helper to parse a "₹1,234.56" string → Number
  function parseAmt(txt){
    return parseFloat(txt.replace(/[₹,]/g,'')) || 0;
  }
  // helper to format a number → "1,234.56"
  function fmt(num){
    return num.toLocaleString(undefined,{
      minimumFractionDigits:2,
      maximumFractionDigits:2
    });
  }

  // 1) get existing values
  let $winCell  = $acctRow.find('td[data-label="Win Value (₹)"]');
  let $commCell = $acctRow.find('td[data-label="Commission (3%) (₹)"]');
  let $netCell  = $acctRow.find('td[data-label="Net Amount (₹)"]');

  let existingWin  = parseAmt($winCell.text());
  let existingComm = parseAmt($commCell.text());
  let existingNet  = parseAmt($netCell.text());

  // 2) compute the new increments
  let addWin       = response.unclaim_points;
  let addComm      = addWin * 0.03;
  let addNet       = addWin - addComm;

  // 3) sum them up
  let updatedWin  = existingWin  + addWin;
  let updatedComm = existingComm + addComm;
  let updatedNet  = existingNet  + addNet;

  // 4) write back the totals
  $winCell .text(fmt(updatedWin));
  $commCell.text(fmt(updatedComm));
  $netCell .text(fmt(updatedNet));

  // 5) now rebuild your footer totals exactly as before
  let totals = { sell:0, win:0, comm:0, net:0 };
  $('#accountdailyTableBody tr').each(function(){
    let $tds = $(this).find('td');
    totals.sell += parseAmt($tds.eq(1).text());
    totals.win  += parseAmt($tds.eq(2).text());
    totals.comm += parseAmt($tds.eq(3).text());
    totals.net  += parseAmt($tds.eq(4).text());
  });

  let $footerTh = $('#accountdailyTableFooter tr.account-table-history').find('th');
  $footerTh.eq(1).text(fmt(totals.sell));
  $footerTh.eq(2).text(fmt(totals.win ));
  $footerTh.eq(3).text(fmt(totals.comm));
  $footerTh.eq(4).text(fmt(totals.net ));
            } else {
                alert(response.message || 'Failed to claim points');
            }
        },
        error: function() {
            alert('Error processing request');
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