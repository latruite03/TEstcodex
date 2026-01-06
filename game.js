const distanceValue = document.getElementById("distance-value");
const receptionStatus = document.getElementById("reception-status");
const timingValue = document.getElementById("timing-value");
const statusMessage = document.getElementById("status-message");
const startButton = document.querySelector(".start-button");
const restartButton = document.querySelector(".restart-button");

const resetStats = () => {
  distanceValue.textContent = "0 m";
  receptionStatus.textContent = "En attente";
  timingValue.textContent = "—";
  statusMessage.textContent = "Prêt à jouer.";
};

const launchPlay = () => {
  const distance = Math.floor(Math.random() * 80) + 20;
  const isSuccess = Math.random() > 0.35;
  const timing = `${(Math.random() * 1.2 + 0.3).toFixed(2)} s`;

  distanceValue.textContent = `${distance} m`;
  receptionStatus.textContent = isSuccess ? "Réception réussie" : "Réception ratée";
  timingValue.textContent = timing;
  statusMessage.textContent = isSuccess ? "Bonne impulsion !" : "Réception ratée !";
};

startButton.addEventListener("click", launchPlay);
restartButton.addEventListener("click", resetStats);

resetStats();
