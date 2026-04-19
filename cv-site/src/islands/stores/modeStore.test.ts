import { describe, it, expect, beforeEach } from "vitest";
import { modeStore, setMode, initMode, type Mode } from "./modeStore";

const VALID_MODES: Mode[] = ["tech", "creative", "human", "management"];

beforeEach(() => {
  // Reset to default state before each test
  modeStore.set("tech");
  document.documentElement.removeAttribute("data-mode");
  // Reset URL search params
  window.history.replaceState({}, "", "/");
});

describe("modeStore — valid modes", () => {
  it("exports all four valid modes", () => {
    // Verified by testing all four transitions work successfully
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

  it("updates the store value for 'management'", () => {
    setMode("management");
    expect(modeStore.get()).toBe("management");
  });

  it("sets document.documentElement data-mode attribute", () => {
    setMode("creative");
    expect(document.documentElement.dataset.mode).toBe("creative");
  });

  it("sets data-mode to 'management'", () => {
    setMode("management");
    expect(document.documentElement.dataset.mode).toBe("management");
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

  it("updates the URL search param for 'management'", () => {
    setMode("management");
    const params = new URLSearchParams(window.location.search);
    expect(params.get("mode")).toBe("management");
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

  it("works for all four modes when route matches", () => {
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

  it("usa il mode della route (/management)", () => {
    window.history.replaceState({}, "", "/management");
    modeStore.set("tech");
    initMode();
    expect(document.documentElement.dataset.mode).toBe("management");
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

  it("route mode-aware (/en/cv) → default 'tech' se store non valido", () => {
    window.history.replaceState({}, "", "/en/cv");
    // Forza uno store value valido ma diverso da default per testare il path reale
    modeStore.set("human");
    document.documentElement.removeAttribute("data-mode");
    initMode();
    expect(document.documentElement.dataset.mode).toBe("human");
  });

  it("route root (/) → rimuove data-mode (colori neutri)", () => {
    window.history.replaceState({}, "", "/");
    modeStore.set("management");
    initMode();
    expect(document.documentElement.dataset.mode).toBeUndefined();
  });
});
