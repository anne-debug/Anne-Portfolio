"use client";

import { useSyncExternalStore } from "react";

/**
 * Site-wide light/dark switch. Dark is `data-theme="dark"` on <html>; the
 * colours are in the v2 block at the end of globals.css. Until the visitor
 * pulls the cord the site follows the system setting. A pull is kept in
 * localStorage ("dark" or "light") and wins over the system from then on.
 * ThemeScript applies either one before first paint.
 */
export const THEME_KEY = "site-theme";
const EVENT = "site-theme-change";
const SYSTEM_DARK = "(prefers-color-scheme: dark)";

function saved(): string | null {
  try {
    return window.localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function apply(dark: boolean) {
  const root = document.documentElement;
  if (dark) root.dataset.theme = "dark";
  else delete root.dataset.theme;
}

// kept at module level: a media query nobody holds on to can be collected, and its listener with it
let systemQuery: MediaQueryList | null = null;

function subscribe(cb: () => void) {
  const system = (systemQuery ??= window.matchMedia(SYSTEM_DARK));
  // the system flips while the page is open: follow it unless the visitor has chosen
  const onSystem = () => {
    const choice = saved();
    if (choice !== "dark" && choice !== "light") apply(system.matches);
    cb();
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  system.addEventListener("change", onSystem);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
    system.removeEventListener("change", onSystem);
  };
}

export function useSiteDark() {
  return useSyncExternalStore(
    subscribe,
    () => document.documentElement.dataset.theme === "dark",
    () => false,
  );
}

export function setSiteDark(dark: boolean) {
  apply(dark);
  try {
    window.localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  } catch {
    // private windows can refuse storage; the switch still works for this visit
  }
  window.dispatchEvent(new Event(EVENT));
}
