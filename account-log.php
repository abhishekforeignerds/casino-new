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
date_default_timezone_set('Asia/Kolkata');

// 1) Get & validate date inputs (default: last 7 days)
$from_date = $_GET['from_date'] ?? date('Y-m-d', strtotime('0 days'));
$to_date   = $_GET['to_date']   ?? date('Y-m-d');
if (!DateTime::createFromFormat('Y-m-d', $from_date) ||
    !DateTime::createFromFormat('Y-m-d', $to_date)) {
    if (!empty($_GET['ajax'])) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Invalid date format']);
        exit();
    }
    die("Invalid date format.");
}

// 2) Fetch aggregated data per existing day
$sql = "
    SELECT 
      DATE(created_at) AS log_date,
      SUM(balance)     AS total_sell_amount,
      SUM(claim_point) AS win_value
    FROM claim_point_data
    WHERE user_id = ?
      AND DATE(created_at) BETWEEN ? AND ?
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at) ASC
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iss", $user_id, $from_date, $to_date);
$stmt->execute();
$res = $stmt->get_result();

$daily_map = [];
while ($row = $res->fetch_assoc()) {
    $daily_map[$row['log_date']] = [
      'sell'  => (float)$row['total_sell_amount'],
      'win'   => (float)$row['win_value'],
    ];
}
$stmt->close();

// 3) Build full date range
$start    = new DateTime($from_date);
$end      = new DateTime($to_date);
$end->modify('+1 day');
$period   = new DatePeriod($start, new DateInterval('P1D'), $end);

// Prepare rows and totals
$rows = [];
$totals = ['sell' => 0, 'win' => 0, 'comm' => 0, 'net' => 0];

foreach ($period as $dt) {
    $d    = $dt->format('Y-m-d');
    $sell = $daily_map[$d]['sell'] ?? 0;
    $win  = $daily_map[$d]['win']  ?? 0;
    $comm = $sell * 0.03;
    $net  = $sell - $win - $comm;

    $rows[] = [
        'date' => $d,
        'sell' => $sell,
        'win'  => $win,
        'comm' => $comm,
        'net'  => $net
    ];

    $totals['sell'] += $sell;
    $totals['win']  += $win;
    $totals['comm'] += $comm;
    $totals['net']  += $net;
}

