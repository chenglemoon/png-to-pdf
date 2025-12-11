"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";

export default function HeroSection() {
  const t = useTranslations("SquareCrop.hero");

  const handleUploadClick = () => {
    const fileInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-16 md:py-24">
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
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {t("button")}
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
              {/* Before 图片 - 原始矩形图片 */}
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/square-image-1.webp"
                  alt="Original photo before crop"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 rounded-full text-sm font-semibold text-gray-900 dark:text-white">
                  {t("before")}
                </div>
              </div>

              {/* After 图片 - 裁剪后的正方形图片 */}
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/square-image-1.webp"
                  alt="Cropped square photo"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
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

