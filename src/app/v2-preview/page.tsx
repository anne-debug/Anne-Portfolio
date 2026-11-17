import { redirect } from "next/navigation";

/** The v2 draft is now the home page; old links to the preview land there. */
export default function V2PreviewRedirect() {
  redirect("/");
}
