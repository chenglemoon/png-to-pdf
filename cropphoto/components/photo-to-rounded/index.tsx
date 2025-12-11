"use client";

import HeroSection from "./HeroSection";
import ExamplesSection from "./ExamplesSection";
import HowToUse from "./HowToUse";
import FAQ from "./FAQ";
import dynamic from "next/dynamic";

const Rounded = dynamic(
  () => import("./Rounded"),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-[600px]">Loading...</div> }
);

export default function PhotoToRoundedPage() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Tool Section - Rounded */}
      <section id="rounded-tool-section" className="relative overflow-hidden bg-white dark:bg-gray-950 pt-4 pb-16 md:pb-24">
        <div className="container relative z-10 mx-auto px-4">
          <Rounded />
        </div>
      </section>
      <ExamplesSection />
      <HowToUse />
      <FAQ />
    </>
  );
}

