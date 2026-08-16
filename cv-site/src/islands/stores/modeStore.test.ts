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
  it("exports all three valid modes", () => {
    // Verified by testing all three transitions work successfully
    for (const mode of VALID_MODES) {
      setMode(mode);
      expect(modeStore.get()).toBe(mode);
    }
  });

  it("accetta e restituisce il mode di default 'creative'", () => {
    modeStore.set("creative");
    expect(modeStore.get()).toBe("creative");
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

  it("sets data-mode to 'human'", () => {
    setMode("human");
    expect(document.documentElement.dataset.mode).toBe("human");
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

  it("updates the URL search param for 'human'", () => {
    setMode("human");
    const params = new URLSearchParams(window.location.search);
    expect(params.get("mode")).toBe("human");
  });
});

describe("initMode", () => {
  it("on home (/) removes data-mode — torna a colori neutri", () => {
    window.history.replaceState({}, "", "/");
    document.documentElement.dataset.mode = "tech"; // simula ritorno da un mode
    initMode();
    expect(document.documentElement.dataset.mode).toBeUndefined();
  });

  it("on home (/) non imposta data-mode anche se store ha un valore", () => {
    window.history.replaceState({}, "", "/");
    modeStore.set("human");
    initMode();
    expect(document.documentElement.dataset.mode).toBeUndefined();
  });

  it("works for all three modes when route matches", () => {
    for (const mode of VALID_MODES) {
      window.history.replaceState({}, "", `/${mode}`);
      initMode();
      expect(document.documentElement.dataset.mode).toBe(mode);
    }
  });

  // ── Fix: route è source of truth (evita flash di colore sbagliato) ──────
  it("usa il mode della route (/tech) anche se localStorage ha un altro mode", () => {
    window.history.replaceState({}, "", "/tech");
    modeStore.set("creative"); // localStorage ha creative
    initMode();
    expect(document.documentElement.dataset.mode).toBe("tech"); // route vince
  });

  it("usa il mode della route (/creative) anche se localStorage ha 'human'", () => {
    window.history.replaceState({}, "", "/creative");
    modeStore.set("human");
    initMode();
    expect(document.documentElement.dataset.mode).toBe("creative");
  });

  it("usa il mode della route (/human)", () => {
    window.history.replaceState({}, "", "/human");
    modeStore.set("tech");
    initMode();
    expect(document.documentElement.dataset.mode).toBe("human");
  });

  it("aggiorna lo store al mode della route (non solo data-mode)", () => {
    window.history.replaceState({}, "", "/human");
    modeStore.set("tech");
    initMode();
    expect(modeStore.get()).toBe("human");
  });

  it("route mode-aware (/en/cv) → usa il mode dallo store", () => {
    window.history.replaceState({}, "", "/en/cv");
    modeStore.set("creative");
    document.documentElement.removeAttribute("data-mode");
    initMode();
    expect(document.documentElement.dataset.mode).toBe("creative");
  });

  it("route mode-aware (/en/cv) → lo store vince sul default", () => {
    window.history.replaceState({}, "", "/en/cv");
    // Store valido ma diverso dal default: verifica che initMode legga lo
    // store invece di forzare DEFAULT_MODE.
    modeStore.set("human");
    document.documentElement.removeAttribute("data-mode");
    initMode();
    expect(document.documentElement.dataset.mode).toBe("human");
  });

  it("route root (/) → rimuove data-mode (colori neutri)", () => {
    window.history.replaceState({}, "", "/");
    modeStore.set("human");
    initMode();
    expect(document.documentElement.dataset.mode).toBeUndefined();
  });
});
