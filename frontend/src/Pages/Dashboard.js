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
        const [studentsRes, coursesRes, gradesRes] = await Promise.all([
          axios.get("/api/students"),
          axios.get("/api/courses"),
          axios.get("/api/grades"),
        ]);

        setStudents(studentsRes.data || []);
        setCourses(coursesRes.data || []);
        setGrades(gradesRes.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const activeCourses = courses.filter((c) => c.status === "active").length;
  const averageGrade =
    grades.length > 0
      ? (
          grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / grades.length
        ).toFixed(1)
      : 0;
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