// When signed out, the game keeps the current grid of each puzzle in
// localStorage under `mrd_state_<puzzleId>`, where puzzleId is the URL path
// after `/play/` (e.g. `puzzle-a-messy-situation-hard`).
export const STATE_PREFIX = "mrd_state_";

const GAME_HOST = "murdoku.com";

/** Returns the puzzle id of a game page URL, or null for any other page. */
export function getPuzzleId(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.hostname !== GAME_HOST) return null;
  const match = parsed.pathname.match(/^\/play\/([^/]+)\/*$/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function stateKey(puzzleId: string): string {
  return STATE_PREFIX + puzzleId;
}
