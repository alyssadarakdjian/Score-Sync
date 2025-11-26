import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Plus, Search } from "lucide-react";
import CourseTable from "../Components/courses/CourseTable";
import CourseDialog from "../Components/courses/CourseDialog";

export default function Courses({ readOnly = false, teacherEmail = '', isAdmin = false }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses', { admin: isAdmin }],
    queryFn: async () => {
      if (isAdmin) {
        const res = await fetch('/api/admin-courses');
        if (!res.ok) return [];
        const json = await res.json();
        return (json.courses || []).map(c => ({ ...c, id: c._id }));
      }
      // Non-admin (student) still reads admin courses read-only for now
      const res = await fetch('/api/admin-courses');
      if (!res.ok) return [];
      const json = await res.json();
      return (json.courses || []).map(c => ({ ...c, id: c._id }));
      // If you want to keep Base44 for students instead, replace with base44.entities.Course.list('-created_date')
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      if (!isAdmin) return Promise.reject(new Error('Not authorized'));
      const res = await fetch('/api/admin-courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': localStorage.getItem('scoreSyncEmail') || ''
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to create course');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', { admin: isAdmin }] });
      setDialogOpen(false);
      setSelectedCourse(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      if (!isAdmin) return Promise.reject(new Error('Not authorized'));
      const res = await fetch(`/api/admin-courses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': localStorage.getItem('scoreSyncEmail') || ''
        },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update course');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', { admin: isAdmin }] });
      setDialogOpen(false);
      setSelectedCourse(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      if (!isAdmin) return Promise.reject(new Error('Not authorized'));
      const res = await fetch(`/api/admin-courses/${id}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': localStorage.getItem('scoreSyncEmail') || ''
        }
      });
      if (!res.ok) throw new Error('Failed to delete course');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', { admin: isAdmin }] });
    },
  });

  const filteredCourses = courses
    .filter(course =>
      `${course.course_name} ${course.course_code} ${course.teacher_name} ${course.subject}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .filter(course => {
      // If teacherEmail provided (admin/teacher), optionally show only their courses
      if (teacherEmail && readOnly === false) return true; // admin sees all for now
      if (teacherEmail && readOnly === true) {
        // student view: just show courses (no restriction). Could refine later.
        return true;
      }
      return true;
    });

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
        {!readOnly && (
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
        )}
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
        readOnly={readOnly}
      />

      {!readOnly && (
        <CourseDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          course={selectedCourse}
          onSave={handleSave}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}