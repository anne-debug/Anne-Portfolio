import { Postcard } from "@/components/playground/Postcard";
import { PetCorner } from "@/components/v2/PetCorner";

/**
 * Playground: Didi roams the page as a little pet, and below her visitors can
 * make a postcard for someone they miss. Not linked from the nav yet; it is a
 * preview until Anne decides where it lives.
 */
export const metadata = { title: "Playground", robots: { index: false } };

export default function Playground() {
  return (
    <main className="flex w-full max-w-[1200px] flex-col items-center gap-20 px-5 py-[100px] tablet:px-10">
      <PetCorner />
      <div className="flex w-full flex-col items-center gap-8">
        <div className="flex max-w-[560px] flex-col items-center gap-3 text-center">
          <h2 className="ts-heading-2 text-deep-blue">Send a postcard to someone you miss</h2>
          <p className="text-[16px] text-dark-charcoal" style={{ fontFamily: "var(--font-dm-sans)" }}>
            Doodle on the front, flip it over, write a note and pick a stamp.
          </p>
        </div>
        <Postcard />
      </div>
    </main>
  );
}
