import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const colorClasses = {
  blue: {
    bg: "bg-blue-500",
    light: "bg-blue-50",
    text: "text-blue-600"
  },
  green: {
    bg: "bg-green-500",
    light: "bg-green-50",
    text: "text-green-600"
  },
  purple: {
    bg: "bg-purple-500",
    light: "bg-purple-50",
    text: "text-purple-600"
  },
  orange: {
    bg: "bg-orange-500",
    light: "bg-orange-50",
    text: "text-orange-600"
  }
};

export default function StatsCard({ title, value, icon: Icon, color, link }) {
  const colors = colorClasses[color] || colorClasses.blue;

  const CardWrapper = link ? Link : "div";
  const cardProps = link ? { to: link } : {};

  return (
    <CardWrapper {...cardProps}>
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        transition={{ duration: 0.2 }}
        className="cursor-pointer"
      >
        <div className="relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white rounded-xl border border-gray-100 p-6">
          <div
            className={`absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8 ${colors.bg} rounded-full opacity-10`}
          />
          <div className="flex justify-between items-start relative z-10">
            <div>
              <p className="text-sm font-medium text-[#78909C] mb-1">{title}</p>
              <h2 className="text-3xl font-bold text-[#1A4D5E]">{value}</h2>
            </div>
            <div className={`p-3 rounded-xl ${colors.light}`}>
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
          </div>
        </div>
      </motion.div>
    </CardWrapper>
  );
}