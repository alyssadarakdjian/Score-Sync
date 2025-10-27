import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const { data: grades = [] } = useQuery({
    queryKey: ['grades'],
    queryFn: () => base44.entities.Grade.list(),
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date) => {
    return grades.filter(grade => {
      const dueDate = grade.due_date ? new Date(grade.due_date) : null;
      const submittedDate = grade.submitted_date ? new Date(grade.submitted_date) : null;
      const gradedDate = grade.graded_date ? new Date(grade.graded_date) : null;
      
      return (dueDate && isSameDay(dueDate, date)) ||
             (submittedDate && isSameDay(submittedDate, date)) ||
             (gradedDate && isSameDay(gradedDate, date));
    });
  };

  const selectedDateEvents = getEventsForDate(selectedDate);

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const today = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D5E]">Academic Calendar</h2>
          <p className="text-[#78909C] mt-1">Track assignments, exams, and important dates</p>
        </div>
        <Button
          onClick={today}
          className="bg-[#00796B] hover:bg-[#00695C]"
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          Today
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-[#1A4D5E]">
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={previousMonth}
                    className="hover:bg-[#E0F2F1] hover:text-[#00796B]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={nextMonth}
                    className="hover:bg-[#E0F2F1] hover:text-[#00796B]"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-[#78909C] py-2">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const events = getEventsForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isToday = isSameDay(day, new Date());
                  const isSelected = isSameDay(day, selectedDate);

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(day)}
                      className={`
                        relative aspect-square p-2 rounded-lg transition-all duration-200
                        ${isCurrentMonth ? 'text-[#37474F]' : 'text-[#B0BEC5]'}
                        ${isToday ? 'bg-[#00796B] text-white font-bold' : ''}
                        ${isSelected && !isToday ? 'bg-[#E0F2F1] text-[#00796B] font-semibold' : ''}
                        ${!isToday && !isSelected ? 'hover:bg-[#F5F5F5]' : ''}
                      `}
                    >
                      <div className="text-sm">{format(day, 'd')}</div>
                      {events.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {events.slice(0, 3).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isToday ? 'bg-white' : 'bg-[#00796B]'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-[#1A4D5E]">
                {format(selectedDate, 'MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-[#CFD8DC] mx-auto mb-3" />
                  <p className="text-[#78909C]">No events on this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-gray-100 hover:border-[#00796B] hover:bg-[#E0F2F1] transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-[#37474F]">{event.assignment_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {event.assignment_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#546E7A] mb-1">
                        {event.course_name}
                      </p>
                      <p className="text-sm text-[#78909C]">
                        {event.student_name}
                      </p>
                      {event.due_date && isSameDay(new Date(event.due_date), selectedDate) && (
                        <Badge className="mt-2 bg-orange-100 text-orange-800 text-xs">
                          Due Date
                        </Badge>
                      )}
                      {event.graded_date && isSameDay(new Date(event.graded_date), selectedDate) && (
                        <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                          Graded: {event.percentage?.toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white mt-6">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-[#1A4D5E]">Legend</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#00796B]" />
                  <span className="text-sm text-[#546E7A]">Has Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#00796B]" />
                  <span className="text-sm text-[#546E7A]">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#E0F2F1]" />
                  <span className="text-sm text-[#546E7A]">Selected</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}