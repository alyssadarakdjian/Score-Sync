import React, { useEffect, useState } from "react";
import axios from "axios";
import StatsCard from "../Components/dashboard/StatsCard";
import RecentGrades from "../Components/dashboard/RecentGrades";
import CourseOverview from "../Components/dashboard/CourseOverview";
import { BookOpen, GraduationCap, TrendingUp, Calendar } from "lucide-react";

export default function Dashboard() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userEmail = localStorage.getItem('scoreSyncEmail');
        console.log('Dashboard - User Email:', userEmail);
        
        // Fetch user info to get user ID
        const userRes = await axios.get(`/api/auth/user?email=${encodeURIComponent(userEmail)}`);
        const userId = userRes.data.user._id;
        console.log('Dashboard - User ID:', userId);
        
        // Fetch courses and grades
        const [coursesRes, gradesRes] = await Promise.all([
          axios.get("/api/admin-courses", {
            headers: { 'X-User-Email': userEmail }
          }),
          axios.get(`/api/course-grades/student/${userId}`)
        ]);
        
        console.log('Dashboard - Courses:', coursesRes.data);
        console.log('Dashboard - Grades:', gradesRes.data);
        
        setCourses(coursesRes.data?.courses || []);
        setGrades(gradesRes.data?.grades || []);
        setStudents([]);
        
        // Fetch assignments for the user
        try {
          const assignmentsRes = await axios.get(`/api/assignments/${userId}`);
          console.log('Dashboard - Assignments:', assignmentsRes.data);
          setAssignments(assignmentsRes.data || []);
        } catch (assignmentError) {
          console.log('Assignments endpoint not available, setting empty array');
          setAssignments([]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const activeCourses = courses.filter((c) => c.status === "active").length;
  
  // Count total grade items across all courses
  const totalGradeItems = grades.reduce((sum, gradeRecord) => {
    return sum + (gradeRecord.gradeItems?.length || 0);
  }, 0);
  
  // Calculate average grade across all courses
  const averageGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + (g.overallGrade || 0), 0) / grades.length).toFixed(1)
    : 0;
  
  // Count upcoming assignments due within 7 days
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);
  
  const upcomingAssignments = assignments.filter((assignment) => {
    if (!assignment.dueDate || assignment.completed) return false;
    const dueDate = new Date(assignment.dueDate);
    return dueDate >= today && dueDate <= sevenDaysFromNow;
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
          value={totalGradeItems}
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
          <CourseOverview courses={courses} />
        </div>
      </div>
    </div>
  );
}