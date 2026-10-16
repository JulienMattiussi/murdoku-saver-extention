import {
  hasState,
  listStates,
  loadBank,
  removeState,
  saveBank,
  upsertState,
} from "../bank";
import { hasNativeSave, readNativeSave, restoreNativeSave } from "../page";
import type { SavedState } from "../types";
import { createConfirm } from "./confirm";
import type { PanelElements } from "./mount";
import { renderStateList } from "./state-list";

/**
 * Wires the panel's save / replace / restore / delete flows. `getPuzzleId`
 * is read on every action, since the game changes puzzle without reloading
 * the page.
 */
export function createPanelController(
  els: PanelElements,
  getPuzzleId: () => string | null,
) {
  // The confirm box stands in for the list, and no new save can start
  // while a question is pending.
  const confirm = createConfirm(
    {
      box: els.confirmBox,
      text: els.confirmText,
      ok: els.confirmOk,
      cancel: els.confirmCancel,
    },
    (open) => {
      els.list.hidden = open;
      els.save.disabled = open;
    },
  );

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
      onReplace: (entry) => replaceState(puzzleId, entry),
      onDelete: (entry) => deleteState(puzzleId, entry),
    });
  }

  /**
   * Stores the current grid under `name`, after `question` if given.
   * Returns whether it was stored.
   */
  async function storeCurrentGrid(
    puzzleId: string,
    name: string,
    question: string | null,
  ): Promise<boolean> {
    const save = readNativeSave(puzzleId);
    if (!hasNativeSave(save)) {
      showMessage(
        "Aucune sauvegarde native pour ce puzzle : joue au moins un coup (déconnecté) avant de sauver.",
      );
      return false;
    }
    if (question && !(await confirm.ask(question))) return false;

    await saveBank(
      upsertState(await loadBank(), puzzleId, {
        ...save,
        name,
        savedAt: Date.now(),
      }),
    );
    showMessage("");
    await render();
    return true;
  }

  async function saveCurrentState(name: string) {
    const puzzleId = getPuzzleId();
    if (!puzzleId) return;
    const exists = hasState(await loadBank(), puzzleId, name);
    const question = exists ? `Remplacer l'état "${name}" ?` : null;
    if (await storeCurrentGrid(puzzleId, name, question)) els.name.value = "";
  }

  function replaceState(puzzleId: string, entry: SavedState) {
    return storeCurrentGrid(
      puzzleId,
      entry.name,
      `Remplacer "${entry.name}" par la grille actuelle ?`,
    );
  }

  async function restoreState(puzzleId: string, entry: SavedState) {
    const question = `Charger "${entry.name}" ? La grille actuelle sera remplacée (sauve-la avant si besoin).`;
    if (!(await confirm.ask(question))) return;
    restoreNativeSave(puzzleId, {
      state: entry.state,
      progress: entry.progress,
    });
  }

  async function deleteState(puzzleId: string, entry: SavedState) {
    if (!(await confirm.ask(`Supprimer l'état "${entry.name}" ?`))) return;
    await saveBank(removeState(await loadBank(), puzzleId, entry.name));
    await render();
  }

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = els.name.value.trim();
    if (name && !els.save.disabled) saveCurrentState(name);
  });

  /** Refreshes the panel content, called each time it opens. */
  return function refresh() {
    const puzzleId = getPuzzleId();
    showMessage(
      puzzleId && !hasNativeSave(readNativeSave(puzzleId))
        ? "Pas de sauvegarde de ce puzzle dans le localStorage. Si tu es connecté au jeu, la sauvegarde est sur leur serveur et l'extension ne peut pas la lire."
        : "",
    );
    confirm.cancel();
    return render();
  };
}
