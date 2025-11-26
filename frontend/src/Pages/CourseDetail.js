import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Badge } from "../Components/ui/badge";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../Components/ui/table";

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudentEmail, setSelectedStudentEmail] = useState("");
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Fetch course details
  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await fetch(`/api/admin-courses/${courseId}`);
      if (!res.ok) throw new Error('Failed to fetch course');
      const json = await res.json();
      return { ...json.course, id: json.course._id };
    },
  });

  // Fetch all students from users collection
  const { data: allStudents = [], isLoading: allStudentsLoading } = useQuery({
    queryKey: ['all-students'],
    queryFn: async () => {
      const res = await fetch('/api/auth/students');
      if (!res.ok) return [];
      const json = await res.json();
      console.log('All students loaded:', json.students);
      return json.students || [];
    },
  });

  // Fetch enrolled students
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ['course-students', courseId],
    queryFn: async () => {
      const res = await fetch(`/api/admin-courses/${courseId}/students`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.students || [];
    },
  });

  // Add student mutation
  const addStudentMutation = useMutation({
    mutationFn: async (studentEmail) => {
      const res = await fetch(`/api/admin-courses/${courseId}/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': localStorage.getItem('scoreSyncEmail') || ''
        },
        body: JSON.stringify({ studentEmail })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add student');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-students', courseId] });
      setSelectedStudentEmail("");
      setStudentSearchTerm("");
    },
  });

  // Remove student mutation
  const removeStudentMutation = useMutation({
    mutationFn: async (studentId) => {
      const res = await fetch(`/api/admin-courses/${courseId}/students/${studentId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': localStorage.getItem('scoreSyncEmail') || ''
        }
      });
      if (!res.ok) throw new Error('Failed to remove student');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-students', courseId] });
    },
  });

  const handleAddStudent = (e) => {
    e.preventDefault();
    console.log('Adding student:', selectedStudentEmail);
    if (selectedStudentEmail.trim()) {
      addStudentMutation.mutate(selectedStudentEmail.trim());
    }
  };

  const handleRemoveStudent = (studentId) => {
    if (window.confirm('Remove this student from the course?')) {
      removeStudentMutation.mutate(studentId);
    }
  };

  // Filter available students (not already enrolled)
  const enrolledEmails = new Set(students.map(s => s.email));
  const availableStudents = allStudents
    .filter(student => !enrolledEmails.has(student.email))
    .filter(student => 
      studentSearchTerm.trim() === "" ||
      `${student.fullname} ${student.email} ${student.studentId || ''}`
        .toLowerCase()
        .includes(studentSearchTerm.toLowerCase())
    );

  console.log('Available students:', availableStudents.length, 'Show dropdown:', showDropdown);

  const filteredStudents = students.filter(student =>
    `${student.fullname} ${student.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (courseLoading) {
    return <div className="p-6">Loading course...</div>;
  }

  if (!course) {
    return <div className="p-6">Course not found</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/Courses')}
          className="hover:bg-[#E0F2F1]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#1A4D5E]">{course.course_name}</h2>
          <p className="text-[#78909C] mt-1">
            {course.course_code} • {course.subject}
          </p>
        </div>
        <Badge className={course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
          {course.status}
        </Badge>
      </div>

      {/* Course Info Card */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-bold text-[#1A4D5E]">Course Information</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#78909C]">Description</p>
              <p className="text-[#37474F] mt-1">{course.description || 'No description'}</p>
            </div>
            <div>
              <p className="text-sm text-[#78909C]">Schedule</p>
              <p className="text-[#37474F] mt-1">{course.schedule || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-[#78909C]">Credits</p>
              <p className="text-[#37474F] mt-1">{course.credits || 0}</p>
            </div>
            <div>
              <p className="text-sm text-[#78909C]">Semester</p>
              <p className="text-[#37474F] mt-1">{course.semester || 'Not specified'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Section */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="border-b border-gray-100">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold text-[#1A4D5E]">
              Enrolled Students ({students.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {/* Add Student Form */}
          <form onSubmit={handleAddStudent} className="space-y-2">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={studentSearchTerm}
                  onChange={(e) => {
                    setStudentSearchTerm(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                  className="border-2 focus:border-[#00796B]"
                />
                {showDropdown && availableStudents.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {availableStudents.slice(0, 10).map((student) => (
                      <button
                        key={student._id}
                        type="button"
                        onClick={() => {
                          console.log('Selected student:', student);
                          setSelectedStudentEmail(student.email);
                          setStudentSearchTerm(`${student.fullname} (${student.email})`);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[#E0F2F1] transition-colors border-b last:border-b-0"
                      >
                        <div className="font-medium text-[#37474F]">{student.fullname}</div>
                        <div className="text-sm text-[#78909C]">{student.email} {student.studentId ? `• ${student.studentId}` : ''}</div>
                      </button>
                    ))}
                  </div>
                )}
                {showDropdown && studentSearchTerm && availableStudents.length === 0 && !allStudentsLoading && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg p-4 text-center text-[#78909C]">
                    No students found
                  </div>
                )}
              </div>
              <Button
                type="submit"
                disabled={addStudentMutation.isPending || !selectedStudentEmail}
                className="bg-[#00796B] hover:bg-[#00695C]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </div>
            {allStudentsLoading && (
              <p className="text-sm text-[#78909C]">Loading students...</p>
            )}
            {!allStudentsLoading && (
              <p className="text-xs text-[#78909C]">
                {allStudents.length} students available • {availableStudents.length} not enrolled
              </p>
            )}
          </form>

          {addStudentMutation.isError && (
            <p className="text-sm text-red-600">{addStudentMutation.error.message}</p>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#78909C] w-5 h-5" />
            <Input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-2 border-gray-200 focus:border-[#00796B]"
            />
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#ECEFF1]">
                  <TableHead className="font-semibold text-[#546E7A]">Name</TableHead>
                  <TableHead className="font-semibold text-[#546E7A]">Email</TableHead>
                  <TableHead className="font-semibold text-[#546E7A]">Student ID</TableHead>
                  <TableHead className="font-semibold text-[#546E7A]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-[#78909C]">
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-[#78909C]">
                      {searchTerm ? 'No students found' : 'No students enrolled yet'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents.map((student) => (
                    <TableRow key={student._id} className="hover:bg-[#F5F5F5] transition-colors">
                      <TableCell className="font-medium text-[#37474F]">{student.fullname}</TableCell>
                      <TableCell className="text-[#546E7A]">{student.email}</TableCell>
                      <TableCell className="text-[#546E7A]">{student.studentId}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveStudent(student._id)}
                          className="hover:bg-[#FFEBEE] hover:text-[#D32F2F]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
