"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Zap, FileImage, FileText, Upload, Cloud, Book } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Features() {
  const t = useTranslations("Home.features");

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
                <span className="text-2xl font-bold text-red-600">PDF</span>
                <Zap className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500" fill="currentColor" />
              </div>
            </div>
          </div>
        );
      case "formats":
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-64 h-64">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <FileText className="w-16 h-16 text-gray-400" />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-400"></div>
                  </div>
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                    <FileText className="w-12 h-12 text-purple-600" />
                  </div>
                </div>
              </div>
              <div className="absolute top-0 left-0 bg-green-100 rounded-lg p-3">
                <span className="text-xs font-semibold text-green-700">WEBP</span>
              </div>
              <div className="absolute top-0 right-0 bg-purple-100 rounded-lg p-3">
                <span className="text-xs font-semibold text-purple-700">JPG</span>
              </div>
              <div className="absolute bottom-0 left-0 bg-blue-100 rounded-lg p-3">
                <span className="text-xs font-semibold text-blue-700">PNG</span>
              </div>
              <div className="absolute bottom-0 right-0 bg-orange-100 rounded-lg p-3">
                <span className="text-xs font-semibold text-orange-700">BMP</span>
              </div>
            </div>
          </div>
        );
      case "book":
        return (
          <div className="relative w-full h-full flex items-center justify-center">
            <div className="relative w-64 h-48 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-lg border-2 border-amber-200">
              <div className="absolute inset-0 flex">
                <div className="w-1/2 border-r-2 border-amber-300 p-4">
                  <div className="w-full h-full bg-white rounded flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-200 via-green-200 to-yellow-200 flex items-center justify-center">
                      <FileImage className="w-12 h-12 text-gray-600" />
                    </div>
                  </div>
                </div>
                <div className="w-1/2 p-4">
                  <div className="w-full h-full bg-white rounded flex flex-col items-center justify-center gap-2">
                    <div className="w-16 h-1 bg-gray-300 rounded"></div>
                    <div className="w-12 h-1 bg-gray-300 rounded"></div>
                    <div className="w-14 h-1 bg-gray-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section id="features-section" className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* 标题和副标题 */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* 功能块 */}
        <div className="max-w-7xl mx-auto space-y-24">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                feature.imagePosition === "left" ? "lg:grid-flow-dense" : ""
              }`}
            >
              {/* 文字内容 */}
              <div
                className={`${
                  feature.imagePosition === "left" ? "lg:col-start-2" : ""
                }`}
              >
                <h3 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {t(feature.descKey)}
                </p>
                <Button
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg flex items-center gap-2"
                  onClick={() => {
                    const converterSection = document.querySelector('[data-converter-section]');
                    if (converterSection) {
                      converterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <Cloud className="w-4 h-4" />
                  {t(feature.buttonKey)}
                </Button>
              </div>

              {/* 插图 */}
              <div
                className={`${
                  feature.imagePosition === "left" ? "lg:col-start-1 lg:row-start-1" : ""
                } h-64 md:h-80`}
              >
                {renderIllustration(feature.illustration)}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
