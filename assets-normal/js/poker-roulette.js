

const segmentCount = 12;
const segmentAngle = 360 / segmentCount; // 30° each
const halfSegment = segmentAngle / 2; // 15°

// For the 400px wheel container: update center and outer radius
const centerX = 200, centerY = 200, outerRadius = 200, innerRadius = 28;

// Define colors for segments
const segmentColors = ["#201cb2", "#5c1166", "#5c1110"];

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

const balanceDisplay = document.getElementById("balance-display");
// const winPointsDisplay = document.getElementById("winPoints-display");
const resultDisplay = document.getElementById("result-display");
// Timer functions

let countdown = spinTimerDuration;
let timerInterval;
const countdownText = document.createElementNS("http://www.w3.org/2000/svg", "text");

const svg = document.getElementById("circular-timer");
const segmentCountTimer = 60;
const centerXTimer = 100, centerYTimer = 100;
const radiusTimer = 70;
const stickLength = 10;
const timerSticks = [];

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


const clientTimeAtLoad = Date.now();
const serverClientOffset = serverTimeAtLoad - clientTimeAtLoad; // sync offset

function getSyncedTime() {
  return Date.now() + serverClientOffset;
}
let withdrawTime;
function getCountdown() {
  const syncedTime = getSyncedTime();
  const elapsed = syncedTime % (spinTimerDuration * 1000);
  return Math.floor((spinTimerDuration * 1000 - elapsed) / 1000);
}
let userwins;
let chosenIndex;
// In your page’s <script> (make sure jQuery is loaded first)
function fetchBetHistory(withdrawTime) {
  $.ajax({
    url: '../../api/get_all_bet_history.php',
    method: 'POST',
    data: JSON.stringify({ withdrawTime }),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
  })
  .done(function(response) {
    if (response.status === 'success') {
      console.log('Fetched rows:', response.data);
      console.log('Choosen Index:', response.meta);
      userwins = response.meta.userwins;
      chosenIndex = response.meta.choosenindex;
      // TODO: render response.data into your UI
    } else {
      console.error('Server returned error:', response);
      // e.g. showErrorToUser(response.message);
    }
  })
  .fail(function(jqXHR, textStatus, errorThrown) {
    // Try to parse JSON payload
    let err = jqXHR.responseJSON || {
      status: 'error',
      type: 'HTTP',
      message: textStatus + (errorThrown ? (': ' + errorThrown) : '')
    };
    console.error('AJAX failure:', err);
    // e.g. showErrorToUser(err.message);
  });
}




function updateTimeDisplay() {
  const now = new Date(getSyncedTime());
  const currentTime = now.toLocaleTimeString();

  const countdown = getCountdown();
  withdrawTime = new Date(now.getTime() + countdown * 1000 + 60000)
  .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  document.getElementById('current-time').textContent = `Current Time: ${currentTime}`;
  document.getElementById('withdraw-time').textContent = `Withdraw Time: ${withdrawTime}`;

  countdownText.textContent = countdown;

  updateTimerSticks();

  if (countdown == 105) {
    resultDisplay.textContent = "";
    resultDisplay.style.display = 'none';
    
  }

  if (countdown <= 5) {
    resultDisplay.textContent = "Betting Time is Over";
    resultDisplay.style.display = 'block';
  
  }
  if (countdown == 5) {
    updateBankValue();
  }
  if (countdown == 3) {
    fetchBetHistory(withdrawTime);
  }


  if (countdown === 0) {
    document.getElementById("spinBtn").click(); // auto-spin at 0
  }
}


