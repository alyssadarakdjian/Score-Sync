import React from "react";
import { Trophy, Award, Medal } from "lucide-react";

export default function TopPerformers({ grades, students }) {
  const getTopPerformers = () => {
    const studentGrades = {};

    grades.forEach((grade) => {
      if (!studentGrades[grade.student_id]) {
        studentGrades[grade.student_id] = {
          name: grade.student_name,
          grades: [],
          average: 0
        };
      }
      studentGrades[grade.student_id].grades.push(grade.percentage || 0);
    });

    Object.keys(studentGrades).forEach((id) => {
      const list = studentGrades[id].grades;
      studentGrades[id].average = list.reduce((a, b) => a + b, 0) / list.length;
    });

    return Object.values(studentGrades)
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);
  };

  const topPerformers = getTopPerformers();
  const icons = [Trophy, Award, Medal];
  const colors = [
    { bg: "bg-yellow-100", text: "text-yellow-600" },
    { bg: "bg-gray-100", text: "text-gray-600" },
    { bg: "bg-orange-100", text: "text-orange-600" }
  ];

  return (
    <div className="shadow-lg border border-gray-100 bg-white rounded-xl overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-xl font-bold text-[#1A4D5E]">Top Performers</h2>
      </div>
      <div className="p-6">
        {topPerformers.length === 0 ? (
          <p className="text-center text-[#78909C] py-4">No data available</p>
        ) : (
          <div className="space-y-4">
            {topPerformers.map((performer, index) => {
              const Icon = icons[Math.min(index, 2)];
              const color = colors[Math.min(index, 2)];

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F5F5] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full ${color.bg} flex items-center justify-center`}
                    >
                      <Icon className={`w-5 h-5 ${color.text}`} />
                    </div>
                    <div>
                      <p className="font-semibold text-[#37474F]">
                        {performer.name}
                      </p>
                      <p className="text-xs text-[#78909C]">
                        {performer.grades.length} assignments
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-[#00796B]">
                      {performer.average.toFixed(1)}%
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}