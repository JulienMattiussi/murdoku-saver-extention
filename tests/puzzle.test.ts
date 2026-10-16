import { describe, it, expect } from "vitest";
import { getPuzzleId, stateKey } from "../src/puzzle";

describe("getPuzzleId", () => {
  it("extracts the id from a game page URL", () => {
    expect(
      getPuzzleId("https://murdoku.com/play/puzzle-a-messy-situation-hard"),
    ).toBe("puzzle-a-messy-situation-hard");
  });

  it("ignores trailing slashes, query string and hash", () => {
    expect(
      getPuzzleId("https://murdoku.com/play/puzzle-x-easy/?lang=fr#a"),
    ).toBe("puzzle-x-easy");
  });

  it("returns null on the catalog page", () => {
    expect(getPuzzleId("https://murdoku.com/play")).toBeNull();
    expect(getPuzzleId("https://murdoku.com/play/")).toBeNull();
  });

  it("returns null on other sites and invalid URLs", () => {
    expect(getPuzzleId("https://example.com/play/puzzle-x-easy")).toBeNull();
    expect(getPuzzleId("chrome://extensions")).toBeNull();
    expect(getPuzzleId("not a url")).toBeNull();
  });

  it("returns null on nested paths", () => {
    expect(getPuzzleId("https://murdoku.com/play/a/b")).toBeNull();
  });
});

describe("stateKey", () => {
  it("prefixes the puzzle id with the game's state prefix", () => {
    expect(stateKey("puzzle-x-easy")).toBe("mrd_state_puzzle-x-easy");
  });
});
