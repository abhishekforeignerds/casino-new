

const segmentCount = 12;
const segmentAngle = 360 / segmentCount; // 30° each
const halfSegment = segmentAngle / 2; // 15°

// For the 400px wheel container: update center and outer radius
const centerX = 200, centerY = 200, outerRadius = 200, innerRadius = 28;

// Define colors for segments
const segmentColors = ["#201cb2", "#5c1166", "#5c1110"];


const balanceDisplay = document.getElementById("balance-display");
const winPointsDisplay = document.getElementById("claim-display");

const resultDisplay = document.getElementById("result-display");



    

let countdowntemp = spinTimerDuration;
let countdown;
let timerInterval;
const countdownText = document.createElementNS("http://www.w3.org/2000/svg", "text");

const svg = document.getElementById("circular-timer");
const segmentCountTimer = 60;
const centerXTimer = 100, centerYTimer = 100;
const radiusTimer = 70;
const stickLength = 10;
const timerSticks = [];

// How many seconds before cycle-end to clear the old result?
const resultClearOffset = 15;

function updateTimerSticks() {
  const fractionPassed = (spinTimerDuration - countdown) / spinTimerDuration;
  const greenSegments = Math.round(fractionPassed * segmentCountTimer);
  timerSticks.forEach((stick, index) => {
    if (index < greenSegments) {
      stick.setAttribute("stroke", "green");
    } else {
      stick.setAttribute("stroke", "white");
    }
    if (countdown < 10) {
      stick.setAttribute("stroke", "red");
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
let winamtValue = 0;
let winValue = 0;

// In your page’s <script> (make sure jQuery is loaded first)
function getinsertedbetHistory(withdrawTime) {
  $.ajax({
    url: '../../api/get_inserted_bet_history.php',
    method: 'POST',
    data: JSON.stringify({ withdrawTime }),
    contentType: 'application/json; charset=utf-8',
    dataType: 'json',
  })
  .done(function(response) {
    if (response.status === 'success') {
      console.log('Fetched rows real:', response);
      console.log('Choosen Index:', response.data.choosenindex);
      userwins = response.data.userwins;
      chosenIndex = response.data.choosenindex;
      winamtValue = response.data.winningpoint;
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
      console.log('Fetched rows:', response);

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
  countdown = getCountdown();

  withdrawTime = new Date(now.getTime() + countdown * 1000 + 60000)
    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  document.getElementById('current-time').textContent = `Current Time: ${currentTime}`;
  document.getElementById('withdraw-time').textContent = `Withdraw Time: ${withdrawTime}`;

  countdownText.textContent = countdown;

  updateTimerSticks();

  // clear old result at spinTimerDuration - resultClearOffset
  if (countdown === spinTimerDuration - resultClearOffset) {
    resultDisplay.textContent = "";
    resultDisplay.style.display = 'none';
  }

  if (countdown == 5) {
     const bettingOversound = new Howl({
      src: ['/assets-normal/img/betting-Over.mp3'],
      volume: 0.9
    });
    // play it
    bettingOversound.play();
    resultDisplay.textContent = "Betting Time is Over";
    resultDisplay.style.display = 'block';

  }
    if (countdown == 15) {
     const bettingOversound = new Howl({
      src: ['/assets-normal/img/Last-time-to-bet.mp3'],
      volume: 0.9
    });
    // play it
    bettingOversound.play();

        resultDisplay.textContent = "Last Time To Bet";
    resultDisplay.style.display = 'block';
    }
    if (countdown == 110) {
      document.getElementById("place-bets").disabled = false;
      resultDisplay.textContent = "Place Your Chips";
    resultDisplay.style.display = 'block';
  const bettingOversound = new Howl({
    src: ['/assets-normal/img/place-chips.mp3'],
    volume: 0.9
  });

  // Play the sound if needed
  bettingOversound.play();

  // Remove "winner" class from elements
  document.querySelectorAll(".grid-card, .card-wrapper").forEach(el => 
    el.classList.remove("winner")
  );
 document.querySelectorAll(".cstm-ribbon").forEach(el =>
    el.classList.remove("blingbg")
  );
}
if (countdown === 5) {
  const overlays = document.querySelectorAll('.bet-overlay');

  overlays.forEach(overlay => {
    // Get the bet amount from the coin's inner span (optional - not used here).
    
    if (overlay.parentElement) {
      overlay.parentElement.removeChild(overlay);
    }
  });

  // resultDisplay.style.display = 'block';
  // resultDisplay.textContent = "Bet was Cancelled.";

  // setTimeout(() => {
  //   resultDisplay.style.display = 'none';
  // }, 2000);

  document.getElementById("place-bets").disabled = true;

 const formData = new FormData();
formData.append('withdrawTime', withdrawTime);
formData.append('n', n);

fetch('../../api/remove_pc_bets.php', {
  method: 'POST',
  body: formData
})
.then(res => res.json())
.then(data => {
  console.log('API RESPONSE:', data);
pcbets = {};
  if (data.status === 'success') {
    const nullBetSum = parseFloat(data.data.nullBetSum) || 0;
console.log('nullBetSum test', nullBetSum)
    // Update "Today's Bet"
    const totalBetDisplay = document.querySelector('#totalbet-display span');
    if (totalBetDisplay) {
      const currentBetValue = parseFloat(totalBetDisplay.textContent.replace(/[^\d.]/g, '')) || 0;
      const newBetValue = currentBetValue - nullBetSum;
      totalBetDisplay.textContent = newBetValue.toFixed(2);
    }
  const currenttotal = document.querySelector('#currentbet-display span');
  currenttotal.textContent = 0;
    // Update "Balance"
    // const balanceDisplay = document.querySelector('#balance-display span');
    // if (balanceDisplay) {
    //   const currentBalance = parseFloat(balanceDisplay.textContent.replace(/[^\d.]/g, '')) || 0;
    //   const newBalance = currentBalance + nullBetSum;
    //   balanceDisplay.textContent = newBalance.toFixed(2);
    // }
    const balanceDisplay = document.querySelector('#balance-display span');
    if (balanceDisplay) {
      const currentBalance = parseFloat(balanceDisplay.textContent.replace(/[^\d.]/g, '')) || 0;
    balance = currentBalance;
    }
  
  } else {
    console.error('Server error:', data.message);
  }
})
.catch(error => {
  console.error('Error during fetch:', error);
});


}


  // if (countdown === 5) {
  //   updateBankValue();
  // }
  if (countdown === 4) {
     
    fetchBetHistory(withdrawTime);
  }
  if (countdown === 2) {
    getinsertedbetHistory(withdrawTime);
  }
// if (countdown <= 110) {
//     resultDisplay.textContent = "";
//     resultDisplay.style.display = 'none';
    
//   }
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
    currentBetSpan.textContent = totalCurrBets;
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
  totalCurrBets += amount;
  updateTotalBetDisplay();
}



let currentRotation = 0;

let selectedCoin = null;
let bets = {};

// let totalClaimvalue;
// let totalUnclaimvalue;

function updateBalanceDisplay() {
  balanceDisplay.innerHTML = "Balance: <span style='color: gold;font-weight:800;'>" + balance + "</span>";

}
// function updatewinPointsDisplay() {
//   winPointsDisplay.innerHTML = "Claimed: <span style='color: gold;font-weight:800;'>" + totalClaimvalue + "</span>";

// }
// function updateUnclaimPointsDisplay() {
//   totalUnclaimdisplay.innerHTML = "Unclaimed: <span style='color: gold;font-weight:800;'>" + totalUnclaimvalue + "</span>";

// }
// updateBalanceDisplay();
// updatewinPointsDisplay();

// AJAX helper to update bank value on server
function updateBankValue() {
  console.log('balance',balance)
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
// Global variable to record all totalbets
let totalBets = 0;
let totalCurrBets = 0;

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
// Global tracker for all bets by index
// Global map to track index-wise bets
let pcbets = {}; // Global map to track index-wise bets
let n=0;
let allbetamtinx = JSON.parse(localStorage.getItem('allbetamtinx')) || {};
console.log(allbetamtinx, allbetamtinx);
document.querySelectorAll(".grid-card").forEach(card => {
  card.addEventListener("click", function () {
    console.log('countdown', countdown);
    const resultDisplay = document.getElementById("result-display");
    if (countdown <= 5) {
      resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Betting time is over.";
      return;
    }

    const index = parseInt(this.getAttribute("data-index"));
    if (selectedCoin === null) return;
    if (balance < selectedCoin) {
      resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Not Enough Balance to Bet.";
         setTimeout(() => {
  resultDisplay.style.display = 'none';
}, 2000);
      return;
    
    }
const currentAmount = pcbets[index] || 0;

if (currentAmount + selectedCoin > 10000) {
    resultDisplay.style.display = 'block';
    resultDisplay.textContent = "Maximum bet done.";
    return;
}
    balance -= selectedCoin;
    // updateBalanceDisplay();

    if (bets[index] === undefined) bets[index] = selectedCoin;
    else bets[index] += selectedCoin;
    totalBets += selectedCoin;
    totalCurrBets += selectedCoin;
    addOrMergeOverlay(this, selectedCoin);
    updateTotalBetDisplay();
    updateTotalBetDisplay();

    lastBet = { identifier: index, amount: selectedCoin, element: this, overlayHTML: this.querySelector(".bet-overlay").outerHTML };
    lastBetHistory = { ...lastBet };

    // Update allbetamtinx and localStorage
   

    pcbets[index] = (pcbets[index] || 0) + selectedCoin;

    const data = {
      user_id: user_id,
      identifier: index,
      amount: selectedCoin,
      ntrack: n,
      withdrawTime: withdrawTime
    };
    fetch('../../api/total_history.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => console.log('Server response:', result))
    .catch(error => console.error('Error sending data:', error));
  });
});

// ----- PLACE BET ON GRID HEADER (suit) -----
document.querySelectorAll(".grid-header:not(.empty)").forEach(header => {
  header.addEventListener("click", function () {
    console.log('countdown', countdown);
    const resultDisplay = document.getElementById("result-display");
    if (countdown <= 5) {
      resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Betting time is over.";
      return;
    }
    const suit = this.textContent.trim();
    const betKey = "suit-" + suit;
    if (selectedCoin === null) return;
    if (balance < selectedCoin * 3) {
 resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Not Enough Balance to Bet.";
         setTimeout(() => {
  resultDisplay.style.display = 'none';
}, 2000);
      return;
    }
    let identifiers = [];
    switch (this.id) {
      case 'suitIcon1': identifiers = [0, 4, 8]; break;
      case 'suitIcon2': identifiers = [1, 5, 9]; break;
      case 'suitIcon3': identifiers = [2, 6, 10]; break;
      case 'suitIcon4': identifiers = [3, 7, 11]; break;
      default: console.warn('Unknown suit icon:', this); return;
    }
    const wouldOverflow = identifiers.some(id => (pcbets[id] || 0) + selectedCoin > 10000);
    if (wouldOverflow) {
      resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Maximum bet per Card is 10 000.";
        setTimeout(() => {
  resultDisplay.style.display = 'none';
}, 2000);
      return;
    }
    balance -= selectedCoin * 3;
    if (!bets[betKey]) bets[betKey] = selectedCoin * 3;
    else bets[betKey] += selectedCoin * 3;
    totalBets += selectedCoin * 3;
    totalCurrBets += selectedCoin * 3;
    updateTotalBetDisplay();
    const clickedIndex = gridCells.findIndex(cell => cell === this);
    const col = clickedIndex % GRID_COLUMNS;
    gridCells.forEach((cell, idx) => {
      if (idx % GRID_COLUMNS === col) addOrMergeOverlay(cell, selectedCoin);
    });
    lastBet = { identifier: betKey, amount: selectedCoin, element: this, overlayHTML: null };
    lastBetHistory = { ...lastBet };
    identifiers.forEach(id => {
      
      pcbets[id] = (pcbets[id] || 0) + selectedCoin;
      fetch('../../api/total_history.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, identifier: id, amount: selectedCoin, ntrack: n, withdrawTime })
      }).then(res => res.json()).then(r => console.log(r)).catch(e => console.error(e));
    });
  });
});

allcardsbeted = false;

// ----- PLACE BET ON GRID LABEL (card type) -----
document.querySelectorAll(".grid-label").forEach(label => {
  label.addEventListener("click", function () {
    console.log('countdown', countdown);
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
    if (balance < selectedCoin * 4) {
     resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Not Enough Balance to Bet.";
         setTimeout(() => {
  resultDisplay.style.display = 'none';
}, 2000);
      return;
    }
    let identifiers = [];
    switch (this.id) {
      case 'grid-label-1': identifiers = [0, 1, 2, 3]; break;
      case 'grid-label-2': identifiers = [4, 5, 6, 7]; break;
      case 'grid-label-3': identifiers = [8, 9, 10, 11]; break;
      default: console.warn('Unknown card label:', this); return;
    }
    const wouldOverflow = identifiers.some(id => (pcbets[id] || 0) + selectedCoin > 10000);
    if (wouldOverflow) {
      resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Maximum bet per Card is 10 000.";
        setTimeout(() => {
  resultDisplay.style.display = 'none';
}, 2000);
      return;
      
    }
    balance -= selectedCoin * 4;
    if (!bets[betKey]) bets[betKey] = selectedCoin * 4;
    else bets[betKey] += selectedCoin * 4;
    totalBets += selectedCoin * 4;
    totalCurrBets += selectedCoin * 4;
    updateTotalBetDisplay();
    const clickedIndex = gridCells.findIndex(cell => cell === this);
    const row = Math.floor(clickedIndex / GRID_COLUMNS);
    gridCells.forEach((cell, idx) => {
      if (Math.floor(idx / GRID_COLUMNS) === row) addOrMergeOverlay(cell, selectedCoin);
    });
    lastBet = { identifier: betKey, amount: selectedCoin, element: this, overlayHTML: null };
    lastBetHistory = { ...lastBet };
    identifiers.forEach(id => {
     
      pcbets[id] = (pcbets[id] || 0) + selectedCoin;
      fetch('../../api/total_history.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id, identifier: id, amount: selectedCoin, ntrack: n, withdrawTime })
      }).then(res => res.json()).then(r => console.log(r)).catch(e => console.error(e));
    });
  });
});


// Clear cache on spin button click and reset allbetamtinx





document.getElementById("place-bets").addEventListener("click", function () {
if (Object.keys(pcbets).length < 1) {
  resultDisplay.style.display = 'block';
  resultDisplay.textContent = "No Bet was Placed.";
  setTimeout(() => {
  resultDisplay.style.display = 'none';
}, 2000);
  return;
} else{
   Object.entries(pcbets).forEach(([key, amt]) => {
    allbetamtinx[key] = (allbetamtinx[key] || 0) + amt;
  });

  // Persist the merged totals to localStorage once:
  localStorage.setItem('allbetamtinx', JSON.stringify(allbetamtinx));
totalCurrBets = 0;
updateTotalBetDisplay();

updateBalanceDisplay();
  const formData = new FormData();
  formData.append('withdrawTime', withdrawTime);
  formData.append('n', n);

  fetch('../../api/place_pc_bets.php', {
  method: 'POST',
  body: formData
})
  .then(res => res.json())
  .then(data => {
    console.log('API RESPONSE PLACEPC BETS:', data);

    if (data.status === 'success') {
      console.log('Bet placed:', data.data.insertedId, 'totalBet:', data.data.totalBet);

        const withdrawTime = new Date().toLocaleString();

            // build your cells array with HTML snippets where needed
            const cells = [
              'NA',                                           // Marker Card
               '#'+data.data.serial,                                           // Ticket ID
              data.data.totalBet,                             // Bet Amount
              'NA',                                           // Win Value
              'NA',                                           // Claimed Points
              'NA',                                           // Unclaimed Points
              '<small class="btn-sm btn-success">Bet Placed</small>',
              withdrawTime,                                   // Withdraw Time
              '<button class="btn btn-sm btn-secondary" disabled>Unclaimable</button>'
            ];

            // OPTION A: build the <tr> as HTML and insert as first child
            const rowHTML = `
              <tr>
                ${cells.map(cell => `<td>${cell}</td>`).join('')}
              </tr>
            `.trim();
            document
              .getElementById('historytablebody')
              .insertAdjacentHTML('afterbegin', rowHTML);

      let today = new Date().toISOString().split('T')[0];

// Parse totalBet once
let totalBet = parseFloat(data.data.totalBet) || 0;

// Initialize running totals
let totalSell = 0;
let totalCommission = 0;
let totalNet = 0;

$('#accountdailyTableBody tr').each(function() {
  let $tr = $(this);
  let dateText = $tr.find('td').eq(0).text().trim();

  if (dateText === today) {
    // Update Sell Amount
    let sellText = $tr.find('td').eq(1).text().replace(/[₹,]/g, '');
    let sellAmount = parseFloat(sellText) || 0;
    let winText = $tr.find('td').eq(2).text().replace(/[₹,]/g, '');
    let winAmount = parseFloat(winText) || 0;
    let newSell = sellAmount + totalBet;
    $tr.find('td').eq(1).text('₹' + newSell.toFixed(2));

    // Calculate & Update Commission (3% of newSell)
    let newCommission = newSell * 0.03;
    $tr.find('td').eq(3).text('₹' + newCommission.toFixed(2));

    // Calculate & Update Net Amount (newSell – newCommission)
    let newNet = newSell - winAmount - newCommission;
    $tr.find('td').eq(4).text('₹' + newNet.toFixed(2));

    // Accumulate for footer
    totalSell += newSell;
    totalCommission += newCommission;
    totalNet += newNet;
  }
});

// Update footer row: Sell, Commission, Net
let $footerTh = $('#accountdailyTableFooter tr').find('th');
$footerTh.eq(1).text('₹' + totalSell.toFixed(2));       // Sell total
$footerTh.eq(3).text('₹' + totalCommission.toFixed(2)); // Commission total
$footerTh.eq(4).text('₹' + totalNet.toFixed(2));        // Net total



        const overlays = document.querySelectorAll('.bet-overlay');

        overlays.forEach(overlay => {
          // Get the bet amount from the coin's inner span.
        
          if (overlay.parentElement) {
            overlay.parentElement.removeChild(overlay);
          }
        });
        resultDisplay.style.display = 'block';
        resultDisplay.textContent = "Bet was placed successfully with ID : "+ data.data.serial;
        setTimeout(() => {
        resultDisplay.style.display = 'none';
      }, 2000);
  } else {
      // on error, your API includes `message`
      console.error('Error placing bet:', data.message || '(no message received)');
    }
  })
  .catch(err => console.error('Fetch error:', err));

}
n +=1;
  console.log('pcbets',pcbets);
  console.log('n',n);
  console.log('withdrawTime',withdrawTime);
  pcbets={};
  console.log('pcbets',pcbets);
});

// ----- CLEAR ALL BETS -----
document.getElementById("clear-bets").addEventListener("click", function () {
  console.log('bets', bets);
  console.log('allbetamtinx', allbetamtinx);
  console.log('pcbets', pcbets);
  console.log('totalBets', totalBets);
  console.log('lastTotalBets', lastTotalBets);
  console.log('lastBet', lastBet);
  if (countdown <= 5) {
    resultDisplay.style.display = 'block';
    resultDisplay.textContent = "Betting time is over.";
    return;
  }
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

    // totalbet.textContent = totalbetvalue - parseFloat(totalBets);
  }
  totalBets = 0;
  totalCurrBets = 0;
  lastTotalBets = 0;
  lastBet ={};
  console.log('bets',bets);
  console.log('allbetamtinx',allbetamtinx);
  console.log('pcbets',pcbets);
  console.log('totalBets',totalBets);
  console.log('lastTotalBets',lastTotalBets);
  console.log('lastBet',lastBet);
});
document.getElementById("double-bets").addEventListener("click", function () {
  if (countdown <= 5) {
    resultDisplay.style.display = 'block';
    resultDisplay.textContent = "Betting time is over.";
    return;
  }
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
   
    resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Max bet amount is " + maxBetamount;
         setTimeout(() => {
  resultDisplay.style.display = 'none';
}, 2000);
  }
  if (balance < extra) {
    resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Not enough balance to double all bets.";
         setTimeout(() => {
  resultDisplay.style.display = 'none';
}, 2000);
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
  if (countdown <= 5) {
    resultDisplay.style.display = 'block';
    resultDisplay.textContent = "Betting time is over.";
    return;
  }
  if (!lastBetHistory) {
    resultDisplay.style.display = 'block';
      resultDisplay.textContent = "No previous bet to repeat.";
         setTimeout(() => {
  resultDisplay.style.display = 'none';
}, 2000);
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
     resultDisplay.style.display = 'block';
      resultDisplay.textContent = "You've already bet on that segment.";
         setTimeout(() => {
  resultDisplay.style.display = 'none';
}, 2000);
  }
  if (balance < amount) {
     resultDisplay.style.display = 'block';
      resultDisplay.textContent = "Insufficient balance to repeat bet.";
         setTimeout(() => {
  resultDisplay.style.display = 'none';
}, 2000);
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
function subtractMinutes(timeStr, minsToSubtract = 2) {
  // split out the parts
  let [time, modifier] = timeStr.split(' ');
  let [hh, mm] = time.split(':').map(Number);

  // adjust hours to 24h
  if (modifier === 'PM' && hh < 12) hh += 12;
  if (modifier === 'AM' && hh === 12) hh = 0;

  // construct a Date and subtract minutes
  let dt = new Date();
  dt.setHours(hh, mm);
  dt.setMinutes(dt.getMinutes() - minsToSubtract);

  // get back hours/minutes
  let newH = dt.getHours();
  let newM = dt.getMinutes();

  // decide AM/PM and convert to 12h
  let newModifier = newH >= 12 ? 'PM' : 'AM';
  newH = newH % 12 || 12;               // 0→12

  // zero‑pad minutes
  let newMStr = newM.toString().padStart(2, '0');

  return `${newH}:${newMStr} ${newModifier}`;
}

// Add winning card image and suit icon to history (limit 12)
function addHistoryCard(src, suit, withdrawTime) {
  const historyContainer = document.getElementById("history-container");
  const wrapper = document.createElement("div");
  wrapper.classList.add("history-item");

   const timeSpan = document.createElement("span");
timeSpan.textContent = subtractMinutes(withdrawTime, 2);
  timeSpan.style.fontSize = "12px";
  timeSpan.style.color = "black";

   const img = document.createElement("span");

  let imgtext;
  if (src == '/assets-normal/img/golden-j.png') {
    imgtext = 'J';
  } else if(src == '/assets-normal/img/golden-q.png') {
imgtext = 'Q';
  } else{
imgtext = 'K';
  }
  img.textContent = imgtext;
   img.style.fontSize = "15px";
  img.style.marginLeft = "5px";
  img.style.color = "black";
  img.classList.add("history-card");

  const suitSpan = document.createElement("span");
  const wintimesSpan = document.createElement("span");
  suitSpan.textContent = suit;
  wintimesSpan.textContent = 'N'; // Use the appropriate win times value if needed
  suitSpan.style.fontSize = "20px";
  wintimesSpan.style.fontSize = "15";
  suitSpan.style.marginLeft = "5px";
  wintimesSpan.style.marginLeft = "5px";

  // Set color based on suit
  suitSpan.style.color = (suit === "♥" || suit === "♦") ? "red" : "black";
  wintimesSpan.style.color = "black";

  wrapper.appendChild(timeSpan);
  wrapper.appendChild(img);
  wrapper.appendChild(suitSpan);
  wrapper.appendChild(wintimesSpan);
  historyContainer.appendChild(wrapper);

  // Ensure the DOM displays only the last 12 items
  if (historyContainer.childNodes.length > 12) {
    historyContainer.removeChild(historyContainer.firstChild);
  }

  // Update the history in the database
  updateHistory(src, suit, 'N',withdrawTime);
}

// AJAX function to update the game history in the database
function updateHistory(src, suit, wintimes,withdrawTime) {
  const formData = new FormData();
  // You may set the game_id as needed
  formData.append('game_id', 1);
  formData.append('src', src);
  formData.append('suiticon', suit);
  formData.append('wintimes', wintimes);
  formData.append('withdrawTime', withdrawTime);

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
function displayHistoryCard(src, suit, wintimes,withdrawTime) {
  const historyContainer = document.getElementById("history-container");

  // 1-based index of the new item
  const newIndex = historyContainer.childNodes.length + 1;



  // Build the wrapper
  const wrapper = document.createElement("div");
  wrapper.classList.add("history-item");

  // Time label


  let [time, modifier] = withdrawTime.split(' ');
  let [hh, mm] = time.split(':').map(Number);

  // adjust hours to 24h
  if (modifier === 'PM' && hh < 12) hh += 12;
  if (modifier === 'AM' && hh === 12) hh = 0;

  // construct a Date and subtract minutes
  let dt = new Date();
  dt.setHours(hh, mm);
  dt.setMinutes(dt.getMinutes() - 2);

  // get back hours/minutes
  let newH = dt.getHours();
  let newM = dt.getMinutes();

  // decide AM/PM and convert to 12h
  let newModifier = newH >= 12 ? 'PM' : 'AM';
  newH = newH % 12 || 12;               // 0→12

  // zero‑pad minutes
  let newMStr = newM.toString().padStart(2, '0');

  withdrawTime = `${newH}:${newMStr} ${newModifier}`;

  const timeSpan = document.createElement("span");
timeSpan.textContent = withdrawTime;
  timeSpan.style.fontSize = "12px";
  timeSpan.style.color = "black";

  // Card face
  const img = document.createElement("span");
  let imgtext;
  if (src === '/assets-normal/img/golden-j.png') {
    imgtext = 'J';
  } else if (src === '/assets-normal/img/golden-q.png') {
    imgtext = 'Q';
  } else {
    imgtext = 'K';
  }
  img.textContent = imgtext;
  img.style.fontSize = "15px";
  img.style.marginRight = "5px";
  img.style.color = "black";
  img.classList.add("history-card");

  // Suit
  const suitSpan = document.createElement("span");
  suitSpan.textContent = suit;
  suitSpan.style.fontSize = "20px";
  suitSpan.style.marginRight = "5px";
  suitSpan.style.color = (suit === "♥" || suit === "♦") ? "red" : "black";

  // Win times
  const wintimesSpan = document.createElement("span");
  wintimesSpan.textContent = wintimes;
  wintimesSpan.style.fontSize = "15px";
  wintimesSpan.style.marginRight = "5px";
  wintimesSpan.style.color = "black";

  // Assemble and append
  wrapper.append(timeSpan, img, suitSpan, wintimesSpan);
  historyContainer.appendChild(wrapper);

  // Trim to last 12
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
        displayHistoryCard(item.src, item.suiticon, item.wintimes,item.withdrawTime);
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
   const spinsound = new Howl({
    src: ['/assets-normal/img/revolver-chamber-spin-ratchet-sound-90521.mp3'],
    volume: 0.9
  });

 spinsound.play();
 
  console.log('bets',bets)
  console.log('allbetamtinx',allbetamtinx)
  console.log('pcbets',pcbets)
  


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

  const segmentAngle = 360 / segmentCount;

  console.log('chosenIndex' , chosenIndex)
  console.log('userwins' , userwins)
  if (chosenIndex < 0) {
     chosenIndex = Math.floor(Math.random() * 12);
    console.log('chosenIndexlast', chosenIndex);


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
  // Add 15° more
  currentRotation += 15;

  wheel.style.transition = "none";
  wheel.style.transform  = `rotate(${currentRotation}deg)`;

  suitRing.style.transition = "none";
  suitRing.style.transform  = `rotate(${-currentRotation + 30}deg)`;

  stickContainer.style.transition = "none";
  stickContainer.style.transform = `rotate(${currentRotation}deg)`;

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
      const winningRibbon = document.querySelector(
      `.grid-card[data-index="${gridIndex}"] .cstm-ribbon`
    );

    if (winningRibbon) {
      winningRibbon.classList.add("blingbg");
    }
    const wheelCards = document.querySelectorAll(".card-wrapper");
    const winningWheelCard = wheelCards[winningIndex];
    winningWheelCard.classList.add("winner");

    // Get winning card image source
    const imgEl = winningWheelCard.querySelector("img");
    const winningSrc = imgEl.getAttribute("src");

    // Debug logging: show the bet and the winning card.
    if (lastBet && Object.keys(lastBet).length > 0) {
      console.log("User placed bet on:", lastBet.identifier, "with amount:", lastBet.amount);
    } else {
      console.log("No bet was placed by the user.");
    }
    // console.log("Winning card:", cardType, suitIcon, "at grid index:", gridIndex);

    // --- Win calculation based on last bet ---
    
    let userWon = false;
if (chosenIndex === undefined) {
  // pick an integer from 0 up to and including 11
  chosenIndex = Math.floor(Math.random() * 12);
  console.log('chosenIndexlast', chosenIndex);
}
function evaluateBet(allbetamtinx, chosenIndex) {
  console.log('incoming bets:', allbetamtinx);
  console.log('chosenIndex:', chosenIndex);

  // Calculate total amount
  const totalAmountbetwasplaced = Object.values(allbetamtinx).reduce((sum, val) => sum + parseFloat(val), 0);
  console.log('Total amount bet:', totalAmountbetwasplaced);

  // Check if chosenIndex is a key in allbetamtinx
  if (allbetamtinx.hasOwnProperty(chosenIndex)) {
    const rawAmt = allbetamtinx[chosenIndex];
    const amount = parseFloat(rawAmt);
    console.log(`Found amount for index ${chosenIndex}:`, rawAmt, '→ parsed:', amount);

    const userWon = true;
    const winamt = amount * 10;
    console.log('userWon:', userWon, 'winamt:', winamt);

    return { userWon, winamt, totalAmountbetwasplaced };
  }

  console.log(`No bet found at index ${chosenIndex}`);
  return { userWon: false, winamt: 0, totalAmountbetwasplaced };
}

    const result = evaluateBet(allbetamtinx, chosenIndex);

console.log('chosenIndex-just-before', chosenIndex);

if (result.winamt > 0 && result.userWon) {
  console.log('true yes userwon');
  winValue = result.winamt;
  userWon = true;

  if (auto_claim) {
    totalClaim = totalClaim + winValue;
    // updatewinPointsDisplay();
    balance = balance + winValue;
    updateBankValue();
  } else {
    totalUnclaim = totalUnclaim + winValue;
    // updateUnclaimPointsDisplay();
  }
} else {
  console.log('usernotwon');
}
        
      



    if (userWon) {
      winningPoints += winValue;
      console.log(balance, 'balance')
      // balance = (balance - totalBets);
      console.log(totalBets, 'totalBets')
      console.log(balance, 'balance')
      console.log(winValue, 'winValue')
      // balance = (balance + winValue);
      console.log(balance, 'balance')
    } else {
      winValue = 0;
    }

    // updateBalanceDisplay();
    // updatewinPointsDisplay();
    resultDisplay.style.display = 'block';

    // base message
    let msg;
    if (userWon) {
      // balanceDisplay.innerHTML = "Balance: <span style='color: gold;font-weight:800;'>" + (balance) + "</span>";
      msg = `Total Win ${winValue}!`;
    } else if (lastBet && Object.keys(lastBet).length > 0 && result.totalAmountbetwasplaced) {
      msg = `Lose.`;
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
  <span><strong>Total Bet:</strong> ${result.totalAmountbetwasplaced}</span>
`;


    // Update center card display and history.
    // (The suit icon color is set based on red for hearts/diamonds, black otherwise.)
    const suitIconcolor = (suitIcon === '♥' || suitIcon === '♦') ? 'red' : 'black';
    showCenterCard(winningSrc, suitIcon, suitIconcolor);
    addHistoryCard(winningSrc, suitIcon, withdrawTime);
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
     Object.values(allbetamtinx).reduce((sum, amt) => sum + amt, 0),
      winValue,
      suiticonnum,
      withdrawTime,
    );


    // Remove all bet overlays and clear the bets object.
    document.querySelectorAll(".bet-overlay").forEach(overlay => overlay.remove());
    for (let key in bets) {
      delete bets[key];
    }
    // Restart the timer for the next spin.
    lastBet = {};
    allbetamtinx = {};
    bets = {};
    allcardsbeted = false;
    // startTimer();
    totalBets = 0;
    totalCurrBets = 0;
    lastTotalBets = 0;
    spinsound.stop();
    const placechipssound = new Howl({
    src: ['place-chips.mp3'],
    volume: 0.9
  });
placechipssound.play();
updatedashboardData(withdrawTime);

  }, 4000);

});
// poker-roulette.js
let totalwindb;
function updatedashboardData(withdrawTime) {
  fetch('../../api/get_dashboard_data.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({ withdrawTime })
  })
    .then(async response => {
      const text = await response.text();
      // console.log(`↳ HTTP ${response.status} ${response.statusText}`, '– body:', text);
 
if (response.status == 'success') {

}
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${text}`);
      }

      try {
        return JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON from server: ${e.message} (raw: ${text})`);
      }
    })
    .then(data => {
      if (data.status === 'success') {
        console.log('Fetched data:', data);
 

const now = new Date();
const today = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0')
].join('-');

const from = document.getElementById('from_date').value;
const to   = document.getElementById('to_date').value;

if ((from === today && to === today) || (countdown == 115)) {
  const $tbodynew = $('#accountdailyTableBody');
  $tbodynew.empty();
  document.getElementById('from_date').value = today;
  document.getElementById('to_date').value = today;

  // Initialize totals
  let totalSellAmount = 0;
  let totalWinValue = 0;
  let totalClaimed = 0;
  let totalUnclaimed = 0;
  let totalCommission = 0;
  let totalNetAmount = 0;

  // Loop and aggregate today's data
  data.mapped.forEach(result => {
    const createdDate = result.created_at?.slice(0, 10);
    if (createdDate === today) {
      const balance = parseFloat(result.balance) || 0;
      const claim_point = parseFloat(result.claim_point) || 0;
      const unclaim_point = parseFloat(result.unclaim_point) || 0;
      const commission = balance * 0.03;
      const win_value = claim_point === 0 ? 0 : claim_point;
      const netAmount = balance - commission - win_value;

      totalSellAmount += balance;
      totalWinValue += win_value;
      totalClaimed += claim_point;
      totalUnclaimed += unclaim_point;
      totalCommission += commission;
      totalNetAmount += netAmount;
    }
  });

  // Build body row (only one row for today)
  let bodyHtml = '';
  if (totalSellAmount > 0 || totalWinValue > 0 || totalCommission > 0 || totalNetAmount > 0) {
    bodyHtml = `
      <tr>
        <td>${today}</td>
        <td>₹${totalSellAmount.toFixed(2)}</td>
        <td>₹${totalWinValue.toFixed(2)}</td>
        <td>₹${totalCommission.toFixed(2)}</td>
        <td>₹${totalNetAmount.toFixed(2)}</td>
      </tr>`;
  } else {
    bodyHtml = `<tr>
        <td>${today}</td>
        <td>₹0</td>
        <td>₹0</td>
        <td>₹0</td>
        <td>₹0</td>
      </tr>`;
  }

  // Build footer row
  const footHtml = `
    <tr class="table-history">
      <th>Total</th>
      <th>₹${totalSellAmount.toFixed(2)}</th>
      <th>₹${totalWinValue.toFixed(2)}</th>
      <th>₹${totalCommission.toFixed(2)}</th>
      <th>₹${totalNetAmount.toFixed(2)}</th>
    </tr>`;

  // Inject into DOM
  document.getElementById('accountdailyTableBody').innerHTML = bodyHtml;
  document.getElementById('accountdailyTableFooter').innerHTML = footHtml;

} else {
  // at least one date isn’t today → skip updating
  console.warn('Table update skipped: date range is not today.');
}


const suits     = ['spades','diamond','clubs','hearts'];
  const ranks     = ['k','q','j'];

  // 2) map each suit→exact file-basename
  const suitIcons = {
    spades:  'spades-golden',
    diamond: 'golden-diamond',
    clubs:   'clubs-golden',
    hearts:  'golden-hearts'
  };

  // 3) map each rank→exact file-basename
  const rankIcons = {
    k: 'goldens-k',  // your PHP used goldens-k.png for *all* Kings
    q: 'golden-q',
    j: 'golden-j'
  };

 
    const $tbody = $('#historytablebody');
    $tbody.empty();
const groupedData = {};

data.mapped.forEach(result => {
    const gameResult = result.game_result || {};
    const index = gameResult.winning_number ?? gameResult.lose_number;

    let output = '0';
    if (result.created_at) {
        const dt = new Date(result.created_at);
        dt.setMinutes(dt.getMinutes() - 2);
        output = dt.toISOString().replace('T', ' ').slice(0, 19);
    }

    const groupKey = `${index}|${output}`;

    const claim_point = result.claim_point || 0;
    const unclaim_point = result.unclaim_point || 0;
    const balance = result.balance || 0;

    const win_value = (unclaim_point === 0 && claim_point === 0) ? 0 : (unclaim_point || claim_point);

    if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
            index,
            output,
            total_balance: 0,
            total_win_value: 0,
            total_claim_point: 0,
            total_unclaim_point: 0,
            ticket_ids: []
        };
    }

    groupedData[groupKey].total_balance += balance;
    groupedData[groupKey].total_win_value += win_value;
    groupedData[groupKey].total_claim_point += claim_point;
    groupedData[groupKey].total_unclaim_point += unclaim_point;
    groupedData[groupKey].ticket_ids.push(result.ticket_serial);
});

// Optional: format currency
const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

const tableBody = document.getElementById("card-historytablebody");
tableBody.innerHTML = "";

Object.values(groupedData).forEach(group => {
    const row = document.createElement("tr");
    row.classList.add("table-history");

    const index = group.index;
    const cardCell = document.createElement("td");
    cardCell.classList.add("d-flex");
    cardCell.setAttribute("data-label", "Card Index");

    const cardImage = (rank, suit) => `
        <img class="card" src="/assets-normal/img/${rank}.png" alt="${rank}">
        <img class="card" src="/assets-normal/img/${suit}.png" alt="${rank}">
    `;

    const cards = [
        ["goldens-k", "spades-golden"],
        ["goldens-k", "golden-diamond"],
        ["goldens-k", "clubs-golden"],
        ["goldens-k", "golden-hearts"],
        ["golden-q", "spades-golden"],
        ["golden-q", "golden-diamond"],
        ["golden-q", "clubs-golden"],
        ["golden-q", "golden-hearts"],
        ["golden-j", "spades-golden"],
        ["golden-j", "golden-diamond"],
        ["golden-j", "clubs-golden"],
        ["golden-j", "golden-hearts"]
    ];

    if (cards[index]) {
        cardCell.innerHTML = cardImage(...cards[index]);
    }

    const cells = [
        formatCurrency(group.total_balance),
        formatCurrency(group.total_win_value),
        group.total_claim_point,
        group.total_unclaim_point,
        group.output
    ];

    const labels = ["Bet Amount", "Win Value", "Claimed Points", "Unclaimed Points", "Withdraw Time"];

    row.appendChild(cardCell);
    cells.forEach((val, i) => {
        const td = document.createElement("td");
        td.setAttribute("data-label", labels[i]);
        td.innerHTML = val;
        row.appendChild(td);
    });

    tableBody.appendChild(row);
});


    data.mapped.forEach(result => {
      // — your existing logic for points, win/lose, withdrawTime, etc. —
      const unclaim   = parseFloat(result.unclaim_point);
      const claim     = parseFloat(result.claim_point);
      const win_value = (unclaim === 0 && claim === 0)
        ? 0
        : (unclaim || claim);

      const userwins = win_value > 0 ? 'Yes' : 'No';

      let withdrawTime = '—';
      if (result.created_at) {
        const utcDate = new Date(result.created_at);

        // Convert to IST (Asia/Kolkata)
        const istDate = new Date(utcDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
        
        // Subtract 2 minutes
        istDate.setMinutes(istDate.getMinutes() - 2);

        const yyyy = istDate.getFullYear();
        const MM   = String(istDate.getMonth() + 1).padStart(2, '0');
        const dd   = String(istDate.getDate()).padStart(2, '0');
        const hh   = String(istDate.getHours()).padStart(2, '0');
        const mm   = String(istDate.getMinutes()).padStart(2, '0');
        const ss   = String(istDate.getSeconds()).padStart(2, '0');

        withdrawTime = `${yyyy}-${MM}-${dd} ${hh}:${mm}:${ss}`;
      }


      // — figure out the 0–11 index as before —
      let index = null;
      if (result.game_result) {
        index = result.game_result.winning_number == null
          ? result.game_result.lose_number
          : result.game_result.winning_number;
      }
      index = (index == null) ? 0 : index;

      // 4) pick rankKey ('k'|'q'|'j') and suitKey ('spades',…)
      const rankKey = ranks[Math.floor(index / 4)];
      const suitKey = suits[index % 4];

      // 5) look up the exact filenames
      const rankFile = rankIcons[rankKey];
      const suitFile = suitIcons[suitKey];

      // 6) build your two‐card HTML
      const cardsHtml = `
        <img class="card"
             src="/assets-normal/img/${rankFile}.png"
             alt="${rankKey.toUpperCase()} of ${suitKey}">
        <img class="card"
             src="/assets-normal/img/${suitFile}.png"
             alt="${rankKey.toUpperCase()} of ${suitKey}">
      `;

      // — your existing status badges & action button logic —
      let statusHtml = userwins === 'Yes'
        ? '<small class="btn-sm btn-success">Win</small> '
        : '<small class="btn-sm btn-danger">Lose</small> ';
      if (claim > 0) {
        statusHtml += '<small class="btn-sm btn-danger">Claimed</small>';
      } else {
        statusHtml += (win_value > 0)
          ? '<small class="btn-sm btn-success">Unclaimed</small>'
          : '<small class="btn-sm btn-success">Unclaimable</small>';
      }

      const actionHtml = (claim <= 0 && win_value > 0)
        ? `<button
             class="btn btn-sm btn-danger win-value claim-btn"
             data-user-id="${result.user_id}"
              data-unclaim-points="${result.unclaim_point}"
             data-claim-id="${result.id}">
             Claim
           </button>`
        : `<button class="btn btn-sm btn-secondary" disabled>
             ${win_value > 0 ? 'Claimed' : 'Unclaimable'}
           </button>`;

      // 7) assemble & append the row
      const row = `
        <tr class="table-history">
          <td data-label="Card Win" class="image-tr d-flex">${cardsHtml}</td>
          <td data-label="Ticket Serial">#${result.ticket_serial}</td>
          <td data-label="Bet Amount">₹${parseFloat(result.balance).toFixed(2)}</td>
          <td data-label="Win Value">₹${win_value.toFixed(2)}</td>
          <td data-label="Claimed Points">${claim.toFixed(0)}</td>
          <td data-label="Unclaimed Points">${unclaim.toFixed(0)}</td>
          <td data-label="Status">${statusHtml}</td>
          <td data-label="Withdraw Time">${withdrawTime}</td>
          <td data-label="Action">${actionHtml}</td>
        </tr>
      `;
      $tbody.append(row);
    });
// 1) Initialize totals
let totalBet = 0;

// 2) Build rows and compute totalBet
data.bethistory.reverse().forEach(result => {
  // Determine card index
  let index = null;
  if (result.card_type != null) {
    const parsed = parseInt(result.card_type, 10);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 11) {
      index = parsed;
    }
  }

  // Build Card‑Win cell
  let cardsHtml = 'NA';
  if (index !== null) {
    const rankKey  = ranks[Math.floor(index / 4)];
    const suitKey  = suits[index % 4];
    const rankFile = rankIcons[rankKey];
    const suitFile = suitIcons[suitKey];
    cardsHtml = `<img src="${rankFile}" alt="${rankKey}" /><img src="${suitFile}" alt="${suitKey}" />`;
  }

  // Other columns with fallbacks
  const ticketSerial   = result.ticket_serial != null ? `#${result.ticket_serial}` : 'NA';
  const numericBet     = parseFloat(result.bet_amount) || 0;
  const betAmount      = result.bet_amount != null ? `₹${numericBet.toFixed(2)}` : 'NA';
  totalBet += Math.floor(numericBet);
  const winValue       = result.win_value   != null ? `₹${parseFloat(result.win_value).toFixed(2)}`   : 'NA';
  const claimedPoints  = result.claim_point  != null ? parseFloat(result.claim_point).toFixed(0)    : 'NA';
  const unclaimedPoints= result.unclaim_point!= null ? parseFloat(result.unclaim_point).toFixed(0)  : 'NA';
  const statusHtml     = result.status_html  || '<small class="btn-sm btn-success">Bet Placed</small>';
  const actionHtml     = result.action_html  || '<small class="btn btn-success disabled">Unclaimable</small>';
  const withdrawTime   = result.withdraw_time|| 'NA';

  // Prepend row
  const row = `
    <tr class="table-history">
      <td data-label="Card Win" class="image-tr d-flex">NA</td>
      <td data-label="Ticket Serial">${ticketSerial}</td>
      <td data-label="Bet Amount">${betAmount}</td>
      <td data-label="Win Value">${winValue}</td>
      <td data-label="Claimed Points">${claimedPoints}</td>
      <td data-label="Unclaimed Points">${unclaimedPoints}</td>
      <td data-label="Status">${statusHtml}</td>
      <td data-label="Withdraw Time">${withdrawTime}</td>
      <td data-label="Action">${actionHtml}</td>
    </tr>
  `;
  $tbody.prepend(row);
});

// 3) Update today's row: add today's totalBet, recalc commission & net
let todaysnew = new Date().toISOString().split('T')[0];
$('#accountdailyTableBody tr').each(function() {
  const $tr = $(this);
  let date = $tr.find('td').eq(0).text().trim();
  if (date === todaysnew) {
    // Sell
    let sell = parseFloat($tr.find('td').eq(1).text().replace(/[₹,]/g, '')) || 0;
    let newSell = sell + totalBet;
    let win = parseFloat($tr.find('td').eq(2).text().replace(/[₹,]/g, '')) || 0;

    $tr.find('td').eq(1).text('₹' + newSell.toFixed(2));

    // Commission = 3%
    let commission = newSell * 0.03;
    $tr.find('td').eq(3).text('₹' + commission.toFixed(2));

    // Net = Sell - Commission
    let net = newSell - win - commission;
    $tr.find('td').eq(4).text('₹' + net.toFixed(2));
  }
});

// 4) Sum all rows and insert into footer
totalSell = 0;
totalCommission = 0;
totalNet = 0;
$('#accountdailyTableBody tr').each(function() {
  const $tds = $(this).find('td');
  let sell       = parseFloat($tds.eq(1).text().replace(/[₹,]/g, '')) || 0;
  let commission = parseFloat($tds.eq(3).text().replace(/[₹,]/g, '')) || 0;
  let net        = parseFloat($tds.eq(4).text().replace(/[₹,]/g, '')) || 0;
  totalSell       += sell;
  totalCommission += commission;
  totalNet        += net;
});

let $footerTh = $('#accountdailyTableFooter tr').find('th');
$footerTh.eq(1).text('₹' + totalSell.toFixed(2));       // Sell total
$footerTh.eq(3).text('₹' + totalCommission.toFixed(2)); // Commission total
$footerTh.eq(4).text('₹' + totalNet.toFixed(2));         // Net total

    const winPointsDisplay = document.getElementById("claim-display");
 winPointsDisplay.innerHTML = "Claimed: <span style='color: gold;font-weight:800;'>" + data.totalClaim + "</span>";
    const totalUnclaimdisplay = document.getElementById("unclaim-display");
 totalUnclaimdisplay.innerHTML = "Unclaimed: <span style='color: gold;font-weight:800;'>" + data.totalUnclaim + "</span>";
      } else {
        console.error('🚨 Server error:', data.message);
      }
    })
    .catch(err => {
      console.error('AJAX request failed:', err);
    });

}

function recordGameResult(winningSpin, betTotal, winValue = 0, suiticonnum, withdrawTime) {
  const params = new URLSearchParams({ winningSpin, betTotal, winValue, suiticonnum, withdrawTime });

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
         allbetamtinx = {};
    localStorage.removeItem('allbetamtinx');
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
  const stickContainer  = document.getElementById("stick-container");
  const overlay         = document.getElementById("overlay");

  // Grab _all_ fullscreen buttons
  const fullscreenBtns = document.querySelectorAll(".fullscreen-toggle");

  let fsEnforcerInterval;

  function updateButtons() {
    const isFull = !!document.fullscreenElement;
    fullscreenBtns.forEach(btn => {
      btn.innerHTML = isFull
        ? '<i class="fas fa-compress"></i> Exit Fullscreen'
        : '<i class="fas fa-expand"></i> Go Fullscreen';
    });
  }

  function enterFullscreen() {
    stickContainer.style.top = "5.5rem";
    document.documentElement.requestFullscreen()
      .then(() => {
        overlay.style.display        = "none";
        document.body.style.overflow = "";
        updateButtons();

        // Stop polling once we're in fullscreen
        clearInterval(fsEnforcerInterval);
      })
      .catch(err => console.warn("FS error:", err));
  }

  function exitFullscreen() {
    stickContainer.style.top = "12.2rem";
    overlay.style.display        = "flex";
    document.body.style.overflow = "hidden";
    updateButtons();

    // restart polling so we re-enter if they exit again
    startFullscreenEnforcer();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      enterFullscreen();

      const bettingOversound = new Howl({
        src: ['/assets-normal/img/place-chips.mp3'],
        volume: 0.9
      });
      bettingOversound.play();
    } else {
      document.exitFullscreen().catch(err => console.warn("FS exit error:", err));
    }
  }

  // Poll every second, and re-enter fullscreen if they've left
  function startFullscreenEnforcer() {
    // avoid multiple intervals
    clearInterval(fsEnforcerInterval);
    fsEnforcerInterval = setInterval(() => {
      if (!document.fullscreenElement) {
        enterFullscreen();
      }
    }, 1000);
  }

  // On DOM ready, lock in the overlay and start polling
  document.addEventListener("DOMContentLoaded", () => {
    overlay.style.display        = "flex";
    document.body.style.overflow = "hidden";
    updateButtons();

    startFullscreenEnforcer();
  });

  // Wire up every button to the same toggle handler
  fullscreenBtns.forEach(btn =>
    btn.addEventListener("click", toggleFullscreen)
  );

  // F11 support
  document.addEventListener("keydown", e => {
    if (e.key === "F11" || e.keyCode === 122) {
      e.preventDefault();
      toggleFullscreen();
    }
  });

  // Listen for fullscreen changes (escape, browser menu, etc)
  [
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "MSFullscreenChange"
  ].forEach(evt => {
    document.addEventListener(evt, () => {
      if (!document.fullscreenElement) {
        exitFullscreen();
      }
    });
  });

  $(document).ready(function() {
  setInterval(function() {
    // console.log('called updatedashboardData')
    updatedashboardData(withdrawTime);
  }, 4000);
});
