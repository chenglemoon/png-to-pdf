"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const t = useTranslations("PdfToJpg.faq");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { id: "q1", questionKey: "q1.question", answerKey: "q1.answer" },
    { id: "q2", questionKey: "q2.question", answerKey: "q2.answer" },
    { id: "q3", questionKey: "q3.question", answerKey: "q3.answer" },
  ];

  const toggleQuestion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq-section" className="py-24 md:py-40 lg:py-48 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* 标题区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16 md:mb-20"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              {t("title")}
            </h2>
          </motion.div>

          {/* FAQ 列表 */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {faqs.map(({ id, questionKey, answerKey }, index) => {
              const isOpen = openIndex === index;
              return (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  {/* 问题按钮 */}
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg px-6 md:px-8 py-5 md:py-6 flex items-center justify-between hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-left"
                  >
                    <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white pr-8">
                      {t(questionKey)}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="h-6 w-6 text-gray-600 dark:text-gray-400 shrink-0" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-gray-600 dark:text-gray-400 shrink-0" />
                    )}
                  </button>

                  {/* 答案内容 */}
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 px-6 md:px-8 pb-6"
                    >
                      <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                        {t(answerKey)}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

