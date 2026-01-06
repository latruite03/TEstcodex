const stateLabel = document.querySelector("#state-label");
const messageLabel = document.querySelector("#message-label");
const indicator = document.querySelector(".indicator");
const indicatorBar = document.querySelector("#indicator-bar");
const impulseButton = document.querySelector("#impulse-button");

const flightDurationMs = 900;
const receptionWindowMs = 1200;

let state = "pret";
let receptionTimeout = null;
let animationFrameId = null;
let receptionStart = null;
let receptionHandled = false;

const setState = (nextState, message) => {
  state = nextState;
  stateLabel.textContent = nextState;
  if (message) {
    messageLabel.textContent = message;
  }
};

const resetIndicator = () => {
  indicator.classList.remove("is-visible");
  indicatorBar.style.width = "100%";
};

const cancelTimers = () => {
  if (receptionTimeout) {
    clearTimeout(receptionTimeout);
    receptionTimeout = null;
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
};

const updateIndicator = () => {
  const elapsed = performance.now() - receptionStart;
  const remainingRatio = Math.max(0, 1 - elapsed / receptionWindowMs);
  indicatorBar.style.width = `${remainingRatio * 100}%`;
  if (remainingRatio > 0) {
    animationFrameId = requestAnimationFrame(updateIndicator);
  }
};

const finishReception = (success) => {
  cancelTimers();
  resetIndicator();
  receptionHandled = true;
  if (success) {
    setState("sol", "Saut validé !");
  } else {
    setState("sol", "Saut raté.");
  }
};

const startReceptionWindow = () => {
  setState("reception", "Réception en cours. Appuyez sur Espace !");
  indicator.classList.add("is-visible");
  receptionStart = performance.now();
  receptionHandled = false;
  updateIndicator();

  receptionTimeout = window.setTimeout(() => {
    if (!receptionHandled) {
      finishReception(false);
    }
  }, receptionWindowMs);
};

const triggerImpulse = () => {
  if (state !== "pret" && state !== "sol") {
    return;
  }
  cancelTimers();
  resetIndicator();
  setState("vol", "Impulsion détectée. En vol...");
  window.setTimeout(() => {
    startReceptionWindow();
  }, flightDurationMs);
};

const attemptReception = () => {
  if (state !== "reception" || receptionHandled) {
    return;
  }
  finishReception(true);
};

document.addEventListener("keydown", (event) => {
  if (event.code !== "Space") {
    return;
  }
  event.preventDefault();
  if (state === "reception") {
    attemptReception();
  } else {
    triggerImpulse();
  }
});

impulseButton.addEventListener("click", () => {
  if (state === "reception") {
    attemptReception();
  } else {
    triggerImpulse();
  }
});
