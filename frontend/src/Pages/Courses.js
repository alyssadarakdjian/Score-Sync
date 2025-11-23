import React, { useState } from "react";
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

  // Retrieve the logged-in user from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const userId = storedUser?._id;

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      if (!userId) return [];
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/courses/user/${userId}`);
      if (!res.ok) throw new Error('Failed to fetch user courses');
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create course");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setDialogOpen(false);
      setSelectedCourse(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ course_code, data }) => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/courses/${course_code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update course");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setDialogOpen(false);
      setSelectedCourse(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (course_code) => {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/courses/${course_code}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete course");
      return res.json();
    },
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
      updateMutation.mutate({ course_code: selectedCourse.course_code, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (course) => {
    setSelectedCourse(course);
    setDialogOpen(true);
  };

  const handleDelete = (course_code) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      deleteMutation.mutate(course_code);
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