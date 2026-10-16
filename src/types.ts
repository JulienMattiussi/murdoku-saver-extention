/** One named snapshot of a puzzle's native save. */
export interface SavedState {
  name: string;
  /** Raw `localStorage` value of `mrd_state_<puzzleId>`, kept opaque. */
  state: string;
  savedAt: number;
}

/** Every saved state, grouped by puzzle id. */
export type Bank = Record<string, SavedState[]>;
