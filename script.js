let score = 0;

const cookie = document.getElementById("cookie");
const scoreDisplay = document.getElementById("score");

cookie.addEventListener("click", function() {
  score++;
  scoreDisplay.textContent = score + " cookies";

  // trigger animation
  cookie.classList.remove("clicked");
  void cookie.offsetWidth; // forces a reflow so the animation can replay
  cookie.classList.add("clicked");
});