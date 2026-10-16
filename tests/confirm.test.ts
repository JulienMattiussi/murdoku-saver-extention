import { describe, it, expect, beforeEach, vi } from "vitest";
import { createConfirm, type ConfirmElements } from "../src/panel/confirm";

let elements: ConfirmElements;
let confirm: ReturnType<typeof createConfirm>;
let onOpenChange: ReturnType<typeof vi.fn<(open: boolean) => void>>;

beforeEach(() => {
  elements = {
    box: document.createElement("div"),
    text: document.createElement("p"),
    ok: document.createElement("button"),
    cancel: document.createElement("button"),
  };
  elements.box.hidden = true;
  onOpenChange = vi.fn<(open: boolean) => void>();
  confirm = createConfirm(elements, onOpenChange);
});

describe("createConfirm", () => {
  it("shows the question in the box", () => {
    confirm.ask("Supprimer ?");
    expect(elements.box.hidden).toBe(false);
    expect(elements.text.textContent).toBe("Supprimer ?");
  });

  it("resolves true on ok and hides the box", async () => {
    const answer = confirm.ask("Supprimer ?");
    elements.ok.click();
    expect(await answer).toBe(true);
    expect(elements.box.hidden).toBe(true);
  });

  it("resolves false on cancel", async () => {
    const answer = confirm.ask("Supprimer ?");
    elements.cancel.click();
    expect(await answer).toBe(false);
  });

  it("answers false to a pending question when asked again", async () => {
    const first = confirm.ask("Premier ?");
    const second = confirm.ask("Second ?");
    expect(await first).toBe(false);
    expect(elements.text.textContent).toBe("Second ?");
    elements.ok.click();
    expect(await second).toBe(true);
  });

  it("answers false and hides the box on cancel()", async () => {
    const answer = confirm.ask("Supprimer ?");
    confirm.cancel();
    expect(await answer).toBe(false);
    expect(elements.box.hidden).toBe(true);
  });

  it("reports when the box opens and closes", () => {
    confirm.ask("Supprimer ?");
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    elements.ok.click();
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("does not report a close when nothing is pending", () => {
    confirm.cancel();
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
