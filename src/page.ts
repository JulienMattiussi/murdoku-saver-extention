// Access to the game's native save. The content script runs in the page's
// isolated world, which shares localStorage with the game.

export function readNativeState(key: string): string | null {
  return localStorage.getItem(key);
}

// The game reads its save only when the puzzle loads, so the page is
// reloaded right after the write.
export function writeNativeStateAndReload(
  key: string,
  value: string,
  reload: () => void = () => location.reload(),
) {
  localStorage.setItem(key, value);
  reload();
}