function startTimer() {
  stopTimer(); // avoid duplicate intervals
  updateTimeDisplay();
  timerInterval = setInterval(updateTimeDisplay, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// Start synchronized timer
startTimer();

// Winning index is determined from the main wheel’s final rotation.
function getWinningIndex(rotationAngle) {
  const r = rotationAngle % 360;
  const effectiveAngle = (360 - r + halfSegment) % 360;
  return Math.floor(effectiveAngle / segmentAngle);
}
// Winning index is determined from the main wheel’s final rotation.

let lastTotalBets = 0;

// helper to sync UI whenever totalBets changes
function updateTotalBetDisplay() {
  const totalBetSpan = document.querySelector("#totalbet-display span");
  const currentBetSpan = document.querySelector("#currentbet-display span");
  
  // update the “current bet” label
  if (currentBetSpan) {
    currentBetSpan.textContent = totalBets;
  }
  
  // compute how much new to add to the rolling “totalbet-display”
  const delta = totalBets - lastTotalBets;
  lastTotalBets = totalBets;

  // update the cumulative display
  const prev = parseFloat(totalBetSpan.textContent.trim()) || 0;
  totalBetSpan.textContent = (prev + delta).toString();
}

// call this whenever you add X to totalBets
function addToTotalBets(amount) {
  totalBets += amount;
  updateTotalBetDisplay();
}



let currentRotation = 0;

let selectedCoin = null;
const bets = {};



function updateBalanceDisplay() {
  balanceDisplay.innerHTML = "Balance: <span style='color: gold;font-weight:800;'>" + balance + "</span>";

}
// function updatewinPointsDisplay() {
//   winPointsDisplay.innerHTML = "Win Points: <span style='color: gold;font-weight:800;'>" + winningPoints + "</span>";

// }
updateBalanceDisplay();
// updatewinPointsDisplay();

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
// Global variable to record all bets
let totalBets = 0;

// Helper function to add or merge an overlay into a cell.
function addOrMergeOverlay(cell, coinAmount) {
  // Check if there is an existing overlay.
  let existingOverlay = cell.querySelector(".bet-overlay");
  if (existingOverlay) {
    // If found, update its coin span by merging the amounts.
    let coinSpan = existingOverlay.querySelector("span");
    if (coinSpan) {
      let currentAmount = parseInt(coinSpan.textContent) || 0;
      let newAmount = currentAmount + coinAmount;
      coinSpan.textContent = newAmount;
    }
  } else {
    // Otherwise, create a new overlay.
    const overlay = document.createElement("div");
    overlay.className = "bet-overlay";
    const coinClone = selectedCoinElement.cloneNode(true);
    coinClone.classList.remove("selected");
    coinClone.removeAttribute("id");
    const coinSpan = coinClone.querySelector("span");
    if (coinSpan) {
      coinSpan.textContent = coinAmount;
    }
    overlay.appendChild(coinClone);
    cell.appendChild(overlay);
  }
}
lastBetHistory = {};
lastBet = {};
// Utility to get grid cells from the grid container.
const gridCells = Array.from(document.querySelectorAll("#card-grid > div"));
// Assume the grid is defined with 5 columns.
const GRID_COLUMNS = 5;
// ----- PLACE BET ON GRID CARD -----
// ----- PLACE BET ON GRID CARD (with merging logic) -----
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
    if (selectedCoin === null) return;
    if (balance < selectedCoin) return;

    // Check max bet
    if (totalBets + selectedCoin > maxBetamount) {
      alert("Max bet amount is 10000");
      return;
    }

    balance -= selectedCoin;
    updateBalanceDisplay();
    // updatewinPointsDisplay();

    // Merge overlay
    if (bets[index] === undefined) bets[index] = selectedCoin;
    else bets[index] += selectedCoin;
    totalBets += selectedCoin;
    addOrMergeOverlay(this, selectedCoin);
    updateTotalBetDisplay();

    // Prepare lastBet
    lastBet = { identifier: index, amount: selectedCoin, element: this, overlayHTML: this.querySelector(".bet-overlay").outerHTML };
    lastBetHistory = { ...lastBet };
 
    // Special rule: if 12 grid bets placed, override lastBet.amount to second-largest
    applySecondLargestRule();
    const data = {
      userId: user_id,
      identifier: lastBet.identifier,
      amount: lastBet.amount,
      withdrawTime: withdrawTime
    };
    fetch('../../api/total_history.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      console.log('Server response:', result);
    })
    .catch(error => {
      console.error('Error sending data:', error);
    });
  });
});

// ----- PLACE BET ON GRID HEADER (suit) -----
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
    if (selectedCoin === null) return;
    if (balance < selectedCoin) return;

    // Check max bet
    if (totalBets + (selectedCoin * 3) > maxBetamount) {
      alert("Max bet amount is 10000");
      return;
    }

    balance -= (selectedCoin * 3);
    updateBalanceDisplay();
    // updatewinPointsDisplay();

    // Merge overlay
    if (bets[betKey] === undefined) bets[betKey] = (selectedCoin * 3);
    else bets[betKey] += (selectedCoin * 3);
    totalBets += (selectedCoin * 3);
    updateTotalBetDisplay();

    // Apply overlay to column
    const clickedIndex = gridCells.findIndex(cell => cell === this);
    const col = clickedIndex % GRID_COLUMNS;
    gridCells.forEach((cell, idx) => {
      if (idx % GRID_COLUMNS === col) addOrMergeOverlay(cell, selectedCoin);
    });

    // Prepare lastBet
    lastBet = { identifier: betKey, amount: selectedCoin, element: this, overlayHTML: null };
    lastBetHistory = { ...lastBet };

    // Special rule: if all 4 suits bet, override lastBet.amount to second-largest
    applySecondLargestRule();
    const data = {
      identifier: lastBet.identifier,
      amount: lastBet.amount,
      withdrawTime: withdrawTime
    };
    fetch('../../api/total_history.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      console.log('Server response:', result);
    })
    .catch(error => {
      console.error('Error sending data:', error);
    });
  });
});

