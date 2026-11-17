"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

/** Framer component "Logo": the handwritten wordmark in Mansalva. */
function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      className="flex h-20 w-[136px] flex-col items-center justify-center p-6 text-center text-orange"
      style={{
        fontFamily: "var(--font-mansalva)",
        fontSize: "24px",
        lineHeight: "110%",
      }}
    >
      Anne Lin
    </Link>
  );
}

/** Framer component "Footer 2", supplied by the Main layout template. */
export function Footer() {
  // the home page (v2) ends on its own dark ink footer
  const path = usePathname();
  if (path === "/" || path?.startsWith("/v2-preview")) return null;
  return (
    <footer className="flex w-full flex-col items-center justify-center p-2">
      <Logo />
      <div className="flex w-full items-center justify-center gap-1">
        <p
          className="text-light-grey"
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "16px",
            letterSpacing: "-0.1px",
            lineHeight: "1.3em",
          }}
        >
          ©
        </p>
        <p
          className="text-light-grey"
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: "16px",
            lineHeight: "1.3em",
          }}
        >
          {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
