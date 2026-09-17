let score = 0;

const cookie = document.getElementById("cookie");
const scoreDisplay = document.getElementById("score");

const buyButton = document.getElementById("buy-autoclicker");
const autoclickerCost = 100;
let autoclickers = 0;
const fallingContainer = document.getElementById("falling-cookies");
const cookieCount = 160;

for (let i = 0; i < cookieCount; i++) {
  const piece = document.createElement("div");
  piece.classList.add("falling-cookie");
  piece.textContent = "🍪";

  // random horizontal position
  piece.style.left = Math.random() * 100 + "vw";

  // random fall speed (between 6s and 14s)
  const duration = 10 + Math.random() * 14;
  piece.style.animationDuration = duration + "s";

  // random delay so they don't all start at once
  piece.style.animationDelay = Math.random() * duration + "s";

  // random size for variety
  const size = 20 + Math.random() * 20;
  piece.style.fontSize = size + "px";

  fallingContainer.appendChild(piece);
}

cookie.addEventListener("click", function() {
  score++;
  scoreDisplay.textContent = score + " cookies";
  updateShop();

  // trigger animation
  cookie.classList.remove("clicked");
  void cookie.offsetWidth; // forces a reflow so the animation can replay
  cookie.classList.add("clicked");
});

function updateShop() {
  if (score >= autoclickerCost) {
    buyButton.removeAttribute("disabled");
  } else {
    buyButton.setAttribute("disabled", "true");
  }
}

buyButton.addEventListener("click", function() {
  if (score >= autoclickerCost) {
    score -= autoclickerCost;
    autoclickers++;
    scoreDisplay.textContent = score + " cookies";
    updateShop();
  }
});

setInterval(function() {
  if (autoclickers > 0) {
    score += autoclickers;
    scoreDisplay.textContent = score + " cookies";
  }
}, 1000);

// Creating a class
class student {
    constructor(name, age , Birthday) {
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

const samir = new student("samir",20,"08/11/2005");
samir.displayInfo();