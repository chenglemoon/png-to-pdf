"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const ageGroups = [
  { age: "Infant (4–12 months)", sleep: "12–16 hours", icon: "👶", color: "bg-pink-50 border-pink-200 text-pink-800" },
  { age: "Toddler (1–2 years)", sleep: "11–14 hours", icon: "🧒", color: "bg-purple-50 border-purple-200 text-purple-800" },
  { age: "Preschool (3–5 years)", sleep: "10–13 hours", icon: "👦", color: "bg-blue-50 border-blue-200 text-blue-800" },
  { age: "School-age (6–12 years)", sleep: "9–12 hours", icon: "👧", color: "bg-green-50 border-green-200 text-green-800" },
  { age: "Teen (13–18 years)", sleep: "8–10 hours", icon: "👨‍🎓", color: "bg-yellow-50 border-yellow-200 text-yellow-800" },
  { age: "Adult (18+ years)", sleep: "At least 7 hours", icon: "👨‍💼", color: "bg-indigo-50 border-indigo-200 text-indigo-800" }
];

const insights = [
  {
    title: "Combine Age Requirements",
    description: "Use your age-specific sleep requirements with a sleep cycle calculator to find your ideal bedtime and wake-up time.",
    icon: "🕐"
  },
  {
    title: "90-Minute Cycles",
    description: "Adults should aim for at least 7 hours of sleep, ideally completing full 90-minute sleep cycles.",
    icon: "🔄"
  },
  {
    title: "Growth & Development",
    description: "Children and teens need more sleep to support growth, learning, and optimal health, so plan bedtimes accordingly.",
    icon: "📈"
  },
  {
    title: "Track & Optimize",
    description: "Tracking your sleep using this method helps you wake up feeling refreshed and energized.",
    icon: "💤"
  }
];

export default function UseCases() {
  const t = useTranslations("SleepCalculator.useCases");
  
  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {t("title")}
          </motion.h2>
          <motion.p
            className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
          >
            {t("subtitle")}
          </motion.p>
          <motion.p
            className="text-lg text-gray-700 max-w-4xl mx-auto mt-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Health authorities, such as the <strong>American Academy of Sleep Medicine (AASM)</strong>, provide general sleep guidelines for all age groups based on scientific research and expert knowledge.
          </motion.p>
        </div>

        {/* Age Sleep Requirements Table */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
              <h3 className="text-2xl font-bold text-white text-center">Sleep Requirements by Age</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Age Group</th>
                    <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900">Recommended Amount of Sleep</th>
                  </tr>
                </thead>
                <tbody>
                  {ageGroups.map((group, index) => (
                    <motion.tr
                      key={index}
                      className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{group.icon}</span>
                          <span className="text-lg font-medium text-gray-800">{group.age}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-2 rounded-full text-lg font-semibold ${group.color}`}>
                          {group.sleep}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* How to Use Section */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">How to Use This With a Sleep Cycle Calculator</h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl mb-4 text-center">{insight.icon}</div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3 text-center">{insight.title}</h4>
                <p className="text-gray-600 leading-relaxed text-center">{insight.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Information */}
        <motion.div
          className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-200"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <div className="text-center">
            <div className="text-4xl mb-4">💡</div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">Pro Tip</h4>
            <p className="text-lg text-gray-700 leading-relaxed max-w-3xl mx-auto">
              Tracking your sleep using this method can help you wake up feeling refreshed and energized, while ensuring sufficient sleep duration by age. Remember that individual sleep needs may vary, so use these guidelines as a starting point and adjust based on how you feel.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}