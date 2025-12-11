"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import Image from "next/image";

export default function Testimonials() {
  const t = useTranslations("WebpToPdf.testimonials");

  const testimonials = [
    {
      contentKey: "testimonial1.content",
      roleKey: "testimonial1.role",
      avatar: "/user-08-1.jpg",
    },
    {
      contentKey: "testimonial2.content",
      roleKey: "testimonial2.role",
      avatar: "/user-09-1.jpg",
    },
    {
      contentKey: "testimonial3.content",
      roleKey: "testimonial3.role",
      avatar: "/users-2.jpg",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* 左侧：标题和副标题 */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
              {t("title")}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {t("subtitle")}
            </p>
          </motion.div>

          {/* 右侧：评价卡片 */}
          <div className="space-y-6">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* 评分星星 */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 fill-blue-500 text-blue-500"
                    />
                  ))}
                </div>

                {/* 评价内容 */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {t(testimonial.contentKey)}
                </p>

                {/* 用户信息 */}
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
                    <Image
                      src={testimonial.avatar}
                      alt={t(testimonial.roleKey)}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {t(testimonial.roleKey)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

