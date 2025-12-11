"use client";

import HeroSection from "./HeroSection";
import HowToUse from "./HowToUse";
import ExamplesSection from "./ExamplesSection";
import Features from "./Features";
import FAQ from "./FAQ";
import Testimonials from "./Testimonials";
import dynamic from "next/dynamic";

const PhotoEditor = dynamic(
  () => import("@/components/photo-editor/PhotoEditor"),
  { ssr: false }
);

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Tool Section - Photo Editor */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-950 pt-4 pb-16 md:pb-24">
        <div className="container relative z-10 mx-auto px-4">
          <PhotoEditor />
        </div>
      </section>
      <ExamplesSection />
      <Features />
      <HowToUse />
      <FAQ />
      <Testimonials />
    </>
  );
}
