import HeroSection from "./HeroSection";
import HowToUse from "../home/HowToUse";
import GetStartedWithTools from "../home/GetStartedWithTools";
import Features from "./Features";
import FAQ from "./FAQ";
import Testimonials from "./Testimonials";

export default function JpgToPdf() {
  return (
    <>
      <HeroSection />
      <HowToUse />
      <GetStartedWithTools />
      <Features />
      <Testimonials />
      <FAQ />
    </>
  );
}

