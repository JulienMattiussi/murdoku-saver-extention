import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  applyPendingRestore,
  hasNativeSave,
  readNativeSave,
  restoreNativeSave,
  writeNativeSave,
} from "../src/page";

const STATE = "mrd_state_p1";
const PROGRESS = "mrd_progress_p1";

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

describe("readNativeSave", () => {
  it("returns the raw values of both keys", () => {
    localStorage.setItem(STATE, '{"v":2,"s":"A-"}');
    localStorage.setItem(PROGRESS, '{"placed":["char_1"]}');
    expect(readNativeSave("p1")).toEqual({
      state: '{"v":2,"s":"A-"}',
      progress: '{"placed":["char_1"]}',
    });
  });

  it("returns null for missing keys", () => {
    expect(readNativeSave("p1")).toEqual({ state: null, progress: null });
  });
});

describe("hasNativeSave", () => {
  it("is true as soon as one key is set", () => {
    expect(hasNativeSave({ state: "s", progress: null })).toBe(true);
    expect(hasNativeSave({ state: null, progress: "p" })).toBe(true);
    expect(hasNativeSave({ state: null, progress: null })).toBe(false);
  });
});

describe("writeNativeSave", () => {
  it("writes both keys", () => {
    writeNativeSave("p1", { state: "s", progress: "p" });
    expect(localStorage.getItem(STATE)).toBe("s");
    expect(localStorage.getItem(PROGRESS)).toBe("p");
  });

  // A character placed after the snapshot lives in the progress key, which
  // the game reads first: it must not survive the restore.
  it("removes the progress key when the snapshot has none", () => {
    localStorage.setItem(PROGRESS, '{"placed":["char_1"]}');
    writeNativeSave("p1", { state: "s" });
    expect(localStorage.getItem(PROGRESS)).toBeNull();
    expect(localStorage.getItem(STATE)).toBe("s");
  });
});

describe("restoreNativeSave", () => {
  it("writes the save, then reloads", () => {
    const reload = vi.fn(() => {
      expect(localStorage.getItem(STATE)).toBe("saved");
      expect(localStorage.getItem(PROGRESS)).toBe("saved-progress");
    });
    localStorage.setItem(STATE, "current");
    localStorage.setItem(PROGRESS, "current-progress");
    restoreNativeSave(
      "p1",
      { state: "saved", progress: "saved-progress" },
      reload,
    );
    expect(reload).toHaveBeenCalledOnce();
  });
});

describe("applyPendingRestore", () => {
  it("writes the save again when the game overwrote it during the reload", () => {
    restoreNativeSave(
      "p1",
      { state: "saved", progress: "saved-progress" },
      () => {},
    );
    localStorage.setItem(PROGRESS, "written-by-the-game-on-unload");

    expect(applyPendingRestore()).toBe(true);
    expect(localStorage.getItem(PROGRESS)).toBe("saved-progress");
    expect(localStorage.getItem(STATE)).toBe("saved");
  });

  it("applies only once", () => {
    restoreNativeSave("p1", { state: "saved", progress: null }, () => {});
    applyPendingRestore();
    localStorage.setItem(STATE, "new move");
    expect(applyPendingRestore()).toBe(false);
    expect(localStorage.getItem(STATE)).toBe("new move");
  });

  it("does nothing without a pending restore", () => {
    localStorage.setItem(STATE, "current");
    expect(applyPendingRestore()).toBe(false);
    expect(localStorage.getItem(STATE)).toBe("current");
  });
});
