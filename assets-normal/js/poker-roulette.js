

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

  // Fix marker so that it always points upward.
  // (Ensure your CSS positions the marker appropriately.)
//   function adjustMarker() {
//     const marker = document.getElementById("marker");
//     marker.style.transform = "none";
//   }
//   adjustMarker();

  // Spin event listener:
  // - Both the main wheel and suit ring start rotating concurrently.
  // - The main wheel rotates clockwise, and the suit ring rotates anticlockwise by the same magnitude.
  // - After 4 seconds, both stop, and the winning segment is determined based on the marker.
  // - The winning segment's card image and suit icon are then used to determine the winning card.
//   document.getElementById("spinBtn").addEventListener("click", function () {
//     resultDisplay.textContent = "";
//     // Remove any previous blinking on grid cards (ensure your CSS .winner class defines the blink)
//     document.querySelectorAll(".grid-card").forEach(card => card.classList.remove("winner"));

//     const wheel = document.getElementById("wheel");
//     const suitRing = document.getElementById("suit-ring");

//     let betTotal = Object.values(bets).reduce((sum, amount) => sum + amount, 0);

//     // Calculate a large delta rotation for the main wheel.
//     const deltaAngle = 3600 + Math.floor(Math.random() * 360);
//     currentRotation += deltaAngle;

//     // Animate main wheel spinning clockwise over 4 seconds.
//     wheel.style.transition = "transform 4s ease-out";
//     wheel.style.transform = "rotate(" + currentRotation + "deg)";

//     // Animate suit ring spinning anticlockwise concurrently.
//     suitRing.style.transition = "transform 4s ease-out";
//     suitRing.style.transform = "rotate(" + (-currentRotation) + "deg)";

//     // After 4 seconds, immediately determine the winning segment.
//     setTimeout(() => {
//   // Normalize the currentRotation to keep it between 0 and 360 degrees
//   currentRotation = currentRotation % 360;
  
//   // Remove transition and update the transform so that the wheel stays at its normalized position.
//   wheel.style.transition = "none";
//   wheel.style.transform = "rotate(" + currentRotation + "deg)";
//   suitRing.style.transition = "none";
//   suitRing.style.transform = "rotate(" + (-currentRotation) + "deg)";
  
//   // Compute effective angle at marker (top). Marker is at 0°.
//   const winningIndex = getWinningIndex(currentRotation);
//   const winningCardEl = document.querySelector(`.grid-card[data-index="${winningIndex}"]`);
//   // Highlight winning grid cell (ensure your CSS .winner class creates the blink effect).
//   winningCardEl.classList.add("winner");

//   let userWon = false;
//   let winValue = 0;
//   if (bets[winningIndex] !== undefined) {
//     const betAmount = bets[winningIndex];
//     winValue = betAmount * 2;
//     balance += winValue;
//     userWon = true;
//   }
//   updateBalanceDisplay();
//   resultDisplay.textContent = userWon ? "You win " + winValue + "!" : (Object.values(bets).length === 0 ? "No bet was placed." : "You lose.");

//   // Retrieve winning card details from the grid card.
//   const imgEl = winningCardEl.querySelector("img");
//   const winningSrc = imgEl.getAttribute("src");
//   let suit = "";
//   if (imgEl.alt.includes("Spades")) suit = "♠";
//   else if (imgEl.alt.includes("Diamonds")) suit = "♦";
//   else if (imgEl.alt.includes("Clubs")) suit = "♣";
//   else if (imgEl.alt.includes("Hearts")) suit = "♥";

//   const suitEl = document.getElementById("suit-ring").children[winningIndex];
//   if (suitEl) {
//     suit = suitEl.textContent.trim();
//   }

//   addHistoryCard(winningSrc, suit);
//   showCenterCard(winningSrc, suit);

//   recordGameResult(winningIndex, Object.values(bets).reduce((sum, amount) => sum + amount, 0), winValue);
//   updateBankValue();

//   // Clear bets.
//   document.querySelectorAll(".bet-overlay").forEach(overlay => overlay.remove());
//   for (let key in bets) delete bets[key];
// }, 4000);

//   });

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
    
    // Determine winning segment.
    const winningIndex = getWinningIndex(currentRotation);
    const winningCardEl = document.querySelector(`.grid-card[data-index="${winningIndex}"]`);
    winningCardEl.classList.add("winner");
    
    let userWon = false;
    let winValue = 0;
    if (bets[winningIndex] !== undefined) {
      const betAmount = bets[winningIndex];
      winValue = betAmount * 2;
      balance += winValue;
      userWon = true;
    }
    updateBalanceDisplay();
    resultDisplay.textContent = userWon
      ? "You win " + winValue + "!"
      : (betTotal === 0 ? "No bet was placed." : "You lose.");
    
    // Retrieve winning card details.
    const imgEl = winningCardEl.querySelector("img");
    const winningSrc = imgEl.getAttribute("src");
    let suit = "";
    if (imgEl.alt.includes("Spades")) suit = "♠";
    else if (imgEl.alt.includes("Diamonds")) suit = "♦";
    else if (imgEl.alt.includes("Clubs")) suit = "♣";
    else if (imgEl.alt.includes("Hearts")) suit = "♥";
    
    // Check the suit ring element for this segment.
    const suitEl = document.getElementById("suit-ring").children[winningIndex];
    if (suitEl) {
      suit = suitEl.textContent.trim();
    }
    
    addHistoryCard(winningSrc, suit);
    showCenterCard(winningSrc, suit);
    
    recordGameResult(winningIndex, betTotal, winValue);
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