

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
      <button type="button" class="" data-bs-dismiss="modal" aria-label="Close" style="color:white;background: transparent;font-size: 1rem;padding: 0.6rem 1rem;">X</button>
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

?>
<div class="dashboard-section padding-top padding-bottom">
            <div class="container">
                <h2 class="text-center mb-3">Account Section</h4>
                <div class="row">       
 <form id="filterForm" class="row g-3 mb-4">
          <div class="col-md-4">
            <label for="from_date" class="form-label text-white">From Date</label>
            <input type="date" id="from_date" name="from_date"
                   class="form-control" required
                   value="<?= htmlspecialchars($from_date) ?>">
          </div>
          <div class="col-md-4">
            <label for="to_date" class="form-label text-white">To Date</label>
            <input type="date" id="to_date" name="to_date"
                   class="form-control" required
                   value="<?= htmlspecialchars($to_date) ?>">
          </div>
          <div class="col-md-4 d-flex align-items-end">
            <button type="submit" class="btn btn-primary w-100">Filter</button>
          </div>
        </form>

              <div id="result-container" class="table--responsive--md">
                <h3 class="text-white">Game: Poker Roulette</h3>

               <table class="table table-bordered table-striped text-white">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Sell Amount (₹)</th>
                      <th>Win Value (₹)</th>
                      <th>Commission (₹)</th>
                      <th>Net Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody id="accountdailyTableBody">
                    <?php foreach ($rows as $r): ?>
                      <tr>
                        <td data-label="Date"><?= htmlspecialchars($r['date']) ?></td>
                        <td data-label="Sell Amount (₹)">₹<?= number_format($r['sell'], 2) ?></td>
                        <td data-label="Win Value (₹)">₹<?= number_format($r['win'], 2) ?></td>
                        <td data-label="Commission (₹)">₹<?= number_format($r['comm'], 2) ?></td>
                        <td data-label="Net Amount (₹)">₹<?= number_format($r['net'], 2) ?></td>
                      </tr>
                    <?php endforeach; ?>
                  </tbody>
                  <tfoot id="accountdailyTableFooter">
                    <tr class="account-table-history">
                      <th data-label="Total">Total</th>
                      <th data-label="Sell Amount (₹)">₹<?= number_format($totals['sell'], 2) ?></th>
                      <th data-label="Win Value (₹)">₹<?= number_format($totals['win'], 2) ?></th>
                      <th data-label="Commission (₹)">₹<?= number_format($totals['comm'], 2) ?></th>
                      <th data-label="Net Amount (₹)">₹<?= number_format($totals['net'], 2) ?></th>
                    </tr>
                  </tfoot>
                </table>


              </div>
            </div>

                </div>
            </div>
        </div>
    
 
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

  
<script defer>
document.getElementById('filterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const from = document.getElementById('from_date').value;
    const to   = document.getElementById('to_date').value;
    fetch(`?from_date=${from}&to_date=${to}&ajax=1`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          return;
        }
        const tbody = document.getElementById('accountdailyTableBody');
        const tfoot = document.getElementById('accountdailyTableFooter');
        tbody.innerHTML = '';
        data.rows.forEach(r => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${r.date}</td>
            <td>₹${r.sell.toFixed(2)}</td>
            <td>₹${r.win.toFixed(2)}</td>
            <td>₹${r.comm.toFixed(2)}</td>
            <td>₹${r.net.toFixed(2)}</td>
          `;
          tbody.appendChild(tr);
        });
        tfoot.innerHTML = `
          <tr class="table-history">
            <th>Total</th>
            <th>₹${data.totals.sell.toFixed(2)}</th>
            <th>₹${data.totals.win.toFixed(2)}</th>
            <th>₹${data.totals.comm.toFixed(2)}</th>
            <th>₹${data.totals.net.toFixed(2)}</th>
          </tr>
        `;
      });
});
</script>