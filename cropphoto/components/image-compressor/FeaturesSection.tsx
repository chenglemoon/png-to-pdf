"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { 
  Archive,
  Trophy,
  Zap,
  Image as ImageIcon,
  ShieldCheck,
  Heart
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function FeaturesSection() {
  const t = useTranslations("ImageCompressor.features");

  const features = [
    {
      icon: Archive,
      titleKey: "perfectQuality.title",
      descKey: "perfectQuality.description",
    },
    {
      icon: Trophy,
      titleKey: "bestCompression.title",
      descKey: "bestCompression.description",
    },
    {
      icon: Zap,
      titleKey: "easyToUse.title",
      descKey: "easyToUse.description",
    },
    {
      icon: ImageIcon,
      titleKey: "imageFormats.title",
      descKey: "imageFormats.description",
    },
    {
      icon: ShieldCheck,
      titleKey: "privacyGuaranteed.title",
      descKey: "privacyGuaranteed.description",
    },
    {
      icon: Heart,
      titleKey: "itsFree.title",
      descKey: "itsFree.description",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <feature.icon className="w-8 h-8 text-gray-900 dark:text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      {t(feature.descKey)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


