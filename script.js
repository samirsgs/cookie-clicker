let score = 0;
let autoclickers = 0;
let autoclickerBaseCost = 100;
let selectedQty = 1;
let shopMode = "buy"; // "buy" of "sell"
const refundRate = 0.5; // 0.5 = 50% geld terug, zet op 1.0 voor 100%

let pacmen = 0;
let pacmanBaseCost = 500;
let pacmanMultiplier = 1;
let pacmanAnimationRunning = false;

const cookie = document.getElementById("cookie");
const scoreDisplay = document.getElementById("score");
const buyButton = document.getElementById("buy-autoclicker");
const costDisplay = buyButton.querySelector(".item-cost");

const buyPacmanButton = document.getElementById("buy-pacman");
const pacmanCostDisplay = buyPacmanButton.querySelector(".item-cost");
const pacmanRow = document.getElementById("pacman-row");
const pacmanTrack = document.getElementById("pacman-track");
const pacmanEl = document.getElementById("pacman");

const modeBuyBtn = document.getElementById("mode-buy");
const modeSellBtn = document.getElementById("mode-sell");

// ---------- NUMBER FORMATTING ----------

function formatNumber(num) {
  if (num >= 1e12) return (num / 1e12).toFixed(2) + "T";
  if (num >= 1e9)  return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6)  return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3)  return (num / 1e3).toFixed(2) + "K";
  return Math.floor(num).toString();
}

function updateScoreDisplay() {
  scoreDisplay.textContent = formatNumber(score) + " cookies";
}

// ---------- KOSTEN & REFUND BEREKENINGEN ----------

function getAutoclickerCost(qty) {
  let totalCost = 0;
  for (let i = 0; i < qty; i++) {
    totalCost += Math.ceil(autoclickerBaseCost * Math.pow(1.15, autoclickers + i));
  }
  return totalCost;
}

function getAutoclickerRefund(qty) {
  let actualQty = Math.min(qty, autoclickers);
  let totalRefund = 0;
  for (let i = 1; i <= actualQty; i++) {
    let costAtThatLevel = Math.ceil(autoclickerBaseCost * Math.pow(1.15, autoclickers - i));
    totalRefund += Math.floor(costAtThatLevel * refundRate);
  }
  return totalRefund;
}

function getPacmanCost(qty) {
  let totalCost = 0;
  for (let i = 0; i < qty; i++) {
    totalCost += Math.ceil(pacmanBaseCost * Math.pow(1.15, pacmen + i));
  }
  return totalCost;
}

function getPacmanRefund(qty) {
  let actualQty = Math.min(qty, pacmen);
  let totalRefund = 0;
  for (let i = 1; i <= actualQty; i++) {
    let costAtThatLevel = Math.ceil(pacmanBaseCost * Math.pow(1.15, pacmen - i));
    totalRefund += Math.floor(costAtThatLevel * refundRate);
  }
  return totalRefund;
}

// ---------- WINKEL UPDATES ----------

function updateShop() {
  if (shopMode === "buy") {
    const cost = getAutoclickerCost(selectedQty);
    costDisplay.textContent = formatNumber(cost);
    if (score >= cost) {
      buyButton.removeAttribute("disabled");
    } else {
      buyButton.setAttribute("disabled", "true");
    }
  } else {
    const refund = getAutoclickerRefund(selectedQty);
    costDisplay.textContent = "+" + formatNumber(refund);
    if (autoclickers >= selectedQty) {
      buyButton.removeAttribute("disabled");
    } else {
      buyButton.setAttribute("disabled", "true");
    }
  }
}

function updatePacmanShop() {
  if (shopMode === "buy") {
    const cost = getPacmanCost(selectedQty);
    pacmanCostDisplay.textContent = formatNumber(cost);
    if (score >= cost) {
      buyPacmanButton.removeAttribute("disabled");
    } else {
      buyPacmanButton.setAttribute("disabled", "true");
    }
  } else {
    const refund = getPacmanRefund(selectedQty);
    pacmanCostDisplay.textContent = "+" + formatNumber(refund);
    if (pacmen >= selectedQty) {
      buyPacmanButton.removeAttribute("disabled");
    } else {
      buyPacmanButton.setAttribute("disabled", "true");
    }
  }
}

// ---------- EVENT LISTENERS: AUTOCLICKER ----------

