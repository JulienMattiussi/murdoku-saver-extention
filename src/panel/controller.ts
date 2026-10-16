import {
  hasState,
  listStates,
  loadBank,
  removeState,
  saveBank,
  upsertState,
} from "../bank";
import { readNativeState, writeNativeStateAndReload } from "../page";
import { stateKey } from "../puzzle";
import type { SavedState } from "../types";
import { createConfirm } from "./confirm";
import type { PanelElements } from "./mount";
import { renderStateList } from "./state-list";

/**
 * Wires the panel's save / restore / delete flows. `getPuzzleId` is read on
 * every action, since the game changes puzzle without reloading the page.
 */
export function createPanelController(
  els: PanelElements,
  getPuzzleId: () => string | null,
) {
  const confirm = createConfirm({
    box: els.confirmBox,
    text: els.confirmText,
    ok: els.confirmOk,
    cancel: els.confirmCancel,
  });

  function showMessage(text: string) {
    els.message.textContent = text;
    els.message.hidden = !text;
  }

  async function render() {
    const puzzleId = getPuzzleId();
    if (!puzzleId) return;
    els.puzzle.textContent = puzzleId;
    const states = listStates(await loadBank(), puzzleId);
    els.empty.hidden = states.length > 0;
    renderStateList(els.states, states, {
      onRestore: (entry) => restoreState(puzzleId, entry),
      onDelete: (entry) => deleteState(puzzleId, entry),
    });
  }

  async function saveCurrentState(name: string) {
    const puzzleId = getPuzzleId();
    if (!puzzleId) return;
    const state = readNativeState(stateKey(puzzleId));
    if (state === null) {
      showMessage(
        "Aucune sauvegarde native pour ce puzzle : joue au moins un coup (déconnecté) avant de sauver.",
      );
      return;
    }

    const bank = await loadBank();
    if (
      hasState(bank, puzzleId, name) &&
      !(await confirm(`Remplacer l'état "${name}" ?`))
    ) {
      return;
    }

    await saveBank(
      upsertState(bank, puzzleId, { name, state, savedAt: Date.now() }),
    );
    els.name.value = "";
    showMessage("");
    await render();
  }

  async function restoreState(puzzleId: string, entry: SavedState) {
    const question = `Charger "${entry.name}" ? La grille actuelle sera remplacée (sauve-la avant si besoin).`;
    if (!(await confirm(question))) return;
    writeNativeStateAndReload(stateKey(puzzleId), entry.state);
  }

  async function deleteState(puzzleId: string, entry: SavedState) {
    if (!(await confirm(`Supprimer l'état "${entry.name}" ?`))) return;
    await saveBank(removeState(await loadBank(), puzzleId, entry.name));
    await render();
  }

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = els.name.value.trim();
    if (name) saveCurrentState(name);
  });

  /** Refreshes the panel content, called each time it opens. */
  return function refresh() {
    const puzzleId = getPuzzleId();
    showMessage(
      puzzleId && readNativeState(stateKey(puzzleId)) === null
        ? `Pas de clé ${stateKey(puzzleId)} dans le localStorage. Si tu es connecté au jeu, la sauvegarde est sur leur serveur et l'extension ne peut pas la lire.`
        : "",
    );
    els.confirmBox.hidden = true;
    return render();
  };
}
