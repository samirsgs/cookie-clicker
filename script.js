let score = 0;
let autoclickers = 0;
let autoclickerBaseCost = 1;
let selectedQty = 1;
let shopMode = "buy"; // "buy" or "sell"
const refundRate = 0.5; // 50% refund value

let pacmen = 0;
let pacmanBaseCost = 200;
let pacmanMultiplier = 1;
let pacmanAnimationRunning = false;

let ovens = 0;
let ovenBaseCost = 1000;
let ovenMultiplier = 0; // +0.5 multiplier per oven

let unlockedAchievements = [];

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

const fallingContainer = document.getElementById("falling-cookies");
const goldenCookieEl = document.getElementById("golden-cookie");

// ---------- FALLING COOKIES BACKGROUND ----------

const cookieCount = 25;
for (let i = 0; i < cookieCount; i++) {
  const piece = document.createElement("img");
  piece.src = "cookie-icon.png";
  piece.classList.add("falling-cookie");
  piece.style.left = Math.random() * 100 + "vw";
  const duration = 6 + Math.random() * 8;
  piece.style.animationDuration = duration + "s";
  piece.style.animationDelay = Math.random() * duration + "s";
  const size = 20 + Math.random() * 20;
  piece.style.width = size + "px";
  fallingContainer.appendChild(piece);
}

// ---------- SAVE / LOAD ----------

function saveGame() {
  const gameState = {
    score: score,
    autoclickers: autoclickers,
    pacmen: pacmen,
    ovens: ovens,
    unlockedAchievements: unlockedAchievements
  };
  localStorage.setItem("cookieClickerSave", JSON.stringify(gameState));
}

function loadGame() {
  const saved = localStorage.getItem("cookieClickerSave");
  if (!saved) return;

  const gameState = JSON.parse(saved);
  score = gameState.score || 0;
  autoclickers = gameState.autoclickers || 0;
  pacmen = gameState.pacmen || 0;
  ovens = gameState.ovens || 0;
  unlockedAchievements = gameState.unlockedAchievements || [];

  updatePacmanMultiplier();
  updateOvenMultiplier();
  updateScoreDisplay();
  updateAllShops();

  if (pacmen > 0) {
    pacmanRow.style.display = "flex";
    renderPacmanTrail();
  }
}

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
  const trailCount = Math.min(pacmen * 3, 20);
  for (let i = 0; i < trailCount; i++) {
    const dot = document.createElement("img");
    dot.src = "cookie-icon.png";
    dot.classList.add("cookie-dot");
    pacmanTrack.appendChild(dot);
  }

  if (trailCount === 0) {
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
  const dotCount = dots.length;
  if (dotCount === 0 || pacmen === 0) {
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

    const progress = position / trackWidth;

    dots.forEach(function(dot, index) {
      if (eatenSet.has(index)) return;
      const dotThreshold = (index + 1) / dotCount;
      if (progress >= dotThreshold) {
        dot.classList.add("eaten");
        eatenSet.add(index);
      }
    });

    if (position >= trackWidth) {
      clearInterval(moveInterval);
      setTimeout(function() {
        const stillDots = pacmanTrack.querySelectorAll(".cookie-dot");
        if (stillDots.length === 0 || pacmen === 0) {
          pacmanAnimationRunning = false;
          return;
        }
        stillDots.forEach(dot => dot.classList.remove("eaten"));
        runPacmanLoop();
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
  ovenMultiplier = ovens * 0.5;
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

// ---------- UPDATE ALL SHOPS TOGETHER ----------

function updateAllShops() {
  updateShop();
  updatePacmanShop();
  updateOvenShop();
}

// ---------- COOKIE CLICK ----------

cookie.addEventListener("click", function() {
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

// ---------- GOLDEN COOKIE ----------

function spawnGoldenCookie() {
  const panel = document.getElementById("left-panel");
  const maxX = panel.offsetWidth - 60;
  const maxY = panel.offsetHeight - 60;

  goldenCookieEl.style.left = Math.max(0, Math.random() * maxX) + "px";
  goldenCookieEl.style.top = Math.max(0, Math.random() * maxY) + "px";
  goldenCookieEl.style.display = "block";

  const disappearTimeout = setTimeout(function() {
    goldenCookieEl.style.display = "none";
  }, 8000);

  goldenCookieEl.onclick = function() {
    clearTimeout(disappearTimeout);
    goldenCookieEl.style.display = "none";

    const bonus = Math.max(50, Math.floor(score * 0.1));
    score += bonus;
    updateScoreDisplay();
    updateAllShops();
    showToast("Golden Cookie!", "+" + formatNumber(bonus) + " cookies");
  };
}

function scheduleGoldenCookie() {
  const delay = 20000 + Math.random() * 40000;
  setTimeout(function() {
    spawnGoldenCookie();
    scheduleGoldenCookie();
  }, delay);
}

scheduleGoldenCookie();

// ---------- ACHIEVEMENTS ----------

const achievements = [
  { id: "cookies_100", name: "Getting Started", desc: "Bake 100 cookies", check: () => score >= 100 },
  { id: "cookies_1000", name: "Cookie Enthusiast", desc: "Bake 1,000 cookies", check: () => score >= 1000 },
  { id: "cookies_100000", name: "Cookie Empire", desc: "Bake 100,000 cookies", check: () => score >= 100000 },
  { id: "first_autoclicker", name: "Automation", desc: "Buy your first Autoclicker", check: () => autoclickers >= 1 },
  { id: "first_pacman", name: "Waka Waka", desc: "Buy your first Pac-Man", check: () => pacmen >= 1 },
  { id: "ten_autoclickers", name: "Clicker Army", desc: "Own 10 Autoclickers", check: () => autoclickers >= 10 },
  { id: "first_oven", name: "Heating Up", desc: "Buy your first Oven", check: () => ovens >= 1 },
];

function checkAchievements() {
  achievements.forEach(function(ach) {
    if (!unlockedAchievements.includes(ach.id) && ach.check()) {
      unlockedAchievements.push(ach.id);
      showToast("Achievement Unlocked!", ach.name + " — " + ach.desc);
      saveGame();
    }
  });
}

function showToast(title, message) {
  const toast = document.createElement("div");
  toast.classList.add("toast");
  toast.innerHTML = "<strong>" + title + "</strong>" + message;
  document.getElementById("achievement-toast").appendChild(toast);

  setTimeout(function() {
    toast.remove();
  }, 4000);
}

setInterval(checkAchievements, 1000);

// ---------- INITIAL SETUP ----------

loadGame();
updateAllShops();
updateOvenMultiplier();

document.getElementById("save-btn").addEventListener("click", function() {
  saveGame();
  alert("Game saved!");
});

setInterval(saveGame, 10000);
window.addEventListener("beforeunload", saveGame);