allcardsbeted = false;
// ----- PLACE BET ON GRID LABEL (card type) -----
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
    const cardType = img.getAttribute("alt").split(" ")[0];
    const betKey = "cardType-" + cardType;
    if (selectedCoin === null) return;
    if (balance < selectedCoin) return;

    // Check max bet
    if (totalBets + (selectedCoin * 4) > maxBetamount) {
      alert("Max bet amount is 10000");
      return;
    }

    balance -= (selectedCoin * 4);
    updateBalanceDisplay();
    // updatewinPointsDisplay();

    // Merge overlay
    if (bets[betKey] === undefined) bets[betKey] = (selectedCoin * 4);
    else bets[betKey] += (selectedCoin * 4);
    totalBets += (selectedCoin * 4);
    updateTotalBetDisplay();

    // Apply overlay to row
    const clickedIndex = gridCells.findIndex(cell => cell === this);
    const row = Math.floor(clickedIndex / GRID_COLUMNS);
    gridCells.forEach((cell, idx) => {
      if (Math.floor(idx / GRID_COLUMNS) === row) addOrMergeOverlay(cell, selectedCoin);
    });

    // Prepare lastBet
    lastBet = { identifier: betKey, amount: selectedCoin, element: this, overlayHTML: null };
    lastBetHistory = { ...lastBet };

    // Special rule: if all 3 card types bet, override lastBet.amount to second-largest
    applySecondLargestRule();
    const data = {
      identifier: lastBet.identifier,
      amount: lastBet.amount,
      withdrawTime: withdrawTime
    };
    fetch('../../api/total_history.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
      console.log('Server response:', result);
    })
    .catch(error => {
      console.error('Error sending data:', error);
    });
    
  });
});

// ----- Helper: second-largest override -----
function applySecondLargestRule() {
  const keys = Object.keys(bets);
  let relevantValues = null;

  // 12 grid cells
  //   const gridKeys = keys.filter(k => !isNaN(k) && +k < GRID_COLUMNS * GRID_ROWS);
  // console.log(Object.keys(bets).length, 'betslength');

  if (Object.keys(bets).length > 11) {
    allcardsbeted = true;
    console.log(allcardsbeted);
  }

  // 3 card types
  else if (["cardType-Jack", "cardType-Queen", "cardType-King"].every(k => bets[k] !== undefined)) {
    relevantValues = ["cardType-Jack", "cardType-Queen", "cardType-King"].map(k => bets[k] / 4);
    allcardsbeted = true;
  }
  // 4 suits
  else if (["suit-♠", "suit-♦", "suit-♣", "suit-♥"].every(k => bets[k] !== undefined)) {
    relevantValues = ["suit-♠", "suit-♦", "suit-♣", "suit-♥"].map(k => bets[k] / 3);
    allcardsbeted = true;
  }

  if (relevantValues) {
    // Sort desc and pick second element
    const sorted = relevantValues.slice().sort((a, b) => b - a);
    const second = sorted[1] !== undefined ? sorted[1] : sorted[0];
    lastBet.amount = second;
    lastBetHistory.amount = second;
  }
}




// ----- CLEAR ALL BETS -----
document.getElementById("clear-bets").addEventListener("click", function () {
  console.log('bets', bets)
  console.log('totalBets', totalBets)
  console.log('lastTotalBets', lastTotalBets)
  console.log('lastBet', lastBet)
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
  // updatewinPointsDisplay();

  const displaySpan = document.querySelector("#currentbet-display span");
  if (displaySpan) {
    displaySpan.textContent = totalBets - totalBets;
  }
  const totalbet = document.querySelector("#totalbet-display span");
  if (totalbet) {
    const totalbetvalue = parseFloat(totalbet.textContent.trim()) || 0;

    totalbet.textContent = totalbetvalue - parseFloat(totalBets);
  }
  totalBets = 0;
  lastTotalBets = 0;
  lastBet ={};
  console.log('bets',bets);
  console.log('totalBets',totalBets);
  console.log('lastTotalBets',lastTotalBets);
  console.log('lastBet',lastBet);
});
document.getElementById("double-bets").addEventListener("click", function () {
  const overlays = document.querySelectorAll('.bet-overlay');
  let extra = 0;

  // sum up what doubling will cost
  overlays.forEach(ov => {
    const coinSpan = ov.querySelector(':scope > .coin span');
    const current = coinSpan ? parseInt(coinSpan.textContent, 10) : 0;
    extra += current;
  });

  // guard rails
  if (totalBets + extra > maxBetamount) {
    return alert("Max bet amount is " + maxBetamount);
  }
  if (balance < extra) {
    return alert("Not enough balance to double all bets.");
  }

  // deduct balance, bump totalBets by the extra
  balance -= extra;
  addToTotalBets(extra);
  updateBalanceDisplay();

  // now actually double the displayed chips and our bets map
  overlays.forEach(ov => {
    const coinSpan = ov.querySelector(':scope > .coin span');
    const current = parseInt(coinSpan.textContent, 10);
    coinSpan.textContent = (current * 2).toString();
  });
  for (let key in bets) {
    bets[key] *= 2;
  }
});


