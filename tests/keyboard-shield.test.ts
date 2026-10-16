import { describe, it, expect, beforeAll, vi } from "vitest";
import { installKeyboardShield } from "../src/content/keyboard-shield";

// Installed once for the whole file: window listeners cannot be removed.
const host = document.createElement("div");
const input = document.createElement("input");
const onPanelKeydown = vi.fn();
const gameListener = vi.fn();

beforeAll(() => {
  host.attachShadow({ mode: "open" }).append(input);
  document.body.append(host);
  installKeyboardShield(() => host, onPanelKeydown);
  // Registered after the shield, like the game's listeners
  window.addEventListener("keydown", gameListener, { capture: true });
  document.addEventListener("keydown", gameListener);
});

const press = (target: EventTarget, key: string) =>
  target.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, composed: true }),
  );

describe("installKeyboardShield", () => {
  it("keeps panel keys away from the game", () => {
    gameListener.mockClear();
    press(input, "a");
    expect(gameListener).not.toHaveBeenCalled();
  });

  it("hands panel keydowns to the panel", () => {
    onPanelKeydown.mockClear();
    press(input, "Escape");
    expect(onPanelKeydown).toHaveBeenCalledWith(
      expect.objectContaining({ key: "Escape" }),
    );
  });

  it("lets keys from the rest of the page through", () => {
    gameListener.mockClear();
    onPanelKeydown.mockClear();
    press(document.body, "a");
    expect(gameListener).toHaveBeenCalledTimes(2);
    expect(onPanelKeydown).not.toHaveBeenCalled();
  });
});
