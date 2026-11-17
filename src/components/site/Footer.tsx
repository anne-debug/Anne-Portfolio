"use client";

import { InkFooter } from "@/components/v2/InkFooter";

/**
 * The site footer, rendered once by the root layout under every page: the
 * dark ink footer the v2 home page introduced (鈺, page links, LinkedIn and
 * email, the lamp with fireflies). It replaced the Framer "Footer 2" on all
 * pages on 2026-11-16 so the home page and the rest match.
 */
export function Footer() {
  return <InkFooter />;
}
