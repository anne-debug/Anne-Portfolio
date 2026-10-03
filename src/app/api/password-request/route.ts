import { NextResponse } from "next/server";

/**
 * Where the Request Password dialog sends a request to see the IBM case study.
 *
 * The message is delivered by whichever transactional email provider is
 * configured in the environment. Nothing about the provider leaks into the
 * client: the browser posts a name, an address and a message, and is told only
 * whether it went.
 *
 * With no provider configured this answers 503 `unconfigured`, and the dialog
 * falls back to opening the visitor's own mail client with everything already
 * filled in. That way the feature works the day it ships, on a portfolio with
 * no email account wired up, and silently upgrades to sending server-side the
 * moment the two variables below are set. What it must never do is accept a
 * message and quietly drop it.
 *
 * Set `RESEND_API_KEY` and `REQUEST_FROM_ADDRESS` to switch it on; see
 * `.env.example`.
 */

/** Anne's own address, the one the About card already links to. */
const TO = process.env.PASSWORD_REQUEST_TO ?? "annelin.yuen@gmail.com";
const SUBJECT = "Password Request — IBM watsonx Builder Control Plane";

const LIMITS = { name: 120, email: 160, message: 4000 };

/** Deliberately loose. The address is for replying to, not for gatekeeping. */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Payload {
  name: string;
  email: string;
  message: string;
}

function read(body: unknown): Payload | null {
  if (typeof body !== "object" || body === null) return null;
  const { name, email, message, company } = body as Record<string, unknown>;

  /* A field no person sees and no person fills. Anything in it is a bot, and
     the answer is a cheerful 200 so it learns nothing. */
  if (typeof company === "string" && company.length > 0) return null;

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof message !== "string"
  ) {
    return null;
  }

  const trimmed = {
    name: name.trim().slice(0, LIMITS.name),
    email: email.trim().slice(0, LIMITS.email),
    message: message.trim().slice(0, LIMITS.message),
  };

  if (!trimmed.name || !trimmed.message) return null;
  if (!LOOKS_LIKE_EMAIL.test(trimmed.email)) return null;
  return trimmed;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" as const }, { status: 400 });
  }

  /* The honeypot and a malformed body are told apart here: a bot gets 200 and
     nothing happens, a person gets a message they can act on. */
  const isHoneypot =
    typeof body === "object" &&
    body !== null &&
    typeof (body as Record<string, unknown>).company === "string" &&
    ((body as Record<string, unknown>).company as string).length > 0;
  if (isHoneypot) return NextResponse.json({ ok: true });

  const payload = read(body);
  if (!payload) {
    return NextResponse.json({ error: "invalid" as const }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  const from = process.env.REQUEST_FROM_ADDRESS;
  if (!key || !from) {
    return NextResponse.json(
      { error: "unconfigured" as const },
      { status: 503 },
    );
  }

  try {
    const sent = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [TO],
        subject: SUBJECT,
        /* Replying in the mail client goes straight back to the asker. */
        reply_to: payload.email,
        text: [
          `${payload.name} <${payload.email}> asked to see the IBM case study.`,
          "",
          payload.message,
        ].join("\n"),
      }),
    });

    if (!sent.ok) {
      return NextResponse.json({ error: "send" as const }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "send" as const }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
