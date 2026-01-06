"""Calcule une distance finale en mètres après réception réussie."""


def calculer_distance(taille_cm: float, poids_kg: float, timing_impulsion: float, constante: float) -> float:
    """
    Formule simple :
    - base dépend de la taille, du poids et d'une constante.
    - bonusTiming vient du timing d'impulsion.
    - penalitePoids dépend du poids.
    """
    base = constante + (taille_cm * 0.05) - (poids_kg * 0.02)
    bonus_timing = timing_impulsion * 0.5
    penalite_poids = poids_kg * 0.1
    return base + bonus_timing - penalite_poids


def afficher_distance_si_reception_reussie(
    taille_cm: float,
    poids_kg: float,
    timing_impulsion: float,
    constante: float,
    reception_reussie: bool,
) -> None:
    if not reception_reussie:
        return
    distance = calculer_distance(taille_cm, poids_kg, timing_impulsion, constante)
    print(f"Distance finale : {distance:.2f} m")


if __name__ == "__main__":
    # Exemple d'utilisation
    afficher_distance_si_reception_reussie(
        taille_cm=180,
        poids_kg=75,
        timing_impulsion=0.8,
        constante=10,
        reception_reussie=True,
    )
