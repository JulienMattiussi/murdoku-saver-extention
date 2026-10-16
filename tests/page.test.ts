import { describe, it, expect, beforeEach, vi } from "vitest";
import { readNativeState, writeNativeStateAndReload } from "../src/page";

beforeEach(() => localStorage.clear());

describe("readNativeState", () => {
  it("returns the raw value of the key", () => {
    localStorage.setItem("mrd_state_p1", '{"v":2,"s":"A-"}');
    expect(readNativeState("mrd_state_p1")).toBe('{"v":2,"s":"A-"}');
  });

  it("returns null when the key is missing", () => {
    expect(readNativeState("mrd_state_p1")).toBeNull();
  });
});

describe("writeNativeStateAndReload", () => {
  it("writes the value, then reloads", () => {
    const reload = vi.fn(() => {
      expect(localStorage.getItem("mrd_state_p1")).toBe("saved");
    });
    localStorage.setItem("mrd_state_p1", "current");
    writeNativeStateAndReload("mrd_state_p1", "saved", reload);
    expect(reload).toHaveBeenCalledOnce();
  });
});
