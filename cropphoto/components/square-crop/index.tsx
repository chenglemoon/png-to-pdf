import HeroSection from "./HeroSection";
import HowToUse from "./HowToUse";
import ExamplesSection from "./ExamplesSection";
import FAQ from "./FAQ";
import Testimonials from "./Testimonials";
import SquareCrop from "./SquareCrop";

export default function SquareCropPage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Tool Section - Square Crop */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-950 pt-4 pb-16 md:pb-24">
        <div className="container relative z-10 mx-auto px-4">
          <SquareCrop />
        </div>
      </section>
      <ExamplesSection />
      <HowToUse />
      <FAQ />
      <Testimonials />
    </>
  );
}

