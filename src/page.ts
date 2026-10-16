// Access to the game's native save. The content script runs in the page's
// isolated world, which shares localStorage and sessionStorage with the game.
import { progressKey, stateKey } from "./puzzle";
import type { NativeSave } from "./types";

// Survives the reload (sessionStorage is per tab), so the restore can be
// applied again at document_start, before the game reads its save.
const PENDING_RESTORE_KEY = "murdoku-save-bank:pending-restore";

interface PendingRestore {
  puzzleId: string;
  save: NativeSave;
}

export function readNativeSave(puzzleId: string): NativeSave {
  return {
    state: localStorage.getItem(stateKey(puzzleId)),
    progress: localStorage.getItem(progressKey(puzzleId)),
  };
}

export function hasNativeSave(save: NativeSave): boolean {
  return save.state != null || save.progress != null;
}

function writeKey(key: string, value: string | null | undefined) {
  if (value == null) localStorage.removeItem(key);
  else localStorage.setItem(key, value);
}

/**
 * Writes both keys; a missing value removes the key. Removing the progress
 * key of an old snapshot makes the game fall back to the state key.
 */
export function writeNativeSave(puzzleId: string, save: NativeSave) {
  writeKey(stateKey(puzzleId), save.state);
  writeKey(progressKey(puzzleId), save.progress);
}

/**
 * Writes the save, then reloads: the game reads it only when the puzzle
 * loads. The game also writes its progress key on a short debounce, which
 * can fire during the reload, so the restore is kept pending and applied
 * again by `applyPendingRestore` at the start of the next page load.
 */
export function restoreNativeSave(
  puzzleId: string,
  save: NativeSave,
  reload: () => void = () => location.reload(),
) {
  writeNativeSave(puzzleId, save);
  const pending: PendingRestore = { puzzleId, save };
  sessionStorage.setItem(PENDING_RESTORE_KEY, JSON.stringify(pending));
  reload();
}

/** Applies and clears a restore left pending by the previous page. */
export function applyPendingRestore(): boolean {
  const raw = sessionStorage.getItem(PENDING_RESTORE_KEY);
  if (raw === null) return false;
  sessionStorage.removeItem(PENDING_RESTORE_KEY);
  try {
    const { puzzleId, save } = JSON.parse(raw) as PendingRestore;
    writeNativeSave(puzzleId, save);
    return true;
  } catch {
    return false;
  }
}
