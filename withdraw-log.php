 <!-- meta tags and other links -->
   <!-- meta tags and other links -->
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


$stmt = $conn->prepare("SELECT SUM(bet) AS total_bet FROM game_results WHERE user_id = ? AND DATE(created_at) = CURDATE()");
$stmt->bind_param("i", $user_id);

$stmt->execute();
$stmt->bind_result($bettingPoints);
$stmt->fetch();
$stmt->close();


$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $amount = trim($_POST['amount']);
    $confirm = trim($_POST['confirm_amount']);
    if ($amount !== $confirm) {
        $error = 'Amounts do not match.';
    } elseif ($amount > $points) {
        $error = 'You do not have enough points to claim.';
    }
    else {
        $stmt = $conn->prepare("SELECT COUNT(*) FROM user_points_claims WHERE user_id = ? AND DATE(created_at) = CURDATE()");
        $stmt->bind_param("i", $retailer_id);
        $stmt->execute();
        $stmt->bind_result($todayCount);
        $stmt->fetch();
        $stmt->close();
        if ($todayCount > 0) {
            $error = 'You have already claimed today.';
        } else {
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
            $status = 'requested';
            $stmt = $conn->prepare("INSERT INTO user_points_claims (from_id, user_id, amount, reference_number, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("iisssss", $user_id, $retailer_id, $amount, $ref, $status, $now, $now);
            if ($stmt->execute()) {
                $success = 'Points claim requested successfully. Reference: ' . $ref;
            } else {
                $error = 'Database error. Please try again.';
            }
            $stmt->close();
        }
    }
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
        <!-- inner hero section start -->
       
        <!-- inner hero section end -->

        <!-- Dashboard Section Starts Here -->
        <div class="dashboard-section padding-top padding-bottom">
            <div class="container">
                <div class="row">
                    <div class="col-lg-3">
                        <div class="dashboard-sidebar">
                            <div class="close-dashboard d-lg-none">
                                <i class="las la-times"></i>
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
                                    <a href="#0">Sign Out</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="col-lg-9">
                        <div
                            class="user-toggler-wrapper d-flex align-items-center d-lg-none">
                            <h4 class="title m-0">User Dashboard</h4>
                            <div class="user-toggler">
                                <i class="las la-sliders-h"></i>
                            </div>
                        </div>
                        <div class="custom--card section-bg">
                            <div class="card--body section-bg p-sm-5 p-3">
                                <div class="reset-header mb-5 text-center">
                                    <div class="icon"><i
                                            class="las la-lock"></i></div>
                                    <h3 class="mt-3">Withdraw Points</h3>
                                    <p>Note You can claim one time in a day, so claim carefully.</p>
                                </div>
                                <?php if ($error): ?>
                                    <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
                                <?php elseif ($success): ?>
                                    <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
                                <?php endif; ?>

                                <form method="post" autocomplete="off">
                                    <div class="form-group mb-3">
                                        <label for="amount" class="form-label">Choose Amount</label>
                                        <input id="amount" type="text" name="amount" class="form-control form--control" required autocomplete="off">
                                    </div>

                                    <div class="form-group mb-3">
                                        <label for="confirm_amount" class="form-label">Confirm Amount</label>
                                        <input id="confirm_amount" type="text" name="confirm_amount" class="form-control form--control" required autocomplete="off">
                                    </div>

                                    <div class="form-group mt-4">
                                        <button type="submit" class="cmn--btn active w-100">Withdraw Points</button>
                                    </div>
                                </form>

                            </div>
                        </div>
                        <div class="table--responsive--md">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Transection ID</th>
                                    <th>Transection Type</th>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th> 
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($user_points_claims as $claim): ?>
                                    <tr>
                                        <td class="trx-id" data-label="Transection ID">#<?= htmlspecialchars($claim['reference_number']) ?></td>
                                        <td class="trx-type" data-label="Transection Type">Withdraw</td>
                                        <td class="date" data-label="Date"><?= date("d M, y \\a\\t h:i A", strtotime($claim['created_at'])) ?></td>
                                        <td class="amount" data-label="Amount">₹<?= number_format($claim['amount'], 2) ?></td>
                                        <td class="status" data-label="Status">
                                        <?php if ($claim['status'] === 'requested'): ?>
                                            <small style="background-color: #87875f; padding: 2px 8px; border-radius: 5px; color: #fff;">Claim Requested</small>
                                        <?php elseif ($claim['status'] === 'rejected'): ?>
                                            <small style="background-color: #dc3545; padding: 2px 8px; border-radius: 5px; color: #fff;">Rejected</small>
                                        <?php else: ?>
                                            <small style="background-color: #28a745; padding: 2px 8px; border-radius: 5px; color: #fff;">Claimed</small>
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

        <!-- jQuery library -->
        <script src="assets/js/lib/jquery-3.6.0.min.js"></script>
        <!-- bootstrap 5 js -->
        <script src="assets/js/lib/bootstrap.min.js"></script>

        <!-- Pluglin Link -->
        <script src="assets/js/lib/slick.min.js"></script>

        <!-- main js -->
        <script src="assets/js/main.js"></script>
    </body>
</html>