

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
if (isset($_GET['action']) && $_GET['action'] === 'fetchHistory') {
$threshold = 0;

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

}
$stmt = $conn->prepare("SELECT SUM(bet) AS total_bet FROM game_results WHERE user_id = ? AND DATE(created_at) = CURDATE()");
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
                    
                    
                    <div class="table--responsive--md">

                       <table class="table" id="history-table">
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
                            <tbody id="history-body">
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
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
<script>
  // how often to refresh (in milliseconds)
  const REFRESH_INTERVAL = 30 * 1000; // e.g. every 30 seconds

  function refreshHistory() {
    $.ajax({
      url: window.location.pathname,
      data: { action: 'fetchHistory' },
      success: function(html) {
        // replace the entire tbody
        $('#history-body').html(html);
      },
      error: function() {
        console.error('Failed to fetch history');
      }
    });
  }

  // initial load after DOM ready
  $(function() {
    setInterval(refreshHistory, REFRESH_INTERVAL);
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
