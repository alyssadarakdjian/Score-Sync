import React from "react";
import { motion } from "framer-motion";

export default function RecentGrades({ grades }) {
  if (!grades || grades.length === 0) {
    return (
      <div className="p-4 rounded-lg shadow bg-white text-center text-gray-500">
        No recent grades available.
      </div>
    );
  }

  return (
    <motion.div
      className="p-4 rounded-lg shadow bg-white"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-lg font-semibold mb-4">Recent Grades</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-gray-600">
              <th className="py-2 px-3">Student</th>
              <th className="py-2 px-3">Course</th>
              <th className="py-2 px-3">Grade (%)</th>
              <th className="py-2 px-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((g, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{g.student_name || "N/A"}</td>
                <td className="py-2 px-3">{g.course_name || "N/A"}</td>
                <td className="py-2 px-3 font-medium text-green-600">
                  {g.percentage || 0}%
                </td>
                <td className="py-2 px-3 text-gray-500">{g.date || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}