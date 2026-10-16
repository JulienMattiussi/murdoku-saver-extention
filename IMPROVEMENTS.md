# Improvements Roadmap

Pistes d'amélioration identifiées pour Murdoku Save Bank.

---

## À faire / à étudier

### 1. Support des joueurs connectés

Connecté, le jeu stocke la grille dans Firestore (`users/<uid>.puzzleProgress.<puzzleId>.gameState`) et supprime les clés `mrd_state_` locales. Pistes : passer par le SDK Firebase déjà chargé dans la page (injection dans le MAIN world), ou intercepter la lecture de l'état au chargement du puzzle.

**État** : À étudier

### 2. Aperçu d'un état

Afficher pour chaque état le nombre de cases remplies, ou une mini-grille, en décodant le code `s` du format v2. Implique de parser le format du jeu, ce que l'extension évite volontairement pour l'instant.

**État** : À étudier

### 3. Renommer un état

Aujourd'hui il faut le recharger puis le sauver sous un autre nom.

**État** : À faire

### 4. Export / import de la banque

Exporter la banque en JSON pour la sauvegarder ou la passer sur une autre machine.

**État** : À faire si le besoin se présente

### 5. Aperçu du panneau dans le README

Une image `docs/panel-preview.svg`, comme dans web-extractor.

**État** : À faire
