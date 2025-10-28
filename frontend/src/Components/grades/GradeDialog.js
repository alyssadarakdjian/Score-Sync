//THIS PAGE ALSO
//Change the Add Grade Section to only be used in Admin/Prof login page

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";

export default function GradeDialog({ open, onOpenChange, grade, students, courses, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    student_id: "",
    student_name: "",
    course_id: "",
    course_name: "",
    assignment_name: "",
    assignment_type: "Homework",
    score: 0,
    max_score: 100,
    weight: 10,
    due_date: "",
    submitted_date: "",
    notes: "",
    semester: "Fall",
    academic_year: "2024-2025"
  });

  useEffect(() => {
    if (grade) {
      setFormData(grade);
    } else {
      setFormData({
        student_id: "",
        student_name: "",
        course_id: "",
        course_name: "",
        assignment_name: "",
        assignment_type: "Homework",
        score: 0,
        max_score: 100,
        weight: 10,
        due_date: "",
        submitted_date: "",
        notes: "",
        semester: "Fall",
        academic_year: "2024-2025"
      });
    }
  }, [grade, open]);

  const handleStudentChange = (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData({
        ...formData,
        student_id: studentId,
        student_name: `${student.first_name} ${student.last_name}`
      });
    }
  };

  const handleCourseChange = (courseId) => {
    const course = courses.find(c => c.id === courseId);
    if (course) {
      setFormData({
        ...formData,
        course_id: courseId,
        course_name: course.course_name
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1A4D5E]">
            {grade ? 'Edit Grade' : 'Add New Grade'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student">Student *</Label>
                <Select
                  value={formData.student_id}
                  onValueChange={handleStudentChange}
                  required
                >
                  <SelectTrigger className="border-2 focus:border-[#00796B]">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.filter(s => s.status === 'active').map(student => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} ({student.student_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="course">Course *</Label>
                <Select
                  value={formData.course_id}
                  onValueChange={handleCourseChange}
                  required
                >
                  <SelectTrigger className="border-2 focus:border-[#00796B]">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.filter(c => c.status === 'active').map(course => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.course_name} ({course.course_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignment_name">Assignment Name *</Label>
                <Input
                  id="assignment_name"
                  value={formData.assignment_name}
                  onChange={(e) => setFormData({ ...formData, assignment_name: e.target.value })}
                  required
                  placeholder="e.g., Chapter 5 Quiz"
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignment_type">Type *</Label>
                <Select
                  value={formData.assignment_type}
                  onValueChange={(value) => setFormData({ ...formData, assignment_type: value })}
                >
                  <SelectTrigger className="border-2 focus:border-[#00796B]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Homework">Homework</SelectItem>
                    <SelectItem value="Quiz">Quiz</SelectItem>
                    <SelectItem value="Test">Test</SelectItem>
                    <SelectItem value="Midterm">Midterm</SelectItem>
                    <SelectItem value="Final Exam">Final Exam</SelectItem>
                    <SelectItem value="Project">Project</SelectItem>
                    <SelectItem value="Participation">Participation</SelectItem>
                    <SelectItem value="Lab">Lab</SelectItem>
                    <SelectItem value="Essay">Essay</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="score">Score *</Label>
                <Input
                  id="score"
                  type="number"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: parseFloat(e.target.value) })}
                  required
                  min="0"
                  step="0.5"
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_score">Max Score *</Label>
                <Input
                  id="max_score"
                  type="number"
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: parseFloat(e.target.value) })}
                  required
                  min="1"
                  step="0.5"
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (%)</Label>
                <Input
                  id="weight"
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) })}
                  min="0"
                  max="100"
                  step="1"
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submitted_date">Submitted Date</Label>
                <Input
                  id="submitted_date"
                  type="date"
                  value={formData.submitted_date}
                  onChange={(e) => setFormData({ ...formData, submitted_date: e.target.value })}
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => setFormData({ ...formData, semester: value })}
                >
                  <SelectTrigger className="border-2 focus:border-[#00796B]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academic_year">Academic Year</Label>
                <Input
                  id="academic_year"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  placeholder="2024-2025"
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Feedback</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add notes or feedback for the student..."
                className="border-2 focus:border-[#00796B]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#00796B] hover:bg-[#00695C]"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (grade ? 'Update Grade' : 'Add Grade')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}