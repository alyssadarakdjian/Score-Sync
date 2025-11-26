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

  // Flatten all grade items from all courses and sort by date
  const allGradeItems = [];
  grades.forEach(gradeRecord => {
    if (gradeRecord.gradeItems && gradeRecord.gradeItems.length > 0) {
      gradeRecord.gradeItems.forEach(item => {
        allGradeItems.push({
          name: item.name,
          grade: item.grade,
          maxGrade: item.maxGrade,
          percentage: ((item.grade / item.maxGrade) * 100).toFixed(1),
          date: item.date || gradeRecord.updatedAt || gradeRecord.createdAt,
          courseName: gradeRecord.courseId?.course_name || 'Unknown Course'
        });
      });
    }
  });

  // Sort by date, most recent first
  allGradeItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Take only the 7 most recent
  const recentGrades = allGradeItems.slice(0, 7);

  if (recentGrades.length === 0) {
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
              <th className="py-2 px-3">Assignment</th>
              <th className="py-2 px-3">Course</th>
              <th className="py-2 px-3">Score</th>
              <th className="py-2 px-3">Grade (%)</th>
              <th className="py-2 px-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentGrades.map((item, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3 font-medium">{item.name}</td>
                <td className="py-2 px-3">{item.courseName}</td>
                <td className="py-2 px-3">{item.grade}/{item.maxGrade}</td>
                <td className="py-2 px-3 font-medium text-green-600">
                  {item.percentage}%
                </td>
                <td className="py-2 px-3 text-gray-500">
                  {new Date(item.date).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}