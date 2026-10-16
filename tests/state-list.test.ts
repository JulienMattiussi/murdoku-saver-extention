import { describe, it, expect, vi } from "vitest";
import { renderStateList } from "../src/panel/state-list";
import type { SavedState } from "../src/types";

const states: SavedState[] = [
  { name: "avant hypothèse", state: "{}", savedAt: 2 },
  { name: "début", state: "{}", savedAt: 1 },
];

describe("renderStateList", () => {
  it("renders one item per state, in the given order", () => {
    const list = document.createElement("ul");
    renderStateList(list, states, { onRestore: vi.fn(), onDelete: vi.fn() });

    const names = [...list.querySelectorAll("strong")].map(
      (el) => el.textContent,
    );
    expect(names).toEqual(["avant hypothèse", "début"]);
  });

  it("replaces the previous content", () => {
    const list = document.createElement("ul");
    const handlers = { onRestore: vi.fn(), onDelete: vi.fn() };
    renderStateList(list, states, handlers);
    renderStateList(list, states.slice(1), handlers);
    expect(list.children).toHaveLength(1);
  });

  it("calls the handlers with the clicked entry", () => {
    const list = document.createElement("ul");
    const onRestore = vi.fn();
    const onDelete = vi.fn();
    renderStateList(list, states, { onRestore, onDelete });

    const [restore, remove] = list.children[1].querySelectorAll("button");
    restore.click();
    remove.click();

    expect(onRestore).toHaveBeenCalledWith(states[1]);
    expect(onDelete).toHaveBeenCalledWith(states[1]);
  });

  it("renders names as text, not HTML", () => {
    const list = document.createElement("ul");
    const unsafe = [{ name: "<b>x</b>", state: "{}", savedAt: 0 }];
    renderStateList(list, unsafe, { onRestore: vi.fn(), onDelete: vi.fn() });
    expect(list.querySelector("b")).toBeNull();
    expect(list.querySelector("strong")?.textContent).toBe("<b>x</b>");
  });
});
