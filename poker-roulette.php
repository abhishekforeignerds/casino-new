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

$stmt = $conn->prepare("SELECT SUM(win_value) AS total_win FROM game_results WHERE user_id = ?");
$stmt->bind_param("i", $user_id);

$stmt->execute();
$stmt->bind_result($winningPoints);
$stmt->fetch();
$stmt->close();
$stmt = $conn->prepare("SELECT SUM(bet) AS total_bet FROM game_results WHERE user_id = ?");
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
                            <a href="about.php">About</a>
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
        <div class="bordersboxes" id="winPoints-display"> Win Points: <span style='color: gold;font-weight:800;'> <?php echo htmlspecialchars($winningPoints ?? 0); ?> </span> </div>

        <div class="bordersboxes" id="balance-display"> Balance: <span style='color: gold;font-weight:800;'> <?php echo htmlspecialchars($points ?? 0); ?> </span> </div>

        <div class="bordersboxes" id="currentbet-display"> Current Bet: <span style="color: gold; font-weight:800;">0</span> </div>
        <div class="bordersboxes" id="totalbet-display"> Total Bet: <span style="color: gold; font-weight:800;"> <?php echo htmlspecialchars($bettingPoints ?? 0); ?></span> </div>


          
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
                    <img class="card" src="/assets-normal/img/k-removebg-preview.png" alt="King of Spades"
                        style="transform: rotate(171deg);">
                </div>
                <div class="card-wrapper" style="left: 249px;top: 22px;" data-initial-rotation="205">
                    <img class="card" src="/assets-normal/img/k-removebg-preview.png" alt="King of Diamonds"
                        style="transform: rotate(205deg);">
                </div>
                <div class="card-wrapper" style="left: 312px;top: 82px;" data-initial-rotation="245">
                    <img class="card" src="/assets-normal/img/k-removebg-preview.png" alt="King of Clubs"
                        style="transform: rotate(245deg);">
                </div>
                <div class="card-wrapper" style="left: 335px;top: 161px;" data-initial-rotation="272">
                    <img class="card" src="/assets-normal/img/k-removebg-preview.png" alt="King of Hearts"
                        style="transform: rotate(272deg);">
                </div>
                <!-- Queens Row -->
                <div class="card-wrapper" style="left: 313px;top: 242px;" data-initial-rotation="298">
                    <img class="card" src="/assets-normal/img/q.png" alt="Queen of Spades"
                        style="transform: rotate(298deg);">
                </div>
                <div class="card-wrapper" style="left: 255px;top: 301px;" data-initial-rotation="327">
                    <img class="card" src="/assets-normal/img/q.png" alt="Queen of Diamonds"
                        style="transform: rotate(327deg);">
                </div>
                <div class="card-wrapper" style="left: 174px;top: 325px;" data-initial-rotation="3">
                    <img class="card" src="/assets-normal/img/q.png" alt="Queen of Clubs"
                        style="transform: rotate(3deg);">
                </div>
                <div class="card-wrapper" style="left: 94px;top: 303px;" data-initial-rotation="30">
                    <img class="card" src="/assets-normal/img/q.png" alt="Queen of Hearts"
                        style="transform: rotate(30deg);">
                </div>
                <!-- Jacks Row -->
                <div class="card-wrapper" style="left: 32px;top: 242px;" data-initial-rotation="61">
                    <img class="card" src="/assets-normal/img/j-removebg-preview.png" alt="Jack of Spades"
                        style="transform: rotate(61deg);">
                </div>
                <div class="card-wrapper" style="left: 10px;top: 159px;" data-initial-rotation="98">
                    <img class="card" src="/assets-normal/img/j-removebg-preview.png" alt="Jack of Diamonds"
                        style="transform: rotate(98deg);">
                </div>
                <div class="card-wrapper" style="left: 33px;top: 82px;" data-initial-rotation="116">
                    <img class="card" src="/assets-normal/img/j-removebg-preview.png" alt="Jack of Clubs"
                        style="transform: rotate(116deg);">
                </div>
                <div class="card-wrapper" style="left: 94px;top:22px;" data-initial-rotation="153">
                    <img class="card" src="/assets-normal/img/j-removebg-preview.png" alt="Jack of Hearts"
                        style="transform: rotate(153deg);">
                </div>
            </div>

            <!-- Center Circle -->
            <div id="center-circle"> <div class="center-text">N</div></div>

            <!-- Suit Ring -->
            <div id="suit-ring"></div>

            <!-- Marker -->
            <div id="marker"> <img class="gem-marker" src="/assets-normal/img/gem-new.png"></div>
        </div>




        <div id="grid-outer">

            <div id="card-grid">
                <!-- Top header row -->
                <div class="grid-header empty" data-index="12">
                    <div id="withdraw-time" style="font-size: 15px;"></div>
                </div>
                <div class="grid-header" id="suitIcon1" style="color:black" data-index="13">♠</div>
                <div class="grid-header" id="suitIcon2" style="color:red" data-index="14">♦</div>
                <div class="grid-header" id="suitIcon3" style="color:black" data-index="15">♣</div>
                <div class="grid-header" id="suitIcon4" style="color:red" data-index="16">♥</div>

                <!-- King Row -->
                <div class="grid-label" id="grid-label-1" data-index="17">
                    <img class="card" src="/assets-normal/img/k-removebg-preview.png" alt="King of Spades">
                </div>
                <div class="grid-card" data-index="0">
                    <img src="https://deckofcardsapi.com/static/img/KS.png" alt="King of Spades">
                </div>
                <div class="grid-card" data-index="1">
                    <img src="https://deckofcardsapi.com/static/img/KD.png" alt="King of Diamonds">
                </div>
                <div class="grid-card" data-index="2">
                    <img src="https://deckofcardsapi.com/static/img/KC.png" alt="King of Clubs">
                </div>
                <div class="grid-card" data-index="3">
                    <img src="https://deckofcardsapi.com/static/img/KH.png" alt="King of Hearts">
                </div>

                <!-- Queen Row -->
                <div class="grid-label" id="grid-label-2" data-index="21">
                    <img class="card" src="/assets-normal/img/q.png" alt="Queen of Diamonds">
                </div>
                <div class="grid-card" data-index="4">
                    <img src="https://deckofcardsapi.com/static/img/QS.png" alt="Queen of Spades">
                </div>
                <div class="grid-card" data-index="5">
                    <img src="https://deckofcardsapi.com/static/img/QD.png" alt="Queen of Diamonds">
                </div>
                <div class="grid-card" data-index="6">
                    <img src="https://deckofcardsapi.com/static/img/QC.png" alt="Queen of Clubs">
                </div>
                <div class="grid-card" data-index="7">
                    <img src="https://deckofcardsapi.com/static/img/QH.png" alt="Queen of Hearts">
                </div>

                <!-- Jack Row -->
                <div class="grid-label" id="grid-label-3" data-index="25">
                    <img class="card" src="/assets-normal/img/j-removebg-preview.png"
                        alt="Jack of Diamonds">
                </div>
                <div class="grid-card" data-index="8">
                    <img src="https://deckofcardsapi.com/static/img/JS.png" alt="Jack of Spades">
                </div>
                <div class="grid-card" data-index="9">
                    <img src="https://deckofcardsapi.com/static/img/JD.png" alt="Jack of Diamonds">
                </div>
                <div class="grid-card" data-index="10">
                    <img src="https://deckofcardsapi.com/static/img/JC.png" alt="Jack of Clubs">
                </div>
                <div class="grid-card" data-index="11">
                    <img src="https://deckofcardsapi.com/static/img/JH.png" alt="Jack of Hearts">
                </div>
            </div>


        </div>
    </div>
    <div id="main-container">
        <!-- Wheel Container -->

        <button id="spinBtn" >Spin</button>

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



    <script>
