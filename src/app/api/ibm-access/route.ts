import { NextResponse } from "next/server";

import { ACCESS_COOKIE, isUnconfigured, issueToken } from "@/lib/ibm-access";

/**
 * Where the password screen sends what the visitor typed.
 *
 * The password is compared here, on the server, and the browser is told only
 * whether it was right. On success the reply carries a signed cookie standing
 * for "this browser has been let in".
 *
 * The cookie has no `maxAge` and no `expires`, which makes it a session cookie:
 * it survives navigation and a refresh, and the browser drops it when it
 * closes. That is exactly the rule asked for — do not keep asking during a
 * session, do ask again in a new one — and it needs no `sessionStorage`, which
 * the server could not read anyway.
 */
export async function POST(request: Request) {
  if (isUnconfigured()) {
    return NextResponse.json(
      { error: "unconfigured" as const },
      { status: 503 },
    );
  }

  let password: unknown;
  try {
    password = (await request.json())?.password;
  } catch {
    password = undefined;
  }

  if (typeof password !== "string") {
    return NextResponse.json({ error: "invalid" as const }, { status: 400 });
  }

  const token = issueToken(password);
  if (!token) {
    /* 401 and nothing else. No hint about length, case or how close it was. */
    return NextResponse.json({ error: "incorrect" as const }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ACCESS_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return response;
}
