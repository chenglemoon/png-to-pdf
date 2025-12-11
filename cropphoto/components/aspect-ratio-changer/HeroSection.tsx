"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const t = useTranslations("AspectRatioChanger.hero");

  const handleUploadClick = () => {
    const fileInput = document.querySelector('input[type="file"][accept="image/*"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* 左侧文字内容 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 text-gray-900 dark:text-white leading-tight">
              {t("title")}
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              {t("description")}
            </p>

            <button
              onClick={handleUploadClick}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {t("button")}
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>

          {/* 右侧对比图片 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* Before 图片 - 原始比例 4:3 */}
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800">
                <Image
                  src="/aspect-ratio-changer-1.jpg"
                  alt="Original aspect ratio"
                  fill
                  className="object-cover object-center"
                  priority
                />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                  {t("before")}
                </div>
              </div>

              {/* After 图片 - 调整后的比例 1:1，显示不同的裁剪区域和效果 */}
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 ring-2 ring-purple-500/30">
                <div className="absolute inset-0">
                  <Image
                    src="/aspect-ratio-changer-1.jpg"
                    alt="Adjusted aspect ratio"
                    fill
                    className="object-cover"
                    style={{ 
                      objectPosition: "center 35%",
                      transform: "scale(1.15)"
                    }}
                    priority
                  />
                </div>
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold z-10 shadow-lg">
                  {t("after")}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

