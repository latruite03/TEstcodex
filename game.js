const distanceValue = document.getElementById("distance-value");
const receptionStatus = document.getElementById("reception-status");
const timingValue = document.getElementById("timing-value");
const statusMessage = document.getElementById("status-message");
const startButton = document.querySelector(".start-button");
const restartButton = document.querySelector(".restart-button");
const skierValue = document.getElementById("skier-value");
const skierList = document.getElementById("skier-list");
const overlay = document.getElementById("game-overlay");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const skiers = [
  { id: "sprinteur", nom: "Sprinteur", taille: 168, poids: 56 },
  { id: "equilibre", nom: "Équilibré", taille: 176, poids: 64 },
  { id: "puissant", nom: "Puissant", taille: 184, poids: 72 },
  { id: "leger", nom: "Léger", taille: 172, poids: 58 },
];

const state = {
  selectedSkier: null,
  phase: "idle",
  startedAt: 0,
  jumpPressedAt: null,
  landPressedAt: null,
  jumpTimingError: null,
  landTimingError: null,
  distance: 0,
  animationFrame: null,
};

const phaseDurations = {
  slide: 2600,
  flight: 1800,
  landingWindow: 700,
};

const setOverlay = (text) => {
  overlay.textContent = text;
  overlay.style.display = text ? "flex" : "none";
};

const resetStats = () => {
  distanceValue.textContent = "0 m";
  receptionStatus.textContent = "En attente";
  timingValue.textContent = "—";
  statusMessage.textContent = "Prêt à jouer.";
  skierValue.textContent = state.selectedSkier
    ? `${state.selectedSkier.nom} (${state.selectedSkier.taille} cm / ${state.selectedSkier.poids} kg)`
    : "—";
  setOverlay("Appuie sur “Démarrer”");
};

const calculateBaseDistance = (skier) => {
  const heightBonus = (skier.taille - 170) * 0.45;
  const weightPenalty = (skier.poids - 60) * 0.35;
  return 58 + heightBonus - weightPenalty;
};

const calculateDistance = () => {
  if (!state.selectedSkier) return 0;

  const base = calculateBaseDistance(state.selectedSkier);
  const jumpTimingPenalty = Math.min(18, (state.jumpTimingError / 100) * 0.9);
  const jumpBonus = Math.max(0, 18 - jumpTimingPenalty);
  const raw = base + jumpBonus;
  return Math.max(25, Math.round(raw));
};

const renderSkierList = () => {
  skierList.innerHTML = "";
  skiers.forEach((skier) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "skier-card";
    card.dataset.id = skier.id;
    card.innerHTML = `
      <h3>${skier.nom}</h3>
      <p>${skier.taille} cm • ${skier.poids} kg</p>
    `;
    card.addEventListener("click", () => selectSkier(skier.id));
    skierList.appendChild(card);
  });
};

const selectSkier = (id) => {
  state.selectedSkier = skiers.find((skier) => skier.id === id);
  document.querySelectorAll(".skier-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.id === id);
  });
  resetStats();
  statusMessage.textContent = "Skieur sélectionné. Démarre quand tu es prêt.";
};

const resetGameState = () => {
  state.phase = "idle";
  state.startedAt = 0;
  state.jumpPressedAt = null;
  state.landPressedAt = null;
  state.jumpTimingError = null;
  state.landTimingError = null;
  state.distance = 0;
  if (state.animationFrame) {
    cancelAnimationFrame(state.animationFrame);
  }
  state.animationFrame = null;
  resetStats();
  drawScene(0);
};

const startGame = () => {
  if (!state.selectedSkier) {
    statusMessage.textContent = "Choisis un skieur avant de démarrer.";
    setOverlay("Sélectionne un skieur");
    return;
  }

  state.phase = "slide";
  state.startedAt = performance.now();
  state.jumpPressedAt = null;
  state.landPressedAt = null;
  state.jumpTimingError = null;
  state.landTimingError = null;
  statusMessage.textContent = "Descente... prépare ton impulsion !";
  setOverlay("Impulsion : barre espace au sommet");
  animate();
};

