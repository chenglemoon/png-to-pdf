"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Upload, Settings, Download } from "lucide-react";

export default function HowToUse() {
  const t = useTranslations("PdfToWebp.howToUse");

  const steps = [
    {
      icon: Upload,
      titleKey: "step1.title",
      descKey: "step1.description",
      delay: 0.1,
      iconColor: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900",
    },
    {
      icon: Settings,
      titleKey: "step2.title",
      descKey: "step2.description",
      delay: 0.2,
      iconColor: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900",
    },
    {
      icon: Download,
      titleKey: "step3.title",
      descKey: "step3.description",
      delay: 0.3,
      iconColor: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900",
    },
  ];

  return (
    <section id="how-to-use-section" className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4">
        {/* 标题和副标题 */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-sm md:text-base font-medium text-blue-600 dark:text-blue-400 mb-2 uppercase tracking-wide"
          >
            {t("label")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* 步骤卡片 */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: step.delay,
                  ease: [0.16, 1, 0.3, 1]
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  transition: { duration: 0.3 }
                }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center text-center cursor-pointer group"
              >
                {/* 图标容器 - 带动画 */}
                <motion.div 
                  className={`mb-4 w-16 h-16 rounded-full ${step.bgColor} flex items-center justify-center relative overflow-hidden`}
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ 
                    duration: 0.8, 
                    delay: step.delay + 0.2,
                    type: "spring",
                    stiffness: 200,
                    damping: 15
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 360,
                    transition: { duration: 0.6 }
                  }}
                >
                  {/* 背景光晕效果 */}
                  <motion.div
                    className={`absolute inset-0 rounded-full ${step.bgColor} opacity-50`}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <IconComponent className={`w-8 h-8 ${step.iconColor} relative z-10`} />
                </motion.div>
                
                {/* 步骤编号 */}
                <motion.div 
                  className="mb-3"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: step.delay + 0.4 }}
                >
                  <motion.span 
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 inline-block"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ 
                      duration: 0.5, 
                      delay: step.delay + 0.4,
                      type: "spring",
                      stiffness: 200
                    }}
                    whileHover={{ scale: 1.2 }}
                  >
                    {t("step")} {index + 1}
                  </motion.span>
                </motion.div>

                {/* 标题 */}
                <motion.h3 
                  className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: step.delay + 0.5 }}
                >
                  {t(step.titleKey)}
                </motion.h3>

                {/* 描述 */}
                <motion.p 
                  className="text-base text-gray-600 dark:text-gray-400 leading-relaxed"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: step.delay + 0.6 }}
                >
                  {t(step.descKey)}
                </motion.p>

                {/* 装饰性连接线 */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-200 to-transparent dark:from-blue-800"
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: step.delay + 0.8 }}
                  />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

