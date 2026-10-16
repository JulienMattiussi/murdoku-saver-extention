import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  hasState,
  listStates,
  loadBank,
  removeState,
  saveBank,
  upsertState,
} from "../src/bank";
import type { Bank, SavedState } from "../src/types";

const entry = (name: string, savedAt: number): SavedState => ({
  name,
  state: `{"v":2,"s":"${name}"}`,
  savedAt,
});

describe("bank operations", () => {
  const bank: Bank = {
    p1: [entry("old", 1), entry("new", 3), entry("mid", 2)],
    p2: [entry("other", 5)],
  };

  it("lists a puzzle's states most recent first", () => {
    expect(listStates(bank, "p1").map((e) => e.name)).toEqual([
      "new",
      "mid",
      "old",
    ]);
    expect(listStates(bank, "unknown")).toEqual([]);
  });

  it("does not mutate the bank when listing", () => {
    listStates(bank, "p1");
    expect(bank.p1[0].name).toBe("old");
  });

  it("tells whether a name is taken for a puzzle", () => {
    expect(hasState(bank, "p1", "mid")).toBe(true);
    expect(hasState(bank, "p2", "mid")).toBe(false);
  });

  it("adds a state to a new puzzle", () => {
    const next = upsertState({}, "p1", entry("a", 1));
    expect(next).toEqual({ p1: [entry("a", 1)] });
  });

  it("replaces a state with the same name", () => {
    const next = upsertState(bank, "p1", entry("mid", 9));
    expect(next.p1).toHaveLength(3);
    expect(next.p1.find((e) => e.name === "mid")?.savedAt).toBe(9);
    expect(bank.p1.find((e) => e.name === "mid")?.savedAt).toBe(2);
  });

  it("removes a state and keeps the other puzzles", () => {
    const next = removeState(bank, "p1", "old");
    expect(next.p1.map((e) => e.name)).toEqual(["new", "mid"]);
    expect(next.p2).toBe(bank.p2);
  });

  it("drops the puzzle once its last state is removed", () => {
    expect(removeState(bank, "p2", "other")).not.toHaveProperty("p2");
  });
});

describe("bank storage", () => {
  const store: Record<string, unknown> = {};

  beforeEach(() => {
    for (const key of Object.keys(store)) delete store[key];
    vi.stubGlobal("chrome", {
      storage: {
        local: {
          get: vi.fn(async (key: string) =>
            key in store ? { [key]: store[key] } : {},
          ),
          set: vi.fn(async (items: Record<string, unknown>) => {
            Object.assign(store, items);
          }),
        },
      },
    });
  });

  it("returns an empty bank when nothing is stored", async () => {
    expect(await loadBank()).toEqual({});
  });

  it("round-trips a bank", async () => {
    const bank: Bank = { p1: [entry("a", 1)] };
    await saveBank(bank);
    expect(await loadBank()).toEqual(bank);
  });
});
