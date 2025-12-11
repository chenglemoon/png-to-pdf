"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function ExamplesSection() {
  const t = useTranslations("PhotoToRounded.examples");

  const examples = [
    {
      title: t("example1.title"),
      description: t("example1.description"),
      beforeImage: "/pfpmaker-1.jpg",
      badge: t("example1.badge"),
      roundness: 30,
    },
    {
      title: t("example2.title"),
      description: t("example2.description"),
      beforeImage: "/pfpmaker-2.jpg",
      badge: t("example2.badge"),
      roundness: 50,
    },
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
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400 px-4 py-2 bg-blue-50 dark:bg-blue-950/30 rounded-full">
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
            <div className="relative h-[28rem] md:h-[32rem] rounded-xl overflow-hidden shadow-lg border-2 border-blue-500 dark:border-blue-500 bg-white dark:bg-gray-800">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div 
                  className="relative w-full h-full overflow-hidden shadow-2xl"
                  style={{
                    borderRadius: `${example.roundness}px`,
                  }}
                >
                  <RoundedImage
                    src={example.beforeImage}
                    alt={labels.after}
                    roundness={example.roundness}
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

// 圆角效果组件
function RoundedImage({ src, alt, roundness }: { src: string; alt: string; roundness: number }) {
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

        const { width, height } = img;
        canvas.width = width;
        canvas.height = height;

        ctx.save();
        ctx.beginPath();
        
        // 绘制圆角矩形路径
        const r = roundness;
        ctx.moveTo(r, 0);
        ctx.lineTo(width - r, 0);
        ctx.arc(width - r, r, r, 1.5 * Math.PI, 2 * Math.PI);
        ctx.lineTo(width, height - r);
        ctx.arc(width - r, height - r, r, 0, 0.5 * Math.PI);
        ctx.lineTo(r, height);
        ctx.arc(r, height - r, r, 0.5 * Math.PI, 1 * Math.PI);
        ctx.lineTo(0, r);
        ctx.arc(r, r, r, 1 * Math.PI, 1.5 * Math.PI);
        ctx.closePath();
        
        // 剪切并绘制图片
        ctx.clip();
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();

        setIsProcessed(true);
      };

      img.onerror = () => {
        console.error("Failed to load image:", src);
      };

      img.src = src;
    };

    processImage();
  }, [src, roundness]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover ${isProcessed ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
        style={{ display: isProcessed ? 'block' : 'none' }}
      />
      {!isProcessed && (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      )}
    </>
  );
}