// If AJAX request, return JSON
if (!empty($_GET['ajax'])) {
    header('Content-Type: application/json');
    echo json_encode(['rows' => $rows, 'totals' => $totals]);
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Casino - Online Casino Platform</title>
        <link rel="icon" type="image/png" href="assets/images/favicon.png"
            sizes="16x16">
        <!-- bootstrap 5  -->
        <link rel="stylesheet" href="assets/css/lib/bootstrap.min.css">
        <!-- Icon Link  -->
        <link rel="stylesheet" href="assets/css/all.min.css">
        <link rel="stylesheet" href="assets/css/line-awesome.min.css">
        <link rel="stylesheet" href="assets/css/lib/animate.css">

        <!-- Plugin Link -->
        <link rel="stylesheet" href="assets/css/lib/slick.css">

        <!-- Main css -->
        <link rel="stylesheet" href="assets/css/main.css">
        <style>
            tr.table-history .grid-card.d-flex.align-items-baseline.justify-content-around img.card {
    width: 50px;
    height: 44px;
}
        </style>
    </head>
    <body data-bs-spy="scroll" data-bs-offset="170"
        data-bs-target=".privacy-policy-sidebar-menu">

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

        <div class="header">
            <div class="container">
                <div class="header-bottom">
                    <div class="header-bottom-area align-items-center">
                        <div class="logo"><a href="poker-roulette.php"><img
                                    src="assets/images/logo.png"
                                    alt="logo"></a></div>
                        <ul class="menu">
                            <li>
                                <a href="poker-roulette.php">Home</a>
                            </li>
                            <li>
                                <a href="about.php">About</a>
                            </li>
                            <li>
                                <a href="games.php">Games <span
                                        class="badge badge--sm badge--base text-dark">NEW</span></a>
                            </li>
                            <li>
                                <a href="faq.php">Faq</a>
                            </li>
                            <li>
                                <a href="#0">Pages</a>
                                <ul class="sub-menu">
                                    <li>
                                        <a href="dashboard.php">User
                                            Dashboard</a>
                                    </li>
                                    <li>
                                        <a href="game-details.php">Game
                                            Details</a>
                                    </li>
                                    <li>
                                        <a href="policy.php">Privacy Policy</a>
                                    </li>
                                    <li>
                                        <a href="terms-conditions.php">Terms &
                                            Conditions</a>
                                    </li>
                                    <li>
                                        <a href="sign-in.php">Sign In</a>
                                    </li>
                                    <li>
                                        <a href="sign-up.php">Sign Up</a>
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <a href="#0">Blog</a>
                                <ul class="sub-menu">
                                    <li><a href="blog.php">Blog</a></li>
                                    <li><a href="blog-details.php">Blog
                                            Details</a></li>
                                </ul>
                            </li>
                            <li>
                                        <a href="logout.php" class="cmn--btn active">Logout</a>

                                    </li>
                                    <li>
                                        <a class="text-center mt-3 gold-box">Welcome,
                                            <?php echo htmlspecialchars($_SESSION['fname']); ?> !
                                        </a>

                                    </li>
                                    <button class="btn-close btn-close-white d-lg-none"></button>
                                </ul>
                                <div class="header-trigger-wrapper d-flex d-lg-none align-items-center">
                                    <div class="header-trigger me-4">
                                        <span></span>
                                    </div>
                                    <a href="sign-in.php" class="cmn--btn active btn--md d-none d-sm-block">Sign In</a>
                                </div>
                    </div>
                </div>
            </div>
        </div>
  
        <!-- inner hero section end -->

        <!-- Dashboard Section Starts Here -->
        <div class="dashboard-section padding-top padding-bottom">
            <div class="container">
                
        <!-- DAILY SUMMARY TABLE -->
        <div class="dashboard-section padding-top padding-bottom">
          <div class="container">
            <h2 class="text-center mb-3 text-white">Account Section</h2>
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
                  <tbody id="dailyTableBody">
                    <?php foreach ($rows as $r): ?>
                      <tr>
                        <td><?= htmlspecialchars($r['date']) ?></td>
                        <td>₹<?= number_format($r['sell'], 2) ?></td>
                        <td>₹<?= number_format($r['win'], 2) ?></td>
                        <td>₹<?= number_format($r['comm'], 2) ?></td>
                        <td>₹<?= number_format($r['net'], 2) ?></td>
                      </tr>
                    <?php endforeach; ?>
                  </tbody>
                  <tfoot id="dailyTableFooter">
                    <tr class="table-history">
                      <th>Total</th>
                      <th>₹<?= number_format($totals['sell'], 2) ?></th>
                      <th>₹<?= number_format($totals['win'], 2) ?></th>
                      <th>₹<?= number_format($totals['comm'], 2) ?></th>
                      <th>₹<?= number_format($totals['net'], 2) ?></th>
                    </tr>
                  </tfoot>
                </table>

              </div>
            </div>
          </div>
        </div>
        <!-- Dashboard Section Ends Here -->

        <!-- Footer Section Starts Here -->
        
        <!-- Footer Section Ends Here -->
<!-- put this somewhere after you load jQuery on history‑log.php -->


          <!-- jQuery library -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>
       
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
        const tbody = document.getElementById('dailyTableBody');
        const tfoot = document.getElementById('dailyTableFooter');
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
        <!-- bootstrap 5 js -->
        <script src="assets/js/lib/bootstrap.min.js"></script>

        <!-- Pluglin Link -->
        <script src="assets/js/lib/slick.min.js"></script>

        <!-- main js -->
        <script src="assets/js/main.js"></script>
    </body>
</html>