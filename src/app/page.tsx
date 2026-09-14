import { Hero } from "@/components/home/Hero";
import { SelectedWork } from "@/components/home/SelectedWork";
import { Skills } from "@/components/home/Skills";

/**
 * Framer page "Home" (/), mirroring its OutterWraper: a 1200px column with
 * 100px vertical and 40px horizontal padding, and 50px between sections, which
 * the Phone frame opens up to 60px.
 */
export default function Home() {
  return (
    <main className="flex w-full max-w-[1200px] flex-col gap-[60px] px-10 py-[100px] tablet:gap-[50px]">
      <Hero />
      <Skills />
      <SelectedWork />
    </main>
  );
}