// CONFIGURABLE VARIABLES
let balance = <?php echo htmlspecialchars($points ?? 0); ?>;
let winningPoints = <?php echo htmlspecialchars($winningPoints ?? 0); ?>;
let bettingPoints = <?php echo htmlspecialchars($bettingPoints ?? 0); ?>;

let winningPercentage = <?php echo htmlspecialchars($winning_percentage ?? 70); ?>;
let overrideChance = <?php echo htmlspecialchars($override_chance ?? 0.3); ?>;
let spinTimerDuration = <?php echo htmlspecialchars($spinTimerDuration ?? 120); ?>;
let maxBetamount = <?php echo htmlspecialchars($maxBetamount ?? 10000); ?>;

let gameResults = <?php echo json_encode($gameResults ?? []); ?>;
</script>


<script src="./assets-normal/js/poker-roulette.js"></script>


        
<script>

      
  const svg = document.getElementById("circular-timer");
  const segmentCountTimer = 60;  // number of sticks
  const centerXTimer = 100, centerYTimer = 100; // center of SVG
  const radiusTimer = 70;      // radiusTimer from center where sticks start
  const stickLength = 10; // length of each stick
  const timerSticks = [];

  // Create sticks around the circle
  for (let i = 0; i < segmentCountTimer; i++) {
      const angle = i * (360 / segmentCountTimer);
      const rad = angle * Math.PI / 180;
      const x1 = centerXTimer + radiusTimer * Math.cos(rad);
      const y1 = centerYTimer + radiusTimer * Math.sin(rad);
      const x2 = centerXTimer + (radiusTimer + stickLength) * Math.cos(rad);
      const y2 = centerYTimer + (radiusTimer + stickLength) * Math.sin(rad);
      
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", x1);
      line.setAttribute("y1", y1);
      line.setAttribute("x2", x2);
      line.setAttribute("y2", y2);
      line.setAttribute("stroke-width", "4");
      // Initially, all sticks are white
      line.setAttribute("stroke", "white");
      svg.appendChild(line);
      timerSticks.push(line);
  }

  // Create center text for countdown display
  const countdownText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  countdownText.setAttribute("x", centerXTimer);
  countdownText.setAttribute("y", centerYTimer);
  countdownText.setAttribute("text-anchor", "middle");
  countdownText.setAttribute("dominant-baseline", "middle"); // centers text vertically
  countdownText.setAttribute("font-size", "24");
  countdownText.setAttribute("fill", "#333");
  countdownText.textContent = 10;  // initial countdown value
  svg.appendChild(countdownText);


  // --- Timer and Display Code ---
  const currentTimeEl = document.getElementById('current-time');
  const withdrawTimeEl = document.getElementById('withdraw-time');
  let countdown = 10; // 10 seconds for auto spin

  // Update the circular timer sticks based on the time passed
  function updateTimerSticks() {
      // Calculate fraction of time passed (0 when countdown is 10, 1 when countdown is 0)
      const fractionPassed = (10 - countdown) / 10;
      const greenSegments = Math.round(fractionPassed * segmentCountTimer);
      
      // Update each stick: if its index is less than greenSegments, color it green, else white
      timerSticks.forEach((stick, index) => {
          if (index < greenSegments) {
              stick.setAttribute("stroke", "green");
          } else {
              stick.setAttribute("stroke", "white");
          }
      });
  }

  // Update the time displays and center countdown text
  function updateTimeDisplay() {
      const now = new Date();
      const currentTime = now.toLocaleTimeString();
      // Withdraw time will show only hours and minutes (no seconds)
      const withdrawTime = new Date(now.getTime() + countdown * 1000)
        .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      currentTimeEl.textContent = `Current Time: ${currentTime}`;
      withdrawTimeEl.textContent = `Withdraw Time: ${withdrawTime}`;
      
      // Update the circular timer sticks
      updateTimerSticks();
      
      // Update the center countdown text
      countdownText.textContent = countdown;
  }

  // Initial display update
  updateTimeDisplay();

  // Timer update loop (runs every second)
  const timerInterval = setInterval(() => {
      if (countdown <= 0) {
          // Auto-trigger the spin
          document.getElementById("spinBtn").click();
          // Reset countdown after auto spin
          countdown = 10;
      } else {
          countdown--;
      }
      updateTimeDisplay();
  }, 1000);

    const textElement = document.querySelector("text");
    textElement.setAttribute("fill", "white");



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

