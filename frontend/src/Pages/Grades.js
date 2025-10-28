import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Plus, Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import GradeTable from "../Components/grades/GradeTable";
import GradeDialog from "../Components/grades/GradeDialog";

export default function Grades() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const queryClient = useQueryClient();

  const { data: grades = [], isLoading: gradesLoading } = useQuery({
    queryKey: ['grades'],
    queryFn: () => base44.entities.Grade.list('-created_date'),
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const percentage = (data.score / data.max_score) * 100;
      let letterGrade = 'F';
      if (percentage >= 97) letterGrade = 'A+';
      else if (percentage >= 93) letterGrade = 'A';
      else if (percentage >= 90) letterGrade = 'A-';
      else if (percentage >= 87) letterGrade = 'B+';
      else if (percentage >= 83) letterGrade = 'B';
      else if (percentage >= 80) letterGrade = 'B-';
      else if (percentage >= 77) letterGrade = 'C+';
      else if (percentage >= 73) letterGrade = 'C';
      else if (percentage >= 70) letterGrade = 'C-';
      else if (percentage >= 67) letterGrade = 'D+';
      else if (percentage >= 63) letterGrade = 'D';
      else if (percentage >= 60) letterGrade = 'D-';
      
      return base44.entities.Grade.create({
        ...data,
        percentage,
        letter_grade: letterGrade,
        graded_date: new Date().toISOString().split('T')[0]
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      setDialogOpen(false);
      setSelectedGrade(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => {
      const percentage = (data.score / data.max_score) * 100;
      let letterGrade = 'F';
      if (percentage >= 97) letterGrade = 'A+';
      else if (percentage >= 93) letterGrade = 'A';
      else if (percentage >= 90) letterGrade = 'A-';
      else if (percentage >= 87) letterGrade = 'B+';
      else if (percentage >= 83) letterGrade = 'B';
      else if (percentage >= 80) letterGrade = 'B-';
      else if (percentage >= 77) letterGrade = 'C+';
      else if (percentage >= 73) letterGrade = 'C';
      else if (percentage >= 70) letterGrade = 'C-';
      else if (percentage >= 67) letterGrade = 'D+';
      else if (percentage >= 63) letterGrade = 'D';
      else if (percentage >= 60) letterGrade = 'D-';
      
      return base44.entities.Grade.update(id, {
        ...data,
        percentage,
        letter_grade: letterGrade
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
      setDialogOpen(false);
      setSelectedGrade(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Grade.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grades'] });
    },
  });

  const filteredGrades = grades.filter(grade => {
    const matchesSearch = `${grade.student_name} ${grade.course_name} ${grade.assignment_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'all' || grade.course_id === filterCourse;
    const matchesType = filterType === 'all' || grade.assignment_type === filterType;
    return matchesSearch && matchesCourse && matchesType;
  });

  const handleSave = (data) => {
    if (selectedGrade) {
      updateMutation.mutate({ id: selectedGrade.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (grade) => {
    setSelectedGrade(grade);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this grade?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D5E]">Grade Management</h2>
          <p className="text-[#78909C] mt-1">Record and manage student grades</p>
        </div>
        <Button
          onClick={() => {
            setSelectedGrade(null);
            setDialogOpen(true);
          }}
          className="bg-[#00796B] hover:bg-[#00695C] shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Grade
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#78909C] w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by student, course, or assignment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white border-2 border-gray-200 focus:border-[#00796B]"
          />
        </div>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-full md:w-48 h-12 bg-white border-2">
            <SelectValue placeholder="Filter by course" />
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
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-48 h-12 bg-white border-2">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Homework">Homework</SelectItem>
            <SelectItem value="Quiz">Quiz</SelectItem>
            <SelectItem value="Test">Test</SelectItem>
            <SelectItem value="Midterm">Midterm</SelectItem>
            <SelectItem value="Final Exam">Final Exam</SelectItem>
            <SelectItem value="Project">Project</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <GradeTable
        grades={filteredGrades}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={gradesLoading}
      />

      <GradeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        grade={selectedGrade}
        students={students}
        courses={courses}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}