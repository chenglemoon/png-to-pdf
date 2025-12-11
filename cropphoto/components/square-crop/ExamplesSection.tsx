"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function ExamplesSection() {
  const t = useTranslations("SquareCrop.examples");

  const examples = [
    {
      title: t("example1.title"),
      description: t("example1.description"),
      beforeImage: "/square-image-1.webp",
      afterImage: "/square-image-1.webp",
      badge: t("example1.badge")
    },
    {
      title: t("example2.title"),
      description: t("example2.description"),
      beforeImage: "/square-image-2.webp",
      afterImage: "/square-image-2.webp",
      badge: t("example2.badge")
    },
    {
      title: t("example3.title"),
      description: t("example3.description"),
      beforeImage: "/square-image-3.webp",
      afterImage: "/square-image-3.webp",
      badge: t("example3.badge")
    }
  ];

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
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-4 inline-block">
              {t("badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t("title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* 示例对比 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {examples.map((example, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="relative group"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-gray-100 dark:bg-gray-800">
                  {/* Before 图片 - 原始矩形图片 */}
                  <div className="absolute inset-0">
                    <Image
                      src={example.beforeImage}
                      alt={t("before")}
                      fill
                      className="object-cover transition-opacity duration-500 group-hover:opacity-0"
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <Badge variant="secondary" className="bg-white/90 text-gray-900 font-semibold">
                        {t("before")}
                      </Badge>
                    </div>
                  </div>

                  {/* After 图片 - 裁剪后的正方形 */}
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="relative w-[75%] aspect-square rounded-lg overflow-hidden shadow-2xl bg-white dark:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <Image
                        src={example.afterImage}
                        alt={t("after")}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge variant="default" className="bg-purple-600 text-white font-semibold">
                          {t("after")}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 说明文字 */}
                <div className="mt-6 text-center">
                  <div className="mb-2">
                    <Badge variant="outline" className="text-xs">
                      {example.badge}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {example.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {example.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

