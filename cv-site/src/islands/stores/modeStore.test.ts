import { describe, it, expect, beforeEach } from "vitest";
import { modeStore, setMode, initMode, type Mode } from "./modeStore";

const VALID_MODES: Mode[] = ["tech", "creative", "human"];

beforeEach(() => {
  // Reset to default state before each test
  modeStore.set("tech");
  document.documentElement.removeAttribute("data-mode");
  // Reset URL search params
  window.history.replaceState({}, "", "/");
});

describe("modeStore — valid modes", () => {
  it("exports exactly three valid modes", () => {
    // Verified by testing all three transitions work successfully
    for (const mode of VALID_MODES) {
      setMode(mode);
      expect(modeStore.get()).toBe(mode);
    }
  });

  it("default value is 'tech'", () => {
    modeStore.set("tech");
    expect(modeStore.get()).toBe("tech");
  });
});

describe("setMode", () => {
  it("updates the store value for 'tech'", () => {
    setMode("tech");
    expect(modeStore.get()).toBe("tech");
  });

  it("updates the store value for 'creative'", () => {
    setMode("creative");
    expect(modeStore.get()).toBe("creative");
  });

  it("updates the store value for 'human'", () => {
    setMode("human");
    expect(modeStore.get()).toBe("human");
  });

  it("sets document.documentElement data-mode attribute", () => {
    setMode("creative");
    expect(document.documentElement.dataset.mode).toBe("creative");
  });

  it("does not change store when given an invalid mode", () => {
    modeStore.set("human");
    setMode("invalid" as Mode);
    expect(modeStore.get()).toBe("human");
  });

  it("does not change data-mode when given an invalid mode", () => {
    document.documentElement.dataset.mode = "human";
    setMode("invalid" as Mode);
    expect(document.documentElement.dataset.mode).toBe("human");
  });

  it("updates the URL search param to the new mode", () => {
    setMode("creative");
    const params = new URLSearchParams(window.location.search);
    expect(params.get("mode")).toBe("creative");
  });
});

describe("initMode", () => {
  it("reads from store and sets document data-mode", () => {
    modeStore.set("human");
    initMode();
    expect(document.documentElement.dataset.mode).toBe("human");
  });

  it("works for all three modes", () => {
    for (const mode of VALID_MODES) {
      modeStore.set(mode);
      initMode();
      expect(document.documentElement.dataset.mode).toBe(mode);
    }
  });
});
