<?php
session_start();

// Restrict access if the user is not logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: sign-in.php");
    exit();
}
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
                            <a class="text-center mt-3">Welcome,
                                <?php echo htmlspecialchars($_SESSION['user_id']); ?>!
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
    <button id="fullscreenBtn" style="color:white;font-size: 32px;border: none;background: none;z-index: 1000;cursor: pointer;">
                    <i class="fas fa-expand"></i>
                    </button>

                    <script>
                    const fullscreenBtn = document.getElementById("fullscreenBtn");
                    const navbar = document.getElementById("navbar-header");
                    const footer = document.getElementById("poker-footer");

                    fullscreenBtn.addEventListener("click", function() {
                        if (!document.fullscreenElement) {
                            
                        // Request fullscreen mode
                        document.documentElement.requestFullscreen().catch(err => console.warn("Error attempting to enable fullscreen:", err));
                        } else {
                        // Exit fullscreen mode
                        document.exitFullscreen().catch(err => console.warn("Error attempting to exit fullscreen:", err));
                        }
                    });

                    // Listen for fullscreen change events to update the icon
                    document.addEventListener("fullscreenchange", () => {
                        if (!document.fullscreenElement) {
                        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
                        navbar.style.display= 'block';
                        footer.style.display= 'block';
                        } else {
                        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
                        navbar.style.display= 'none';
                        footer.style.display= 'none';
                        }
                    });
                    </script>
   <link href="./assets-normal/css/poker-roulette.css" rel="stylesheet" type="text/css">
    </head>
    <body>
    <!-- Result Message Display -->
    <div id="result-display" class="custom-alert" style="font-size:18px; margin:10px 0;"></div>

    <div id="image-roulette">
  

        <!-- Balance Display -->
        <div id="balance-display">Balance: <?php echo htmlspecialchars($_SESSION['points']); ?>;</div>
        <div id="time-info-container" style="text-align:center; margin-bottom: 20px;">
  <div id="current-time" style="font-size: 18px;"></div>



