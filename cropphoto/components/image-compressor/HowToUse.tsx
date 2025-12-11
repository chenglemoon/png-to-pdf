"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HowToUse() {
  const t = useTranslations("ImageCompressor.howToUse");
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  const handleCreateClick = () => {
    const fileInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  const steps = [
    { titleKey: "step1.title", descKey: "step1.description" },
    { titleKey: "step2.title", descKey: "step2.description" },
    { titleKey: "step3.title", descKey: "step3.description" },
    { titleKey: "step4.title", descKey: "step4.description" },
  ];

  return (
    <section id="how-to-use-section" className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-r from-blue-50 via-purple-50 to-white dark:from-blue-950/30 dark:via-purple-900/20 dark:to-gray-900 shadow-lg">
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <svg 
                  width="140" 
                  height="140" 
                  viewBox="0 0 140 140" 
                  className="text-gray-600 dark:text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                >
                  <rect x="25" y="35" width="90" height="60" rx="3" />
                  <rect x="28" y="38" width="84" height="54" fill="black" />
                  <line x1="18" y1="95" x2="122" y2="95" strokeLinecap="round" strokeWidth="2.5" />
                </svg>
                <p className="mt-8 text-gray-500 dark:text-gray-400 text-sm">Compression Preview</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-8">
              {t("title")}
            </h2>

            <div className="space-y-0">
              {steps.map((step, index) => {
                const isExpanded = expandedSteps.has(index);
                return (
                  <div
                    key={index}
                    className="relative pl-5 py-2"
                  >
                    <div 
                      className="absolute left-0 top-0 bottom-0 w-0.5 transition-colors"
                      style={{
                        backgroundColor: index === 0 ? "#06b6d4" : "#e5e7eb",
                      }}
                    />
                    <button
                      onClick={() => toggleStep(index)}
                      className="w-full text-left pr-4 py-2 flex items-center justify-between group"
                    >
                      <span className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">
                        {t(step.titleKey)}
                      </span>
                      <ChevronDown 
                        className={`w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 ml-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pr-4 pb-2"
                      >
                        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mt-1">
                          {t(step.descKey)}
                        </p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="pt-6">
              <Button
                onClick={handleCreateClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3.5 rounded-lg text-base transition-colors shadow-sm hover:shadow-md"
              >
                {t("button")}
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


