const DEFAULT_CONFIG = {
  rampLength: 500,
  speed: 160,
  idealImpulseTimeMs: 2000,
  maxTimingWindowMs: 700,
  maxBonusDistance: 140,
};

function computeTimingScore(diffMs, maxTimingWindowMs) {
  const clamped = Math.min(Math.abs(diffMs), maxTimingWindowMs);
  return 1 - clamped / maxTimingWindowMs;
}

function timingToBonusDistance(score, maxBonusDistance) {
  const centered = (score - 0.5) * 2;
  return Math.round(centered * maxBonusDistance);
}

function createGame(config = {}) {
  const settings = { ...DEFAULT_CONFIG, ...config };
  const state = {
    etat: "descente",
    startedAt: null,
    spritePosition: 0,
    impulseAt: null,
    timingDiffMs: null,
    bonusDistance: 0,
    totalDistance: settings.rampLength,
  };

  let spriteEl = null;
  let infoEl = null;
  let animationFrame = null;

  function setupDom() {
    if (typeof document === "undefined") return;

    const container = document.createElement("div");
    container.style.cssText =
      "position: relative; width: 600px; height: 160px; border: 2px solid #333; margin: 16px;";

    const ramp = document.createElement("div");
    ramp.style.cssText =
      "position: absolute; left: 20px; top: 80px; width: 520px; height: 8px; background: linear-gradient(90deg, #666, #999); transform: skewX(-10deg);";

    spriteEl = document.createElement("div");
    spriteEl.textContent = "🏂";
    spriteEl.style.cssText =
      "position: absolute; left: 20px; top: 48px; font-size: 28px; transition: transform 0.05s linear;";

    infoEl = document.createElement("div");
    infoEl.style.cssText = "margin: 8px 16px; font-family: sans-serif;";

    container.append(ramp, spriteEl);
    document.body.append(container, infoEl);
  }

  function updateSprite() {
    if (!spriteEl) return;
    spriteEl.style.transform = `translateX(${state.spritePosition}px)`;
  }

  function updateInfo() {
    if (!infoEl) return;
    const timingText =
      state.timingDiffMs === null
        ? "En attente de l'impulsion..."
        : `Timing: ${state.timingDiffMs} ms | Bonus/malus: ${state.bonusDistance} m`;
    infoEl.textContent = `État: ${state.etat} | ${timingText}`;
  }

  function step(timestamp) {
    if (state.startedAt === null) state.startedAt = timestamp;
    const elapsedMs = timestamp - state.startedAt;

    state.spritePosition = Math.min(
      (elapsedMs / 1000) * settings.speed,
      settings.rampLength
    );

    updateSprite();
    updateInfo();

    if (state.spritePosition < settings.rampLength) {
      animationFrame = requestAnimationFrame(step);
    }
  }

  function handleImpulse(timestampMs) {
    if (state.impulseAt !== null) return;
    const elapsedMs = timestampMs - state.startedAt;
    state.impulseAt = elapsedMs;
    state.timingDiffMs = Math.round(elapsedMs - settings.idealImpulseTimeMs);

    const score = computeTimingScore(state.timingDiffMs, settings.maxTimingWindowMs);
    state.bonusDistance = timingToBonusDistance(score, settings.maxBonusDistance);
    state.totalDistance = settings.rampLength + state.bonusDistance;

    updateInfo();
  }

  function onKeydown(event) {
    if (event.code !== "Space") return;
    if (state.startedAt === null) return;
    handleImpulse(performance.now());
  }

  function start() {
    setupDom();
    updateInfo();
    if (typeof window !== "undefined") {
      window.addEventListener("keydown", onKeydown);
      animationFrame = requestAnimationFrame(step);
    }
  }

  function stop() {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    if (typeof window !== "undefined") {
      window.removeEventListener("keydown", onKeydown);
    }
  }

  return {
    state,
    start,
    stop,
    handleImpulse,
    computeTimingScore,
    timingToBonusDistance,
  };
}

const game = createGame();

game.start();

if (typeof module !== "undefined") {
  module.exports = {
    computeTimingScore,
    timingToBonusDistance,
    createGame,
  };
}
