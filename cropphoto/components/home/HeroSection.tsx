"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  const t = useTranslations("Home.hero");

  const handleUploadClick = () => {
    // 优先查找 PhotoEditor 的文件输入框
    const fileInput = document.querySelector('#photo-editor-file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    } else {
      // 如果没有找到，尝试查找通用的文件输入框
      const fallbackInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement;
      if (fallbackInput) {
        fallbackInput.click();
      }
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-12 items-center max-w-7xl mx-auto">
          {/* 左侧文字内容 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-3 text-gray-900 dark:text-white leading-tight">
              {t("title")}
            </h1>

            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300">
              {t("subtitle")}
            </h2>

            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-lg">
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
            className="relative w-full"
          >
            <div className="grid grid-cols-2 gap-4 md:gap-6 w-full">
              {/* Before 图片 - 原始方形图片 */}
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 w-full min-h-[400px] md:min-h-[500px]">
                <Image
                  src="/circle-image.png"
                  alt="Original image"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                  {t("before")}
                </div>
              </div>

              {/* After 图片 - 圆形裁剪效果 */}
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl w-full min-h-[400px] md:min-h-[500px] bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
                {/* 圆形裁剪的图片 */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative aspect-square w-[75%] rounded-full overflow-hidden shadow-2xl ring-4 ring-white/80">
                    <Image
                      src="/circle-image.png"
                      alt="Circular cropped image"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
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
