import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../Components/ui/table";

export default function StudentGrades() {
  const { courseId, studentId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [newGradeName, setNewGradeName] = useState("");
  const [newGradeScore, setNewGradeScore] = useState("");
  const [newGradeMax, setNewGradeMax] = useState("100");
  const [newGradeWeight, setNewGradeWeight] = useState("1");
  const [comments, setComments] = useState("");

  // Fetch course info
  const { data: course } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const res = await fetch(`/api/admin-courses/${courseId}`);
      if (!res.ok) throw new Error('Failed to fetch course');
      const json = await res.json();
      return json.course;
    },
  });

  // Fetch student info
  const { data: student } = useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      const res = await fetch(`/api/auth/user?email=${studentId}`);
      if (!res.ok) {
        // Try fetching by ID instead
        const allStudents = await fetch('/api/auth/students');
        const studentsData = await allStudents.json();
        const found = studentsData.students.find(s => s._id === studentId);
        return found;
      }
      const json = await res.json();
      return json.user;
    },
  });

  // Fetch grade record
  const { data: gradeRecord, isLoading } = useQuery({
    queryKey: ['student-grade', courseId, studentId],
    queryFn: async () => {
      const res = await fetch(`/api/course-grades/course/${courseId}/student/${studentId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.grade;
    },
  });

  // Add grade item mutation
  const addGradeItemMutation = useMutation({
    mutationFn: async (item) => {
      const res = await fetch(`/api/course-grades/course/${courseId}/student/${studentId}/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': localStorage.getItem('scoreSyncEmail') || ''
        },
        body: JSON.stringify(item)
      });
      if (!res.ok) throw new Error('Failed to add grade item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-grade', courseId, studentId] });
      setNewGradeName("");
      setNewGradeScore("");
      setNewGradeMax("100");
      setNewGradeWeight("1");
    },
  });

  // Save comments mutation
  const saveCommentsMutation = useMutation({
    mutationFn: async () => {
      const gradeItems = gradeRecord?.gradeItems || [];
      const res = await fetch(`/api/course-grades/course/${courseId}/student/${studentId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': localStorage.getItem('scoreSyncEmail') || ''
        },
        body: JSON.stringify({ gradeItems, comments })
      });
      if (!res.ok) throw new Error('Failed to save comments');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-grade', courseId, studentId] });
    },
  });

  // Delete grade item mutation
  const deleteGradeItemMutation = useMutation({
    mutationFn: async (itemId) => {
      const res = await fetch(`/api/course-grades/grade/${gradeRecord._id}/item/${itemId}`, {
        method: 'DELETE',
        headers: {
          'X-User-Email': localStorage.getItem('scoreSyncEmail') || ''
        }
      });
      if (!res.ok) throw new Error('Failed to delete grade item');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-grade', courseId, studentId] });
    },
  });

  const handleAddGradeItem(e = {}) {
    e.preventDefault?.();
    if (newGradeName && newGradeScore) {
      addGradeItemMutation.mutate({
        name: newGradeName,
        grade: parseFloat(newGradeScore),
        maxGrade: parseFloat(newGradeMax),
        weight: parseFloat(newGradeWeight)
      });
    }
  }

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Delete this grade item?')) {
      deleteGradeItemMutation.mutate(itemId);
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(`/Courses/${courseId}`)}
          className="hover:bg-[#E0F2F1]"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-[#1A4D5E]">Manage Student Grades</h2>
          <p className="text-[#78909C] mt-1">
            {course?.course_name} ({course?.course_code}) • {student?.fullname || 'Student'}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-[#00796B]">
            {gradeRecord?.overallGrade?.toFixed(1) || '0.0'}%
          </div>
          <div className="text-lg font-semibold text-[#546E7A]">
            {gradeRecord?.letterGrade || 'No Grade'}
          </div>
        </div>
      </div>

      {/* Add Grade Item Form */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-bold text-[#1A4D5E]">Add Grade Item</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleAddGradeItem} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Assignment name"
                value={newGradeName}
                onChange={(e) => setNewGradeName(e.target.value)}
                required
                className="border-2 focus:border-[#00796B]"
              />
              <Input
                type="number"
                placeholder="Score"
                value={newGradeScore}
                onChange={(e) => setNewGradeScore(e.target.value)}
                required
                step="0.01"
                className="border-2 focus:border-[#00796B]"
              />
              <Input
                type="number"
                placeholder="Max score"
                value={newGradeMax}
                onChange={(e) => setNewGradeMax(e.target.value)}
                required
                step="0.01"
                className="border-2 focus:border-[#00796B]"
              />
              <Input
                type="number"
                placeholder="Weight"
                value={newGradeWeight}
                onChange={(e) => setNewGradeWeight(e.target.value)}
                required
                step="0.01"
                className="border-2 focus:border-[#00796B]"
              />
            </div>
            <Button
              type="submit"
              disabled={addGradeItemMutation.isPending}
              className="bg-[#00796B] hover:bg-[#00695C]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Grade Item
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Grade Items Table */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-bold text-[#1A4D5E]">Grade Items</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!gradeRecord || !gradeRecord.gradeItems || gradeRecord.gradeItems.length === 0 ? (
            <div className="text-center py-8 text-[#78909C]">No grade items yet</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#ECEFF1]">
                  <TableHead className="font-semibold text-[#546E7A]">Assignment</TableHead>
                  <TableHead className="font-semibold text-[#546E7A]">Score</TableHead>
                  <TableHead className="font-semibold text-[#546E7A]">Percentage</TableHead>
                  <TableHead className="font-semibold text-[#546E7A]">Weight</TableHead>
                  <TableHead className="font-semibold text-[#546E7A]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gradeRecord.gradeItems.map((item) => (
                  <TableRow key={item._id} className="hover:bg-[#F5F5F5]">
                    <TableCell className="font-medium text-[#37474F]">{item.name}</TableCell>
                    <TableCell className="text-[#546E7A]">
                      {item.grade}/{item.maxGrade}
                    </TableCell>
                    <TableCell className="font-semibold text-[#00796B]">
                      {((item.grade / item.maxGrade) * 100).toFixed(1)}%
                    </TableCell>
                    <TableCell className="text-[#546E7A]">{item.weight}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item._id)}
                        className="hover:bg-[#FFEBEE] hover:text-[#D32F2F]"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Comments */}
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-lg font-bold text-[#1A4D5E]">Comments</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <textarea
            value={comments || gradeRecord?.comments || ''}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Add comments about student performance..."
            className="w-full p-3 border-2 border-gray-200 rounded focus:border-[#00796B] focus:outline-none"
            rows={4}
          />
          <Button
            onClick={() => saveCommentsMutation.mutate()}
            disabled={saveCommentsMutation.isPending}
            className="mt-4 bg-[#00796B] hover:bg-[#00695C]"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Comments
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
