import { describe, it, expect, beforeEach } from "vitest";
import { createConfirm, type ConfirmElements } from "../src/panel/confirm";

let elements: ConfirmElements;
let ask: (question: string) => Promise<boolean>;

beforeEach(() => {
  elements = {
    box: document.createElement("div"),
    text: document.createElement("p"),
    ok: document.createElement("button"),
    cancel: document.createElement("button"),
  };
  elements.box.hidden = true;
  ask = createConfirm(elements);
});

describe("createConfirm", () => {
  it("shows the question in the box", () => {
    ask("Supprimer ?");
    expect(elements.box.hidden).toBe(false);
    expect(elements.text.textContent).toBe("Supprimer ?");
  });

  it("resolves true on ok and hides the box", async () => {
    const answer = ask("Supprimer ?");
    elements.ok.click();
    expect(await answer).toBe(true);
    expect(elements.box.hidden).toBe(true);
  });

  it("resolves false on cancel", async () => {
    const answer = ask("Supprimer ?");
    elements.cancel.click();
    expect(await answer).toBe(false);
  });

  it("answers false to a pending question when asked again", async () => {
    const first = ask("Premier ?");
    const second = ask("Second ?");
    expect(await first).toBe(false);
    expect(elements.text.textContent).toBe("Second ?");
    elements.ok.click();
    expect(await second).toBe(true);
  });
});
