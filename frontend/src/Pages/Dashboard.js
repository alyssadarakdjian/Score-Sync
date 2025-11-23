import React, { useEffect, useState } from "react";
import axios from "axios";
import StatsCard from "../Components/dashboard/StatsCard";
import RecentGrades from "../Components/dashboard/RecentGrades";
import TopPerformers from "../Components/dashboard/TopPerformers";
import CourseOverview from "../Components/dashboard/CourseOverview";
import { BookOpen, GraduationCap, TrendingUp, Calendar } from "lucide-react";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user || !user._id) {
          console.warn("No user logged in");
          return;
        }

        const API_BASE = "http://127.0.0.1:5050/api";

        const coursesRes = await axios.get(`${API_BASE}/courses/user/${user._id}`);
        setCourses(coursesRes.data || []);
      } catch (error) {
        console.error("❌ Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  // Active courses
  const activeCourses = courses.filter(
    (c) =>
      c.status?.toLowerCase() === "active" ||
      c.Status?.toLowerCase() === "active"
  ).length;

  // Average grade
  const averageGrade =
    grades.length > 0
      ? (
          grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length
        ).toFixed(1)
      : 0;

  // Upcoming assignments
  const upcomingAssignments = grades.filter((g) => {
    if (!g.due_date) return false;
    return new Date(g.due_date) > new Date();
  }).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Courses"
          value={activeCourses}
          icon={BookOpen}
          color="green"
        />
        <StatsCard
          title="Total Grades"
          value={grades.length}
          icon={GraduationCap}
          color="purple"
        />
        <StatsCard
          title="Average Grade"
          value={`${averageGrade}%`}
          icon={TrendingUp}
          color="orange"
        />
        <StatsCard
          title="Upcoming Assignments"
          value={upcomingAssignments}
          icon={Calendar}
          color="blue"
        />
      </div>

      {/* Content Sections */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentGrades grades={grades.slice(0, 10)} />
        </div>
        <div className="space-y-6">
          <TopPerformers grades={grades} students={students} />
          <CourseOverview courses={courses} />
        </div>
      </div>
    </div>
  );
}