</div>

        <!-- Main Container: Wheel and Grid -->
        <div id="main-container">
            <!-- Wheel Container -->
            <div id="wheel-container">
                <div id="wheel">
                    <!-- SVG segments and lines -->
                    <svg id="segments-svg" width="350" height="350"></svg>
                    <svg id="lines-svg" width="350" height="350"></svg>
                    <!-- Card wrappers -->
                    <!-- Kings Row -->
                    <div class="card-wrapper" style="left: 166px;top: 0px;" data-initial-rotation="171">
                        <img class="card" src="https://deckofcardsapi.com/static/img/KS.png" alt="King of Spades" style="transform: rotate(171deg);">
                    </div>
                    <div class="card-wrapper" style="left: 249px;top: 22px;" data-initial-rotation="205">
                        <img class="card" src="https://deckofcardsapi.com/static/img/KD.png" alt="King of Diamonds" style="transform: rotate(205deg);">
                    </div>
                    <div class="card-wrapper" style="left: 312px;top: 82px;" data-initial-rotation="245">
                        <img class="card" src="https://deckofcardsapi.com/static/img/KC.png" alt="King of Clubs" style="transform: rotate(245deg);">
                    </div>
                    <div class="card-wrapper" style="left: 335px;top: 161px;" data-initial-rotation="272">
                        <img class="card" src="https://deckofcardsapi.com/static/img/KH.png" alt="King of Hearts" style="transform: rotate(272deg);">
                    </div>
                    <!-- Queens Row -->
                    <div class="card-wrapper" style="left: 313px;top: 242px;" data-initial-rotation="298">
                        <img class="card" src="https://deckofcardsapi.com/static/img/QS.png" alt="Queen of Spades" style="transform: rotate(298deg);">
                    </div>
                    <div class="card-wrapper" style="left: 255px;top: 301px;" data-initial-rotation="327">
                        <img class="card" src="https://deckofcardsapi.com/static/img/QD.png" alt="Queen of Diamonds" style="transform: rotate(327deg);">
                    </div>
                    <div class="card-wrapper" style="left: 174px;top: 325px;" data-initial-rotation="3">
                        <img class="card" src="https://deckofcardsapi.com/static/img/QC.png" alt="Queen of Clubs" style="transform: rotate(3deg);">
                    </div>
                    <div class="card-wrapper" style="left: 94px;top: 303px;" data-initial-rotation="30">
                        <img class="card" src="https://deckofcardsapi.com/static/img/QH.png" alt="Queen of Hearts" style="transform: rotate(30deg);">
                    </div>
                    <!-- Jacks Row -->
                    <div class="card-wrapper" style="left: 32px;top: 242px;" data-initial-rotation="61">
                        <img class="card" src="https://deckofcardsapi.com/static/img/JS.png" alt="Jack of Spades" style="transform: rotate(61deg);">
                    </div>
                    <div class="card-wrapper" style="left: 10px;top: 159px;" data-initial-rotation="98">
                        <img class="card" src="https://deckofcardsapi.com/static/img/JD.png" alt="Jack of Diamonds" style="transform: rotate(98deg);">
                    </div>
                    <div class="card-wrapper" style="left: 33px;top: 82px;" data-initial-rotation="116">
                        <img class="card" src="https://deckofcardsapi.com/static/img/JC.png" alt="Jack of Clubs" style="transform: rotate(116deg);">
                    </div>
                    <div class="card-wrapper" style="left: 94px;top:22px;" data-initial-rotation="153">
                        <img class="card" src="https://deckofcardsapi.com/static/img/JH.png" alt="Jack of Hearts" style="transform: rotate(153deg);">
                    </div>
                </div>
                <!-- Center Circle -->
                <div id="center-circle"></div>
                <!-- Marker -->
                <div id="marker"></div>
               
            </div>
            
          

            <div id="grid-outer">
               
            <div id="card-grid">
                <!-- Top header row -->
                <div class="grid-header empty">  <div id="withdraw-time" style="font-size: 15px;"></div></div>
                <div class="grid-header" style="color:black">♠</div>
                <div class="grid-header" style="color:red">♦</div>
                <div class="grid-header" style="color:black">♣</div>
                <div class="grid-header" style="color:red">♥</div>

                <!-- King Row -->
                <div class="grid-label">K</div>
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
                <div class="grid-label">Q</div>
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
                <div class="grid-label">J</div>
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
            
            <button id="spinBtn">Spin</button>

            <div id="auto-spin-countdown" style="font-size: 18px; text-align: center;">
  <svg id="circular-timer" width="200" height="200" viewBox="0 0 200 200"></svg>
