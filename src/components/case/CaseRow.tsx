"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

/**
 * The row a case study is laid out in: the table-of-contents rail, then the
 * article beside it.
 *
 * It exists as its own client component for one reason — the rail can be
 * collapsed, and both halves of the row have to agree about that at the same
 * moment. The rail has to narrow and the gap beside it has to close, or the
 * article gains the rail's width and loses it again to empty space.
 *
 * `SidebarNav` reads the same state through `useRailCollapse`. Context rather
 * than a prop because the rail arrives here as an already-built node, handed
 * down from a server component, and a node cannot be given new props. React
 * still threads context through it, because what the server passed is an
 * element and the client is what renders it.
 *
 * With `collapsible` off — which is every case study but the IBM one — this
 * renders exactly the markup `CaseShell` rendered before it existed, and the
 * hook hands back `enabled: false` so the rail never draws a control.
 */

interface RailCollapse {
  /** Whether this page offers the control at all. */
  enabled: boolean;
  collapsed: boolean;
  toggle: () => void;
}

const Ctx = createContext<RailCollapse>({
  enabled: false,
  collapsed: false,
  toggle: () => {},
});

export const useRailCollapse = () => useContext(Ctx);

export function CaseRow({
  sidebar,
  children,
  collapsible = false,
  bodyWidth,
  bodyGap,
  bodyPad,
  bodyPadTop,
  bodyPadX,
}: {
  sidebar?: ReactNode;
  children: ReactNode;
  collapsible?: boolean;
  bodyWidth: number;
  bodyGap: number;
  bodyPad: number;
  /** Top padding, when the page wants it to differ from `bodyPad`. */
  bodyPadTop?: number;
  bodyPadX: number;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = useCallback(() => setCollapsed((c) => !c), []);
  const value = useMemo(
    () => ({ enabled: collapsible && Boolean(sidebar), collapsed, toggle }),
    [collapsible, sidebar, collapsed, toggle],
  );

  /*
    Only the desktop gap changes, and only when the rail is actually collapsed.
    Below 1200 the rail floats over the page instead of holding a column in it,
    so there is no gap to close and nothing here to do — which is what keeps
    the tablet and phone behaviour exactly as it was.

    `transition-[gap]` rather than animating a width: the gap is the one length
    that has to change, and letting the article follow it keeps the two moving
    as one instead of the rail sliding out and the column catching up.
  */
  const gap =
    value.enabled && collapsed ? "desktop:gap-[20px]" : "desktop:gap-[50px]";

  return (
    <Ctx.Provider value={value}>
      <div
        className={`flex w-full items-start gap-4 px-6 transition-[column-gap] duration-300 ease-out motion-reduce:transition-none tablet:gap-6 tablet:px-[max(24px,var(--body-pad-x))] desktop:justify-center desktop:px-[var(--body-pad-x)] ${gap}`}
        style={
          {
            paddingTop: bodyPadTop ?? bodyPad,
            paddingBottom: bodyPad,
            "--body-pad-x": `${bodyPadX}px`,
          } as CSSProperties
        }
      >
        {sidebar}
        <article
          className="flex w-full min-w-0 flex-col items-start"
          style={{ maxWidth: bodyWidth, gap: bodyGap }}
        >
          {children}
        </article>
      </div>
    </Ctx.Provider>
  );
}
