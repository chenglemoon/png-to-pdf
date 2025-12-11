"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

export default function HeroSection() {
  const t = useTranslations("PhotoToRounded.hero");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    // 首先尝试使用本地的文件输入框
    if (fileInputRef.current) {
      fileInputRef.current.click();
      return;
    }

    // 如果本地输入框不存在，尝试查找工具区域的文件输入框
    const findAndClickInput = () => {
      const uploadInputs = document.querySelectorAll('input[type="file"]');
      for (const input of Array.from(uploadInputs)) {
        const htmlInput = input as HTMLInputElement;
        if (htmlInput.accept && htmlInput.accept.includes('image')) {
          htmlInput.click();
          return true;
        }
      }
      const fileInput = document.querySelector('input[type="file"][accept*="image"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.click();
        return true;
      }
      return false;
    };

    // 立即尝试
    if (findAndClickInput()) {
      return;
    }

    // 如果找不到，滚动到工具区域并重试
    const toolSection = document.querySelector('#rounded-tool-section');
    if (toolSection) {
      toolSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => {
        if (!findAndClickInput()) {
          const uploadArea = document.querySelector('.ant-upload-drag') as HTMLElement;
          if (uploadArea) {
            uploadArea.click();
          }
        }
      }, 800);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 滚动到工具区域
    const toolSection = document.querySelector('#rounded-tool-section');
    if (toolSection) {
      toolSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 通过自定义事件传递文件给 Rounded 组件
    const fileEvent = new CustomEvent('rounded-upload-file', {
      detail: { file },
      bubbles: true,
    });
    document.dispatchEvent(fileEvent);

    // 重置本地输入框
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 py-16 md:py-24">
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

            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                onClick={handleUploadClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                {t("button")}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>

          {/* 右侧对比图片 */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative w-full"
          >
            <div className="grid grid-cols-2 gap-4 md:gap-6 w-full">
              {/* Before 图片 - 原始方形图片（无圆角） */}
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-gray-800 w-full min-h-[400px] md:min-h-[500px]">
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative w-full h-full overflow-hidden shadow-2xl">
                    <Image
                      src="/photo-to-rounded-1.jpg"
                      alt="Original photo"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
                  {t("before")}
                </div>
              </div>

              {/* After 图片 - 圆角效果 */}
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl w-full min-h-[400px] md:min-h-[500px] bg-gradient-to-br from-blue-400 via-purple-400 to-pink-400">
                {/* 圆角图片 */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="relative w-full h-full rounded-[30px] overflow-hidden shadow-2xl ring-4 ring-white/80">
                    <Image
                      src="/photo-to-rounded-1.jpg"
                      alt="Rounded photo"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold z-10 shadow-lg">
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

