import HeroSection from "./HeroSection";
import HowToUse from "./HowToUse";
import GetStartedWithTools from "../home/GetStartedWithTools";
import Features from "./Features";
import FAQ from "./FAQ";
import Testimonials from "./Testimonials";

export default function TextToPdf() {
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

