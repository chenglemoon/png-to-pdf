"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function ExamplesSection() {
  const t = useTranslations("ImageFlipper.examples");

  const examples = [
    {
      title: t("items.horizontal.title"),
      description: t("items.horizontal.description"),
      beforeImage: "/flip-image-1.webp",
      afterImage: "/flip-image-1-flipped-1761567383401.png"
    },
    {
      title: t("items.vertical.title"),
      description: t("items.vertical.description"),
      beforeImage: "/flip-image-2.webp",
      afterImage: "/flip-image-2-flipped-1761567503885.png"
    },
    {
      title: t("items.rotate.title"),
      description: t("items.rotate.description"),
      beforeImage: "/flip-image-3.webp",
      afterImage: "/flip-image-3-flipped-1761567748240.png"
    },
    {
      title: t("items.mirror.title"),
      description: t("items.mirror.description"),
      beforeImage: "/imageflipper.png",
      afterImage: "/imageflipper-flipped-1761567812594.png"
    }
  ];

  return (
    <section className="relative py-20 md:py-28 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400 px-4 py-2 bg-purple-50 dark:bg-purple-950/30 rounded-full">
              {t("badge")}
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {t("title")}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Examples */}
        <div className="space-y-16">
          {examples.map((example, index) => (
            <ExampleCard 
              key={index} 
              example={example} 
              index={index}
              labels={{
                before: t("before"),
                after: t("after")
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExampleCard({ example, index, labels }: { example: any; index: number; labels: { before: string; after: string } }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Feature Badge */}
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-full">
        <span className="text-lg">*</span>
        <span className="text-sm font-semibold">{example.title}</span>
      </div>

      <div className="p-6 md:p-8">
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 mb-8 text-center">
          {example.description}
        </p>

        {/* Image Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* BEFORE */}
          <div className="relative group">
            <div className="relative h-[28rem] md:h-[32rem] rounded-xl overflow-hidden shadow-lg border-2 border-gray-200 dark:border-gray-700">
              <Image
                src={example.beforeImage}
                alt={labels.before}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1.5 bg-gray-800 text-white rounded-full text-xs font-bold">
                  {labels.before}
                </div>
              </div>
            </div>
          </div>

          {/* AFTER */}
          <div className="relative group">
            <div className="relative h-[28rem] md:h-[32rem] rounded-xl overflow-hidden shadow-lg border-2 border-purple-500 dark:border-purple-500">
              <Image
                src={example.afterImage}
                alt={labels.after}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1.5 bg-purple-600 text-white rounded-full text-xs font-bold">
                  {labels.after}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

