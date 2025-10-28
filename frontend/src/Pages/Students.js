import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Plus, Search } from "lucide-react";
import StudentTable from "../Components/students/StudentTable";
import StudentDialog from "../Components/students/StudentDialog";

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const queryClient = useQueryClient();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list('-created_date'),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Student.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setDialogOpen(false);
      setSelectedStudent(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Student.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      setDialogOpen(false);
      setSelectedStudent(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Student.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  const filteredStudents = students.filter(student =>
    `${student.first_name} ${student.last_name} ${student.email} ${student.student_id}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleSave = (data) => {
    if (selectedStudent) {
      updateMutation.mutate({ id: selectedStudent.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D5E]">Student Management</h2>
          <p className="text-[#78909C] mt-1">Manage student records and information</p>
        </div>
        <Button
          onClick={() => {
            setSelectedStudent(null);
            setDialogOpen(true);
          }}
          className="bg-[#00796B] hover:bg-[#00695C] shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#78909C] w-5 h-5" />
        <Input
          type="text"
          placeholder="Search students by name, email, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-12 bg-white border-2 border-gray-200 focus:border-[#00796B]"
        />
      </div>

      <StudentTable
        students={filteredStudents}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={isLoading}
      />

      <StudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={selectedStudent}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}