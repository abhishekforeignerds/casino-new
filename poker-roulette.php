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
$stmt = $conn->prepare("SELECT SUM(bet) AS total_bet FROM game_results WHERE user_id = ? AND DATE(created_at) = CURDATE()");
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
    $stmt = $conn->prepare("SELECT SUM(bet) AS total_bet FROM game_results WHERE user_id = ? AND DATE(created_at) = CURDATE()");
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

<body data-bs-spy="scroll" data-bs-offset="170" data-bs-target=".privacy-policy-sidebar-menu">

    <div class="overlay"></div>
    <div class="preloader">
        <div class="scene" id="scene">
            <input type="checkbox" id="andicator" />
            <div class="cube">
                <div class="cube__face cube__face--front"><i></i></div>
                <div class="cube__face cube__face--back"><i></i><i></i></div>
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

    <div id="navbar-header" class="header">
        <div class="container">
            <div class="header-bottom">
                <div class="header-bottom-area align-items-center">
                    <div class="logo"><a href="index.php"><img src="assets/images/logo.png" alt="logo"></a></div>
                    <ul class="menu">
                        <li>
                            <a href="index.php">Home</a>
                        </li>
                        <li>
                            <a href="dashboard.php">Dashboard</a>
                        </li>
                        <li>
                            <a href="games.php">Games <span class="badge badge--sm badge--base text-dark">NEW</span></a>
                        </li>

                        <li>
                            <a href="contact.php">Contact</a>
                        </li>
                        <li>
                            <a href="logout.php" class="cmn--btn active">Logout</a>

                        </li>
                        <li>
                            <a class="text-center mt-3 gold-box">Welcome,
                                <?php echo htmlspecialchars($_SESSION['fname']); ?>    <?php echo htmlspecialchars($_SESSION['lname']); ?> !
                            </a>

                        </li>
                        <button class="btn-close btn-close-white d-lg-none"></button>
                    </ul>
                    <div class="header-trigger-wrapper d-flex d-lg-none align-items-center">
                        <div class="header-trigger me-4">
                            <span></span>
                        </div>
                        <a href="logout.php" class="cmn--btn active btn--md d-none d-sm-block">Logout</a>
                    </div>
                  <!-- Toggle Fullscreen Button with Icon -->
                    

                </div>
            </div>
        </div>
    </div>
    <div id="mini-nav">
        <button class="bordersboxes" id="fullscreenBtn" style="color:white;font-size: 32px;border: none;background: none;z-index: 1000;cursor: pointer;">
          <i class="fas fa-expand"></i>
        </button>
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
        <div class="bordersboxes" id="claim-display"> Claimed: <span style='color: gold;font-weight:800;'> <?php echo htmlspecialchars($totalClaim ?? 0); ?> </span> </div>
        <div class="bordersboxes" id="unclaim-display"> Unclaimed: <span style='color: gold;font-weight:800;'> <?php echo htmlspecialchars($totalUnclaim ?? 0); ?> </span> </div>

        <div class="bordersboxes" id="balance-display"> Balance: <span style='color: gold;font-weight:800;'> <?php echo htmlspecialchars($points ?? 0); ?> </span> </div>

        <div class="bordersboxes" id="currentbet-display"> Current Bet: <span style="color: gold; font-weight:800;">0</span> </div>
        <div class="bordersboxes" id="totalbet-display"> Today's Bet: <span style="color: gold; font-weight:800;"> <?php echo htmlspecialchars($bettingPoints ?? 0); ?></span> </div>


          
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
            <div id="wheel">
                <!-- SVG segments and lines -->
                <svg id="segments-svg" width="350" height="350"></svg>
                <svg id="lines-svg" width="350" height="350"></svg>
                <!-- Card wrappers -->
                <!-- Kings Row -->
                <div class="card-wrapper" style="left: 166px;top: 0px;" data-initial-rotation="171">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Spades"
                        style="transform: rotate(171deg);">
                </div>
                <div class="card-wrapper" style="left: 249px;top: 22px;" data-initial-rotation="205">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Diamonds"
                        style="transform: rotate(205deg);">
                </div>
                <div class="card-wrapper" style="left: 312px;top: 82px;" data-initial-rotation="245">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Clubs"
                        style="transform: rotate(245deg);">
                </div>
                <div class="card-wrapper" style="left: 335px;top: 161px;" data-initial-rotation="272">
                    <img class="card" src="/assets-normal/img/goldens-k.png" alt="King of Hearts"
                        style="transform: rotate(272deg);">
                </div>
                <!-- Queens Row -->
                <div class="card-wrapper" style="left: 313px;top: 242px;" data-initial-rotation="298">
                       <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Spades"
                        style="transform: rotate(298deg);">
                </div>
                <div class="card-wrapper" style="left: 255px;top: 301px;" data-initial-rotation="327">
                       <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Diamonds"
                        style="transform: rotate(327deg);">
                </div>
                <div class="card-wrapper" style="left: 174px;top: 325px;" data-initial-rotation="3">
                       <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Clubs"
                        style="transform: rotate(3deg);">
                </div>
                <div class="card-wrapper" style="left: 94px;top: 303px;" data-initial-rotation="30">
                       <img class="card" src="/assets-normal/img/golden-q.png" alt="Queen of Hearts"
                        style="transform: rotate(30deg);">
                </div>
                <!-- Jacks Row -->
                <div class="card-wrapper" style="left: 32px;top: 242px;" data-initial-rotation="61">
                     <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Spades"
                        style="transform: rotate(61deg);">
                </div>
                <div class="card-wrapper" style="left: 10px;top: 159px;" data-initial-rotation="98">
                     <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Diamonds"
                        style="transform: rotate(98deg);">
                </div>
                <div class="card-wrapper" style="left: 33px;top: 82px;" data-initial-rotation="116">
                     <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Clubs"
                        style="transform: rotate(116deg);">
                </div>
                <div class="card-wrapper" style="left: 94px;top:22px;" data-initial-rotation="153">
                     <img class="card" src="/assets-normal/img/golden-j.png" alt="Jack of Hearts"
                        style="transform: rotate(153deg);">
                </div>
            </div>

            <!-- Center Circle -->
            <div id="center-circle"> <div class="center-text">N</div></div>

            <!-- Suit Ring -->
            <div id="suit-ring" style="
                position: absolute;
                width: 100px;
                height: 100px;
                top: 50%;
                left: 50%;
                transform-origin: 50% 50%;
                margin-left: -50px;
                margin-top: -50px;
                transform: rotate(-359deg);
                transition: none;
                " bis_skin_checked="1">
                <span class="suit-segment" style="
                position: absolute;
                left: 107.572px;
                top: 99.7818px;
                transform: rotate(293deg);
                "><img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Spades"></span>
                        <span class="suit-segment" style="
                position: absolute;
                left: 69.8509px;
                top: 116.944px;
                transform: rotate(332deg);
                "><img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Spades"></span>
                <span
                    class="suit-segment" style="
                position: absolute;
                left: 55.6283px;
                top: 128.633px;
                transform: rotate(80deg);
                "><img class="card" src="/assets-normal/img/golden-diamond.png"
                        alt="King of Spades" /></span><span
                    class="suit-segment" style="
                position: absolute;
                left: -17.78181px;
                top: 102.572px;
                transform: rotate(22deg);
                "><img class="card" src="/assets-normal/img/spades-golden.png"
                        alt="King of Spades" /></span><span
                    class="suit-segment" style="
                position: absolute;
                left: -39.944px;
                top: 69.8509px;
                transform: rotate(54deg);
                "><img class="card" src="/assets-normal/img/golden-hearts.png"
                        alt="King of Spades" /></span><span
                    class="suit-segment" style="
                position: absolute;
                left: -43.6327px;
                top: 19.6283px;
                transform: rotate(77deg);
                "><img class="card" src="/assets-normal/img/clubs-golden.png"
                        alt="King of Spades" /></span><span
                    class="suit-segment" style="
                position: absolute;
                left: -44.5723px;
                top: 9.21819px;
                transform: rotate(200deg);
                "><img class="card" src="/assets-normal/img/golden-diamond.png"
                        alt="King of Spades" /></span><span
                    class="suit-segment" style="
                position: absolute;
                left: 8.1491px;
                top: -41.944px;
                transform: rotate(146deg);
                "><img class="card" src="/assets-normal/img/spades-golden.png"
                        alt="King of Spades" /></span><span
                    class="suit-segment" style="
                position: absolute;
                left: 55.3717px;
                top: -44.6327px;
                transform: rotate(175deg);
                "><img class="card" src="/assets-normal/img/golden-hearts.png"
                        alt="King of Spades" /></span><span
                    class="suit-segment" style="
                position: absolute;
                left: 93.7818px;
                top: -25.5723px;
                transform: rotate(213deg);
                "><img class="card" src="/assets-normal/img/clubs-golden.png"
                        alt="King of Spades" /></span><span
                    class="suit-segment" style="
                position: absolute;
                left: 108.944px;
                top: -17.8509px;
                transform: rotate(320deg);
                "><img class="card" src="/assets-normal/img/golden-diamond.png"
                        alt="King of Spades" /></span><span
                    class="suit-segment" style="
                position: absolute;
                left: 121.633px;
                top: 55.3717px;
                transform: rotate(267deg);
                "><img class="card" src="/assets-normal/img/spades-golden.png"
                        alt="King of Spades" /></span>
            </div>

            <!-- Marker -->
            <div id="marker"> 
                <!-- <img class="gem-marker" src="/assets-normal/img/gem-new.png"> -->
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
                <button id="clear-bets" class="cmn--btn active w-100 m-3" style="border: 2px solid white;">Clear</button>
                <button id="double-bets" class="cmn--btn active w-100 m-3" style="border: 2px solid white;">Double</button>
                <button id="repeat-bet" class="cmn--btn active w-100 m-3" style="border: 2px solid white;">Repeat</button>
            </div>
            <div id="auto-spin-countdown" style="font-size: 18px; text-align: center;">
                <svg id="circular-timer" width="200" height="200" viewBox="0 0 200 200"></svg>
            </div>

        </div>


        <div>
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
<div id="foter-div">
<footer id="poker-footer" class="footer-section bg_img" style="background: url(assets/images/footer/bg.jpg) center;">
            <div class="footer-top">
                <div class="container">
                    <div class="footer-wrapper d-flex flex-wrap align-items-center justify-content-md-between justify-content-center">
                        <div class="logo mb-3 mb-md-0">
                            <a href="index.php"><img src="assets/images/logo.png" alt="logo"></a>
                        </div>
                        <ul class="footer-links d-flex flex-wrap justify-content-center">
                            <li><a href="games.php">Games</a></li>
                            <li><a href="terms-conditions.php">Terms & Conditions</a></li>
                            <li><a href="policy.php">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="container">
                    <div class="footer-wrapper d-flex flex-wrap justify-content-center align-items-center text-center">
                        <p class="copyright text-white">
                            Copyrights &copy; <?php echo date("Y"); ?> All Rights Reserved by
                            <a href="#0" class="text--base ms-2">Viserlab</a>
                        </p>
                    </div>
                </div>
            </div>
            <div class="shapes">
                <img src="assets/images/footer/shape.png" alt="footer" class="shape1">
            </div>
        </footer>
</div>
   

        <!-- jQuery library -->
        <script src="assets/js/lib/jquery-3.6.0.min.js"></script>
        <!-- bootstrap 5 js -->
        <script src="assets/js/lib/bootstrap.min.js"></script>
        <!-- Pluglin Link -->
        <script src="assets/js/lib/slick.min.js"></script>
        <!-- main js -->
        <script src="assets/js/main.js"></script>
    </div>
</body>

