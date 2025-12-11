"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronUp } from "lucide-react";

export default function FAQ() {
  const t = useTranslations("ProfilePictureMaker.faq");
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const faqs = [
    { id: "q1", questionKey: "q1.question", answerKey: "q1.answer" },
    { id: "q2", questionKey: "q2.question", answerKey: "q2.answer" },
    { id: "q3", questionKey: "q3.question", answerKey: "q3.answer" },
    { id: "q4", questionKey: "q4.question", answerKey: "q4.answer" },
    { id: "q5", questionKey: "q5.question", answerKey: "q5.answer" },
    { id: "q6", questionKey: "q6.question", answerKey: "q6.answer" },
  ];

  return (
    <section id="faq-section" className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr] gap-12 lg:gap-20 items-start">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:sticky lg:top-24"
            >
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                {t("title")}
              </h2>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1"
            >
              <div className="space-y-0">
                {faqs.map((faq, index) => {
                  const isExpanded = expandedItems.has(faq.id);
                  return (
                    <div key={faq.id} className="relative">
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full text-left py-5 pr-4 pl-0 flex items-start justify-between group hover:bg-gray-50 dark:hover:bg-gray-900/50 rounded-lg transition-colors duration-150"
                      >
                        <span className="text-base md:text-lg font-semibold text-gray-900 dark:text-white pr-6 flex-1 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {t(faq.questionKey)}
                        </span>
                        <ChevronUp 
                          className={`w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0 mt-0.5 transition-all duration-200 ${isExpanded ? 'text-purple-600 dark:text-purple-400' : 'rotate-180 group-hover:text-gray-700 dark:group-hover:text-gray-300'}`}
                        />
                      </button>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="pl-0 pr-4 pb-5"
                        >
                          <div className="pl-0">
                            <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                              {t(faq.answerKey)}
                            </p>
                          </div>
                        </motion.div>
                      )}
                      {index < faqs.length - 1 && (
                        <div className="border-t border-gray-100 dark:border-gray-800/80"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

