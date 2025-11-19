import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import GradeDialog from "../Components/grades/GradeDialog";
import GradeTable from "../Components/grades/GradeTable";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../Components/ui/select";

export default function Grades() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCourse, setFilterCourse] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);
  const queryClient = useQueryClient();

  // TODO: once you have real student/course endpoints, replace these with real queries
  const students = []; // placeholder so GradeDialog still receives prop
  const courses = [];  // placeholder for course filter and dialog

  // 1) Load grades from your backend
  const {
    data: grades = [],
    isLoading: gradesLoading,
    error: gradesError,
  } = useQuery({
    queryKey: ["grades"],
    queryFn: async () => {
      // if you want per-student, you can pull an ID from localStorage
      // const studentId = localStorage.getItem("scoreSyncEmail");
      const res = await fetch("http://localhost:5050/api/grades");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch grades");
      }
      const json = await res.json();
      return json.grades || [];
    },
  });

  // Helper to compute percentage + letter once, used in create & update
  const computeGradePayload = (data) => {
    const percentage = (data.score / data.max_score) * 100;
    let letterGrade = "F";
    if (percentage >= 97) letterGrade = "A+";
    else if (percentage >= 93) letterGrade = "A";
    else if (percentage >= 90) letterGrade = "A-";
    else if (percentage >= 87) letterGrade = "B+";
    else if (percentage >= 83) letterGrade = "B";
    else if (percentage >= 80) letterGrade = "B-";
    else if (percentage >= 77) letterGrade = "C+";
    else if (percentage >= 73) letterGrade = "C";
    else if (percentage >= 70) letterGrade = "C-";
    else if (percentage >= 67) letterGrade = "D+";
    else if (percentage >= 63) letterGrade = "D";
    else if (percentage >= 60) letterGrade = "D-";

    return {
      ...data,
      percentage,
      letter_grade: letterGrade,
      graded_date: new Date().toISOString().split("T")[0],
    };
  };

  // 2) Create grade
  const createMutation = useMutation({
    mutationFn: async (data) => {
      const payload = computeGradePayload(data);
      const res = await fetch("http://localhost:5050/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to create grade");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      setDialogOpen(false);
      setSelectedGrade(null);
    },
  });

  // 3) Update grade
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const payload = computeGradePayload(data);
      const res = await fetch(`http://localhost:5050/api/grades/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to update grade");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      setDialogOpen(false);
      setSelectedGrade(null);
    },
  });

  // 4) Delete grade
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await fetch(`http://localhost:5050/api/grades/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to delete grade");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
  });

  // Filtering client-side
  const filteredGrades = grades.filter((grade) => {
    const matchesSearch = `${grade.student_name} ${grade.course_name} ${grade.assignment_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCourse =
      filterCourse === "all" || grade.course_id === filterCourse;
    const matchesType =
      filterType === "all" || grade.assignment_type === filterType;
    return matchesSearch && matchesCourse && matchesType;
  });

  const handleSave = (data) => {
    if (selectedGrade) {
      updateMutation.mutate({ id: selectedGrade.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (grade) => {
    setSelectedGrade(grade);
    setDialogOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D5E]">Grade Management</h2>
          <p className="text-[#78909C] mt-1">Record and manage student grades</p>
          {gradesError && (
            <p className="text-sm text-red-600 mt-1">
              {gradesError.message}
            </p>
          )}
        </div>
        <Button
          onClick={() => {
            setSelectedGrade(null);
            setDialogOpen(true);
          }}
          className="bg-[#00796B] hover:bg-[#00695C] shadow-lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Grade
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#78909C] w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by student, course, or assignment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 bg-white border-2 border-gray-200 focus:border-[#00796B]"
          />
        </div>
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-full md:w-48 h-12 bg-white border-2">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.course_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-48 h-12 bg-white border-2">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Homework">Homework</SelectItem>
            <SelectItem value="Quiz">Quiz</SelectItem>
            <SelectItem value="Test">Test</SelectItem>
            <SelectItem value="Midterm">Midterm</SelectItem>
            <SelectItem value="Final Exam">Final Exam</SelectItem>
            <SelectItem value="Project">Project</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <GradeTable
        grades={filteredGrades}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={gradesLoading}
      />

      <GradeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        grade={selectedGrade}
        students={students}
        courses={courses}
        onSave={handleSave}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}