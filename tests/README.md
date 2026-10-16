# Tests

## Vue d'ensemble

| Fichier                   | Environnement | Description                                                                 |
| ------------------------- | ------------- | --------------------------------------------------------------------------- |
| `puzzle.test.ts`          | jsdom         | `getPuzzleId` (URL de puzzle, catalogue, autres sites) + `stateKey`         |
| `bank.test.ts`            | jsdom         | Opérations pures sur la banque + persistance `chrome.storage.local`         |
| `page.test.ts`            | jsdom         | Lecture / écriture de la sauvegarde native, rechargement après écriture     |
| `keyboard-shield.test.ts` | jsdom         | Touches du panneau bloquées pour le jeu, touches du reste de la page libres |
| `mount.test.ts`           | jsdom         | Shadow root, CSS et icône injectés, rien dans le DOM du jeu                 |
| `state-list.test.ts`      | jsdom         | Rendu de la liste des états, clics, échappement du nom                      |
| `confirm.test.ts`         | jsdom         | Confirmation intégrée : affichage, réponses, question en attente            |

## Architecture

Un seul niveau de tests : unitaires, sous jsdom, sans navigateur.

- La logique est isolée dans des fonctions pures (`bank.ts`, `puzzle.ts`) ou des modules qui reçoivent leurs éléments en paramètre (`panel/state-list.ts`, `panel/confirm.ts`, `panel/mount.ts`), testés directement.
- Les API `chrome` sont simulées avec `vi.stubGlobal("chrome", { ... })`, avec un objet en mémoire pour `chrome.storage.local` (voir `bank.test.ts`).
- Les effets impossibles sous jsdom sont passés en paramètre : `writeNativeStateAndReload` reçoit la fonction de rechargement, `installKeyboardShield` la fonction qui donne l'hôte.
- Les listeners posés sur `window` ne se retirent pas : `keyboard-shield.test.ts` installe le bouclier une seule fois (`beforeAll`) et remet les mocks à zéro dans chaque test.
- `content/index.ts` et `panel/controller.ts` ne sont pas testés unitairement : ils câblent les modules testés entre eux, au DOM de la page et à `chrome.runtime`.

### Node

Les tests tournent sous la version de `.nvmrc` (22). Sous Node 25, le `localStorage` natif de Node masque celui de jsdom (`localStorage.clear is not a function`).

### Ce qui se valide à la main

Le placement du bouton par-dessus le jeu, le rechargement et la reprise de l'état par le jeu ne sont pas simulables sans charger l'extension dans un navigateur. À vérifier sur murdoku.com, déconnecté :

1. Le bouton apparaît en haut à droite d'une page de puzzle, pas sur le catalogue
2. Jouer quelques coups, ouvrir le panneau, sauver un état « A » : taper le nom ne place aucune lettre dans la grille
3. Jouer d'autres coups, puis charger « A » : la page se recharge sur la grille de « A »
4. Jouer un coup après le chargement, recharger la page : le coup est conservé (le jeu a bien repris l'état injecté)
5. Passer à un autre puzzle sans recharger : le panneau affiche la liste du nouveau puzzle

## Commandes

```bash
nvm use              # Node 22
npm test             # tous les tests
npm run test:watch   # mode watch
make check           # typecheck + format + tests
```
