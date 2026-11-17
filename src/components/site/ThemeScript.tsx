"use client";

import { useSyncExternalStore } from "react";

import { THEME_KEY } from "./theme";

const noop = () => () => {};

/**
 * Applies the saved choice, or the system setting when there is none, before first paint, so a reload does not flash
 * light. The script tag only exists in the server's HTML: React warns when a
 * script is created in the browser (it would never run there), so after
 * hydration this renders nothing.
 */
export function ThemeScript() {
  const onServer = useSyncExternalStore(noop, () => false, () => true);
  if (!onServer) return null;
  return (
    <script
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `try{var s=null;try{s=localStorage.getItem("${THEME_KEY}")}catch(e){}if(s==="dark"||(s!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.dataset.theme="dark"}catch(e){}`,
      }}
    />
  );
}
