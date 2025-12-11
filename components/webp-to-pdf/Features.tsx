"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Zap, FileImage, FileText, Upload, Cloud, Book } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Features() {
  const t = useTranslations("WebpToPdf.features");

  const features = [
    {
      titleKey: "feature1.title",
      descKey: "feature1.description",
      buttonKey: "feature1.button",
      icon: Zap,
      imagePosition: "right" as const,
      illustration: "speed",
    },
    {
      titleKey: "feature2.title",
      descKey: "feature2.description",
      buttonKey: "feature2.button",
      icon: FileImage,
      imagePosition: "left" as const,
      illustration: "formats",
    },
    {
      titleKey: "feature3.title",
      descKey: "feature3.description",
      buttonKey: "feature3.button",
      icon: Book,
      imagePosition: "right" as const,
      illustration: "book",
    },
  ];

  const renderIllustration = (type: string) => {
    switch (type) {
      case "speed":
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="grid grid-cols-3 gap-4 w-full max-w-md">
              <div className="bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg aspect-square flex items-center justify-center">
                <FileImage className="w-12 h-12 text-blue-700" />
              </div>
              <div className="bg-gradient-to-br from-green-200 to-green-300 rounded-lg aspect-square flex items-center justify-center">
                <FileImage className="w-12 h-12 text-green-700" />
              </div>
              <div className="bg-white border-2 border-red-300 rounded-lg aspect-square flex items-center justify-center relative">
                <FileText className="w-12 h-12 text-red-600" />
                <div className="absolute top-1 right-1">
                  <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                </div>
              </div>
            </div>
          </div>
        );
      case "formats":
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-24 h-24 text-blue-600" />
                <div className="absolute -top-2 -right-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-0 h-0 border-l-[6px] border-l-blue-600 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent"></div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-8">
                <div className="bg-green-100 px-3 py-2 rounded text-sm font-semibold text-green-700 text-center">
                  WEBP
                </div>
                <div className="bg-purple-100 px-3 py-2 rounded text-sm font-semibold text-purple-700 text-center">
                  JPG
                </div>
                <div className="bg-blue-100 px-3 py-2 rounded text-sm font-semibold text-blue-700 text-center">
                  PNG
                </div>
                <div className="bg-orange-100 px-3 py-2 rounded text-sm font-semibold text-orange-700 text-center">
                  BMP
                </div>
              </div>
            </div>
          </div>
        );
      case "book":
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg w-full max-w-md aspect-[4/3] p-4 flex">
              <div className="w-1/2 pr-2">
                <div className="bg-green-100 rounded-lg aspect-square flex items-center justify-center">
                  <FileImage className="w-12 h-12 text-green-700" />
                </div>
              </div>
              <div className="w-1/2 pl-2 flex flex-col justify-center space-y-2">
                <div className="h-2 bg-gray-300 rounded w-full"></div>
                <div className="h-2 bg-gray-300 rounded w-3/4"></div>
                <div className="h-2 bg-gray-300 rounded w-full"></div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const scrollToConverter = () => {
    const converterSection = document.querySelector('[data-converter-section]');
    if (converterSection) {
      converterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="features-section" className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {t("title")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </motion.div>

        <div className="space-y-20 md:space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${
                feature.imagePosition === "left" ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text Content */}
              <div
                className={`space-y-6 ${
                  feature.imagePosition === "left" ? "lg:order-2" : ""
                }`}
              >
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {t(feature.descKey)}
                </p>
                <button
                  onClick={scrollToConverter}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {t(feature.buttonKey)}
                </button>
              </div>
              {/* Graphic */}
              <div
                className={`relative flex justify-center ${
                  feature.imagePosition === "left"
                    ? "lg:justify-start lg:order-1"
                    : "lg:justify-end"
                }`}
              >
                <div className="w-full max-w-md h-64">
                  {renderIllustration(feature.illustration)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