buyButton.addEventListener("click", function() {
  if (buyButton.hasAttribute("disabled")) return;

  if (shopMode === "buy") {
    const cost = getAutoclickerCost(selectedQty);
    if (score >= cost) {
      score -= cost;
      autoclickers += selectedQty;
    }
  } else {
    if (autoclickers >= selectedQty) {
      const refund = getAutoclickerRefund(selectedQty);
      score += refund;
      autoclickers -= selectedQty;
    }
  }

  updateScoreDisplay();
  updateShop();
  updatePacmanShop();
});

// ---------- EVENT LISTENERS: PAC-MAN ----------

function updatePacmanMultiplier() {
  pacmanMultiplier = 1 + (pacmen * 0.1);
}

function renderPacmanTrail() {
  pacmanTrack.innerHTML = "";
  const cookieCount = Math.min(pacmen * 3, 20);
  for (let i = 0; i < cookieCount; i++) {
    const dot = document.createElement("span");
    dot.classList.add("cookie-dot");
    dot.textContent = "🍪";
    pacmanTrack.appendChild(dot);
  }

  if (cookieCount === 0) {
    pacmanRow.style.display = "none";
    pacmanAnimationRunning = false;
    return;
  }

  if (!pacmanAnimationRunning) {
    pacmanAnimationRunning = true;
    runPacmanLoop();
  }
}

function runPacmanLoop() {
  const dots = pacmanTrack.querySelectorAll(".cookie-dot");
  if (dots.length === 0 || pacmen === 0) {
    pacmanAnimationRunning = false;
    return;
  }

  const trackWidth = pacmanTrack.offsetWidth;
  let position = 0;
  const speed = 2;
  const eatenSet = new Set();

  pacmanEl.style.left = "0px";

  const moveInterval = setInterval(function() {
    position += speed;
    pacmanEl.style.left = position + "px";

    dots.forEach(function(dot, index) {
      if (eatenSet.has(index)) return;
      const dotLeft = dot.offsetLeft;
      if (position + 60 >= dotLeft) {
        dot.classList.add("eaten");
        eatenSet.add(index);
      }
    });

    if (position >= trackWidth) {
      clearInterval(moveInterval);
      setTimeout(function() {
        dots.forEach(dot => dot.classList.remove("eaten"));
        if (pacmen > 0) runPacmanLoop();
      }, 800);
    }
  }, 16);
}

buyPacmanButton.addEventListener("click", function() {
  if (buyPacmanButton.hasAttribute("disabled")) return;

  if (shopMode === "buy") {
    const cost = getPacmanCost(selectedQty);
    if (score >= cost) {
      score -= cost;
      pacmen += selectedQty;
      pacmanRow.style.display = "flex";
      renderPacmanTrail();
    }
  } else {
    if (pacmen >= selectedQty) {
      const refund = getPacmanRefund(selectedQty);
      score += refund;
      pacmen -= selectedQty;
      renderPacmanTrail();
    }
  }

  updatePacmanMultiplier();
  updateScoreDisplay();
  updatePacmanShop();
  updateShop();
});

// ---------- COOKIE CLICK ----------

cookie.addEventListener("click", function() {
  score += Math.ceil(1 * pacmanMultiplier);
  updateScoreDisplay();
  updateShop();
  updatePacmanShop();

  cookie.classList.remove("clicked");
  void cookie.offsetWidth;
  cookie.classList.add("clicked");
});

// ---------- PASSIVE INCOME ----------

setInterval(function() {
  if (autoclickers > 0) {
    score += autoclickers;
    updateScoreDisplay();
    updateShop();
    updatePacmanShop();
  }
}, 1000);

// ---------- BUY / SELL SELECTOR ----------

modeBuyBtn.addEventListener("click", function() {
  shopMode = "buy";
  modeBuyBtn.classList.add("active");
  modeSellBtn.classList.remove("active");
  updateShop();
  updatePacmanShop();
});

modeSellBtn.addEventListener("click", function() {
  shopMode = "sell";
  modeSellBtn.classList.add("active");
  modeBuyBtn.classList.remove("active");
  updateShop();
  updatePacmanShop();
});

const buyQtyButtons = document.querySelectorAll(".buy-qty");

buyQtyButtons.forEach(function(btn) {
  btn.addEventListener("click", function() {
    buyQtyButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedQty = parseInt(btn.dataset.qty);
    updateShop();
    updatePacmanShop();
  });
});

// ---------- INITIAL SETUP ----------

updateShop();
updatePacmanShop();