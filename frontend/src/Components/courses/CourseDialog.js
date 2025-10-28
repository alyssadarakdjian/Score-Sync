//This page is for the +Add Course Button. I may get rid of this since users wont be inputing there own courses. The DB will enter information
//Might use this for the Admin/professor page only

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

export default function CourseDialog({ open, onOpenChange, course, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    course_code: "",
    course_name: "",
    description: "",
    teacher_name: "",
    teacher_email: "",
    grade_level: "All",
    subject: "Mathematics",
    credits: 1,
    semester: "Fall",
    academic_year: "2024-2025",
    room_number: "",
    schedule: "",
    max_students: 30,
    status: "active"
  });

  useEffect(() => {
    if (course) {
      setFormData(course);
    } else {
      setFormData({
        course_code: "",
        course_name: "",
        description: "",
        teacher_name: "",
        teacher_email: "",
        grade_level: "All",
        subject: "Mathematics",
        credits: 1,
        semester: "Fall",
        academic_year: "2024-2025",
        room_number: "",
        schedule: "",
        max_students: 30,
        status: "active"
      });
    }
  }, [course, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1A4D5E]">
            {course ? 'Edit Course' : 'Add New Course'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="course_code">Course Code *</Label>
                <Input
                  id="course_code"
                  value={formData.course_code}
                  onChange={(e) => setFormData({ ...formData, course_code: e.target.value })}
                  required
                  placeholder="e.g., MATH101"
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Select
                  value={formData.subject}
                  onValueChange={(value) => setFormData({ ...formData, subject: value })}
                >
                  <SelectTrigger className="border-2 focus:border-[#00796B]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="History">History</SelectItem>
                    <SelectItem value="Foreign Language">Foreign Language</SelectItem>
                    <SelectItem value="Physical Education">Physical Education</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                    <SelectItem value="Computer Science">Computer Science</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="course_name">Course Name *</Label>
              <Input
                id="course_name"
                value={formData.course_name}
                onChange={(e) => setFormData({ ...formData, course_name: e.target.value })}
                required
                placeholder="e.g., Advanced Calculus"
                className="border-2 focus:border-[#00796B]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Course description..."
                className="border-2 focus:border-[#00796B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="teacher_name">Teacher Name *</Label>
                <Input
                  id="teacher_name"
                  value={formData.teacher_name}
                  onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                  required
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher_email">Teacher Email</Label>
                <Input
                  id="teacher_email"
                  type="email"
                  value={formData.teacher_email}
                  onChange={(e) => setFormData({ ...formData, teacher_email: e.target.value })}
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade_level">Grade Level</Label>
                <Select
                  value={formData.grade_level}
                  onValueChange={(value) => setFormData({ ...formData, grade_level: value })}
                >
                  <SelectTrigger className="border-2 focus:border-[#00796B]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Grades</SelectItem>
                    <SelectItem value="9th">9th Grade</SelectItem>
                    <SelectItem value="10th">10th Grade</SelectItem>
                    <SelectItem value="11th">11th Grade</SelectItem>
                    <SelectItem value="12th">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  value={formData.credits}
                  onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) })}
                  min="0"
                  step="0.5"
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_students">Max Students</Label>
                <Input
                  id="max_students"
                  type="number"
                  value={formData.max_students}
                  onChange={(e) => setFormData({ ...formData, max_students: parseInt(e.target.value) })}
                  min="1"
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
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
                    <SelectItem value="Full Year">Full Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="academic_year">Academic Year *</Label>
                <Input
                  id="academic_year"
                  value={formData.academic_year}
                  onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                  required
                  placeholder="2024-2025"
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  value={formData.room_number}
                  onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="schedule">Schedule</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                placeholder="e.g., Mon/Wed/Fri 9:00-10:00 AM"
                className="border-2 focus:border-[#00796B]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="border-2 focus:border-[#00796B]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
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
              {isLoading ? 'Saving...' : (course ? 'Update Course' : 'Add Course')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}