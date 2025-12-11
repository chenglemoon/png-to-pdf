import HeroSection from "./HeroSection";
import ExamplesSection from "./ExamplesSection";
import HowToUse from "./HowToUse";
import FAQ from "./FAQ";
import AspectRatioChangerTool from "./AspectRatioChangerTool";

export default function AspectRatioChanger() {
  return (
    <>
      <HeroSection />
      <section className="relative overflow-hidden bg-white dark:bg-gray-950 pt-4 pb-16 md:pb-24">
        <div className="container relative z-10 mx-auto px-4">
          <AspectRatioChangerTool />
        </div>
      </section>
      <ExamplesSection />
      <HowToUse />
      <FAQ />
    </>
  );
}

