import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200"
};

const subjectColors = {
  "Mathematics": "bg-blue-100 text-blue-800",
  "Science": "bg-green-100 text-green-800",
  "English": "bg-purple-100 text-purple-800",
  "History": "bg-orange-100 text-orange-800",
  "Foreign Language": "bg-pink-100 text-pink-800",
  "Physical Education": "bg-red-100 text-red-800",
  "Arts": "bg-yellow-100 text-yellow-800",
  "Computer Science": "bg-indigo-100 text-indigo-800"
};

export default function CourseTable({ courses, onEdit, onDelete, isLoading, readOnly = false }) {
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
                <TableHead className="font-semibold text-[#546E7A]">Course Code</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Course Name</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Subject</TableHead>
                {readOnly && (
                  <TableHead className="font-semibold text-[#546E7A]">Teacher</TableHead>
                )}
                <TableHead className="font-semibold text-[#546E7A]">Status</TableHead>
                {!readOnly && (
                  <TableHead className="font-semibold text-[#546E7A]">Actions</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={readOnly ? 5 : 5} className="text-center py-8 text-[#78909C]">
                    No courses found
                  </TableCell>
                </TableRow>
              ) : (
                courses.map((course) => (
                  <TableRow key={course.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <TableCell className="font-medium text-[#37474F]">{course.course_code}</TableCell>
                    <TableCell className="font-medium text-[#37474F]">{course.course_name}</TableCell>
                    <TableCell>
                      <Badge className={subjectColors[course.subject] || 'bg-gray-100 text-gray-800'}>
                        {course.subject}
                      </Badge>
                    </TableCell>
                    {readOnly && (
                      <TableCell className="text-[#546E7A]">{course.teacher_name}</TableCell>
                    )}
                    <TableCell>
                      <Badge className={`${statusColors[course.status]} border`}>
                        {course.status}
                      </Badge>
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(course)}
                            className="hover:bg-[#E0F2F1] hover:text-[#00796B]"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(course.id)}
                            className="hover:bg-[#FFEBEE] hover:text-[#D32F2F]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
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