"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const examples = [
  {
    beforeImage: "/aspect-ratio-changer-2.jpg",
    afterImage: "/aspect-ratio-changer-2.jpg",
    beforeAspect: "aspect-[4/3]",
    afterAspect: "aspect-[16/9]", // 示例1: After 是 16:9 宽屏
    // Before: 4:3 比例，显示完整图片，不缩放
    beforeObjectPosition: "center center",
    beforeScale: 1.0,
    // After: 16:9 宽屏，向右移动焦点，裁剪左侧内容
    afterObjectPosition: "75% center", // 向右移动，显示右侧区域
    afterScale: 1.8, // 放大显示右侧区域
  },
  {
    beforeImage: "/aspect-ratio-changer-3.jpg",
    afterImage: "/aspect-ratio-changer-3.jpg",
    beforeAspect: "aspect-[3/4]",
    afterAspect: "aspect-[4/3]", // 示例2: After 是 4:3 标准
    // Before: 3:4 竖屏，显示完整图片，居中
    beforeObjectPosition: "center center",
    beforeScale: 1.0,
    // After: 4:3 标准，中心裁剪，去除上下边缘，聚焦中心
    afterObjectPosition: "center center",
    afterScale: 1.6, // 放大显示中心区域
  },
  {
    beforeImage: "/aspect-ratio-changer-4.jpg",
    afterImage: "/aspect-ratio-changer-4.jpg",
    beforeAspect: "aspect-[16/9]",
    afterAspect: "aspect-square", // 示例3: After 是 1:1 正方形
    // Before: 16:9 宽屏，显示完整图片
    beforeObjectPosition: "center center",
    beforeScale: 1.0,
    // After: 1:1 正方形，聚焦中心区域，裁剪左右两侧，放大显示
    afterObjectPosition: "center center",
    afterScale: 1.8, // 更大的缩放，让中心区域更突出
  },
];

export default function ExamplesSection() {
  const t = useTranslations("AspectRatioChanger.examples");

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t("title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* 示例对比 */}
          <div className="space-y-16">
            {examples.map((example, index) => {
              const exampleKey = `example${index + 1}`;
              return (
                <motion.div
                  key={exampleKey}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-6 md:p-8">
                    {/* 说明文字 */}
                    <div className="mb-8 text-center">
                      <h3 className="text-xl md:text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                        {t(`${exampleKey}.title`)}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        {t(`${exampleKey}.description`)}
                      </p>
                    </div>

                    {/* Before 和 After 对比 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Before */}
                      <div className="relative group">
                        <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                          <div className={`relative w-full ${example.beforeAspect}`}>
                            <Image
                              src={example.beforeImage}
                              alt={t("before")}
                              fill
                              className="object-cover"
                              style={{ 
                                objectPosition: example.beforeObjectPosition,
                                transform: `scale(${example.beforeScale || 1.0})`
                              }}
                            />
                          </div>
                          <div className="absolute top-4 left-4 z-10">
                            <Badge variant="secondary" className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white font-semibold border border-gray-200 dark:border-gray-700">
                              {t("before")}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* After */}
                      <div className="relative group">
                        <div className="relative rounded-xl overflow-hidden shadow-lg border-2 border-purple-500 dark:border-purple-500 bg-white dark:bg-gray-800 ring-2 ring-purple-500/30">
                          <div className={`relative w-full ${example.afterAspect}`}>
                            <Image
                              src={example.afterImage}
                              alt={t("after")}
                              fill
                              className="object-cover"
                              style={{ 
                                objectPosition: example.afterObjectPosition,
                                transform: `scale(${example.afterScale})`
                              }}
                            />
                          </div>
                          <div className="absolute top-4 right-4 z-10">
                            <Badge variant="default" className="bg-purple-600 text-white font-semibold">
                              {t("after")}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

