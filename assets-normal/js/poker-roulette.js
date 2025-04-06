
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

const segmentCount = 12;
const segmentAngle = 360 / segmentCount; // 30° each
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
function getWinningIndex(rotationAngle) {
  const r = rotationAngle % 360;
  const effectiveAngle = (360 - r + halfSegment) % 360;
  return Math.floor(effectiveAngle / segmentAngle);
}

let currentRotation = 0;

let selectedCoin = null;
const bets = {};

const balanceDisplay = document.getElementById("balance-display");
const resultDisplay = document.getElementById("result-display");

function updateBalanceDisplay() {
  balanceDisplay.innerHTML = "Balance: <span style='color: gold;font-weight:800;'>" + balance + "</span>";

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
// Global mapping of bet overlays by their identifier.
let betOverlays = {};

// ----- COIN SELECTION -----
let selectedCoinElement = null;

document.querySelectorAll(".coin").forEach(btn => {
  btn.addEventListener("click", function () {
    document.querySelectorAll(".coin").forEach(b => b.classList.remove("selected"));
    this.classList.add("selected");
    selectedCoin = parseInt(this.getAttribute("data-value"));
    selectedCoinElement = this; // Store reference to the selected coin design
  });
});

// ----- PLACE BET ON GRID CARD -----
document.querySelectorAll(".grid-card").forEach(card => {
  card.addEventListener("click", function () {
    const resultDisplay = document.getElementById("result-display");
    if (countdown <= 5) {
      resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Betting time is over.";
      return;
    }

    const index = this.getAttribute("data-index");
    if (bets[index] !== undefined) return;
    if (selectedCoin === null) return;
    if (balance < selectedCoin) return;

    balance -= selectedCoin;
    updateBalanceDisplay();
    bets[index] = selectedCoin;

    // Create overlay with cloned coin design.
    const overlay = document.createElement("div");
    overlay.className = "bet-overlay";

    const coinClone = selectedCoinElement.cloneNode(true);
    coinClone.classList.remove("selected");
    coinClone.removeAttribute("id");

    // Update the internal span with the bet amount.
    const coinSpan = coinClone.querySelector("span");
    if (coinSpan) {
      coinSpan.textContent = selectedCoin;
    }
    overlay.appendChild(coinClone);

    this.appendChild(overlay);
    betOverlays[index] = overlay;

    // Store last bet info (using 'identifier' for uniformity)
    lastBet = {
      identifier: index,
      amount: selectedCoin,
      element: this,
      overlayHTML: overlay.outerHTML
    };
  });
});

// ----- PLACE BET ON GRID HEADER (for suit bets) -----
document.querySelectorAll(".grid-header:not(.empty)").forEach(header => {
  header.addEventListener("click", function () {
    const resultDisplay = document.getElementById("result-display");
    if (countdown <= 5) {
      resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Betting time is over.";
      return;
    }

    const suit = this.textContent.trim();
    const betKey = "suit-" + suit;
    if (bets[betKey] !== undefined) return;
    if (selectedCoin === null) return;
    if (balance < selectedCoin) return;

    balance -= selectedCoin;
    updateBalanceDisplay();
    bets[betKey] = selectedCoin;

    const overlay = document.createElement("div");
    overlay.className = "bet-overlay";

    const coinClone = selectedCoinElement.cloneNode(true);
    coinClone.classList.remove("selected");
    coinClone.removeAttribute("id");

    const coinSpan = coinClone.querySelector("span");
    if (coinSpan) {
      coinSpan.textContent = selectedCoin;
    }
    overlay.appendChild(coinClone);

    this.appendChild(overlay);
    betOverlays[betKey] = overlay;

    lastBet = {
      identifier: betKey,
      amount: selectedCoin,
      element: this,
      overlayHTML: overlay.outerHTML
    };
  });
});

// ----- PLACE BET ON GRID LABEL (for card type bets) -----
document.querySelectorAll(".grid-label").forEach(label => {
  label.addEventListener("click", function () {
    const resultDisplay = document.getElementById("result-display");
    if (countdown <= 5) {
      resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Betting time is over.";
      return;
    }
    
    const img = this.querySelector("img");
    if (!img) return;
    const altText = img.getAttribute("alt");
    const cardType = altText.split(" ")[0]; // Extracts "King", "Queen", or "Jack"
    const betKey = "cardType-" + cardType;
    if (bets[betKey] !== undefined) return;
    if (selectedCoin === null) return;
    if (balance < selectedCoin) return;

    balance -= selectedCoin;
    updateBalanceDisplay();
    bets[betKey] = selectedCoin;

    const overlay = document.createElement("div");
    overlay.className = "bet-overlay";

    const coinClone = selectedCoinElement.cloneNode(true);
    coinClone.classList.remove("selected");
    coinClone.removeAttribute("id");

    const coinSpan = coinClone.querySelector("span");
    if (coinSpan) {
      coinSpan.textContent = selectedCoin;
    }
    overlay.appendChild(coinClone);

    this.appendChild(overlay);
    betOverlays[betKey] = overlay;

    lastBet = {
      identifier: betKey,
      amount: selectedCoin,
      element: this,
      overlayHTML: overlay.outerHTML
    };
  });
});

// ----- CLEAR ALL BETS -----
document.getElementById("clear-bets").addEventListener("click", function () {
  console.log(bets)
  // Query all bet overlays in the DOM
  const overlays = document.querySelectorAll('.bet-overlay');

  overlays.forEach(overlay => {
    // Get the bet amount from the coin's inner span.
    const coinSpan = overlay.querySelector('.coin span');
    if (coinSpan) {
      const betAmount = parseInt(coinSpan.textContent, 10);
      balance += betAmount; // Refund bet amount
    }
    if (overlay.parentElement) {
      overlay.parentElement.removeChild(overlay);
    }
  });
  for (let key in bets) {
    delete bets[key];
  }
  
  updateBalanceDisplay();
});

// ----- DOUBLE ALL BETS -----
document.getElementById("double-bets").addEventListener("click", function () {
  console.log(bets)
  const overlays = document.querySelectorAll('.bet-overlay');
  let totalExtra = 0;

  overlays.forEach(overlay => {
    // Query the coin's inner span.
    const coinSpan = overlay.querySelector(':scope > .coin span');
    if (coinSpan) {
      const currentBet = parseInt(coinSpan.textContent, 10);
      totalExtra += currentBet;
    }
  });

  if (balance < totalExtra) return; // Not enough balance to double

  balance -= totalExtra;

  overlays.forEach(overlay => {
    const coinSpan = overlay.querySelector(':scope > .coin span');
    if (coinSpan) {
      const currentBet = parseInt(coinSpan.textContent, 10);
      coinSpan.textContent = currentBet * 2;
    }
  });
  for (let key in bets) {
    bets[key] *= 2;
  }
  updateBalanceDisplay();
});

// ----- REPEAT LAST BET -----
document.getElementById("repeat-bet").addEventListener("click", function () {
  const resultDisplay = document.getElementById("result-display");

  if (!lastBet) return; // No previous bet

  if (countdown <= 5) {
    resultDisplay.style.display = 'block';
    resultDisplay.textContent = "Betting time is over.";
    return;
  }

  if (bets[lastBet.identifier] !== undefined) return;
  if (balance < lastBet.amount) return;

  balance -= lastBet.amount;
  updateBalanceDisplay();
  bets[lastBet.identifier] = lastBet.amount;

  const overlay = document.createElement("div");
  overlay.className = "bet-overlay";
  overlay.innerHTML = lastBet.overlayHTML;
  lastBet.element.appendChild(overlay);
  betOverlays[lastBet.identifier] = overlay;
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
  const wintimes = document.createElement("span");
  suitSpan.textContent = suit;
  wintimes.textContent = 'N';
  suitSpan.style.fontSize = "40px";
  wintimes.style.fontSize = "40px";
  suitSpan.style.marginLeft = "5px";
  wintimes.style.marginLeft = "5px";

  // Set color based on suit
  if (suit === "♥" || suit === "♦") {
    suitSpan.style.color = "red";
  } else {
    suitSpan.style.color = "black";
  }
  wintimes.style.color = "black";
  wrapper.appendChild(img);
  wrapper.appendChild(suitSpan);
  wrapper.appendChild(wintimes);
  historyContainer.appendChild(wrapper);

  if (historyContainer.childNodes.length > 12) {
    historyContainer.removeChild(historyContainer.firstChild);
  }
}

// Show winning card's image and suit icon in the center circle.
function showCenterCard(src, suit, suitIconcolor) {
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
  suitSpan.style.color = suitIconcolor;
  centerCircle.appendChild(img);
  centerCircle.appendChild(suitSpan);
}

// Draw suit ring with icons positioned at segment centers.
function drawSuitRing() {
  const suitRing = document.getElementById("suit-ring");
  suitRing.innerHTML = "";
  
  // Assuming the container is a 100x100 box centered in the parent.
  const containerSize = 100;
  const center = containerSize / 2; // 50px
  suitRing.style.position = "absolute";
  suitRing.style.width = containerSize + "px";
  suitRing.style.height = containerSize + "px";
  suitRing.style.top = "50%";
  suitRing.style.left = "50%";
  suitRing.style.transformOrigin = "50% 50%";
  suitRing.style.marginLeft = `-${center}px`;
  suitRing.style.marginTop = `-${center}px`;
  suitRing.style.transform = "rotate(0deg)";
  suitRing.style.transition = "none";

  // Adjust this value to change how far icons are from the center.
  const ringRadius = 100;
  // Angular offset to rotate the entire suit ring if needed.
  const baseAngleOffset = 10;

  // The suit order to be repeated over the segments.
  const suits = ["♠", "♦", "♣", "♥"];

  for (let i = 0; i < segmentCount; i++) {
    const angleDeg = i * segmentAngle + halfSegment + baseAngleOffset;
    const angleRad = angleDeg * Math.PI / 180;
    const x = ringRadius * Math.cos(angleRad) + center - 10;
    const y = ringRadius * Math.sin(angleRad) + center - 10;

    const span = document.createElement("span");
    span.className = "suit-segment";
    span.style.position = "absolute";
    span.style.left = x + "px";
    span.style.top = y + "px";
    span.style.fontSize = "30px";
    span.textContent = suits[i % suits.length];
    span.style.color = (suits[i % suits.length] === "♦" || suits[i % suits.length] === "♥") ? "red" : "black";
    span.style.transform = `rotate(${angleDeg}deg)`;
    
    suitRing.appendChild(span);
  }
}

drawSuitRing();

// ---- Timer Setup for Rotating Wheel ----
const spinTimerDuration = 120; // Change this value to modify the timer duration for the wheel (in seconds)
let countdown = spinTimerDuration;
let timerInterval;

// Create circular timer sticks
const svg = document.getElementById("circular-timer");
const segmentCountTimer = 60;
const centerXTimer = 100, centerYTimer = 100;
const radiusTimer = 70;
const stickLength = 10;
const timerSticks = [];

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
  line.setAttribute("stroke", "white");
  svg.appendChild(line);
  timerSticks.push(line);
}

const countdownText = document.createElementNS("http://www.w3.org/2000/svg", "text");
countdownText.setAttribute("x", centerXTimer);
countdownText.setAttribute("y", centerYTimer);
countdownText.setAttribute("text-anchor", "middle");
countdownText.setAttribute("dominant-baseline", "middle");
countdownText.setAttribute("font-size", "24");
countdownText.setAttribute("fill", "#333");
countdownText.textContent = spinTimerDuration;
svg.appendChild(countdownText);

// Timer functions
function updateTimerSticks() {
  const fractionPassed = (spinTimerDuration - countdown) / spinTimerDuration;
  const greenSegments = Math.round(fractionPassed * segmentCountTimer);
  timerSticks.forEach((stick, index) => {
    if (index < greenSegments) {
      stick.setAttribute("stroke", "green");
    } else {
      stick.setAttribute("stroke", "white");
    }
  });
}

function updateTimeDisplay() {
  const now = new Date();
  const currentTime = now.toLocaleTimeString();
  const withdrawTime = new Date(now.getTime() + countdown * 1000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  document.getElementById('current-time').textContent = `Current Time: ${currentTime}`;
  document.getElementById('withdraw-time').textContent = `Withdraw Time: ${withdrawTime}`;
  
  updateTimerSticks();
  countdownText.textContent = countdown;
}

function startTimer() {
  // Clear any existing interval first
  stopTimer();
  countdown = spinTimerDuration;
  updateTimeDisplay();
  timerInterval = setInterval(() => {
    if (countdown <= 0) {
      // Auto-trigger the spin if timer runs out
      document.getElementById("spinBtn").click();
      countdown = spinTimerDuration;
    } else {
      countdown--;
    }
    updateTimeDisplay();
    if (countdown <= 12) {
      resultDisplay.textContent = "";
      resultDisplay.style.display = 'none';
    }
    if (countdown <= 5) {
      resultDisplay.textContent = "Betting Time is Over";
      resultDisplay.style.display = 'block';
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Start timer initially
startTimer();

// ---- Spin Button and Wheel Rotation ----
document.getElementById("spinBtn").addEventListener("click", function () {
  // Stop timer when wheel starts spinning
  stopTimer();
  resultDisplay.textContent = "";
  resultDisplay.style.display = 'none';
  document.querySelectorAll(".grid-card").forEach(card => card.classList.remove("winner"));

  const stickContainer = document.getElementById("stick-container");
  // stickContainer.style.top = "19.2rem";

  const wheel = document.getElementById("wheel");
  const suitRing = document.getElementById("suit-ring");
  let betTotal = Object.values(bets).reduce((sum, amount) => sum + amount, 0);
  // Calculate rotation so that a segment is centered.
  const chosenIndex = Math.floor(Math.random() * segmentCount);
  const targetRotationMod = (360 + halfSegment - (chosenIndex * segmentAngle)) + 7.5;
  let currentMod = currentRotation % 360;
  let adjustment = targetRotationMod - currentMod;
  if (adjustment < 0) adjustment += 360;
  const deltaAngle = 3600 + adjustment;
  currentRotation += deltaAngle;

  wheel.style.transition = "transform 4s ease-out";
  wheel.style.transform = "rotate(" + currentRotation + "deg)";

  suitRing.style.transition = "transform 4s ease-out";
  suitRing.style.transform = "rotate(" + (-currentRotation) + "deg)";

  stickContainer.style.transition = "transform 4s ease-out";
  stickContainer.style.transform = "rotate(" + currentRotation + "deg)";

  let centerInterval;

// Function to start the center text animation
function startCenterTextAnimation() {
  const centerText = document.querySelector('#center-circle .center-text');
  const texts = ["N", "1X", "2X", "3X"];
  let index = 0;
  
  // Immediately update and trigger the animation
  centerText.textContent = texts[index];
  centerText.classList.remove("animate");
  void centerText.offsetWidth; // Force reflow
  centerText.classList.add("animate");
  
  index = (index + 1) % texts.length;
  
  // Update the text every 2 seconds (adjust the interval as needed)
  centerInterval = setInterval(() => {
    centerText.textContent = texts[index];
    centerText.classList.remove("animate");
    void centerText.offsetWidth; // Force reflow
    centerText.classList.add("animate");
    index = (index + 1) % texts.length;
  }, 500);
}

// Function to stop the center text animation
function stopCenterTextAnimation() {
  clearInterval(centerInterval);
  // Optionally remove the animation class to reset the text position
  const centerText = document.querySelector('#center-circle .center-text');
  centerText.classList.remove("animate");
}

/* 
Assume this is part of your wheel spin logic.
We start the spin and the animation concurrently, 
and then after 4 seconds (spin duration), we stop the animation and proceed with the result.
*/

// Start the center text animation when the spin begins
startCenterTextAnimation();

// Example spin logic (wheel rotation and other transforms)
wheel.style.transition = "transform 4s ease-out";
suitRing.style.transition = "transform 4s ease-out";
stickContainer.style.transition = "transform 4s ease-out";

// Start the spin rotation (example rotation value; adjust as needed)
currentRotation += 720 + Math.floor(Math.random() * 360); // Example spin calculation

wheel.style.transform = "rotate(" + currentRotation + "deg)";
suitRing.style.transform = "rotate(" + (-currentRotation - 9) + "deg)";
stickContainer.style.transform = "rotate(" + currentRotation + "deg)";

setTimeout(() => {
  currentRotation = currentRotation % 360;
  wheel.style.transition = "none";
  wheel.style.transform = "rotate(" + currentRotation + "deg)";
  suitRing.style.transition = "none";
  suitRing.style.transform = "rotate(" + (-currentRotation - 9) + "deg)";
  stickContainer.style.transition = "none";
  stickContainer.style.transform = "rotate(" + currentRotation + "deg)";
  
  // Stop the center text animation as the spin is complete.
  stopCenterTextAnimation();

  // Continue with determining the winning index, updating bets, and the rest of your logic
  const winningIndex = getWinningIndex(currentRotation);
  document.querySelectorAll(".grid-card, .card-wrapper").forEach(el => el.classList.remove("winner"));
  const markerSegments = document.querySelectorAll("#segments-svg path");
  markerSegments.forEach(seg => seg.classList.remove("blink"));
  const winningSegment = markerSegments[winningIndex];
  if (winningSegment) {
    winningSegment.classList.add("blink");
  }
  
  let cardType = "";
  if (winningIndex < 4) {
      cardType = "King";
  } else if (winningIndex < 8) {
      cardType = "Queen";
  } else {
      cardType = "Jack";
  }
  const suits = ["♠", "♥", "♣", "♦"];
  const suitIcon = suits[winningIndex % suits.length];
  const suitMapping = { "♠": "Spades", "♦": "Diamonds", "♣": "Clubs", "♥": "Hearts" };
  const suitName = suitMapping[suitIcon];
  const suitOrder = { "Spades": 0, "Diamonds": 1, "Clubs": 2, "Hearts": 3 };
  const baseIndex = (cardType === "King") ? 0 : (cardType === "Queen") ? 4 : 8;
  const gridIndex = baseIndex + suitOrder[suitName];
  const winningGridCard = document.querySelector(`.grid-card[data-index="${gridIndex}"]`);
  if (winningGridCard) {
      winningGridCard.classList.add("winner");
  }
  const wheelCards = document.querySelectorAll(".card-wrapper");
  const winningWheelCard = wheelCards[winningIndex];
  winningWheelCard.classList.add("winner");
  const imgEl = winningWheelCard.querySelector("img");
  const winningSrc = imgEl.getAttribute("src");

  let winValue = 0;
  let userWon = false;
  if (bets[gridIndex] !== undefined) {
      const betAmount = bets[gridIndex];
      winValue += betAmount * 2;
      balance += betAmount * 2;
      userWon = true;
  }
  const cardTypeKey = "cardType-" + cardType;
  if (bets[cardTypeKey] !== undefined) {
      const betAmount = bets[cardTypeKey];
      winValue += betAmount * 2;
      balance += betAmount * 2;
      userWon = true;
  }
  const suitKey = "suit-" + suitIcon;
  if (bets[suitKey] !== undefined) {
      const betAmount = bets[suitKey];
      winValue += betAmount * 2;
      balance += betAmount * 2;
      userWon = true;
  }
  updateBalanceDisplay();
  resultDisplay.style.display = 'block';
  resultDisplay.textContent = userWon ? "You win " + winValue + "!" : 
      (Object.keys(bets).length === 0 ? "No bet was placed." : "You lose.");
      
  var suitIconcolor = (suitIcon === '♥' || suitIcon === '♦') ? 'red' : 'black';
  showCenterCard(winningSrc, suitIcon, suitIconcolor);
  addHistoryCard(winningSrc, suitIcon);
  recordGameResult(winningIndex, Object.values(bets).reduce((sum, amt) => sum + amt, 0), winValue);
  updateBankValue();
  document.querySelectorAll(".bet-overlay").forEach(overlay => overlay.remove());
  for (let key in bets) delete bets[key];
  startTimer();
}, 4000);
});

// Record game result via AJAX.
function recordGameResult(winningSpin, betTotal, winValue = 0) {
  let formData = `winValue=${encodeURIComponent(winValue)}&winningSpin=${encodeURIComponent(winningSpin)}&betTotal=${encodeURIComponent(betTotal)}`;
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

document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".coin").forEach((coin, index) => {
    const color = coin.id; 
    if (color.startsWith("#") || color === "orange") {
      coin.style.backgroundColor = color;
    }
    setTimeout(() => {
      coin.style.opacity = 1;
      coin.style.transition = "opacity 1s ease-in-out";
    }, index * 200);
  });

  document.querySelectorAll(".coin").forEach(coin => {
    coin.addEventListener("mouseenter", function () {
      this.classList.add("spin");
    });
    coin.addEventListener("mouseleave", function () {
      this.classList.remove("spin");
    });
  });
});

const fullscreenBtn = document.getElementById("fullscreenBtn");
const footer = document.getElementById("foter-div");
const navbar = document.getElementById("navbar-header");
const stickContainer = document.getElementById("stick-container");

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    // Request fullscreen mode
    stickContainer.style.top = "5.5rem";
    document.documentElement.requestFullscreen().catch(err => console.warn("Error attempting to enable fullscreen:", err));
  } else {
    // Exit fullscreen mode
    stickContainer.style.top = "12.2rem";
    document.exitFullscreen().catch(err => console.warn("Error attempting to exit fullscreen:", err));
  }
}

// Toggle fullscreen on button click
fullscreenBtn.addEventListener("click", toggleFullscreen);

// Listen for F11 key press and prevent the default browser action
document.addEventListener("keydown", function(e) {
  if (e.key === "F11" || e.keyCode === 122) {
    e.preventDefault();  // Prevent the default F11 behavior (which may vary by browser)
    toggleFullscreen();
  }
});

// Listen for fullscreen change events to update the UI
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    // Exited fullscreen mode
    console.log('Exited fullscreen');
    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    navbar.style.display = 'block';
    stickContainer.style.top = "12.2rem";
    footer.style.display = 'block';
  } else {
    // Entered fullscreen mode
    fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    navbar.style.display = 'none';
    stickContainer.style.top = "5.5rem";
    footer.style.display = 'none';
  }
});
