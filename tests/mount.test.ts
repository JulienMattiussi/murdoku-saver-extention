import { describe, it, expect, beforeEach } from "vitest";
import { mountPanel } from "../src/panel/mount";

beforeEach(() => {
  document.body.replaceChildren();
});

describe("mountPanel", () => {
  it("adds a host with a shadow root to the parent", () => {
    const els = mountPanel("", "icon.png");
    expect(document.body.contains(els.host)).toBe(true);
    expect(els.host.shadowRoot).not.toBeNull();
  });

  it("keeps the panel out of the page DOM", () => {
    mountPanel("", "icon.png");
    expect(document.querySelector("form, ul, input")).toBeNull();
  });

  it("injects the CSS and the icon into the shadow root", () => {
    const els = mountPanel(".panel { color: red; }", "chrome-extension://x/i");
    const root = els.host.shadowRoot!;
    expect(root.querySelector("style")?.textContent).toBe(
      ".panel { color: red; }",
    );
    expect(els.toggle.querySelector("img")?.src).toBe("chrome-extension://x/i");
  });

  it("returns every element, with the panel closed", () => {
    const els = mountPanel("", "icon.png");
    for (const [key, el] of Object.entries(els)) {
      expect(el, key).toBeInstanceOf(HTMLElement);
    }
    expect(els.panel.hidden).toBe(true);
    expect(els.confirmBox.hidden).toBe(true);
  });
});
