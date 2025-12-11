"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface Testimonial {
  id: number;
  content: string;
  author: string;
}

export default function Testimonials() {
  const t = useTranslations("SquareCrop.testimonials");
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      id: 1,
      content: t("testimonial1.content"),
      author: t("testimonial1.author"),
    },
    {
      id: 2,
      content: t("testimonial2.content"),
      author: t("testimonial2.author"),
    },
    {
      id: 3,
      content: t("testimonial3.content"),
      author: t("testimonial3.author"),
    },
    {
      id: 4,
      content: t("testimonial4.content"),
      author: t("testimonial4.author"),
    },
    {
      id: 5,
      content: t("testimonial5.content"),
      author: t("testimonial5.author"),
    },
  ];

  // 自动轮播
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // 每5秒切换一次

    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 引号图标 */}
        <div className="flex justify-center mb-8">
          <svg
            className="w-12 h-12 text-gray-300 dark:text-gray-600"
            fill="currentColor"
            viewBox="0 0 32 32"
          >
            <path d="M10 8c-3.866 0-7 3.134-7 7 0 3.866 3.134 7 7 7h1c.552 0 1-.448 1-1v-5c0-.552-.448-1-1-1h-1c-1.103 0-2-.897-2-2s.897-2 2-2h4c.552 0 1-.448 1-1v-1c0-.552-.448-1-1-1h-4zM23 8c-3.866 0-7 3.134-7 7 0 3.866 3.134 7 7 7h1c.552 0 1-.448 1-1v-5c0-.552-.448-1-1-1h-1c-1.103 0-2-.897-2-2s.897-2 2-2h4c.552 0 1-.448 1-1v-1c0-.552-.448-1-1-1h-4z" />
          </svg>
        </div>

        {/* 评价内容 */}
        <div className="relative min-h-[200px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto px-4">
                {testimonials[currentIndex].content}
              </p>
              <p className="text-base md:text-lg text-gray-500 dark:text-gray-400 font-medium">
                {testimonials[currentIndex].author}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 指示器 */}
        <div className="flex justify-center gap-2 mt-12">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "w-8 bg-purple-600"
                  : "w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

