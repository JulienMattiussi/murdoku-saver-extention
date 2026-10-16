/** Raw values of the game's two save keys for one puzzle, kept opaque. */
export interface NativeSave {
  /** `mrd_state_<puzzleId>`: encoded state, the game's fallback. */
  state: string | null;
  /**
   * `mrd_progress_<puzzleId>`: decoded grid, read first by the game.
   * Undefined for states saved before it was captured (up to v0.3.0).
   */
  progress?: string | null;
}

/** One named snapshot of a puzzle's native save. */
export interface SavedState extends NativeSave {
  name: string;
  savedAt: number;
}

/** Every saved state, grouped by puzzle id. */
export type Bank = Record<string, SavedState[]>;
