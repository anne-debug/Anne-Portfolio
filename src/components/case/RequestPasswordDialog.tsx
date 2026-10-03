"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { createPortal } from "react-dom";

/**
 * The dialog behind "Request Password" on a protected case study.
 *
 * It posts to `/api/password-request`, which sends the message on from the
 * server. If no mail provider is configured there the dialog does not pretend:
 * it opens the visitor's own mail client with the whole message already
 * written, and says so. Either way the request reaches an inbox — the one thing
 * a form like this must never do is take a message and lose it.
 *
 * Portalled to the body, like `SidebarNav`, so it is not sorted against the
 * page's own stacking. Escape closes it, the backdrop closes it, focus moves to
 * the first field on open and returns to the link that opened it on close, and
 * Tab is kept inside while it is open.
 */

/**
 * Written for someone who has landed here without the password.
 *
 * Short, and in a voice rather than a policy. The first draft explained the
 * arrangement in three sentences, which is a notice, not an invitation — and a
 * placeholder that long fills the box and gets read as content.
 */
const PLACEHOLDER =
  "It's an NDA project, so say hello first — who you are, and what brings you here.";

const SUBJECT = "Password Request — IBM watsonx Builder Control Plane";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "mail"; href: string }
  | { kind: "error"; message: string };

/* Mounted only while it is open, which is what keeps the fields and the status
   fresh on each visit without an effect resetting them. */
export function RequestPasswordDialog({
  onClose,
  contactEmail,
}: {
  onClose: () => void;
  contactEmail: string;
}) {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const panel = useRef<HTMLDivElement>(null);
  const firstField = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  /** Everything the message would say, for the mail-client fallback. */
  const mailHref = useCallback(() => {
    const body = [
      `${name || "Someone"} <${email}> asked to see the IBM case study.`,
      "",
      message,
    ].join("\n");
    return `mailto:${contactEmail}?subject=${encodeURIComponent(SUBJECT)}&body=${encodeURIComponent(body)}`;
  }, [name, email, message, contactEmail]);

  /* Escape, and keeping Tab inside the panel while it is open. */
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel.current) return;

      const focusable = panel.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([type="hidden"]), textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* The page behind must not scroll while the dialog is over it. */
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    firstField.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status.kind === "sending") return;
    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/password-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, company }),
      });

      if (response.ok) {
        setStatus({ kind: "sent" });
        return;
      }
      if (response.status === 400) {
        setStatus({
          kind: "error",
          message: "Please fill in your name, a valid email and a message.",
        });
        return;
      }
      /* 503 unconfigured, or 502 the provider refused: hand the message to the
         visitor's own mail client rather than losing it. */
      setStatus({ kind: "mail", href: mailHref() });
    } catch {
      setStatus({ kind: "mail", href: mailHref() });
    }
  }

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto overscroll-contain p-5 tablet:items-center tablet:p-8"
      role="presentation"
      /* Anything outside the panel dismisses: the tinted backdrop is its own
         element and sits over this one, so comparing target to currentTarget
         only ever caught the strip of padding around it. */
      onMouseDown={(event) => {
        if (panel.current && !panel.current.contains(event.target as Node)) {
          onClose();
        }
      }}
    >
      <div className="fixed inset-0 bg-dark-charcoal/35 backdrop-blur-[2px]" />

      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
        className="relative my-auto flex w-full max-w-[520px] flex-col gap-6 rounded-[24px] bg-off-white p-6 shadow-xl tablet:p-8"
      >
        <div className="flex w-full items-start justify-between gap-4">
          <h2
            id="request-title"
            className="ts-heading-5 text-left text-grey-200"
          >
            Request access
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-2 shrink-0 rounded-full p-2 text-light-grey transition hover:text-dark-charcoal focus-visible:ring-2 focus-visible:ring-orange focus-visible:outline-none"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden
            >
              <path
                d="M4 4l10 10M14 4L4 14"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {status.kind === "sent" ? (
          <div className="flex w-full flex-col gap-5">
            <p className="ts-body text-left">
              Thanks — your request is on its way. I&rsquo;ll get back to you at{" "}
              <span className="font-semibold">{email}</span>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-full bg-orange px-10 py-3 text-off-white transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span className="ts-button text-off-white">Close</span>
            </button>
          </div>
        ) : status.kind === "mail" ? (
          <div className="flex w-full flex-col gap-5">
            <p className="ts-body text-left">
              Your message is ready to send from your own mail app — it is
              already written and addressed.
            </p>
            <a
              href={status.href}
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-full bg-orange px-10 py-3 text-off-white transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span className="ts-button text-off-white">Open mail app</span>
            </a>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="flex w-full flex-col gap-5"
            noValidate
          >
            <Field label="Name" htmlFor="request-name">
              <input
                ref={firstField}
                id="request-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className={INPUT}
              />
            </Field>

            <Field label="Your email" htmlFor="request-email">
              <input
                id="request-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className={INPUT}
              />
            </Field>

            <Field label="Message" htmlFor="request-message">
              <textarea
                id="request-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder={PLACEHOLDER}
                /* Lighter and a size down, so it reads as a prompt rather
                   than as text already typed. */
                className={`${INPUT} resize-y placeholder:text-[13px] placeholder:text-light-grey/55`}
              />
            </Field>

            {/* Not for people. Off-screen rather than display:none, because a
                hidden field is the first thing a bot skips. */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="pointer-events-none absolute -left-[9999px] h-px w-px opacity-0"
            />

            {status.kind === "error" ? (
              <p role="alert" className="ts-body-small text-orange">
                {status.message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status.kind === "sending"}
              className="flex w-full items-center justify-center rounded-full bg-orange px-10 py-3 text-off-white transition hover:brightness-105 focus-visible:ring-2 focus-visible:ring-orange focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60"
            >
              <span className="ts-button text-off-white">
                {status.kind === "sending" ? "Sending…" : "Send request"}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

const INPUT =
  "ts-body w-full rounded-2xl border border-grey-100 bg-white px-4 py-3 text-dark-charcoal transition outline-none focus-visible:border-orange focus-visible:ring-2 focus-visible:ring-orange/30";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full flex-col gap-2">
      <label htmlFor={htmlFor} className="ts-body font-semibold">
        {label}
      </label>
      {children}
    </div>
  );
}
