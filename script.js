let score = 0;
let autoclickers = 0;
let autoclickerBaseCost = 100;
let selectedQty = 1;
let pacmen = 0;
let pacmanBaseCost = 100;
let pacmanMultiplier = 1;

const cookie = document.getElementById("cookie");
const scoreDisplay = document.getElementById("score");
const buyButton = document.getElementById("buy-autoclicker");
const costDisplay = buyButton.querySelector(".item-cost");

const buyPacmanButton = document.getElementById("buy-pacman");
const pacmanCostDisplay = buyPacmanButton.querySelector(".item-cost");
const pacmanRow = document.getElementById("pacman-row");
const pacmanTrack = document.getElementById("pacman-track");

// ---------- AUTOCLICKER ----------

function getAutoclickerCost(qty) {
  let totalCost = 0;
  for (let i = 0; i < qty; i++) {
    totalCost += Math.ceil(autoclickerBaseCost * Math.pow(1.15, autoclickers + i));
  }
  return totalCost;
}

function updateShop() {
  const cost = getAutoclickerCost(selectedQty);
  costDisplay.textContent = cost;

  if (score >= cost) {
    buyButton.removeAttribute("disabled");
  } else {
    buyButton.setAttribute("disabled", "true");
  }
}

buyButton.addEventListener("click", function() {
  if (buyButton.hasAttribute("disabled")) return;

  const cost = getAutoclickerCost(selectedQty);
  if (score >= cost) {
    score -= cost;
    autoclickers += selectedQty;
    scoreDisplay.textContent = score + " cookies";
    updateShop();
  }
});

// ---------- PAC-MAN ----------

const pacmanEl = document.getElementById("pacman");
let pacmanAnimationRunning = false;

function renderPacmanTrail() {
  pacmanTrack.innerHTML = "";
  const cookieCount = Math.min(pacmen * 3, 20);
  for (let i = 0; i < cookieCount; i++) {
    const dot = document.createElement("span");
    dot.classList.add("cookie-dot");
    dot.textContent = "🍪";
    pacmanTrack.appendChild(dot);
  }

  if (!pacmanAnimationRunning) {
    pacmanAnimationRunning = true;
    runPacmanLoop();
  }
}

function runPacmanLoop() {
  const dots = pacmanTrack.querySelectorAll(".cookie-dot");
  if (dots.length === 0) {
    pacmanAnimationRunning = false;
    return;
  }

  const trackWidth = pacmanTrack.offsetWidth;
  let position = 0;
  const speed = 2; // px per tick, adjust for faster/slower movement
  const eatenSet = new Set();

  pacmanEl.style.left = "0px";

  const moveInterval = setInterval(function() {
    position += speed;
    pacmanEl.style.left = position + "px";

    // check which cookies pacman has now passed
    dots.forEach(function(dot, index) {
      if (eatenSet.has(index)) return;
      const dotLeft = dot.offsetLeft;
      if (position + 60 >= dotLeft) { // 60 = pacman's track offset
        dot.classList.add("eaten");
        eatenSet.add(index);
      }
    });

    // once pacman reaches the end, reset after a short pause
    if (position >= trackWidth) {
      clearInterval(moveInterval);
      setTimeout(function() {
        dots.forEach(dot => dot.classList.remove("eaten"));
        runPacmanLoop(); // restart the loop
      }, 800);
    }
  }, 16); // roughly 60fps
}

// ---------- COOKIE CLICK ----------

cookie.addEventListener("click", function() {
  score += Math.ceil(1 * pacmanMultiplier);
  scoreDisplay.textContent = score + " cookies";
  updateShop();
  updatePacmanShop();

  cookie.classList.remove("clicked");
  void cookie.offsetWidth;
  cookie.classList.add("clicked");
});

// ---------- PASSIVE INCOME (autoclickers) ----------

setInterval(function() {
  if (autoclickers > 0) {
    score += autoclickers;
    scoreDisplay.textContent = score + " cookies";
    updateShop();
    updatePacmanShop();
  }
}, 1000);

// ---------- BUY QUANTITY SELECTOR ----------

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

// ---------- STUDENT CLASS (unrelated) ----------

class student {
    constructor(name, age, Birthday) {
        this.name = name;
        this.age = age;
        this.birthday = Birthday;
    }
    displayInfo() {
        console.log("Name: " + this.name);
        console.log("Age: " + this.age);
        console.log("Birthday: " + this.birthday);
    }
}

const samir = new student("samir", 20, "08/11/2005");
samir.displayInfo();