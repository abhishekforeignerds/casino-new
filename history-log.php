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

$stmt = $conn->prepare("SELECT * FROM game_results WHERE user_id = ? AND game_id = 1");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$gameResults = []; // Initialize empty array

while ($row = $result->fetch_assoc()) {
    $gameResults[] = $row; // Append each row to the array
}

$stmt->close();

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
                        <div class="logo"><a href="index.php"><img
                                    src="assets/images/logo.png"
                                    alt="logo"></a></div>
                        <ul class="menu">
                            <li>
                                <a href="index.php">Home</a>
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
        <section class="inner-banner bg_img"
            style="background: url('assets/images/inner-banner/bg2.jpg') top;">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-7 col-xl-6 text-center">
                        <h2 class="title text-white">Withdraw Logs</h2>
                        <ul
                            class="breadcrumbs d-flex flex-wrap align-items-center justify-content-center">
                            <li><a href="index.php">Home</a></li>
                            <li>Withdraw Log</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
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
                                    <h3 class="mt-3">Claim Points</h3>
                                    <p>Note You can claim one time in a day, so claim carefully.</p>
                                </div>
                                <?php if ($error): ?>
                                    <div class="alert alert-danger"><?= htmlspecialchars($error) ?></div>
                                <?php elseif ($success): ?>
                                    <div class="alert alert-success"><?= htmlspecialchars($success) ?></div>
                                <?php endif; ?>

                                <form method="post" autocomplete="off">
                                    <div class="form-group mb-3">
                                        <!-- <label for="amount" class="form-label">Choose Amount</label> -->
                                        <input id="amount" type="text" name="amount" class="form-control form--control" hidden autocomplete="off">
                                    </div>

                                    <div class="form-group mb-3">
                                        <!-- <label for="confirm_amount" class="form-label">Confirm Amount</label> -->
                                        <input id="confirm_amount" type="text" name="confirm_amount" class="form-control form--control" hidden autocomplete="off">
                                    </div>

                                    <div class="form-group mt-4">
                                        <button type="submit" class="cmn--btn active w-100">Claim Points</button>
                                    </div>
                                </form>

                            </div>
                        </div>
                        <div class="table--responsive--md">
                 <table class="table">
                    <thead>
                        <tr>
                            <th>Card Number</th>
                            <th>Bet Amount</th>
                            <th>Win Value</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($gameResults as $result): ?>
                            <?php
                                $card_number = ($result['win_value'] > 0) ? $result['winning_number'] : $result['lose_number'];
                                $userwins = ($result['win_value'] > 0) ? 'Yes' : 'No';

                            ?>
                            <tr class="table-history">
                                <td data-label="Card">

                                 <?php if ($card_number == 0): ?>
                                    <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="0">
                                        <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Spades">
                                        <img class="card" src="/assets-normal/img/spades-golden.png" alt="King of Spades">
                                        <div class="cstm-ribbon">Play</div>
                                    </div>
                                <?php elseif ($card_number == 1): ?>
                                    <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="1">
                                        <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Diamonds">
                                        <img class="card" src="/assets-normal/img/golden-diamond.png" alt="King of Diamonds">
                                        <div class="cstm-ribbon">Play</div>
                                    </div>
                               
                                <?php elseif ($card_number == 2): ?>
                                   <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="2">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Clubs">
                    <img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Clubs">
                    <div class="cstm-ribbon">Play</div>
                </div>
              
                                <?php elseif ($card_number == 3): ?>
                                    <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="3">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Hearts">
                    <img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Hearts">
                    <div class="cstm-ribbon">Play</div>
                </div>
                                
                                <?php elseif ($card_number == 4): ?>
                                 <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="4">
                     <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Spades">
                     <img class="card" src="/assets-normal/img/spades-golden.png" alt="Queen of Spades">
                     <div class="cstm-ribbon">Play</div>
                </div>
               
                                
                                <?php elseif ($card_number == 5): ?>
                                 <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="5">
                    <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Diamonds">
                     <img class="card" src="/assets-normal/img/golden-diamond.png" alt="Queen of Diamonds">
                    <div class="cstm-ribbon">Play</div>
                </div>
             
                                
                                <?php elseif ($card_number == 6): ?>
                                 <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="6">
                    <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Clubs">
                    <img class="card" src="/assets-normal/img/clubs-golden.png" alt="Queen of Clubs">
                    <div class="cstm-ribbon">Play</div>
                </div>
              
                                
                                <?php elseif ($card_number == 7): ?>
                                <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="7">
                    <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Hearts">
                    <img class="card" src="/assets-normal/img/golden-hearts.png" alt="Queen of Hearts">
                    <div class="cstm-ribbon">Play</div>
                </div>
                                
                                <?php elseif ($card_number == 8): ?>
                                 <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="8">
                    <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Spades">
                     <img class="card" src="/assets-normal/img/spades-golden.png" alt="Jack of Spades">
                        <div class="cstm-ribbon">Play</div>
                </div>
                
               
                                <?php elseif ($card_number == 9): ?>
                         <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="9">
                <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Diamonds">
                     <img class="card" src="/assets-normal/img/golden-diamond.png" alt="Jack of Diamonds">
                        <div class="cstm-ribbon">Play</div>
                </div>
               
                                <?php elseif ($card_number == 10): ?>
                               <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="10">
                <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Clubs">
                       <img class="card" src="/assets-normal/img/clubs-golden.png" alt="Jack of Clubs">
                          <div class="cstm-ribbon">Play</div>
                </div>
               
                                
                                <?php elseif ($card_number == 11): ?>
                                   <div class="grid-card d-flex align-items-baseline justify-content-around" data-index="11">
                <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Hearts">
                        <img class="card" src="/assets-normal/img/golden-hearts.png" alt="Jack of Hearts">
                           <div class="cstm-ribbon">Play</div>
                </div>
                                <?php endif; ?>
                                </td>
                                <td class="bet" data-label="Bet Amount">₹<?= number_format($result['bet'], 2) ?></td>
                                <td class="win-value" data-label="Win Value">₹<?= number_format($result['win_value'], 2) ?></td>
                                <td class="status" data-label="Status">
                                    <?php if ($userwins === 'Yes'): ?>
                                        <small style="background-color: #28a745; padding: 2px 8px; border-radius: 5px; color: #fff;">Win</small>
                                    <?php else: ?>
                                        <small style="background-color: #dc3545; padding: 2px 8px; border-radius: 5px; color: #fff;">Lose</small>
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
        <footer class="footer-section bg_img"
            style="background: url(assets/images/footer/bg.jpg) center;">
            <div class="footer-top">
                <div class="container">
                    <div
                        class="footer-wrapper d-flex flex-wrap align-items-center justify-content-md-between justify-content-center">
                        <div class="logo mb-3 mb-md-0"><a href="index.php"><img
                                    src="assets/images/logo.png"
                                    alt="logo"></a></div>
                        <ul
                            class="footer-links d-flex flex-wrap justify-content-center">
                            <li><a href="games.php">Games</a></li>
                            <li><a href="terms-conditions.php">Terms &
                                    Conditions</a></li>
                            <li><a href="policy.php">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="container">
                    <div
                        class="footer-wrapper d-flex flex-wrap justify-content-center align-items-center text-center">
                        <p class="copyright text-white">Copyrights &copy; 2021
                            All Rights Reserved by <a href="#0"
                                class=" text--base ms-2">Viserlab</a></p>
                    </div>
                </div>
            </div>
            <div class="shapes">
                <img src="assets/images/footer/shape.png" alt="footer"
                    class="shape1">
            </div>
        </footer>
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