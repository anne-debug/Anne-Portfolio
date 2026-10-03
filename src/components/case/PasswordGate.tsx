"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";

import { RequestPasswordDialog } from "./RequestPasswordDialog";

/**
 * The screen a protected case study shows instead of itself.
 *
 * It is the only thing the server sends a visitor without access, so there is
 * no case study underneath it to reveal — this is a door, not a curtain.
 *
 * Nothing here knows the password. The form posts it to `/api/ibm-access`,
 * which compares it on the server and, if it matches, sets a signed session
 * cookie. `router.refresh()` then re-asks the server for this route, which now
 * renders the case study. That is why there is no success state to design: the
 * page simply becomes the project.
 *
 * It borrows the portfolio's own vocabulary rather than inventing a form
 * style — `ts-heading-3` over `ts-body`, the orange pill the Skip button uses,
 * the grey rule the case study heroes sit on.
 */

export function PasswordGate({
  title,
  blurb,
  /** The portfolio's own address, taken from the About card's Contact button. */
  contactEmail,
  /** True when the server has no password set, so no attempt can succeed. */
  unconfigured = false,
}: {
  title: string;
  blurb: string;
  contactEmail: string;
  unconfigured?: boolean;
}) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [asking, setAsking] = useState(false);
  /* Focus goes back where it came from when the dialog closes. */
  const requestLink = useRef<HTMLButtonElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/ibm-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        /* The cookie is set. Ask the server for this route again and it comes
           back as the case study. */
        router.refresh();
        return;
      }

      setError(
        response.status === 503
          ? "This case study is not accepting passwords right now. Please request access below."
          : "Incorrect password. Please try again.",
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex w-full max-w-[1200px] flex-col items-center px-6 py-[160px] tablet:px-10">
      {/* Narrow on purpose: a password field the width of a case study column
          reads as a search bar. */}
      <div className="flex w-full max-w-[480px] flex-col gap-10">
        <div className="flex w-full flex-col gap-4">
          <h1 className="ts-heading-3 w-full text-left text-grey-200">
            {title}
          </h1>
          <p className="ts-body w-full text-left">{blurb}</p>
        </div>

        <form
          onSubmit={submit}
          className="flex w-full flex-col gap-5"
          noValidate
        >
          <div className="flex w-full flex-col gap-2">
            <label htmlFor="case-password" className="ts-body font-semibold">
              Password
            </label>

            <div className="relative w-full">
              <input
                id="case-password"
                name="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                /* The browser is told what is wrong, not just the eye: the
                   message below is wired to the field both ways. */
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? "case-password-error" : undefined}
                className="ts-body w-full rounded-2xl border border-grey-100 bg-white py-3 pr-20 pl-4 text-dark-charcoal transition outline-none focus-visible:border-orange focus-visible:ring-2 focus-visible:ring-orange/30"
              />

              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                /* Not a second submit: it must never be what Enter triggers. */
                className="ts-body-small absolute top-1/2 right-3 -translate-y-1/2 rounded-full px-2 py-1 text-light-grey transition hover:text-dark-charcoal focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
              >
                {show ? "Hide" : "Show"}
              </button>
            </div>

            {/* Inline, next to the field, and announced. No alert, no modal. */}
            {error ? (
              <p
                id="case-password-error"
                role="alert"
                className="ts-body-small text-orange"
              >
                {error}
              </p>
            ) : null}
          </div>

          {/* Primary. Enter in the field submits this, because it is the
              form's only submit button. */}
          <button
            type="submit"
            disabled={busy || unconfigured}
            className="flex w-full items-center justify-center rounded-full bg-orange px-10 py-3 text-off-white transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
          >
            <span className="ts-button text-off-white">View Case Study</span>
          </button>
        </form>

        {/* Secondary, and deliberately styled as a line of text rather than a
            button, so the two actions never read as a pair. It opens the
            request dialog instead of jumping straight to a mail client: a
            visitor who has no password usually has something to explain. */}
        <div className="flex w-full flex-col gap-1">
          <p className="ts-body-small text-light-grey">
            Don&rsquo;t have the password?
          </p>
          <button
            ref={requestLink}
            type="button"
            onClick={() => setAsking(true)}
            className="ts-body-small inline-flex w-fit items-center gap-1.5 text-dark-charcoal underline underline-offset-4 transition hover:text-orange focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
          >
            Request Password
            <span aria-hidden>&rarr;</span>
          </button>
        </div>
      </div>

      {asking ? (
        <RequestPasswordDialog
          onClose={() => {
            setAsking(false);
            requestLink.current?.focus();
          }}
          contactEmail={contactEmail}
        />
      ) : null}
    </main>
  );
}
