const skieurs = [
  { nom: "Luc Moreau", taille: 178, poids: 68 },
  { nom: "Camille Dubois", taille: 165, poids: 55 },
  { nom: "Hugo Martin", taille: 190, poids: 76 },
];

const optionsContainer = document.querySelector("#skieur-options");
const nomValue = document.querySelector("#skieur-nom");
const tailleValue = document.querySelector("#skieur-taille");
const poidsValue = document.querySelector("#skieur-poids");
const startButton = document.querySelector("#start-jump");
const statusMessage = document.querySelector("#status-message");

let skieurSelectionne = null;

const renderOptions = () => {
  optionsContainer.innerHTML = "";

  skieurs.forEach((skieur, index) => {
    const card = document.createElement("button");
    card.type = "button";
    card.className = "skieur-card";
    card.dataset.index = index.toString();
    card.innerHTML = `
      <strong>${skieur.nom}</strong>
      <div>Taille : ${skieur.taille} cm</div>
      <div>Poids : ${skieur.poids} kg</div>
    `;

    card.addEventListener("click", () => selectionnerSkieur(index));

    optionsContainer.appendChild(card);
  });
};

const selectionnerSkieur = (index) => {
  skieurSelectionne = skieurs[index];

  document.querySelectorAll(".skieur-card").forEach((card) => {
    card.classList.toggle(
      "active",
      Number(card.dataset.index) === index
    );
  });

  nomValue.textContent = skieurSelectionne.nom;
  tailleValue.textContent = skieurSelectionne.taille;
  poidsValue.textContent = skieurSelectionne.poids;
  statusMessage.textContent = `${skieurSelectionne.nom} est prêt(e) pour le saut.`;
};

const demarrerSaut = () => {
  if (!skieurSelectionne) {
    statusMessage.textContent =
      "Veuillez sélectionner un skieur avant de démarrer le saut.";
    return;
  }

  statusMessage.textContent = `Le saut de ${skieurSelectionne.nom} commence !`;
};

startButton.addEventListener("click", demarrerSaut);

renderOptions();
