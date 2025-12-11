"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function ExamplesSection() {
  const t = useTranslations("CircleCrop.examples");

  const examples = [
    {
      title: t("items.example1.title"),
      description: t("items.example1.description"),
      beforeImage: "/circleimage-1.png",
      badge: t("items.example1.badge"),
    },
    {
      title: t("items.example2.title"),
      description: t("items.example2.description"),
      beforeImage: "/circleimage-2.png",
      badge: t("items.example2.badge"),
    },
    {
      title: t("items.example3.title"),
      description: t("items.example3.description"),
      beforeImage: "/circleimage-3.png",
      badge: t("items.example3.badge"),
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
      <div className="absolute top-6 left-6 z-10 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full">
        <span className="text-sm font-semibold">{example.badge}</span>
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
            <div className="relative h-[28rem] md:h-[32rem] rounded-xl overflow-hidden shadow-lg border-2 border-blue-500 dark:border-blue-500 bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative aspect-square w-[75%] rounded-full overflow-hidden shadow-2xl ring-4 ring-white/80">
                  <CircleCropImage
                    src={example.beforeImage}
                    alt={labels.after}
                  />
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1.5 bg-blue-600 text-white rounded-full text-xs font-bold">
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

// 圆形裁剪效果组件
function CircleCropImage({ src, alt }: { src: string; alt: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessed, setIsProcessed] = useState(false);

  useEffect(() => {
    const processImage = async () => {
      if (!canvasRef.current) return;

      const img = new window.Image();
      img.crossOrigin = "anonymous";
      
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        const size = Math.max(img.width, img.height);
        canvas.width = size;
        canvas.height = size;

        // 清除画布（透明背景）
        ctx.clearRect(0, 0, size, size);

        // 创建圆形裁剪路径
        const centerX = size / 2;
        const centerY = size / 2;
        const radius = size / 2;

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // 计算图片绘制尺寸和位置（保持宽高比）
        const imgAspectRatio = img.width / img.height;
        let drawWidth: number;
        let drawHeight: number;
        let drawX: number;
        let drawY: number;

        if (imgAspectRatio > 1) {
          // 横向图片
          drawWidth = size;
          drawHeight = size / imgAspectRatio;
          drawX = 0;
          drawY = (size - drawHeight) / 2;
        } else {
          // 纵向或方形图片
          drawWidth = size * imgAspectRatio;
          drawHeight = size;
          drawX = (size - drawWidth) / 2;
          drawY = 0;
        }

        // 绘制图片
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

        setIsProcessed(true);
      };

      img.onerror = () => {
        console.error("Failed to load image:", src);
      };

      img.src = src;
    };

    processImage();
  }, [src]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
          isProcessed ? "opacity-100" : "opacity-0"
        }`}
      />
      {!isProcessed && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
          <div className="text-gray-400">Processing...</div>
        </div>
      )}
    </>
  );
}

