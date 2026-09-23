let score = 0;
let autoclickers = 0;
let autoclickerBaseCost = 1;
let selectedQty = 1;
let shopMode = "buy"; // "buy" of "sell"
const refundRate = 0.5; // 50% refund waarde

let pacmen = 0;
let pacmanBaseCost = 200;
let pacmanMultiplier = 1;
let pacmanAnimationRunning = false;

let ovens = 0;
let ovenBaseCost = 1000;
let ovenMultiplier = 0; // Geeft +0.5 multiplier per oven

const cookie = document.getElementById("cookie");
const scoreDisplay = document.getElementById("score");
const cpsDisplay = document.getElementById("cps");

const buyButton = document.getElementById("buy-autoclicker");
const costDisplay = buyButton.querySelector(".item-cost");

const buyPacmanButton = document.getElementById("buy-pacman");
const pacmanCostDisplay = buyPacmanButton.querySelector(".item-cost");
const pacmanRow = document.getElementById("pacman-row");
const pacmanTrack = document.getElementById("pacman-track");
const pacmanEl = document.getElementById("pacman");

const buyOvenButton = document.getElementById("buy-oven");
const ovenCostDisplay = buyOvenButton.querySelector(".item-cost");

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
  cpsDisplay.textContent = "per second: " + formatNumber(autoclickers);
}

// ---------- AUTOCLICKER ----------

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
  updateAllShops();
});

// ---------- PAC-MAN ----------

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

function updatePacmanMultiplier() {
  pacmanMultiplier = 1 + (pacmen * 0.1);
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
  updateAllShops();
});

// ---------- OVEN (CLICK MULTIPLIER UPGRADE) ----------

function getOvenCost(qty) {
  let totalCost = 0;
  for (let i = 0; i < qty; i++) {
    totalCost += Math.ceil(ovenBaseCost * Math.pow(1.15, ovens + i));
  }
  return totalCost;
}

function getOvenRefund(qty) {
  let actualQty = Math.min(qty, ovens);
  let totalRefund = 0;
  for (let i = 1; i <= actualQty; i++) {
    let costAtThatLevel = Math.ceil(ovenBaseCost * Math.pow(1.15, ovens - i));
    totalRefund += Math.floor(costAtThatLevel * refundRate);
  }
  return totalRefund;
}

function updateOvenMultiplier() {
  ovenMultiplier = ovens * 0.5; // Elke oven telt op als +0.5 bij de multiplier
}

function updateOvenShop() {
  if (shopMode === "buy") {
    const cost = getOvenCost(selectedQty);
    ovenCostDisplay.textContent = formatNumber(cost);
    if (score >= cost) {
      buyOvenButton.removeAttribute("disabled");
    } else {
      buyOvenButton.setAttribute("disabled", "true");
    }
  } else {
    const refund = getOvenRefund(selectedQty);
    ovenCostDisplay.textContent = "+" + formatNumber(refund);
    if (ovens >= selectedQty) {
      buyOvenButton.removeAttribute("disabled");
    } else {
      buyOvenButton.setAttribute("disabled", "true");
    }
  }
}

buyOvenButton.addEventListener("click", function() {
  if (buyOvenButton.hasAttribute("disabled")) return;

  if (shopMode === "buy") {
    const cost = getOvenCost(selectedQty);
    if (score >= cost) {
      score -= cost;
      ovens += selectedQty;
    }
  } else {
    if (ovens >= selectedQty) {
      const refund = getOvenRefund(selectedQty);
      score += refund;
      ovens -= selectedQty;
    }
  }

  updateOvenMultiplier();
  updateScoreDisplay();
  updateAllShops();
});

// ---------- WINKELS SAMEN VERNIEUWEN ----------

function updateAllShops() {
  updateShop();
  updatePacmanShop();
  updateOvenShop();
}

// ---------- COOKIE CLICK ----------

cookie.addEventListener("click", function() {
  // Totale click-waarde = (basis 1 + oven boost) vermenigvuldigd met pacmanMultiplier
  const totalMultiplier = (1 + ovenMultiplier) * pacmanMultiplier;
  score += Math.ceil(totalMultiplier);

  updateScoreDisplay();
  updateAllShops();

  cookie.classList.remove("clicked");
  void cookie.offsetWidth;
  cookie.classList.add("clicked");
});

// ---------- PASSIVE INCOME ----------

setInterval(function() {
  if (autoclickers > 0) {
    score += autoclickers;
    updateScoreDisplay();
    updateAllShops();
  }
}, 1000);

// ---------- BUY / SELL SELECTOR ----------

modeBuyBtn.addEventListener("click", function() {
  shopMode = "buy";
  modeBuyBtn.classList.add("active");
  modeSellBtn.classList.remove("active");
  updateAllShops();
});

modeSellBtn.addEventListener("click", function() {
  shopMode = "sell";
  modeSellBtn.classList.add("active");
  modeBuyBtn.classList.remove("active");
  updateAllShops();
});

// ---------- BUY QUANTITY SELECTOR ----------

const buyQtyButtons = document.querySelectorAll(".buy-qty");

buyQtyButtons.forEach(function(btn) {
  btn.addEventListener("click", function() {
    buyQtyButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    selectedQty = parseInt(btn.dataset.qty);
    updateAllShops();
  });
});

// ---------- INITIAL SETUP ----------

updateScoreDisplay();
updateAllShops();