</div>

          
                <div>
                <h3>Last 12 Winning Cards</h3>
                <div id="history-box">
                    <div id="history-container"></div>
                </div>
                <div class="container-chip-child">
                <div id="#073d91" class="coin" data-value="5"><span>5</span></div>
                <div id="#32a9f1" class="coin" data-value="10"><span>10</span></div>
                <div id="orange" class="coin" data-value="20"><span>20</span></div>
                <div id="#315a97" class="coin" data-value="50"><span>50</span></div>
                <div id="#ff9108" class="coin" data-value="100"><span>100</span></div>
                <div id="#cbbeb5" class="coin" data-value="500"><span>500</span></div>
                
            </div>
            </div>
        </div>

        <script>
            // CONFIGURABLE VARIABLES
            // CONFIGURABLE VARIABLES
            const segmentCount = 12;
            const segmentAngle = 360 / segmentCount; // 30° each
            let segmentOffset = -15; // Adjust segment boundaries

            // For the 400px wheel container: update center and outer radius
            const centerX = 200, centerY = 200, outerRadius = 200, innerRadius = 28;

            // Define three colors for the segments
            const segmentColors = ["#dc9600", "#ffdc00", "#f5cd28","d19e1d"]; // Change these values as desired

            // Draw alternating segments with three colors
            function drawSegments() {
                const svg = document.getElementById("segments-svg");
                svg.innerHTML = '';
                for (let i = 0; i < segmentCount; i++) {
                    const startDeg = segmentOffset + i * segmentAngle;
                    const endDeg = startDeg + segmentAngle;
                    const startRad = startDeg * Math.PI / 180;
                    const endRad = endDeg * Math.PI / 180;
                    const x1 = centerX + outerRadius * Math.cos(startRad);
                    const y1 = centerY + outerRadius * Math.sin(startRad);
                    const x2 = centerX + outerRadius * Math.cos(endRad);
                    const y2 = centerY + outerRadius * Math.sin(endRad);
                    const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} Z`;
                    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
                    // Use three different colors by cycling through the segmentColors array
                    path.setAttribute("fill", segmentColors[i % 3]);
                    path.setAttribute("d", d);
                    svg.appendChild(path);
                }
            }


            // Draw radial boundary lines
            function drawLines() {
                const svg = document.getElementById("lines-svg");
                svg.innerHTML = '';
                for (let i = 0; i < segmentCount; i++) {
                    const angleDeg = segmentOffset + i * segmentAngle;
                    const angleRad = angleDeg * Math.PI / 180;
                    const x1 = centerX + innerRadius * Math.cos(angleRad);
                    const y1 = centerY + innerRadius * Math.sin(angleRad);
                    const x2 = centerX + outerRadius * Math.cos(angleRad);
                    const y2 = centerY + outerRadius * Math.sin(angleRad);
                    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    line.setAttribute("x1", x1);
                    line.setAttribute("y1", y1);
                    line.setAttribute("x2", x2);
                    line.setAttribute("y2", y2);
                    line.setAttribute("stroke", "rgba(0,0,0,0.5)");
                    line.setAttribute("stroke-width", "2");
                    svg.appendChild(line);
                }
            }
            drawSegments();
            drawLines();

            // Calculate winning index based on current rotation
            function getWinningIndex(rotationAngle) {
                const r = rotationAngle % 360;
                const effectiveAngle = (360 - r + segmentAngle / 2 - segmentOffset) % 360;
                return Math.floor(effectiveAngle / segmentAngle);
            }

            let currentRotation = 0;
            let balance = <?php echo htmlspecialchars($_SESSION['points']); ?>;
            let selectedCoin = null;
            // bets object will map grid card indexes to bet amounts
            const bets = {};

            const balanceDisplay = document.getElementById("balance-display");
            const resultDisplay = document.getElementById("result-display");

            function updateBalanceDisplay() {
                balanceDisplay.textContent = "Balance: " + balance;
            }
            updateBalanceDisplay();

            // Helper: Update bank value on server via AJAX using update_bank.php
            function updateBankValue() {
                fetch('../../api/update_bank.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `bankValue=${encodeURIComponent(balance)}`
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log("Bank value updated:", data.message);
                    } else {
                        console.error("Error updating bank value:", data.message);
                    }
                })
                .catch(error => console.error('AJAX request failed:', error));
            }

            // Coin selection
            document.querySelectorAll(".coin").forEach(btn => {
                btn.addEventListener("click", function () {
                    document.querySelectorAll(".coin").forEach(b => b.classList.remove("selected"));
                    this.classList.add("selected");
                    selectedCoin = parseInt(this.getAttribute("data-value"));
                });
            });

            // Place bet on grid cell when clicked
            document.querySelectorAll(".grid-card").forEach(card => {
                card.addEventListener("click", function () {
                    const index = this.getAttribute("data-index");
                    if (bets[index] !== undefined) return;
                    if (selectedCoin === null) return;
                    if (balance < selectedCoin) return;
                    balance -= selectedCoin;
                    updateBalanceDisplay();
                    bets[index] = selectedCoin;
                    const overlay = document.createElement("div");
                    overlay.className = "bet-overlay";
                    overlay.textContent = selectedCoin;
                    this.appendChild(overlay);
                });
            });

            // Helper: Add winning card image to history (max 12)
            function addHistoryCard(src) {
                const historyContainer = document.getElementById("history-container");
                const img = document.createElement("img");
                img.src = src;
                img.classList.add("history-card");
                historyContainer.appendChild(img);
                if (historyContainer.childNodes.length > 12) {
                    historyContainer.removeChild(historyContainer.firstChild);
                }
            }

            // Record game result via AJAX (game_id is set in the API to 2)
            function recordGameResult(winningSpin, betTotal, winValue = 0) {
                // Build URL-encoded form data string
                let formData = `winningSpin=${encodeURIComponent(winningSpin)}&betTotal=${encodeURIComponent(betTotal)}`;
                if (winValue > 0) {
                    formData += `&winValue=${encodeURIComponent(winValue)}`;
                }
                fetch('../../api/record_game.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        console.log("Game result stored:", data.message);
                    } else {
                        console.error("Error storing game result:", data.message);
                    }
                })
                .catch(error => console.error('AJAX request failed:', error));
            }

            // Spin event listener
            document.getElementById("spinBtn").addEventListener("click", function () {
                // Clear previous result message
                resultDisplay.textContent = "";

                // Remove winner highlight from grid cards
                document.querySelectorAll(".grid-card").forEach(card => card.classList.remove("winner"));

                const wheel = document.getElementById("wheel");

                // Calculate total bet amount (sum of all bets placed)
                let betTotal = Object.values(bets).reduce((sum, amount) => sum + amount, 0);

                const deltaAngle = 3600 + Math.floor(Math.random() * 360);
                currentRotation += deltaAngle;
                wheel.style.transform = "rotate(" + currentRotation + "deg)";

                // After spin animation (4 seconds)
                setTimeout(() => {
                    // Update each card's counter rotation if needed
                    document.querySelectorAll(".card-wrapper").forEach(wrapper => {
                        const initial = parseFloat(wrapper.dataset.initialRotation);
                        let cardRotation = initial - (currentRotation % 360);
                        cardRotation = ((cardRotation % 360) + 360) % 360;
                        // Uncomment below to update card image rotation if desired:
                        // wrapper.querySelector(".card").style.transform = "rotate(" + cardRotation + "deg)";
                    });

                    // Determine the winning card/index (using our getWinningIndex function)
                    const winningIndex = getWinningIndex(currentRotation);
                    const winningCardEl = document.querySelector(`.grid-card[data-index="${winningIndex}"]`);
                    winningCardEl.classList.add("winner");

                    // For our purposes, we use winningIndex as the winningSpin value.
                    const winningSpin = winningIndex;

                    // Determine if user won on the winning card
                    let userWon = false;
                    let winValue = 0;
                    if (bets[winningIndex] !== undefined) {
                        const betAmount = bets[winningIndex];
                        winValue = betAmount * 2;
                        balance += winValue;
                        userWon = true;
                    }
                    updateBalanceDisplay();

                    // Display result message
                    if (userWon) {
                        resultDisplay.textContent = "You win " + winValue + "!";
                    } else if (betTotal === 0) {
                        resultDisplay.textContent = "No bet was placed.";
                    } else {
                        resultDisplay.textContent = "You lose.";
                    }

                    // Add winning card image to history box
                    const winningCardImgSrc = winningCardEl.querySelector("img").src;
                    addHistoryCard(winningCardImgSrc);

                    // Record game result in the database
                    // If win, send winValue; if lose, omit winValue (defaults to 0)
                    recordGameResult(winningSpin, betTotal, winValue);

                    // Update bank value on server with the new balance
                    updateBankValue();

                    // Remove bet overlays and reset bets
                    document.querySelectorAll(".bet-overlay").forEach(overlay => overlay.remove());
                    for (let key in bets) delete bets[key];

                }, 4000);
            });
        </script>
        <script>

     // Timer and time display variables
// --- Circular Timer Setup ---
// --- Circular Timer Setup ---
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
countdownText.textContent = 120;  // initial countdown value
svg.appendChild(countdownText);


// --- Timer and Display Code ---
const currentTimeEl = document.getElementById('current-time');
const withdrawTimeEl = document.getElementById('withdraw-time');
let countdown = 120; // 120 seconds for auto spin

// Update the circular timer sticks based on the time passed
function updateTimerSticks() {
    // Calculate fraction of time passed (0 when countdown is 120, 1 when countdown is 0)
    const fractionPassed = (120 - countdown) / 120;
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
        countdown = 120;
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

