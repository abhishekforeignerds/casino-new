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
                        <img class="card" src="/assets-normal/img/k-removebg-preview.png" alt="King of Spades" style="transform: rotate(171deg);">
                    </div>
                    <div class="card-wrapper" style="left: 249px;top: 22px;" data-initial-rotation="205">
                        <img class="card" src="/assets-normal/img/k-removebg-preview.png" alt="King of Diamonds" style="transform: rotate(205deg);">
                    </div>
                    <div class="card-wrapper" style="left: 312px;top: 82px;" data-initial-rotation="245">
                        <img class="card" src="/assets-normal/img/k-removebg-preview.png" alt="King of Clubs" style="transform: rotate(245deg);">
                    </div>
                    <div class="card-wrapper" style="left: 335px;top: 161px;" data-initial-rotation="272">
                        <img class="card" src="/assets-normal/img/k-removebg-preview.png" alt="King of Hearts" style="transform: rotate(272deg);">
                    </div>
                    <!-- Queens Row -->
                    <div class="card-wrapper" style="left: 313px;top: 242px;" data-initial-rotation="298">
                        <img class="card" src="/assets-normal/img/q.png" alt="Queen of Spades" style="transform: rotate(298deg);">
                    </div>
                    <div class="card-wrapper" style="left: 255px;top: 301px;" data-initial-rotation="327">
                        <img class="card" src="/assets-normal/img/q.png" alt="Queen of Diamonds" style="transform: rotate(327deg);">
                    </div>
                    <div class="card-wrapper" style="left: 174px;top: 325px;" data-initial-rotation="3">
                        <img class="card" src="/assets-normal/img/q.png" alt="Queen of Clubs" style="transform: rotate(3deg);">
                    </div>
                    <div class="card-wrapper" style="left: 94px;top: 303px;" data-initial-rotation="30">
                        <img class="card" src="/assets-normal/img/q.png" alt="Queen of Hearts" style="transform: rotate(30deg);">
                    </div>
                    <!-- Jacks Row -->
                    <div class="card-wrapper" style="left: 32px;top: 242px;" data-initial-rotation="61">
                        <img class="card" src="/assets-normal/img/j-removebg-preview.png" alt="Jack of Spades" style="transform: rotate(61deg);">
                    </div>
                    <div class="card-wrapper" style="left: 10px;top: 159px;" data-initial-rotation="98">
                        <img class="card" src="/assets-normal/img/j-removebg-preview.png" alt="Jack of Diamonds" style="transform: rotate(98deg);">
                    </div>
                    <div class="card-wrapper" style="left: 33px;top: 82px;" data-initial-rotation="116">
                        <img class="card" src="/assets-normal/img/j-removebg-preview.png" alt="Jack of Clubs" style="transform: rotate(116deg);">
                    </div>
                    <div class="card-wrapper" style="left: 94px;top:22px;" data-initial-rotation="153">
                        <img class="card" src="/assets-normal/img/j-removebg-preview.png" alt="Jack of Hearts" style="transform: rotate(153deg);">
                    </div>
                </div>
        
                <!-- Center Circle -->
                <div id="center-circle"></div>
                
                <!-- Suit Ring -->
                <div id="suit-ring"></div>
                
                <!-- Marker -->
                <!-- <div id="marker"></div> -->
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
document.addEventListener("DOMContentLoaded", function() {
  const stickContainer = document.getElementById('stick-container');
  const containerSize = 400; // Container width and height
  const centerX = containerSize / 2;
  const centerY = containerSize / 2;

  // Container's border represents the outer circle (radius 200)
  const outerCircleRadius = (containerSize / 2) + 100; // 200px
  
  // Set inner circle radius so that the stick's top touches this circle.
  // For a bigger stick, we choose a smaller inner circle radius.
  const innerCircleRadius = 205; // adjust this value for more gap

  // The stick's length equals the difference between the outer and inner circles.
  const stickHeight = outerCircleRadius - innerCircleRadius; // 200 - 160 = 40px
  
  // Double the number of sticks.
  const numberOfSticks = 72;
  const stickWidth = 17;  // stick width (should match your CSS)

  // Clear any previous sticks.
  stickContainer.innerHTML = '';

  for (let i = 0; i < numberOfSticks; i++) {
    const stick = document.createElement('div');
    stick.classList.add('stick');

    // Calculate the angle (in degrees) for this stick.
    const angle = (360 / numberOfSticks) * i;
    const radian = angle * Math.PI / 180;

    // Position the stick so that its top edge sits on the inner circle.
    // Subtract half the stick's width to center it horizontally.
    const x = centerX + innerCircleRadius * Math.cos(radian) - (stickWidth / 2);
    const y = centerY + innerCircleRadius * Math.sin(radian);

    stick.style.left = `${x}px`;
    stick.style.top = `${y}px`;
    // Set the stick's height (its length)
    stick.style.height = `${stickHeight}px`;
    // Rotate the stick so that it points radially outward.
    stick.style.transform = `rotate(${angle}deg)`;

    stickContainer.appendChild(stick);
  }
});
</script>


        <script>
     


  // CONFIGURABLE VARIABLES
  const segmentCount = 12;
  const segmentAngle = 360 / segmentCount; // 30° each
  // Each segment is considered centered at multiples of 30°; we add half a segment (15°) when calculating the winner.
  const halfSegment = segmentAngle / 2; // 15°

  // For the 400px wheel container: update center and outer radius
  const centerX = 200, centerY = 200, outerRadius = 200, innerRadius = 28;

  // Define colors for segments
  const segmentColors = ["#dc9600", "#ffdc00", "#f5cd28"];

  // Draw segments (each segment spans from (i*30° -15°) to (i*30° +15°))
  function drawSegments() {
    const svg = document.getElementById("segments-svg");
    svg.innerHTML = '';
    for (let i = 0; i < segmentCount; i++) {
      const startDeg = i * segmentAngle - 15;
      const endDeg = i * segmentAngle + 15;
      const startRad = startDeg * Math.PI / 180;
      const endRad = endDeg * Math.PI / 180;
      const x1 = centerX + outerRadius * Math.cos(startRad);
      const y1 = centerY + outerRadius * Math.sin(startRad);
      const x2 = centerX + outerRadius * Math.cos(endRad);
      const y2 = centerY + outerRadius * Math.sin(endRad);
      const d = `M ${centerX} ${centerY} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 0 1 ${x2} ${y2} Z`;
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("fill", segmentColors[i % segmentColors.length]);
      path.setAttribute("d", d);
      svg.appendChild(path);
    }
  }

  // Draw radial boundary lines at (i*30° + 15°)
  function drawLines() {
    const svg = document.getElementById("lines-svg");
    svg.innerHTML = '';
    for (let i = 0; i < segmentCount; i++) {
      const angleDeg = 15 + i * segmentAngle;
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

  // Winning index is determined from the main wheel’s final rotation.
  // The marker is assumed at the top (0°). We compute the effective angle
  // as (360 - (rotation % 360) + halfSegment) mod 360,
  // then the winning index is Math.floor(effectiveAngle/segmentAngle)
  function getWinningIndex(rotationAngle) {
    const r = rotationAngle % 360;
    const effectiveAngle = (360 - r + halfSegment) % 360;
    return Math.floor(effectiveAngle / segmentAngle);
  }

  let currentRotation = 0;
  let balance = <?php echo htmlspecialchars($_SESSION['points']); ?>;
  let selectedCoin = null;
  const bets = {};

  const balanceDisplay = document.getElementById("balance-display");
  const resultDisplay = document.getElementById("result-display");

  function updateBalanceDisplay() {
    balanceDisplay.textContent = "Balance: " + balance;
  }
  updateBalanceDisplay();

  // AJAX helper to update bank value on server
  function updateBankValue() {
    fetch('../../api/update_bank.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `bankValue=${encodeURIComponent(balance)}`
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) { console.log("Bank value updated:", data.message); }
      else { console.error("Error updating bank value:", data.message); }
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

  // Add winning card image and suit icon to history (limit 12)
  function addHistoryCard(src, suit) {
    const historyContainer = document.getElementById("history-container");
    const wrapper = document.createElement("div");
    wrapper.classList.add("history-item");
    const img = document.createElement("img");
    img.src = src;
    img.classList.add("history-card");
    const suitSpan = document.createElement("span");
    suitSpan.textContent = suit;
    suitSpan.style.fontSize = "20px";
    suitSpan.style.marginLeft = "5px";
    wrapper.appendChild(img);
    wrapper.appendChild(suitSpan);
    historyContainer.appendChild(wrapper);
    if (historyContainer.childNodes.length > 12) {
      historyContainer.removeChild(historyContainer.firstChild);
    }
  }

  // Show winning card's image and suit icon in the center circle.
  function showCenterCard(src, suit) {
    const centerCircle = document.getElementById("center-circle");
    centerCircle.innerHTML = "";
    const img = document.createElement("img");
    img.src = src;
    img.style.width = "60px";
    img.style.height = "auto";
    const suitSpan = document.createElement("span");
    suitSpan.textContent = suit;
    suitSpan.style.fontSize = "40px";
    suitSpan.style.display = "block";
    suitSpan.style.textAlign = "center";
    centerCircle.appendChild(img);
    centerCircle.appendChild(suitSpan);
  }

  // Draw suit ring with icons positioned at segment centers.
  // Their positions are fixed (based on 0°, 30°, 60°, etc.)
  function drawSuitRing() {
    const suitRing = document.getElementById("suit-ring");
    suitRing.innerHTML = "";
    suitRing.style.position = "absolute";
    suitRing.style.width = "100px";
    suitRing.style.height = "100px";
    suitRing.style.top = "50%";
    suitRing.style.left = "50%";
    suitRing.style.transformOrigin = "50% 50%";
    suitRing.style.marginLeft = "-50px";
    suitRing.style.marginTop = "-50px";
    // Initially, no rotation is applied.
    suitRing.style.transform = "rotate(0deg)";
    suitRing.style.transition = "none";

    const suits = ["♠", "♥", "♣", "♦"];
    const ringRadius = 80; // distance from center to icon center
    for (let i = 0; i < segmentCount; i++) {
      const angleDeg = i * segmentAngle - 90;
      const angleRad = angleDeg * Math.PI / 180;
      const x = ringRadius * Math.cos(angleRad) + 50 - 10;
      const y = ringRadius * Math.sin(angleRad) + 50 - 10;
      const span = document.createElement("span");
      span.className = "suit-segment";
      span.style.position = "absolute";
      span.style.left = x + "px";
      span.style.top = y + "px";
      span.style.fontSize = "30px";
      // The suit for each segment is defined cyclically:
      span.textContent = suits[i % suits.length];
      span.style.color = (suits[i % suits.length] === "♦" || suits[i % suits.length] === "♥") ? "red" : "black";
      suitRing.appendChild(span);
    }
  }
  drawSuitRing();


document.getElementById("spinBtn").addEventListener("click", function () {
  resultDisplay.textContent = "";
  document.querySelectorAll(".grid-card").forEach(card => card.classList.remove("winner"));
  
  // Get the stick container element.
  const stickContainer = document.getElementById("stick-container");
  // Set top to 19.2rem when the spin starts.
  stickContainer.style.top = "19.2rem";
  
  const wheel = document.getElementById("wheel");
  const suitRing = document.getElementById("suit-ring");
  let betTotal = Object.values(bets).reduce((sum, amount) => sum + amount, 0);
  
  // Calculate a large delta rotation.
  const deltaAngle = 3600 + Math.floor(Math.random() * 360);
  currentRotation += deltaAngle;
  
  // Animate the spin.
  wheel.style.transition = "transform 4s ease-out";
  wheel.style.transform = "rotate(" + currentRotation + "deg)";
  
  suitRing.style.transition = "transform 4s ease-out";
  suitRing.style.transform = "rotate(" + (-currentRotation) + "deg)";
  
  // After the spin stops (4 seconds), update positions.
  setTimeout(() => {
  // Change the stick container top so that it jumps to 21.2rem.
  stickContainer.style.top = "21.2rem";
  
  // Normalize the rotation so that currentRotation is within 0-359°.
  currentRotation = currentRotation % 360;
  // Remove transition so the final position is locked.
  wheel.style.transition = "none";
  wheel.style.transform = "rotate(" + currentRotation + "deg)";
  suitRing.style.transition = "none";
  suitRing.style.transform = "rotate(" + (-currentRotation) + "deg)";
  
  // Determine winning segment index based on rotation.
  const winningIndex = getWinningIndex(currentRotation);
  
  // Remove previous winner highlights.
  document.querySelectorAll(".grid-card, .card-wrapper").forEach(el => el.classList.remove("winner"));
  
  // Get the winning card from the wheel card wrappers.
  const wheelCards = document.querySelectorAll(".card-wrapper");
  const winningWheelCard = wheelCards[winningIndex];
  winningWheelCard.classList.add("winner"); // blink/highlight this wheel segment
  
  // Retrieve winning card details from the wheel image.
  const imgEl = winningWheelCard.querySelector("img");
  const winningSrc = imgEl.getAttribute("src");
  const altText = imgEl.getAttribute("alt") || "";
  
  // Determine card type based on image source.
  let cardType = "";
  if (winningSrc.indexOf("k-removebg-preview.png") !== -1) {
    cardType = "King";
  } else if (winningSrc.indexOf("q.png") !== -1) {
    cardType = "Queen";
  } else if (winningSrc.indexOf("j-removebg-preview.png") !== -1) {
    cardType = "Jack";
  }
  
  // Extract suit from alt text (assumes format "King of Spades", etc.)
  let suitName = "";
  if (altText.indexOf("Spades") !== -1) {
    suitName = "Spades";
  } else if (altText.indexOf("Diamonds") !== -1) {
    suitName = "Diamonds";
  } else if (altText.indexOf("Clubs") !== -1) {
    suitName = "Clubs";
  } else if (altText.indexOf("Hearts") !== -1) {
    suitName = "Hearts";
  }
  
  // Define suit order matching the grid columns (♠, ♦, ♣, ♥)
  const suitOrder = { "Spades": 0, "Diamonds": 1, "Clubs": 2, "Hearts": 3 };
  
  // Compute grid cell index:
  // King row starts at index 0, Queen row at index 4, Jack row at index 8.
  let baseIndex = 0;
  if (cardType === "Queen") {
    baseIndex = 4;
  } else if (cardType === "Jack") {
    baseIndex = 8;
  }
  
  // Determine offset based on suit.
  const suitOffset = suitOrder[suitName] !== undefined ? suitOrder[suitName] : 0;
  const gridIndex = baseIndex + suitOffset;
  
  // Highlight the matching grid cell.
  const winningGridCard = document.querySelector(`.grid-card[data-index="${gridIndex}"]`);
  if (winningGridCard) {
    winningGridCard.classList.add("winner");
  }
  
  // If there is a bet on the winning grid cell, update winnings.
  let userWon = false;
  let winValue = 0;
  if (bets[gridIndex] !== undefined) {
    const betAmount = bets[gridIndex];
    winValue = betAmount * 2;
    balance += winValue;
    userWon = true;
  }
  
  updateBalanceDisplay();
  resultDisplay.textContent = userWon
    ? "You win " + winValue + "!"
    : (Object.keys(bets).length === 0 ? "No bet was placed." : "You lose.");
  
  // Show winning card in center circle.
  // (Also using suit icon from the suit ring for consistency.)
  let suitIcon = "";
  // Find the suit ring span corresponding to the wheel winning segment.
  const suitEl = suitRing.children[winningIndex];
  if (suitEl) {
    suitIcon = suitEl.textContent.trim();
  }
  
  addHistoryCard(winningSrc, suitIcon);
  showCenterCard(winningSrc, suitIcon);
  
  recordGameResult(winningIndex, Object.values(bets).reduce((sum, amt) => sum + amt, 0), winValue);
  updateBankValue();
  
  // Clear bets.
  document.querySelectorAll(".bet-overlay").forEach(overlay => overlay.remove());
  for (let key in bets) delete bets[key];
  
}, 4000);

});


  // Record game result via AJAX.
  function recordGameResult(winningSpin, betTotal, winValue = 0) {
    let formData = `winningSpin=${encodeURIComponent(winningSpin)}&betTotal=${encodeURIComponent(betTotal)}`;
    if (winValue > 0) {
      formData += `&winValue=${encodeURIComponent(winValue)}`;
    }
    fetch('../../api/record_game.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) { console.log("Game result stored:", data.message); }
      else { console.error("Error storing game result:", data.message); }
    })
    .catch(error => console.error('AJAX request failed:', error));
  }
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

