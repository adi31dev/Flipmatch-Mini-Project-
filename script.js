// ===== DATA =====
const emojis = ["🐶","🐱","🦊","🐼","🐸","🦁","🐵","🐧","🦄","🐙","🐢","🦋"];

// ===== STATE =====
let pairs = 6;
let firstCard = null;
let lock = false;          // stops clicking while 2 cards are being checked
let moves = 0, matchedCount = 0, seconds = 0, timerId = null;

const board = document.getElementById("board");

// ===== SHUFFLE (Fisher-Yates loop) =====
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ===== BEST SCORE (saved per difficulty) =====
function getBest() { return localStorage.getItem("flipBest" + pairs); }
function showBest() { document.getElementById("best").textContent = getBest() || "--"; }

// ===== START / RESET GAME =====
function startGame() {
  clearInterval(timerId); timerId = null;
  firstCard = null; lock = false; moves = 0; matchedCount = 0; seconds = 0;
  document.getElementById("moves").textContent = 0;
  document.getElementById("time").textContent = "0s";
  document.getElementById("winBox").classList.add("hidden");
  showBest();

  // pick N emojis, double them, shuffle
  const chosen = shuffle([...emojis]).slice(0, pairs);
  const deck = shuffle([...chosen, ...chosen]);

  board.innerHTML = "";
  deck.forEach(symbol => {
    const card = document.createElement("div");
    card.className = "card";
    card.dataset.symbol = symbol;
    card.innerHTML = `<div class="inner"><div class="face front">❓</div><div class="face back">${symbol}</div></div>`;
    card.addEventListener("click", () => flip(card));
    board.appendChild(card);
  });
}

// ===== TIMER (starts on first flip) =====
function startTimer() {
  if (timerId) return;
  timerId = setInterval(() => {
    seconds++;
    document.getElementById("time").textContent = seconds + "s";
  }, 1000);
}

// ===== FLIP LOGIC =====
function flip(card) {
  if (lock || card === firstCard || card.classList.contains("matched")) return;
  startTimer();
  card.classList.add("flipped");

  if (!firstCard) { firstCard = card; return; }   // first pick

  // second pick
  moves++;
  document.getElementById("moves").textContent = moves;
  lock = true;

  if (firstCard.dataset.symbol === card.dataset.symbol) {
    firstCard.classList.add("matched");
    card.classList.add("matched");
    matchedCount++;
    firstCard = null; lock = false;
    if (matchedCount === pairs) win();
  } else {
    const a = firstCard, b = card;
    a.classList.add("wrong"); b.classList.add("wrong");
    setTimeout(() => {
      a.classList.remove("flipped", "wrong");
      b.classList.remove("flipped", "wrong");
      firstCard = null; lock = false;
    }, 850);
  }
}

// ===== WIN =====
function win() {
  clearInterval(timerId); timerId = null;
  const best = getBest();
  let msg = `${moves} moves in ${seconds} seconds.`;
  if (!best || moves < Number(best)) {
    localStorage.setItem("flipBest" + pairs, moves);
    msg += " 🏆 New best score!";
  }
  showBest();
  document.getElementById("winText").textContent = msg;
  setTimeout(() => document.getElementById("winBox").classList.remove("hidden"), 600);
}

// ===== BUTTONS =====
document.querySelectorAll(".lvl").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".lvl").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    pairs = Number(btn.dataset.pairs);
    startGame();
  });
});
document.getElementById("restart").addEventListener("click", startGame);
document.getElementById("playAgain").addEventListener("click", startGame);

startGame();
