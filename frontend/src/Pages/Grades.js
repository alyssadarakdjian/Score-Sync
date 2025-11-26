import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../Components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../Components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Components/ui/select";

export default function Grades({ readOnly = false }) {
  const [selectedCourseId, setSelectedCourseId] = useState("all");
  const [addGradeDialogOpen, setAddGradeDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [gradeName, setGradeName] = useState("");
  const [totalPoints, setTotalPoints] = useState("");
  const [pointsEarned, setPointsEarned] = useState("");
  const queryClient = useQueryClient();

  const userEmail = localStorage.getItem('scoreSyncEmail') || '';
  const isAdmin = localStorage.getItem('scoreSyncRole') === 'admin';

  // Fetch user's courses
  const { data: courses = [] } = useQuery({
    queryKey: ['user-courses'],
    queryFn: async () => {
      const res = await fetch('/api/admin-courses', {
        headers: { 'X-User-Email': userEmail }
      });
      if (!res.ok) return [];
      const json = await res.json();
      return (json.courses || []).map(c => ({ ...c, id: c._id }));
    },
  });

  // Fetch grades - either for selected course or all courses
  const {
    data: grades = [],
    isLoading: gradesLoading,
  } = useQuery({
    queryKey: ["course-grades", selectedCourseId],
    queryFn: async () => {
      if (!userEmail) return [];
      
      // Get user ID first
      const userRes = await fetch(`/api/auth/user?email=${encodeURIComponent(userEmail)}`);
      if (!userRes.ok) return [];
      const userData = await userRes.json();
      const userId = userData.user._id;

      if (isAdmin && selectedCourseId && selectedCourseId !== 'all') {
        // Admin viewing specific course
        const res = await fetch(`/api/course-grades/course/${selectedCourseId}`, {
          headers: { 'X-User-Email': userEmail }
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.grades || [];
      } else if (!isAdmin) {
        // Student viewing their grades
        const res = await fetch(`/api/course-grades/student/${userId}`);
        if (!res.ok) return [];
        const json = await res.json();
        const allGrades = json.grades || [];
        
        // Filter by selected course if not "all"
        if (selectedCourseId && selectedCourseId !== 'all') {
          return allGrades.filter(g => g.courseId._id === selectedCourseId);
        }
        return allGrades;
      }
      
      return [];
    },
  });

  // Fetch enrolled students for the selected course (admin only)
  const { data: enrolledStudents = [] } = useQuery({
    queryKey: ['enrolled-students', selectedCourseId],
    queryFn: async () => {
      if (!isAdmin || !selectedCourseId || selectedCourseId === 'all') return [];
      
      const res = await fetch(`/api/admin-courses/${selectedCourseId}/students`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.students || [];
    },
    enabled: isAdmin && selectedCourseId !== 'all',
  });

  // Add grade mutation
  const addGradeMutation = useMutation({
    mutationFn: async ({ studentId, gradeData }) => {
      const res = await fetch(`/api/course-grades/course/${selectedCourseId}/student/${studentId}/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': userEmail
        },
        body: JSON.stringify(gradeData)
      });
      if (!res.ok) throw new Error('Failed to add grade');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course-grades', selectedCourseId] });
      setAddGradeDialogOpen(false);
      setSelectedStudent(null);
      setGradeName("");
      setTotalPoints("");
      setPointsEarned("");
    },
  });

  const handleAddGrade = (e) => {
    e.preventDefault();
    if (selectedStudent && gradeName && totalPoints && pointsEarned) {
      addGradeMutation.mutate({
        studentId: selectedStudent._id,
        gradeData: {
          name: gradeName,
          grade: parseFloat(pointsEarned),
          maxGrade: parseFloat(totalPoints),
          weight: 1
        }
      });
    }
  };

  const openAddGradeDialog = (student) => {
    setSelectedStudent(student);
    setAddGradeDialogOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D5E]">
            {isAdmin ? 'Student Grades by Course' : 'My Grades'}
          </h2>
          <p className="text-[#78909C] mt-1">
            {isAdmin ? 'View student performance in each course' : 'View your grades across all courses'}
          </p>
        </div>
      </div>

      {/* Course Selector */}
      <div className="flex gap-4">
        <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
          <SelectTrigger className="w-full md:w-64 h-12 bg-white border-2">
            <SelectValue placeholder="Select a course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.course_code} - {course.course_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grades Display */}
      {gradesLoading ? (
        <div className="text-center py-8 text-[#78909C]">Loading grades...</div>
      ) : isAdmin && selectedCourseId !== 'all' ? (
        // Admin view - show student list with add grade buttons
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1A4D5E]">Students Enrolled</h3>
            </div>
            
            {enrolledStudents.length === 0 ? (
              <p className="text-center py-8 text-[#78909C]">No students enrolled in this course</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledStudents.map((student) => {
                    // Find grade record for this student
                    const studentGrade = grades.find(g => g.studentId?._id === student._id);
                    
                    return (
                      <React.Fragment key={student._id}>
                        <TableRow>
                          <TableCell className="font-medium">{student.fullname}</TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>{student.studentId || 'N/A'}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => openAddGradeDialog(student)}
                              size="sm"
                              className="bg-[#00796B] hover:bg-[#00695C]"
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              Add Grade
                            </Button>
                          </TableCell>
                        </TableRow>
                        {/* Show existing grades for this student */}
                        {studentGrade && studentGrade.gradeItems && studentGrade.gradeItems.length > 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="bg-gray-50">
                              <div className="py-2 px-4">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="text-sm font-semibold text-[#546E7A]">Grades:</h4>
                                  <div className="text-right">
                                    <span className="text-lg font-bold text-[#00796B]">
                                      {studentGrade.overallGrade?.toFixed(1)}%
                                    </span>
                                    <span className="ml-2 text-sm font-semibold text-[#546E7A]">
                                      ({studentGrade.letterGrade})
                                    </span>
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  {studentGrade.gradeItems.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm py-1">
                                      <span className="text-[#37474F]">{item.name}</span>
                                      <span className="font-medium text-[#00796B]">
                                        {item.grade}/{item.maxGrade} ({((item.grade / item.maxGrade) * 100).toFixed(1)}%)
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      ) : grades.length === 0 ? (
        <div className="text-center py-8 text-[#78909C]">
          {selectedCourseId === 'all' ? 'No grades found' : 'No grades for this course yet'}
        </div>
      ) : (
        // Student view - show their grades
        <div className="space-y-4">
          {grades.map((gradeRecord) => (
            <div key={gradeRecord._id} className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-[#1A4D5E]">
                    {gradeRecord.courseId?.course_name || 'Unknown Course'}
                  </h3>
                  <p className="text-sm text-[#78909C]">
                    {gradeRecord.courseId?.course_code || ''} • {gradeRecord.studentId?.fullname || 'Student'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-[#00796B]">
                    {gradeRecord.overallGrade?.toFixed(1) || 'N/A'}%
                  </div>
                  <div className="text-lg font-semibold text-[#546E7A]">
                    {gradeRecord.letterGrade || '-'}
                  </div>
                </div>
              </div>

              {gradeRecord.gradeItems && gradeRecord.gradeItems.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-[#546E7A] mb-2">Grade Breakdown:</h4>
                  <div className="space-y-2">
                    {gradeRecord.gradeItems.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div>
                          <span className="font-medium text-[#37474F]">{item.name}</span>
                          {item.notes && (
                            <p className="text-xs text-[#78909C] mt-1">{item.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="font-semibold text-[#00796B]">
                            {item.grade}/{item.maxGrade}
                          </span>
                          <span className="text-sm text-[#78909C] ml-2">
                            ({((item.grade / item.maxGrade) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gradeRecord.comments && (
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-[#546E7A]">
                    <strong>Comments:</strong> {gradeRecord.comments}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Grade Dialog */}
      <Dialog open={addGradeDialogOpen} onOpenChange={setAddGradeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Grade for {selectedStudent?.fullname}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddGrade} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#37474F]">Assignment Name</label>
              <Input
                value={gradeName}
                onChange={(e) => setGradeName(e.target.value)}
                placeholder="e.g., Quiz 1, Midterm Exam"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#37474F]">Total Points</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={totalPoints}
                onChange={(e) => setTotalPoints(e.target.value)}
                placeholder="100"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#37474F]">Points Earned</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={pointsEarned}
                onChange={(e) => setPointsEarned(e.target.value)}
                placeholder="85"
                required
              />
            </div>
            {totalPoints && pointsEarned && (
              <div className="p-3 bg-blue-50 rounded">
                <p className="text-sm font-medium text-[#1A4D5E]">
                  Grade: {pointsEarned}/{totalPoints} ({((parseFloat(pointsEarned) / parseFloat(totalPoints)) * 100).toFixed(1)}%)
                </p>
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddGradeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#00796B] hover:bg-[#00695C]"
                disabled={addGradeMutation.isPending}
              >
                {addGradeMutation.isPending ? 'Adding...' : 'Add Grade'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

