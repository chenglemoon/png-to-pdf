"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQ() {
  const t = useTranslations("AspectRatioChanger.faq");

  const faqs = [
    { id: "q1", questionKey: "q1.question", answerKey: "q1.answer" },
    { id: "q2", questionKey: "q2.question", answerKey: "q2.answer" },
    { id: "q3", questionKey: "q3.question", answerKey: "q3.answer" },
    { id: "q4", questionKey: "q4.question", answerKey: "q4.answer" },
    { id: "q5", questionKey: "q5.question", answerKey: "q5.answer" },
    { id: "q6", questionKey: "q6.question", answerKey: "q6.answer" },
    { id: "q7", questionKey: "q7.question", answerKey: "q7.answer" },
    { id: "q8", questionKey: "q8.question", answerKey: "q8.answer" },
  ];

  return (
    <section id="faq-section" className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-12 lg:gap-16 items-start">
            {/* 左侧 - 标题 */}
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
              <p className="mt-4 text-base text-gray-600 dark:text-gray-400">
                {t("subtitle")}
              </p>
            </motion.div>

            {/* 右侧 - FAQ 列表 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map(({ id, questionKey, answerKey }, index) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <AccordionItem
                      value={id}
                      className="border-b border-gray-200 dark:border-gray-800 pb-4"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4 [&[data-state=open]>svg]:rotate-180">
                        <span className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                          {t(questionKey)}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-base text-gray-600 dark:text-gray-400 leading-relaxed pt-2 pb-4">
                        {t(answerKey)}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

