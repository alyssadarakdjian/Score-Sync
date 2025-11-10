import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Badge } from "../Components/ui/badge";
import { Button } from "../Components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus, Check, RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../Components/ui/dialog";
import EventForm from "../Components/EventForm";
import AssignmentForm from "../Components/AssignmentForm";
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
  const [showDialog, setShowDialog] = useState(false);
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);

  const { data: grades = [] } = useQuery({
    queryKey: ['grades'],
    queryFn: () => base44.entities?.Grade?.list ? base44.entities.Grade.list() : Promise.resolve([]),
  });

  const { data: events = [], refetch: refetchEvents } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/events/demo-user');
        if (!res.ok) return [];
        return res.json();
      } catch (err) {
        console.warn('Failed to fetch events:', err.message);
        return [];
      }
    },
  });

  const { data: assignments = [], refetch: refetchAssignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/assignments/demo-user');
        if (!res.ok) return [];
        return res.json();
      } catch (err) {
        console.warn('Failed to fetch assignments:', err.message);
        return [];
      }
    },
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getEventsForDate = (date) => {
    const gradeEvents = grades.filter(grade => {
      const dueDate = grade.due_date ? new Date(grade.due_date) : null;
      const submittedDate = grade.submitted_date ? new Date(grade.submitted_date) : null;
      const gradedDate = grade.graded_date ? new Date(grade.graded_date) : null;
      
      return (dueDate && isSameDay(dueDate, date)) ||
             (submittedDate && isSameDay(submittedDate, date)) ||
             (gradedDate && isSameDay(gradedDate, date));
    });

    const calendarEvents = events.filter(event => 
      isSameDay(new Date(event.start), date) || 
      isSameDay(new Date(event.end), date)
    );

    const assignmentEvents = assignments.filter(assignment =>
      isSameDay(new Date(assignment.dueDate), date)
    );

    return [...gradeEvents, ...calendarEvents, ...assignmentEvents];
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

  const markAssignmentDone = async (id) => {
    try {
      await fetch(`/api/assignments/${id}/complete`, { method: 'PATCH' });
      await refetchAssignments();
    } catch (err) {
      console.error('Failed to complete assignment:', err);
    }
  };

  const undoAssignmentDone = async (id) => {
    try {
      await fetch(`/api/assignments/${id}/uncomplete`, { method: 'PATCH' });
      await refetchAssignments();
    } catch (err) {
      console.error('Failed to undo assignment:', err);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D5E]">Academic Calendar</h2>
          <p className="text-[#78909C] mt-1">Track assignments, exams, and important dates</p>
        </div>
        <div className="flex items-center gap-2 relative z-10 mr-4">
          <Button
            onClick={() => setShowDialog(true)}
            variant="default"
            size="md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
          <Button
            onClick={() => setShowAssignmentDialog(true)}
            variant="default"
            size="md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>
          <Button
            onClick={today}
            variant="default"
            size="md"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Today
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Event</DialogTitle>
              </DialogHeader>
              <EventForm
                onSubmit={async (eventData) => {
                  try {
                    await fetch('/api/events', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...eventData, userId: 'demo-user' }),
                    });
                    refetchEvents();
                    setShowDialog(false);
                  } catch (err) {
                    console.error('Failed creating event:', err);
                  }
                }}
                onClose={() => setShowDialog(false)}
              />
            </DialogContent>
          </Dialog>
          <Dialog open={showAssignmentDialog} onOpenChange={setShowAssignmentDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Assignment</DialogTitle>
              </DialogHeader>
              <AssignmentForm
                onSubmit={async (assignmentData) => {
                  try {
                    await fetch('/api/assignments', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...assignmentData, userId: 'demo-user' }),
                    });
                    refetchAssignments();
                    setShowAssignmentDialog(false);
                  } catch (err) {
                    console.error('Failed creating assignment:', err);
                  }
                }}
                onClose={() => setShowAssignmentDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
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
                  {selectedDateEvents.map((event) => {
                    if (event.assignment_name) {
                      // Grade event
                      return (
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
                      );
                    } else if (event.name) {
                      // Assignment event
                      return (
                        <div
                          key={event._id}
                          className="p-3 rounded-lg border border-gray-100 hover:border-[#00796B] hover:bg-[#E0F2F1] transition-all duration-200"
                          style={{ borderLeftColor: event.completed ? '#4CAF50' : '#FF9800', borderLeftWidth: '4px' }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-[#37474F] flex items-center gap-2">
                              {event.name}
                              {event.completed && (
                                <Badge className="bg-green-100 text-green-800 text-xs">Done</Badge>
                              )}
                            </h4>
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              Assignment
                            </Badge>
                          </div>
                          <p className="text-sm text-[#78909C] mb-3">
                            Due: {format(new Date(event.dueDate), 'MMM d, h:mm a')}
                          </p>
                          {!event.completed && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => markAssignmentDone(event._id)}
                              className="flex items-center gap-1"
                            >
                              <Check className="w-4 h-4" />
                              Mark as Done
                            </Button>
                          )}
                          {event.completed && (
                            <div className="flex items-center gap-3 mt-2">
                              {event.completedAt && (
                                <p className="text-xs text-green-700">Completed {format(new Date(event.completedAt), 'MMM d, h:mm a')}</p>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => undoAssignmentDone(event._id)}
                                className="flex items-center gap-1"
                              >
                                <RotateCcw className="w-4 h-4" />
                                Undo
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    } else {
                      // Calendar event
                      return (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg border border-gray-100 hover:border-[#00796B] hover:bg-[#E0F2F1] transition-all duration-200"
                          style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-[#37474F]">{event.title}</h4>
                          </div>
                          {event.description && (
                            <p className="text-sm text-[#546E7A] mb-1">
                              {event.description}
                            </p>
                          )}
                          <p className="text-sm text-[#78909C]">
                            {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
                          </p>
                        </div>
                      );
                    }
                  })}
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