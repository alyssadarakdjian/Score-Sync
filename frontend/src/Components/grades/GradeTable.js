import React from "react";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { format } from "date-fns";

const getGradeColor = (percentage) => {
  if (percentage >= 90) return "bg-green-100 text-green-800 border-green-200";
  if (percentage >= 80) return "bg-blue-100 text-blue-800 border-blue-200";
  if (percentage >= 70) return "bg-yellow-100 text-yellow-800 border-yellow-200";
  if (percentage >= 60) return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-red-100 text-red-800 border-red-200";
};

export default function GradeTable({ grades, onEdit, onDelete, isLoading }) {
  if (isLoading) {
    return (
      <Card className="shadow-lg border-0">
        <CardContent className="p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 mb-4">
              <Skeleton className="h-12 flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border-0 bg-white">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#ECEFF1]">
                <TableHead className="font-semibold text-[#546E7A]">Student</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Course</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Assignment</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Type</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Score</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Grade</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Date</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-[#78909C]">
                    No grades found
                  </TableCell>
                </TableRow>
              ) : (
                grades.map((grade) => (
                  <TableRow key={grade.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <TableCell className="font-medium text-[#37474F]">{grade.student_name}</TableCell>
                    <TableCell className="text-[#546E7A]">{grade.course_name}</TableCell>
                    <TableCell className="text-[#546E7A]">{grade.assignment_name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {grade.assignment_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#546E7A]">
                      {grade.score}/{grade.max_score}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getGradeColor(grade.percentage)} border font-semibold`}>
                          {grade.percentage?.toFixed(0)}%
                        </Badge>
                        <span className="text-sm font-semibold text-[#37474F]">
                          {grade.letter_grade}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#78909C] text-sm">
                      {grade.graded_date ? format(new Date(grade.graded_date), 'MMM d, yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(grade)}
                          className="hover:bg-[#E0F2F1] hover:text-[#00796B]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(grade.id)}
                          className="hover:bg-[#FFEBEE] hover:text-[#D32F2F]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}