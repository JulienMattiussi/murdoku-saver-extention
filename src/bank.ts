import type { Bank, SavedState } from "./types";

const BANK_KEY = "bank";

/** States of one puzzle, most recent first. */
export function listStates(bank: Bank, puzzleId: string): SavedState[] {
  return [...(bank[puzzleId] ?? [])].sort((a, b) => b.savedAt - a.savedAt);
}

export function hasState(bank: Bank, puzzleId: string, name: string): boolean {
  return (bank[puzzleId] ?? []).some((entry) => entry.name === name);
}

/** Adds the entry, or replaces the one with the same name. */
export function upsertState(
  bank: Bank,
  puzzleId: string,
  entry: SavedState,
): Bank {
  const others = (bank[puzzleId] ?? []).filter((e) => e.name !== entry.name);
  return { ...bank, [puzzleId]: [...others, entry] };
}

/** Removes a state; drops the puzzle entry once it is empty. */
export function removeState(bank: Bank, puzzleId: string, name: string): Bank {
  const remaining = (bank[puzzleId] ?? []).filter((e) => e.name !== name);
  const { [puzzleId]: _removed, ...rest } = bank;
  return remaining.length > 0 ? { ...rest, [puzzleId]: remaining } : rest;
}

// The bank lives in chrome.storage.local rather than in the page's
// localStorage, so the game's own resets can never wipe it.
export async function loadBank(): Promise<Bank> {
  const stored = await chrome.storage.local.get(BANK_KEY);
  return (stored[BANK_KEY] as Bank | undefined) ?? {};
}

export async function saveBank(bank: Bank): Promise<void> {
  await chrome.storage.local.set({ [BANK_KEY]: bank });
}
