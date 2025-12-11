"use client";

import HeroSection from "./HeroSection";
import FeaturesSection from "./FeaturesSection";
import HowToUse from "./HowToUse";
import FAQ from "./FAQ";
import dynamic from "next/dynamic";

const Compressor = dynamic(
  () => import("./Compressor"),
  { ssr: false, loading: () => <div className="flex items-center justify-center h-[600px]">Loading...</div> }
);

export default function ImageCompressor() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Tool Section - Compressor */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pt-4 pb-16 md:pb-24">
        <div className="container relative z-10 mx-auto px-4">
          <Compressor />
        </div>
      </section>
      <FeaturesSection />
      <HowToUse />
      <FAQ />
    </>
  );
}

