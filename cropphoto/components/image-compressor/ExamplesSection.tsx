"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function ExamplesSection() {
  const t = useTranslations("ImageCompressor.examples");

  const examples = [
    {
      title: "PNG Compression",
      description: "Reduce PNG file size by up to 70% while maintaining quality",
      beforeImage: "/square-image-1.webp",
      afterImage: "/square-image-1.webp",
      badge: "PNG",
      reduction: "65%",
    },
    {
      title: "JPEG Optimization",
      description: "Optimize JPEG images for web with smart compression",
      beforeImage: "/square-image-2.webp",
      afterImage: "/square-image-2.webp",
      badge: "JPEG",
      reduction: "58%",
    },
    {
      title: "WEBP Conversion",
      description: "Convert and compress images to modern WEBP format",
      beforeImage: "/square-image-3.webp",
      afterImage: "/square-image-3.webp",
      badge: "WEBP",
      reduction: "72%",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-4 inline-block">
              {t("badge")}
            </span>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              {t("title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              {t("subtitle")}
            </p>
          </motion.div>

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
                <div className="relative rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-gray-800 aspect-square">
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

                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center p-6">
                    <div className="relative overflow-hidden shadow-2xl rounded-xl w-[75%] h-[75%] ring-4 ring-white/80">
                      <Image
                        src={example.afterImage}
                        alt={t("after")}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute top-4 right-4 z-10">
                      <Badge variant="default" className="bg-blue-600 text-white font-semibold">
                        {t("after")} - {example.reduction}
                      </Badge>
                    </div>
                  </div>
                </div>

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

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("hoverTip")}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}


