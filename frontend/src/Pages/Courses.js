import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Plus, Search } from "lucide-react";
import CourseTable from "../Components/courses/CourseTable";
import CourseDialog from "../Components/courses/CourseDialog";

export default function Courses() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: () => base44.entities.Course.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setDialogOpen(false);
      setSelectedCourse(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Course.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setDialogOpen(false);
      setSelectedCourse(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Course.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });

  const filteredCourses = courses.filter(course =>
    `${course.course_name} ${course.course_code} ${course.teacher_name} ${course.subject}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSave = (data) => {
    if (selectedCourse) {
      updateMutation.mutate({ id: selectedCourse.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D5E]">Course Management</h2>
          <p className="text-[#78909C] mt-1">Manage courses and class information</p>
        </div>
        <Button
          onClick={() => {
            setSelectedCourse(null);
            setDialogOpen(true);
          }}
          className="bg-[#00796B] hover:bg-[#00695C] shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#78909C] w-5 h-5" />
        <Input
          type="text"
          placeholder="Search courses by name, code, teacher, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 bg-white border-2 border-gray-200 focus:border-[#00796B]"
        />
      </div>

      <CourseTable
        courses={filteredCourses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={selectedCourse}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}