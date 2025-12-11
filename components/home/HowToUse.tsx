"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import Image from "next/image";
import { Plus } from "lucide-react";

export default function HowToUse() {
  const t = useTranslations("Home.howToUse");

  const steps = [
    {
      label: "step1.label",
      titleKey: "step1.title",
      descKey: "step1.description",
      images: [
        "/what-is-spider-png-to-pdf.webp",
        "/harry_potter_png-to-pdf.webp"
      ],
      arrowPosition: { bottom: "10px", right: "10px" }, // 从卡片底部右侧角落指向加号图标
      arrowDirection: "up-left", // 从右下指向左上（指向加号）
      delay: 0.1,
    },
    {
      label: "step2.label",
      titleKey: "step2.title",
      descKey: "step2.description",
      images: [
        "/what-is-spider-png-to-pdf.webp",
        "/harry_potter_png-to-pdf.webp"
      ],
      arrowPosition: { bottom: "10px", right: "10px" }, // 从卡片底部右侧角落指向转换按钮
      arrowDirection: "up-left", // 从右下指向左上
      delay: 0.2,
    },
    {
      label: "step3.label",
      titleKey: "step3.title",
      descKey: "step3.description",
      images: [
        "/what-is-spider-png-to-pdf.webp",
        "/harry_potter_png-to-pdf.webp"
      ],
      arrowPosition: { bottom: "10px", right: "10px" }, // 从卡片底部右侧角落指向下载按钮
      arrowDirection: "up-left", // 从右下指向左上
      delay: 0.3,
    },
  ];

  // 黄色箭头 SVG 组件 - 从右下指向左上，匹配图片中的样式
  const YellowArrow = ({ direction = "up-left", targetIndex = 0 }: { direction?: string; targetIndex?: number }) => {
    // 根据目标位置调整箭头终点
    // 步骤1：指向加号（右侧中间偏上）
    // 步骤2：指向转换按钮区域（中间偏下）
    // 步骤3：指向下载按钮（底部中间）
    let endX = 30;
    let endY = 30;
    
    if (targetIndex === 0) {
      // 步骤1：指向加号图标（右侧中间）
      endX = 35;
      endY = 25;
    } else if (targetIndex === 1) {
      // 步骤2：指向转换按钮区域（中间偏下）
      endX = 30;
      endY = 40;
    } else {
      // 步骤3：指向下载按钮（底部中间）
      endX = 30;
      endY = 50;
    }
    
    return (
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        className="absolute"
        style={{ 
          filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.4))"
        }}
      >
        {/* 粗箭头主体 - 从右下(90,90)指向目标位置 */}
        <path
          d={`M90,90 L${endX},${endY}`}
          stroke="#FCD34D"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* 箭头头部 */}
        <path
          d={`M${endX},${endY} L${endX + 8},${endY - 5} M${endX},${endY} L${endX + 8},${endY + 5}`}
          stroke="#FCD34D"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <section id="how-to-use-section" className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        {/* 标题和副标题 */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm md:text-base font-medium text-teal-600 dark:text-teal-400 mb-2 uppercase tracking-wide"
          >
            {t("label")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white"
          >
            {t("title")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-gray-600 dark:text-gray-400"
          >
            {t("subtitle")}
          </motion.p>
        </div>

        {/* 步骤卡片 */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: step.delay }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col"
            >
              {/* 步骤标签 - 紫色/粉色，粗体 */}
              <div className="mb-4">
                <h3 className="text-lg md:text-xl font-bold text-purple-600 dark:text-purple-400 mb-3">
                  {t(step.titleKey)}
                </h3>
              </div>

              {/* UI Mockup 图片容器 */}
              <div className="relative mb-4 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 p-4">
                <div className="relative w-full" style={{ aspectRatio: "16/10" }}>
                  {/* 图片预览区域 */}
                  <div className="flex gap-2 mb-3">
                    {step.images.map((img, imgIndex) => (
                      <div
                        key={imgIndex}
                        className="relative flex-1 h-20 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600 overflow-hidden"
                      >
                        <Image
                          src={img}
                          alt={`Preview ${imgIndex + 1}`}
                          fill
                          className="object-contain p-1"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                    ))}
                    {/* 上传区域 */}
                    <div className="relative flex-1 h-20 bg-white dark:bg-gray-800 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  </div>
                  
                  {/* 控制按钮区域（仅步骤2和3显示） */}
                  {(index === 1 || index === 2) && (
                    <div className="flex gap-2 mb-2">
                      <div className="flex-1 h-8 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600"></div>
                      <div className="flex-1 h-8 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600"></div>
                    </div>
                  )}
                  
                  {/* 下载按钮（仅步骤3显示） */}
                  {index === 2 && (
                    <div className="w-full h-10 bg-purple-600 dark:bg-purple-700 rounded flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">DOWNLOAD PDF</span>
                    </div>
                  )}
                  
                  {/* 黄色箭头指示器 */}
                  <div
                    className="absolute z-10 pointer-events-none"
                    style={step.arrowPosition}
                  >
                    <YellowArrow direction={step.arrowDirection} targetIndex={index} />
                  </div>
                </div>
              </div>

              {/* 描述文字 */}
              <p className="text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {t(step.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
