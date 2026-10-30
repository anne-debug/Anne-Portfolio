import type { Metadata } from "next";

import { PasswordGate } from "@/components/case/PasswordGate";
import { hasAccess, isUnconfigured } from "@/lib/ibm-access";

import { CaseStudy } from "./CaseStudy";

/**
 * The second protected route, and it shares the first one's gate.
 *
 * `hasAccess()` is scoped to the password, not to a route: both IBM case
 * studies come from the same internship under the same NDA, so one password
 * opens both and a visitor given it does not have to type it twice. Splitting
 * them later means a second secret and a second cookie in `ibm-access.ts`;
 * nothing here would change but the import.
 *
 * The decision is made on the server before anything renders. Without access
 * the visitor gets `PasswordGate` and nothing else — `CaseStudy` is never
 * called, so none of its markup or text reaches the HTML or the Flight
 * payload. Reading the cookie opts this route out of static prerendering,
 * which is the point: a password screen that could be cached and handed to
 * everyone would be no screen at all.
 */

export const metadata: Metadata = {
  title: "IBM watsonx Orchestrate Notification Experience — Anne Lin",
  /* Deliberately thin, and `noindex`: the page is not for search results. */
  description: "A password-protected case study.",
  robots: { index: false, follow: false },
};

/** Where Request Password goes. The address the About card already uses. */
const CONTACT_EMAIL = "annelin.yuen@gmail.com";

export default async function IbmWatsonxOrchestrateNotificationsPage() {
  if (await hasAccess()) return <CaseStudy />;

  return (
    <PasswordGate
      title="IBM watsonx Orchestrate Notification Experience"
      blurb="This case study contains work completed during my IBM internship. Please enter the password to view the project."
      contactEmail={CONTACT_EMAIL}
      unconfigured={isUnconfigured()}
    />
  );
}
