"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Upload, Crop, Download } from "lucide-react";

export default function HowToUse() {
  const t = useTranslations("SquareCrop.howToUse");

  const steps = [
    {
      icon: Upload,
      label: "step1.label",
      titleKey: "step1.title",
      descKey: "step1.description",
      delay: 0.1,
    },
    {
      icon: Crop,
      label: "step2.label",
      titleKey: "step2.title",
      descKey: "step2.description",
      delay: 0.2,
    },
    {
      icon: Download,
      label: "step3.label",
      titleKey: "step3.title",
      descKey: "step3.description",
      delay: 0.3,
    },
  ];

  return (
    <section id="how-to-use-section" className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* 标题和副标题 */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white"
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

        {/* 步骤卡片 */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map(({ icon: Icon, label, titleKey, descKey, delay }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay }}
              className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-8 flex flex-col items-center text-center hover:shadow-lg transition-shadow"
            >
              {/* STEP 标签 */}
              <div className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-4 uppercase tracking-wide">
                {t(label)}
              </div>

              {/* 图标 */}
              <div className="w-16 h-16 mb-6 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" strokeWidth={2} />
              </div>

              {/* 标题 */}
              <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                {t(titleKey)}
              </h3>

              {/* 描述 */}
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {t(descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

