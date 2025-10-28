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

export default function StudentDialog({ open, onOpenChange, student, onSave, isLoading }) {
  const [formData, setFormData] = useState({
    student_id: "",
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    grade_level: "9th",
    date_of_birth: "",
    address: "",
    parent_name: "",
    parent_email: "",
    parent_phone: "",
    enrollment_date: new Date().toISOString().split('T')[0],
    status: "active"
  });

  useEffect(() => {
    if (student) {
      setFormData(student);
    } else {
      setFormData({
        student_id: "",
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        grade_level: "9th",
        date_of_birth: "",
        address: "",
        parent_name: "",
        parent_email: "",
        parent_phone: "",
        enrollment_date: new Date().toISOString().split('T')[0],
        status: "active"
      });
    }
  }, [student, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#1A4D5E]">
            {student ? 'Edit Student' : 'Add New Student'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="student_id">Student ID *</Label>
                <Input
                  id="student_id"
                  value={formData.student_id}
                  onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                  required
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade_level">Grade Level *</Label>
                <Select
                  value={formData.grade_level}
                  onValueChange={(value) => setFormData({ ...formData, grade_level: value })}
                >
                  <SelectTrigger className="border-2 focus:border-[#00796B]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9th">9th Grade</SelectItem>
                    <SelectItem value="10th">10th Grade</SelectItem>
                    <SelectItem value="11th">11th Grade</SelectItem>
                    <SelectItem value="12th">12th Grade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enrollment_date">Enrollment Date</Label>
                <Input
                  id="enrollment_date"
                  type="date"
                  value={formData.enrollment_date}
                  onChange={(e) => setFormData({ ...formData, enrollment_date: e.target.value })}
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="border-2 focus:border-[#00796B]"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parent_name">Parent/Guardian Name</Label>
                <Input
                  id="parent_name"
                  value={formData.parent_name}
                  onChange={(e) => setFormData({ ...formData, parent_name: e.target.value })}
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent_email">Parent Email</Label>
                <Input
                  id="parent_email"
                  type="email"
                  value={formData.parent_email}
                  onChange={(e) => setFormData({ ...formData, parent_email: e.target.value })}
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parent_phone">Parent Phone</Label>
                <Input
                  id="parent_phone"
                  value={formData.parent_phone}
                  onChange={(e) => setFormData({ ...formData, parent_phone: e.target.value })}
                  className="border-2 focus:border-[#00796B]"
                />
              </div>
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
                  <SelectItem value="graduated">Graduated</SelectItem>
                  <SelectItem value="transferred">Transferred</SelectItem>
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
              {isLoading ? 'Saving...' : (student ? 'Update Student' : 'Add Student')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}