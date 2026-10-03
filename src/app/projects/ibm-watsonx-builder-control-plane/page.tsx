import type { Metadata } from "next";

import { PasswordGate } from "@/components/case/PasswordGate";
import { hasAccess, isUnconfigured } from "@/lib/ibm-access";

import { CaseStudy } from "./CaseStudy";

/**
 * The only protected route in the portfolio.
 *
 * The decision is made here, on the server, before anything is rendered. A
 * visitor without access gets `PasswordGate` and nothing else — `CaseStudy` is
 * never called, so none of its markup, text or image URLs appear in the HTML or
 * in the Flight payload. There is no hidden content to find in the page source.
 *
 * Reading the cookie opts this route out of static prerendering, which is what
 * we want: a password screen that could be cached and served to everyone would
 * be no screen at all.
 */

export const metadata: Metadata = {
  title: "IBM watsonx Builder Control Plane — Anne Lin",
  /* Deliberately thin, and `noindex`: the page is not for search results. */
  description: "A password-protected case study.",
  robots: { index: false, follow: false },
};

/** Where Request Password goes. The address the About card already uses. */
const CONTACT_EMAIL = "annelin.yuen@gmail.com";

export default async function IbmWatsonxBuilderControlPlanePage() {
  if (await hasAccess()) return <CaseStudy />;

  return (
    <PasswordGate
      title="IBM watsonx Builder Control Plane"
      blurb="This case study contains work completed during my IBM internship. Please enter the password to view the project."
      contactEmail={CONTACT_EMAIL}
      unconfigured={isUnconfigured()}
    />
  );
}
