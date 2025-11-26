import React from "react";
import { BookOpen } from "lucide-react";

const subjectColors = {
  Mathematics: "bg-blue-100 text-blue-800",
  Science: "bg-green-100 text-green-800",
  English: "bg-purple-100 text-purple-800",
  History: "bg-orange-100 text-orange-800",
  "Foreign Language": "bg-pink-100 text-pink-800",
  "Physical Education": "bg-red-100 text-red-800",
  Arts: "bg-yellow-100 text-yellow-800",
  "Computer Science": "bg-indigo-100 text-indigo-800"
};

export default function CourseOverview({ courses }) {
  // Show all active courses (no limit)
  const activeCourses = courses.filter((c) => c.status === "active");

  return (
    <div className="shadow-lg border border-gray-100 bg-white rounded-xl overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-4">
        <h2 className="text-xl font-bold text-[#1A4D5E]">Active Courses</h2>
      </div>

      <div className="p-6">
        {activeCourses.length === 0 ? (
          <p className="text-center text-[#78909C] py-4">No active courses</p>
        ) : (
          <div className="space-y-3">
            {activeCourses.map((course) => (
              <div
                key={course._id || course.id}
                className="p-3 rounded-lg border border-gray-100 hover:border-[#00796B] hover:bg-[#E0F2F1] transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#E0F2F1] rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-[#00796B]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[#37474F] truncate">
                      {course.course_name}
                    </p>
                    <p className="text-xs text-[#78909C] truncate">
                      {course.teacher_name}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          subjectColors[course.subject] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {course.subject}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}