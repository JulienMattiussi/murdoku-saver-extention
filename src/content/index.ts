import css from "../panel/panel.css";
import { applyPendingRestore } from "../page";
import { createPanelController } from "../panel/controller";
import { mountPanel, type PanelElements } from "../panel/mount";
import { getPuzzleId } from "../puzzle";
import { installKeyboardShield } from "./keyboard-shield";

// Before anything else (document_start): a restore made just before the
// reload is written again, in case the game overwrote it while unloading.
applyPendingRestore();

// The game is a single-page app: the URL changes without a reload when the
// player opens another puzzle, so it is polled.
const URL_POLL_MS = 1000;

const currentPuzzleId = () => getPuzzleId(location.href);

let els: PanelElements | null = null;
let refresh: (() => Promise<void>) | null = null;

function setOpen(open: boolean) {
  if (!els) return;
  els.panel.hidden = !open;
  if (open) {
    refresh?.();
    els.name.focus();
  }
}

function syncWithUrl() {
  if (!els) return;
  const onPuzzle = currentPuzzleId() !== null;
  els.host.hidden = !onPuzzle;
  if (!onPuzzle) setOpen(false);
  else if (!els.panel.hidden) refresh?.();
}

function init() {
  els = mountPanel(css, chrome.runtime.getURL("icons/icon-48.png"));
  refresh = createPanelController(els, currentPuzzleId);

  const { host, toggle, panel } = els;
  toggle.addEventListener("click", () => setOpen(panel.hidden));
  document.addEventListener("pointerdown", (event) => {
    if (!panel.hidden && !event.composedPath().includes(host)) setOpen(false);
  });

  let lastUrl = location.href;
  setInterval(() => {
    if (location.href === lastUrl) return;
    lastUrl = location.href;
    syncWithUrl();
  }, URL_POLL_MS);
  syncWithUrl();
}

// Installed right away (document_start) so it runs before the game's own
// keyboard listeners.
installKeyboardShield(
  () => els?.host ?? null,
  (event) => {
    if (event.key === "Escape") setOpen(false);
  },
);

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
