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
  // Search input for filtering grades by student, course, or assignment text
  const [searchTerm, setSearchTerm] = useState("");

  // Course filter (by course_id); "all" = no filtering
  const [filterCourse, setFilterCourse] = useState("all");

  // Assignment type filter (Homework, Quiz, etc.); "all" = no filtering
  const [filterType, setFilterType] = useState("all");

  // Controls whether the Add/Edit Grade dialog is open
  const [dialogOpen, setDialogOpen] = useState(false);

  // Grade currently being edited; null when adding a new grade
  const [selectedGrade, setSelectedGrade] = useState(null);

  // React Query client used to invalidate and refetch queries
  const queryClient = useQueryClient();

  // TODO: replace with real queries for students and courses once your backend endpoints are ready
  // Right now these are placeholders so GradeDialog still receives props and renders correctly.
  const students: any[] = []; // will eventually be populated from /api/students or Base44
  const courses: any[] = [];  // will eventually be populated from /api/courses or Base44

  /*
  =====================================================
  1) LOAD GRADES FROM BACKEND
  =====================================================
  Uses React Query to fetch all grades from your API.
  - Endpoint: GET http://localhost:5050/api/grades
  - Expects { grades: [...] } in the JSON response.
  */
  const {
    data: grades = [],
    isLoading: gradesLoading,
    error: gradesError,
  } = useQuery({
    queryKey: ["grades"],
    queryFn: async () => {
      // If you want per-student filtering, you could grab an ID from localStorage here:
      // const studentId = localStorage.getItem("scoreSyncEmail");
      const res = await fetch("http://localhost:5050/api/grades");
      if (!res.ok) {
        // Try to extract an error message from backend; fallback to generic message.
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to fetch grades");
      }
      const json = await res.json();
      return json.grades || [];
    },
  });

  /*
  =====================================================
  Helper: computeGradePayload
  =====================================================
  Takes raw form data (score, max_score, etc.) and:
  - Computes percentage
  - Computes letter grade based on percentage
  - Adds current graded_date (YYYY-MM-DD)
  Returns final payload object to send to backend.
  */
  const computeGradePayload = (data: any) => {
    const percentage = (data.score / data.max_score) * 100;

    // Compute letter grade based on percentage
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
      // store graded_date as YYYY-MM-DD string
      graded_date: new Date().toISOString().split("T")[0],
    };
  };

  /*
  =====================================================
  2) CREATE GRADE
  =====================================================
  POST /api/grades with computed payload.
  On success:
  - Invalidate "grades" query so table refreshes
  - Close dialog and clear selectedGrade
  */
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
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

  /*
  =====================================================
  3) UPDATE GRADE
  =====================================================
  PUT /api/grades/:id with computed payload.
  On success:
  - Invalidate "grades" query
  - Close dialog and clear selectedGrade
  */
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
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

  /*
  =====================================================
  4) DELETE GRADE
  =====================================================
  DELETE /api/grades/:id.
  On success:
  - Invalidate "grades" query so table refreshes.
  */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
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

  /*
  =====================================================
  CLIENT-SIDE FILTERING
  =====================================================
  Filters the loaded grades based on:
  - Search text (student_name, course_name, assignment_name)
  - Selected course (filterCourse)
  - Selected assignment type (filterType)
  */
  const filteredGrades = grades.filter((grade: any) => {
    // Match against searchTerm in composite string
    const matchesSearch = `${grade.student_name} ${grade.course_name} ${grade.assignment_name}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Check course filter "all" or matching course_id
    const matchesCourse =
      filterCourse === "all" || grade.course_id === filterCourse;

    // Check assignment type filter "all" or exact type match
    const matchesType =
      filterType === "all" || grade.assignment_type === filterType;

    return matchesSearch && matchesCourse && matchesType;
  });

  /*
  =====================================================
  HANDLERS
  =====================================================
  - handleSave: decides create vs update based on selectedGrade
  - handleEdit: opens dialog with grade data
  - handleDelete: confirms and triggers delete mutation
  */
  const handleSave = (data: any) => {
    if (selectedGrade) {
      // Editing an existing grade
      updateMutation.mutate({ id: selectedGrade.id, data });
    } else {
      // Creating a new grade
      createMutation.mutate(data);
    }
  };

  const handleEdit = (grade: any) => {
    setSelectedGrade(grade);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this grade?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 
      =====================================================
      HEADER + ADD BUTTON
      =====================================================
      */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D5E]">Grade Management</h2>
          <p className="text-[#78909C] mt-1">
            Record and manage student grades
          </p>
          {/* Show error message if fetching grades fails */}
          {gradesError && (
            <p className="text-sm text-red-600 mt-1">
              {gradesError.message as string}
            </p>
          )}
        </div>

        {/* Open dialog to create a new grade */}
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

      {/* 
      =====================================================
      SEARCH + FILTERS ROW
      =====================================================
      */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search input */}
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

        {/* Course filter dropdown (currently uses placeholder courses array) */}
        <Select value={filterCourse} onValueChange={setFilterCourse}>
          <SelectTrigger className="w-full md:w-48 h-12 bg-white border-2">
            <SelectValue placeholder="Filter by course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course: any) => (
              <SelectItem key={course.id} value={course.id}>
                {course.course_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assignment type filter dropdown */}
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

      {/* 
      =====================================================
      GRADE TABLE
      =====================================================
      Displays list of grades with edit/delete actions.
      */}
      <GradeTable
        grades={filteredGrades}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isLoading={gradesLoading}
      />

      {/* 
      =====================================================
      ADD / EDIT GRADE DIALOG
      =====================================================
      GradeDialog is used for both creating and editing grades.
      - "grade" prop = selectedGrade for editing or null for new
      */}
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
