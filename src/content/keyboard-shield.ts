// The game listens to the keyboard (letters place suspects, Escape closes its
// dialogs). Keys typed in the panel must not reach it. Events coming out of
// a shadow root are retargeted to the host, so the game cannot tell they
// come from an input and would handle them.
//
// The shield is a capture listener on window, installed at document_start:
// it runs before any listener of the page, and stops panel key events there.
// Stopping propagation does not cancel default actions, so typing in the
// input and submitting the form with Enter keep working.

const KEY_EVENTS = ["keydown", "keyup", "keypress"] as const;

export function installKeyboardShield(
  getHost: () => HTMLElement | null,
  onPanelKeydown: (event: KeyboardEvent) => void,
  target: Window = window,
) {
  for (const type of KEY_EVENTS) {
    target.addEventListener(
      type,
      (event) => {
        const host = getHost();
        if (!host || !event.composedPath().includes(host)) return;
        event.stopImmediatePropagation();
        if (type === "keydown") onPanelKeydown(event as KeyboardEvent);
      },
      { capture: true },
    );
  }
}
