import React, { useState } from "react";
import { base44 } from "../api/base44Client";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TrendingUp, Users, Award } from "lucide-react";

const COLORS = ['#00796B', '#0097A7', '#00ACC1', '#00BCD4', '#26C6DA', '#4DD0E1'];

export default function Reports() {
  const [selectedCourse, setSelectedCourse] = useState("all");

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const { data: grades = [] } = useQuery({
    queryKey: ['grades'],
    queryFn: () => base44.entities.Grade.list(),
  });

  const filteredGrades = selectedCourse === "all" 
    ? grades 
    : grades.filter(g => g.course_id === selectedCourse);

  // Grade distribution data
  const gradeDistribution = [
    { grade: 'A (90-100)', count: filteredGrades.filter(g => g.percentage >= 90).length },
    { grade: 'B (80-89)', count: filteredGrades.filter(g => g.percentage >= 80 && g.percentage < 90).length },
    { grade: 'C (70-79)', count: filteredGrades.filter(g => g.percentage >= 70 && g.percentage < 80).length },
    { grade: 'D (60-69)', count: filteredGrades.filter(g => g.percentage >= 60 && g.percentage < 70).length },
    { grade: 'F (0-59)', count: filteredGrades.filter(g => g.percentage < 60).length },
  ];

  // Assignment type performance
  const assignmentTypeData = {};
  filteredGrades.forEach(grade => {
    if (!assignmentTypeData[grade.assignment_type]) {
      assignmentTypeData[grade.assignment_type] = { total: 0, count: 0 };
    }
    assignmentTypeData[grade.assignment_type].total += grade.percentage || 0;
    assignmentTypeData[grade.assignment_type].count += 1;
  });

  const assignmentPerformance = Object.keys(assignmentTypeData).map(type => ({
    type,
    average: (assignmentTypeData[type].total / assignmentTypeData[type].count).toFixed(1)
  }));

  // Course performance comparison
  const coursePerformance = courses.map(course => {
    const courseGrades = grades.filter(g => g.course_id === course.id);
    const average = courseGrades.length > 0
      ? courseGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / courseGrades.length
      : 0;
    return {
      name: course.course_code,
      average: average.toFixed(1),
      students: courseGrades.length
    };
  }).filter(c => c.students > 0);

  const activeStudents = students.filter(s => s.status === 'active').length;
  const averageGrade = filteredGrades.length > 0
    ? (filteredGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / filteredGrades.length).toFixed(1)
    : 0;

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
            {courses.map(course => (
              <SelectItem key={course.id} value={course.id}>
                {course.course_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-[#78909C]">Active Students</p>
                <p className="text-2xl font-bold text-[#1A4D5E]">{activeStudents}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg border-0 bg-white">
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
        
        <Card className="shadow-lg border-0 bg-white">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-[#78909C]">Total Grades</p>
                <p className="text-2xl font-bold text-[#1A4D5E]">{filteredGrades.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-[#1A4D5E]">Grade Distribution</CardTitle>
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
            <CardTitle className="text-xl font-bold text-[#1A4D5E]">Performance by Assignment Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={assignmentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
                <XAxis dataKey="type" stroke="#78909C" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#78909C" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="average" fill="#0097A7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-0 bg-white">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-[#1A4D5E]">Course Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={coursePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E0E0E0" />
              <XAxis dataKey="name" stroke="#78909C" />
              <YAxis stroke="#78909C" domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#00796B" 
                strokeWidth={3}
                dot={{ fill: '#00796B', r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}