// ----- REPEAT LAST BET -----
document.getElementById("repeat-bet").addEventListener("click", function () {
  if (!lastBetHistory) {
    return alert("No previous bet to repeat.");
  }
  if (countdown <= 5) {
    const rd = document.getElementById("result-display");
    rd.style.display = 'block';
    rd.textContent = "Betting time is over.";
    return;
  }

  const { identifier, amount, element, overlayHTML } = lastBetHistory;
  // if you already have a bet on that segment, skip
  if (bets[identifier] !== undefined) {
    return alert("You've already bet on that segment.");
  }
  if (balance < amount) {
    return alert("Insufficient balance to repeat bet.");
  }

  // deduct and register
  balance -= amount;
  addToTotalBets(amount);
  updateBalanceDisplay();

  // render the overlay again
  bets[identifier] = amount;
  const overlay = document.createElement("div");
  overlay.className = "bet-overlay";
  overlay.innerHTML = overlayHTML;
  element.appendChild(overlay);
  betOverlays[identifier] = overlay;
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
  const wintimesSpan = document.createElement("span");
  suitSpan.textContent = suit;
  wintimesSpan.textContent = 'N'; // Use the appropriate win times value if needed
  suitSpan.style.fontSize = "30px";
  wintimesSpan.style.fontSize = "30px";
  suitSpan.style.marginLeft = "5px";
  wintimesSpan.style.marginLeft = "5px";

  // Set color based on suit
  suitSpan.style.color = (suit === "♥" || suit === "♦") ? "red" : "black";
  wintimesSpan.style.color = "black";

  wrapper.appendChild(img);
  wrapper.appendChild(suitSpan);
  wrapper.appendChild(wintimesSpan);
  historyContainer.appendChild(wrapper);

  // Ensure the DOM displays only the last 12 items
  if (historyContainer.childNodes.length > 12) {
    historyContainer.removeChild(historyContainer.firstChild);
  }

  // Update the history in the database
  updateHistory(src, suit, 'N');
}

// AJAX function to update the game history in the database
function updateHistory(src, suit, wintimes) {
  const formData = new FormData();
  // You may set the game_id as needed
  formData.append('game_id', 1);
  formData.append('src', src);
  formData.append('suiticon', suit);
  formData.append('wintimes', wintimes);

  fetch('../../api/updateHistory.php', { method: 'POST', body: formData })
    .then(res => res.text())                // ← get raw text
    .then(text => {
      console.log('RAW RESPONSE:', text);   // ← inspect it in your console
      try {
        const data = JSON.parse(text);       // then try to parse
        if (!data.success) console.error('Error updating history:', data.message);
      } catch (err) {
        console.error('Invalid JSON, server returned HTML or error page:', err);
      }
    })
    .catch(err => console.error('Fetch error:', err));
}
function displayHistoryCard(src, suit, wintimes) {
  const historyContainer = document.getElementById("history-container");
  const wrapper = document.createElement("div");
  wrapper.classList.add("history-item");

  const img = document.createElement("img");
  img.src = src;
  img.classList.add("history-card");

  const suitSpan = document.createElement("span");
  suitSpan.textContent = suit;
  suitSpan.style.fontSize = "30px";
  suitSpan.style.marginLeft = "5px";
  suitSpan.style.color = (suit === "♥" || suit === "♦") ? "red" : "black";

  const wintimesSpan = document.createElement("span");
  wintimesSpan.textContent = wintimes;
  wintimesSpan.style.fontSize = "30px";
  wintimesSpan.style.marginLeft = "5px";
  wintimesSpan.style.color = "black";

  wrapper.appendChild(img);
  wrapper.appendChild(suitSpan);
  wrapper.appendChild(wintimesSpan);
  historyContainer.appendChild(wrapper);

  // Ensure the DOM displays only the last 12 items
  if (historyContainer.childNodes.length > 12) {
    historyContainer.removeChild(historyContainer.firstChild);
  }
}

// Function to fetch history from the database via AJAX and populate the DOM
function fetchHistoryFromDB() {
  // Adjust the URL and game_id as needed
  fetch('../../api/fetchHistory.php?game_id=1')
    .then(response => response.json())
    .then(historyArray => {
      // Clear the current history container
      const historyContainer = document.getElementById("history-container");
      historyContainer.innerHTML = "";
      // historyArray is expected to be an array of objects
      historyArray.forEach(item => {
        displayHistoryCard(item.src, item.suiticon, item.wintimes);
      });
    })
    .catch(error => console.error("Error fetching history:", error));
}

// Call fetchHistoryFromDB on DOM load
document.addEventListener("DOMContentLoaded", fetchHistoryFromDB);

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
// function drawSuitRing() {
//   const suitRing = document.getElementById("suit-ring");
//   suitRing.innerHTML = "";

//   // Assuming the container is a 100x100 box centered in the parent.
//   const containerSize = 100;
//   const center = containerSize / 2; // 50px
//   suitRing.style.position = "absolute";
//   suitRing.style.width = containerSize + "px";
//   suitRing.style.height = containerSize + "px";
//   suitRing.style.top = "50%";
//   suitRing.style.left = "50%";
//   suitRing.style.transformOrigin = "50% 50%";
//   suitRing.style.marginLeft = `-${center}px`;
//   suitRing.style.marginTop = `-${center}px`;
//   suitRing.style.transform = "rotate(0deg)";
//   suitRing.style.transition = "none";

//   // Adjust this value to change how far icons are from the center.
//   const ringRadius = 90;
//   // Angular offset to rotate the entire suit ring if needed.
//   const baseAngleOffset = 5;


//   const suits = [
//     '<img class="card" src="/assets-normal/img/golden-hearts.png" alt="King of Spades">',
//     '<img class="card" src="/assets-normal/img/clubs-golden.png" alt="King of Spades">',
//     '<img class="card" src="/assets-normal/img/golden-diamond.png" alt="King of Spades">',
//     '<img class="card" src="/assets-normal/img/spades-golden.png" alt="King of Spades">',
//   ];
  

//   for (let i = 0; i < segmentCount; i++) {
//     const angleDeg = i * segmentAngle + halfSegment + baseAngleOffset;
//     const angleRad = angleDeg * Math.PI / 180;
//     const x = ringRadius * Math.cos(angleRad) + center - 10;
//     const y = ringRadius * Math.sin(angleRad) + center - 10;

//     const span = document.createElement("span");
//     span.className = "suit-segment";
//     span.style.position = "absolute";
//     span.style.left = x + "px";
//     span.style.top = y + "px";
//     span.style.transform = `rotate(${angleDeg}deg)`;

//     // inject the <img> HTML
//     span.innerHTML = suits[i % suits.length];

//     suitRing.appendChild(span);
//   }
// }

// drawSuitRing();

// ---- Timer Setup for Rotating Wheel ----
// Change this value to modify the timer duration for the wheel (in seconds)


// Create circular timer sticks


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


countdownText.setAttribute("x", centerXTimer);
countdownText.setAttribute("y", centerYTimer);
countdownText.setAttribute("text-anchor", "middle");
countdownText.setAttribute("dominant-baseline", "middle");
countdownText.setAttribute("font-size", "24");
countdownText.setAttribute("fill", "#333");
countdownText.textContent = spinTimerDuration;
svg.appendChild(countdownText);

// Set this variable to true if you want the user to always win,
// or false if you want the user to always lose.
// Set this variable to true if you want the user to always win;
// set to false if you want the user to always lose.

// Calculate the total bet (rounding to 2 decimal places)
const totalBetRaw = gameResults.reduce((sum, result) => sum + parseFloat(result.bet), 0);
const totalBet = Math.round(totalBetRaw * 100) / 100;

// Calculate the total win_value (rounding to 2 decimal places)
const totalWinValue = Math.round(
  gameResults.reduce((sum, result) => sum + result.win_value, 0) * 100
) / 100;

// Define the win percentage threshold


// Array representing the card details for the wheel and grid.
// Indices 0-3: Kings; 4-7: Queens; 8-11: Jacks.
// The order is: Spades, Diamonds, Clubs, Hearts.
const cardDetails = [
  { card: 'King', suit: '♠' },
  { card: 'King', suit: '♦' },
  { card: 'King', suit: '♣' },
  { card: 'King', suit: '♥' },
  { card: 'Queen', suit: '♠' },
  { card: 'Queen', suit: '♦' },
  { card: 'Queen', suit: '♣' },
  { card: 'Queen', suit: '♥' },
  { card: 'Jack', suit: '♠' },
  { card: 'Jack', suit: '♦' },
  { card: 'Jack', suit: '♣' },
  { card: 'Jack', suit: '♥' },
];

document.getElementById("spinBtn").addEventListener("click", function () {
  // console.log(bets)
  fetchBetHistory(withdrawTime);

  // let userwins;
  // let gmlen = gameResults.length;
  // if (gmlen ==  0) {
  //   gmlen = 1;
  // }
  // Define an override chance (10% chance to override the "default" outcome)

  // console.log(gmlen, 'gamelenght')
  // let currentWinPercentage = totalBets > 0 ? (winningPoints / bettingPoints) * 100 : 0;
  // currentWinPercentage = Math.round(currentWinPercentage * 100) / 100;
  // if ((gmlen > 4 || totalWinValue > 100)) {

  //   if (currentWinPercentage > winningPercentage) {
  //     // Default outcome for a high win ratio is to lose ('no').
  //     // But with a small chance, override to win.
  //     console.log(currentWinPercentage, 'currentWinPercentage-no')
  
  //     console.log(winningPercentage, 'winningPercentage-no')
      
  //     userwins = Math.random() < overrideChance ? 'yes' : 'no';
  //   } else if (currentWinPercentage < winningPercentage) {
  //     // Default outcome for a low win ratio is to win ('yes').
  //     // But with a small chance, override to lose.
 
  //     console.log(currentWinPercentage, 'currentWinPercentage-yes')
  
  //     console.log(winningPercentage, 'winningPercentage-yes')

  //     userwins = Math.random() < overrideChance ? 'no' : 'yes';
  //   } else if (currentWinPercentage < winningPercentage) {
  //     // Default outcome for a low win ratio is to win ('yes').
  //     // But with a small chance, override to lose.

  //     console.log(currentWinPercentage, 'currentWinPercentage-strino')
  
  //     console.log(winningPercentage, 'winningPercentage-strino')

  //     userwins = Math.random() < overrideChance ? 'no' : 'yes';
  //   }
  //   else if (currentWinPercentage > winningPercentage * 2) {
  //     // Default outcome for a low win ratio is to win ('yes').
  //     // But with a small chance, override to lose.

  //     console.log(currentWinPercentage, 'currentWinPercentage-x-no')
  
  //     console.log(winningPercentage, 'winningPercentage-x-no')

  //     userwins = 'no';
  //   }
  //   else {
  //     // When currentWinPercentage exactly equals winningPercentage,
  //     // use a standard evaluation. (Or you could also randomize here if desired.)
  //     userwins = currentWinPercentage >= winningPercentage ? 'yes' : 'no';
  //   }

  //   console.log(totalBet, 'totalBet')
  //   console.log(totalWinValue, 'totalWinValue')
  //   console.log(currentWinPercentage, 'currentWinPercentage')

  //   console.log(winningPercentage, 'winningPercentage')

  //   console.log(overrideChance, 'overrideChance')

  // } else {
  //   // If gameResults length is 10 or less AND totalWinValue is 200 or less, fallback to 'random'.
  //   userwins = Math.random() < overrideChance ? 'yes' : 'random';
  // }
  // if (currentWinPercentage > winningPercentage && lastBet.amount > 20) {
  //   userwins = 'no';
  // }

  // if (allcardsbeted) {
  //   userwins = 'yes';
  // }


  console.log(userwins, 'userwins')


  console.log(allcardsbeted, 'allcardsbeted')


  // Stop timer and reset display

  // stopTimer();
  resultDisplay.textContent = "";
  resultDisplay.style.display = 'none';
  document.querySelectorAll(".grid-card").forEach(card => card.classList.remove("winner"));

  const stickContainer = document.getElementById("stick-container");
  const wheel = document.getElementById("wheel");
  const suitRing = document.getElementById("suit-ring");
  let betTotal = Object.values(bets).reduce((sum, amount) => sum + amount, 0);

  // --- Calculate rotation so that the winning segment is centered ---
  const segmentAngle = 360 / segmentCount;

  // Initially choose a random index (0 to segmentCount - 1)
  // let chosenIndex = Math.floor(Math.random() * segmentCount);

  // --- Override chosenIndex based on the userwins flag and last bet, if a bet exists ---
  if (lastBet && Object.keys(lastBet).length > 0) {
    let possibleIndices = [];

    // If the bet identifier is numeric, assume it is a specific grid card index.
    if (!isNaN(lastBet.identifier)) {
      possibleIndices = [parseInt(lastBet.identifier, 10)];
    }
    // If the bet is on a card type (e.g. "cardType-King")
    else if (lastBet.identifier.startsWith("cardType-")) {
      const betCardType = lastBet.identifier.split("-")[1]; // "King", "Queen", or "Jack"
      possibleIndices = cardDetails
        .map((cd, index) => (cd.card === betCardType ? index : -1))
        .filter(index => index !== -1);
    }
    // If the bet is on a suit (e.g. "suit-♠")
    else if (lastBet.identifier.startsWith("suit-")) {
      const betSuit = lastBet.identifier.split("-")[1]; // "♠", "♦", etc.
      possibleIndices = cardDetails
        .map((cd, index) => (cd.suit === betSuit ? index : -1))
        .filter(index => index !== -1);
    }

    // If there is at least one matching index, override chosenIndex
    if (possibleIndices.length > 0) {
      if (userwins == 'yes') {
        // Pick one of the matching indices at random.
        chosenIndex = possibleIndices[Math.floor(Math.random() * possibleIndices.length)];
        console.log('chosenIndex' , chosenIndex)
      } else if (userwins === 'random') {
        chosenIndex = Math.floor(Math.random() * segmentCount);
      } else {
        // Force a loss: if the current random choice is one of the matching indices,
        // shift it (here, we simply increment mod segmentCount until it doesn't match).
        while (possibleIndices.includes(chosenIndex)) {
          chosenIndex = (chosenIndex + 1) % segmentCount;
        }
      }
    }
  }

  // Calculate rotation details so the winning segment is centered.
  const markerOffset = 0; // Adjust if the marker is not exactly at the top.
  const targetRotationMod = (360 - (chosenIndex * segmentAngle + segmentAngle / 2) + markerOffset) % 360;

  let currentMod = currentRotation % 360;
  let adjustment = targetRotationMod - currentMod;
  if (adjustment < 0) adjustment += 360;

  // Add a fixed number of full spins to build suspense.
  const fullSpin = 10 * 360;
  const deltaAngle = fullSpin + adjustment;
  currentRotation += deltaAngle;

  // --- Apply the spin animation to wheel, suit ring, and stick container ---
  wheel.style.transition = "transform 4s ease-out";
  wheel.style.transform = "rotate(" + currentRotation + "deg)";

  suitRing.style.transition = "transform 4s ease-out";
  suitRing.style.transform = "rotate(" + (-currentRotation) + "deg)";

  stickContainer.style.transition = "transform 4s ease-out";
  stickContainer.style.transform = "rotate(" + currentRotation + "deg)";

  // --- Center text animation logic ---
  let centerInterval;
  function startCenterTextAnimation() {
    const centerCircle = document.getElementById('center-circle');
    let centerText = centerCircle.querySelector('.center-text');
    if (!centerText) {
      centerCircle.innerHTML = "";
      centerText = document.createElement("div");
      centerText.className = "center-text";
      centerCircle.appendChild(centerText);
    }
    const texts = ["N", "1X", "2X", "3X"];
    let index = 0;
    centerText.textContent = texts[index];
    centerText.classList.remove("animate");
    void centerText.offsetWidth; // Force reflow
    centerText.classList.add("animate");
    index = (index + 1) % texts.length;
    centerInterval = setInterval(() => {
      centerText.textContent = texts[index];
      centerText.classList.remove("animate");
      void centerText.offsetWidth;
      centerText.classList.add("animate");
      index = (index + 1) % texts.length;
    }, 500);
  }

  function stopCenterTextAnimation() {
    clearInterval(centerInterval);
    const centerText = document.querySelector('#center-circle .center-text');
    if (centerText) {
      centerText.classList.remove("animate");
    }
  }

  startCenterTextAnimation();

  // --- After spin duration, finalize and determine results ---
  setTimeout(() => {
    // Normalize currentRotation and update transforms
    currentRotation = currentRotation % 360;
    wheel.style.transition = "none";
    wheel.style.transform = "rotate(" + currentRotation + "deg)";
    suitRing.style.transition = "none";
    suitRing.style.transform = "rotate(" + (-currentRotation) + "deg)";
    stickContainer.style.transition = "none";
    stickContainer.style.transform = "rotate(" + currentRotation + "deg)";

    // Stop center text animation
    stopCenterTextAnimation();

    // The chosenIndex is our winning index.
    const winningIndex = chosenIndex;
    const winningCard = cardDetails[winningIndex];
    const cardType = winningCard.card;
    const suitIcon = winningCard.suit;
    // For win calculations we use keys based on the card type and suit.
    const cardTypeKey = "cardType-" + cardType;
    const suitKey = "suit-" + suitIcon;

    // The grid card that wins is exactly at the index 'winningIndex'
    const gridIndex = winningIndex;
    const markerImgEls = document.querySelectorAll(`.grid-card[data-index="${gridIndex}"] img`);

const markerImgEl1 = markerImgEls[0];
const markerImgEl2 = markerImgEls[1];

const markerSrc = markerImgEl1?.src;
const markerAlt = markerImgEl1?.alt;

const markerSrc2 = markerImgEl2?.src;
const markerAlt2 = markerImgEl2?.alt;

    // const markerImgEl = document.querySelector(`.grid-card[data-index="${gridIndex}"] img`);
    // const markerSrc = markerImgEl.src;
    // const markerAlt = markerImgEl.alt;

    // Highlight winning segments and grid card.
    document.querySelectorAll(".grid-card, .card-wrapper").forEach(el => el.classList.remove("winner"));
    const markerSegments = document.querySelectorAll("#segments-svg path");
    markerSegments.forEach(seg => seg.classList.remove("blink"));
    const winningSegment = markerSegments[winningIndex];
    if (winningSegment) {
      winningSegment.classList.add("blink");
    }
    const winningGridCard = document.querySelector(`.grid-card[data-index="${gridIndex}"]`);
    if (winningGridCard) {
      winningGridCard.classList.add("winner");
    }
    const wheelCards = document.querySelectorAll(".card-wrapper");
    const winningWheelCard = wheelCards[winningIndex];
    winningWheelCard.classList.add("winner");

    // Get winning card image source
    const imgEl = winningWheelCard.querySelector("img");
    const winningSrc = imgEl.getAttribute("src");

    // Debug logging: show the bet and the winning card.
    if (lastBet && Object.keys(lastBet).length > 0) {
      // console.log("User placed bet on:", lastBet.identifier, "with amount:", lastBet.amount);
    } else {
      // console.log("No bet was placed by the user.");
    }
    // console.log("Winning card:", cardType, suitIcon, "at grid index:", gridIndex);

    // --- Win calculation based on last bet ---
    let winValue = 0;
    let userWon = false;
    if (lastBet && Object.keys(lastBet).length > 0) {
      if (!isNaN(lastBet.identifier)) {
        if (parseInt(lastBet.identifier, 10) === gridIndex) {
          winValue = lastBet.amount * 10;
          userWon = true;
        }
      } else if (lastBet.identifier.startsWith("cardType-")) {
        if (lastBet.identifier === cardTypeKey) {
          winValue = lastBet.amount * 10;
          userWon = true;
        }
      } else if (lastBet.identifier.startsWith("suit-")) {
        if (lastBet.identifier === suitKey) {
          winValue = lastBet.amount * 10;
          userWon = true;
        }
      }
    }

    if (userWon) {
      winningPoints += winValue;
      console.log(balance, 'balance')
      balance = (balance - totalBets);
      console.log(totalBets, 'totalBets')
      console.log(balance, 'balance')
      console.log(winValue, 'winValue')
      balance = (balance + winValue);
      console.log(balance, 'balance')
    }

    updateBalanceDisplay();
    // updatewinPointsDisplay();
    resultDisplay.style.display = 'block';

    // base message
    let msg;
    if (userWon) {
      balanceDisplay.innerHTML = "Balance: <span style='color: gold;font-weight:800;'>" + (balance) + "</span>";
      msg = `You win ${winValue}!`;
    } else if (lastBet && Object.keys(lastBet).length > 0) {
      msg = `You lose.`;
    } else {
      msg = `No bet was placed.`;
    }

    // now include the marker image + total bet
    resultDisplay.innerHTML = `
  <p><strong>Current Marker Card</strong></p>
  <div class="d-flex d-flex align-items-center justify-content-center">
  <img
    src="${markerSrc}"
    alt="${markerAlt}"
    class="marker-card"
  />
  <img
    src="${markerSrc2}"
    alt="${markerAlt2}"
    class="marker-card"
  />
   </div>
  <p>${msg}</p>
  <span><strong>Current Bet:</strong> ${totalBets}</span>
`;


    // Update center card display and history.
    // (The suit icon color is set based on red for hearts/diamonds, black otherwise.)
    const suitIconcolor = (suitIcon === '♥' || suitIcon === '♦') ? 'red' : 'black';
    showCenterCard(winningSrc, suitIcon, suitIconcolor);
    addHistoryCard(winningSrc, suitIcon);
    let suiticonnum = 0;
    if (suitIcon === '♥') {
      suiticonnum = 1;
    } else if (suitIcon === '♦') {
      suiticonnum = 2;
    } else if (suitIcon === '♠') {
      suiticonnum = 3;
    } else {
      suiticonnum = 4;
    }
    // Record the game result via AJAX.
    recordGameResult(
      winningIndex,
      Object.values(bets).reduce((sum, amt) => sum + amt, 0),
      winValue,
      suiticonnum
    );


    // Remove all bet overlays and clear the bets object.
    document.querySelectorAll(".bet-overlay").forEach(overlay => overlay.remove());
    for (let key in bets) {
      delete bets[key];
    }
    // Restart the timer for the next spin.
    lastBet = {};
    allcardsbeted = false;
    // startTimer();
    totalBets = 0;
    lastTotalBets = 0;
  }, 4000);
});

function recordGameResult(winningSpin, betTotal, winValue = 0, suiticonnum) {
  const params = new URLSearchParams({ winningSpin, betTotal, winValue, suiticonnum });

  fetch('../../api/record_game.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  })
    .then(async response => {
      const text = await response.text();
      // Log raw HTTP status + body for debugging:
      console.log(`↳ HTTP ${response.status} ${response.statusText}`, '– body:', text);

      if (!response.ok) {
        // include status and body in the error
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`);
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON from server: ${e.message} (raw: ${text})`);
      }
    })
    .then(data => {
      if (data.success) {
        console.log('✅ Game result stored:', data.message);
      } else {
        console.error('🚨 Server error storing game result:', data.message);
      }
    })
    .catch(err => {
      // log the full Error object so you see message + stack
      console.error('AJAX request failed:', err);
    });
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
document.addEventListener("keydown", function (e) {
  if (e.key === "F11" || e.keyCode === 122) {
    e.preventDefault();  // Prevent the default F11 behavior (which may vary by browser)
    toggleFullscreen();
  }
});

// Listen for fullscreen change events to update the UI
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    // Exited fullscreen mode

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
