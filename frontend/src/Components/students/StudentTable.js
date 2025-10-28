import React from "react";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { Skeleton } from "../ui/skeleton";

const statusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  graduated: "bg-blue-100 text-blue-800 border-blue-200",
  transferred: "bg-orange-100 text-orange-800 border-orange-200"
};

export default function StudentTable({ students, onEdit, onDelete, isLoading }) {
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
                <TableHead className="font-semibold text-[#546E7A]">Student ID</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Name</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Email</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Grade Level</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Status</TableHead>
                <TableHead className="font-semibold text-[#546E7A]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-[#78909C]">
                    No students found
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <TableCell className="font-medium text-[#37474F]">{student.student_id}</TableCell>
                    <TableCell className="font-medium text-[#37474F]">
                      {student.first_name} {student.last_name}
                    </TableCell>
                    <TableCell className="text-[#546E7A]">{student.email}</TableCell>
                    <TableCell className="text-[#546E7A]">{student.grade_level}</TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[student.status]} border`}>
                        {student.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(student)}
                          className="hover:bg-[#E0F2F1] hover:text-[#00796B]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(student.id)}
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