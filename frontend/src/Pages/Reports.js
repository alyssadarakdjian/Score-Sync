import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Award } from "lucide-react";

const COLORS = ['#00796B', '#0097A7', '#00ACC1', '#00BCD4', '#26C6DA', '#4DD0E1'];

export default function Reports() {
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [user, setUser] = useState(null);
  const [grades, setGrades] = useState([]);
  const [courses, setCourses] = useState([]);

  const userEmail = localStorage.getItem("scoreSyncEmail");

  useEffect(() => {
    if (!userEmail) return;

    const fetchUserAndData = async () => {
      try {
        const { data: userData } = await axios.get(`/api/auth/user?email=${userEmail}`);
        setUser(userData.user);

        const { data: coursesData } = await axios.get("/api/admin-courses", {
          headers: { "X-User-Email": userEmail },
        });
        setCourses(coursesData?.courses || []);

        const { data: gradesData } = await axios.get(`/api/course-grades/student/${userData.user._id}`);
        setGrades(gradesData?.grades || gradesData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchUserAndData();
  }, [userEmail]);

  const filteredGrades = selectedCourse === "all"
    ? grades
    : grades.filter(g => {
        const courseObj = g.courseId || g.course_id;
        return (
          courseObj?._id === selectedCourse ||
          courseObj?.id === selectedCourse ||
          courseObj?.course_name === selectedCourse ||
          courseObj?.course_code === selectedCourse
        );
      });
  console.log("Filtered Grades:", filteredGrades);

  // Grade distribution data
  const gradeDistribution = [
    { grade: 'A (90-100)', count: filteredGrades.filter(g => g.overallGrade >= 90).length },
    { grade: 'B (80-89)', count: filteredGrades.filter(g => g.overallGrade >= 80 && g.overallGrade < 90).length },
    { grade: 'C (70-79)', count: filteredGrades.filter(g => g.overallGrade >= 70 && g.overallGrade < 80).length },
    { grade: 'D (60-69)', count: filteredGrades.filter(g => g.overallGrade >= 60 && g.overallGrade < 70).length },
    { grade: 'F (0-59)', count: filteredGrades.filter(g => g.overallGrade < 60).length },
  ];

  // Assignment distribution - individual assignment grades
  const assignmentDistribution = [];
  filteredGrades.forEach(gradeRecord => {
    if (gradeRecord.gradeItems && gradeRecord.gradeItems.length > 0) {
      gradeRecord.gradeItems.forEach(item => {
        const percentage = (item.grade / item.maxGrade) * 100;
        let category = 'F (0-59)';
        if (percentage >= 90) category = 'A (90-100)';
        else if (percentage >= 80) category = 'B (80-89)';
        else if (percentage >= 70) category = 'C (70-79)';
        else if (percentage >= 60) category = 'D (60-69)';
        
        const existing = assignmentDistribution.find(d => d.grade === category);
        if (existing) {
          existing.count += 1;
        } else {
          assignmentDistribution.push({ grade: category, count: 1 });
        }
      });
    }
  });

  // Sort by grade order
  const gradeOrder = ['A (90-100)', 'B (80-89)', 'C (70-79)', 'D (60-69)', 'F (0-59)'];
  assignmentDistribution.sort((a, b) => gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade));

  // Assignment type performance
  const assignmentTypeData = {};
  filteredGrades.forEach(grade => {
    if (!assignmentTypeData[grade.assignment_type]) {
      assignmentTypeData[grade.assignment_type] = { total: 0, count: 0 };
    }
    assignmentTypeData[grade.assignment_type].total += grade.overallGrade || 0;
    assignmentTypeData[grade.assignment_type].count += 1;
  });

  const assignmentPerformance = Object.keys(assignmentTypeData).map(type => ({
    type,
    average: (assignmentTypeData[type].total / assignmentTypeData[type].count).toFixed(1)
  }));

  // Course performance comparison
  const coursePerformance = courses.map(course => {
    const courseGrades = grades.filter(g => {
      const courseObj = g.courseId || g.course_id;
      return courseObj?._id === course._id || courseObj?.id === course._id;
    });
    
    const average = courseGrades.length > 0
      ? courseGrades.reduce((sum, g) => sum + (g.overallGrade || 0), 0) / courseGrades.length
      : 0;
    
    return {
      name: course.course_code || course.course_name,
      average: average.toFixed(1),
      students: courseGrades.length
    };
  }).filter(c => c.students > 0);

  const averageGrade = filteredGrades.length > 0
    ? (filteredGrades.reduce((sum, g) => sum + (g.overallGrade || 0), 0) / filteredGrades.length).toFixed(1)
    : 0;

  const totalGrades = filteredGrades.reduce((sum, record) => sum + (record.gradeItems?.length || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D5E]">Reports & Analytics</h2>
          <p className="text-[#78909C] mt-1">Visualize grade data and performance trends</p>
        </div>
        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
          <SelectTrigger className="w-full md:w-64 h-12 bg-white border-2">
            <SelectValue placeholder="Select course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {Array.isArray(courses) && courses.map(course => (
              <SelectItem key={course._id} value={course._id}>
                {course.course_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-white w-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-[#78909C]">Average Grade</p>
                <p className="text-2xl font-bold text-[#1A4D5E]">{averageGrade}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-white w-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-[#78909C]">Total Grades</p>
                <p className="text-2xl font-bold text-[#1A4D5E]">{totalGrades}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#1A4D5E]">Course Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="grade" stroke="#78909C" />
                <YAxis stroke="#78909C" />
                <Tooltip />
                <Bar dataKey="count" fill="#00796B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#1A4D5E]">Assignment Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assignmentDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="grade" stroke="#78909C" />
                <YAxis stroke="#78909C" />
                <Tooltip />
                <Bar dataKey="count" fill="#0097A7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}