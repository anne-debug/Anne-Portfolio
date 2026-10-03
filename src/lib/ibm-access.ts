import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * The access check for the IBM case study.
 *
 * This file runs on the server only. It imports `next/headers` and
 * `node:crypto`, either of which fails the build if a client component pulls
 * it in, and `IBM_CASE_STUDY_PASSWORD` has no `NEXT_PUBLIC_` prefix, so Next
 * never inlines it into a browser bundle. The password does not reach the
 * client.
 * The page asks `hasAccess()` before it renders anything, and a visitor without
 * access is sent the password screen and nothing else: the case study is not
 * rendered, so none of it is in the HTML or the Flight payload. It is not a
 * cover over content that was already delivered.
 *
 * The password lives in `IBM_CASE_STUDY_PASSWORD`, not in the repository. With
 * the variable unset nobody gets in, which is the right way round — a fallback
 * to a literal would put the password back in the source and defeat the point.
 *
 * Read README-port.md, "What this gate does and does not do", before putting
 * anything genuinely confidential behind it.
 */

const COOKIE = "ibm_access";

/** Tied to the password, so changing the password invalidates issued cookies. */
const PAYLOAD = "ibm-case-study-access-v1";

function secret(): string | null {
  const value = process.env.IBM_CASE_STUDY_PASSWORD;
  return value && value.length > 0 ? value : null;
}

/**
 * The cookie's value: an HMAC of a fixed string keyed by the password.
 *
 * Signed rather than a flag, because a flag would be forgeable — anyone could
 * set `ibm_access=1` in dev tools and walk in. Deriving it from the password
 * means a valid cookie cannot be made without knowing the password, and the
 * server can check one without storing any session state.
 */
function expectedToken(password: string): string {
  return createHmac("sha256", password).update(PAYLOAD).digest("hex");
}

/** Constant time, so neither check leaks its answer through how long it took. */
function same(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/** Case-sensitive by construction: the bytes are compared, not folded. */
export function issueToken(attempt: string): string | null {
  const password = secret();
  if (!password) return null;
  return same(attempt, password) ? expectedToken(password) : null;
}

export async function hasAccess(): Promise<boolean> {
  const password = secret();
  if (!password) return false;
  const token = (await cookies()).get(COOKIE)?.value;
  return Boolean(token && same(token, expectedToken(password)));
}

/** True when the server has no password configured, so nobody can be let in. */
export function isUnconfigured(): boolean {
  return secret() === null;
}

export const ACCESS_COOKIE = COOKIE;