const finishGame = () => {
  const receptionOk = state.landTimingError !== null && state.landTimingError <= 250;
  receptionStatus.textContent = receptionOk ? "Réception réussie" : "Réception ratée";
  state.distance = receptionOk ? calculateDistance() : 0;
  distanceValue.textContent = `${state.distance} m`;

  if (state.jumpTimingError !== null) {
    timingValue.textContent = `${(state.jumpTimingError / 1000).toFixed(2)} s`;
  }

  statusMessage.textContent = receptionOk
    ? "Saut validé !"
    : "Réception ratée : saut non validé.";
  setOverlay("Recommence quand tu veux");
  state.phase = "result";
};

const registerKeyPress = (event) => {
  if (event.code !== "Space") return;
  if (state.phase === "slide" && state.jumpPressedAt === null) {
    const now = performance.now();
    state.jumpPressedAt = now;
    const ideal = state.startedAt + phaseDurations.slide;
    state.jumpTimingError = Math.abs(now - ideal);
    statusMessage.textContent = "Impulsion enregistrée ! Prépare la réception.";
    setOverlay("Réception : barre espace à l'atterrissage");
  } else if (state.phase === "landing" && state.landPressedAt === null) {
    const now = performance.now();
    state.landPressedAt = now;
    const idealLanding =
      state.startedAt + phaseDurations.slide + phaseDurations.flight;
    state.landTimingError = Math.abs(now - idealLanding);
  }
};

const drawScene = (progress) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#f1f5f9";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#94a3b8";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(40, 80);
  ctx.lineTo(260, 200);
  ctx.lineTo(360, 220);
  ctx.lineTo(720, 280);
  ctx.stroke();

  const skierPosition = getSkierPosition(progress);
  ctx.fillStyle = "#1d4ed8";
  ctx.beginPath();
  ctx.arc(skierPosition.x, skierPosition.y, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.font = "12px sans-serif";
  ctx.fillText(skierPosition.label, 20, 24);
};

const getSkierPosition = (progress) => {
  if (state.phase === "idle" || state.phase === "result") {
    return { x: 60, y: 80, label: "En attente" };
  }

  if (state.phase === "slide") {
    const t = Math.min(progress, 1);
    const x = 60 + (260 - 60) * t;
    const y = 80 + (200 - 80) * t;
    return { x, y, label: "Descente" };
  }

  if (state.phase === "flight") {
    const t = Math.min(progress, 1);
    const x = 260 + (460 * t);
    const y = 200 - 80 * Math.sin(Math.PI * t) + 20 * t;
    return { x, y, label: "Vol" };
  }

  if (state.phase === "landing") {
    const t = Math.min(progress, 1);
    const x = 600 + 120 * t;
    const y = 240 + 40 * t;
    return { x, y, label: "Réception" };
  }

  return { x: 60, y: 80, label: "En attente" };
};

const animate = () => {
  const now = performance.now();
  const elapsed = now - state.startedAt;

  if (state.phase === "slide") {
    const progress = elapsed / phaseDurations.slide;
    drawScene(progress);

    if (elapsed >= phaseDurations.slide) {
      state.phase = "flight";
      statusMessage.textContent = "En vol... prépare la réception !";
    }
  } else if (state.phase === "flight") {
    const flightElapsed = elapsed - phaseDurations.slide;
    const progress = flightElapsed / phaseDurations.flight;
    drawScene(progress);

    if (flightElapsed >= phaseDurations.flight) {
      state.phase = "landing";
      statusMessage.textContent = "Réception imminente !";
    }
  } else if (state.phase === "landing") {
    const landingElapsed = elapsed - phaseDurations.slide - phaseDurations.flight;
    const progress = landingElapsed / phaseDurations.landingWindow;
    drawScene(progress);

    if (landingElapsed >= phaseDurations.landingWindow) {
      finishGame();
      return;
    }
  }

  state.animationFrame = requestAnimationFrame(animate);
};

startButton.addEventListener("click", startGame);
restartButton.addEventListener("click", resetGameState);
window.addEventListener("keydown", registerKeyPress);

renderSkierList();
resetGameState();
