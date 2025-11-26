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
  // Date currently displayed in the month grid (e.g., November 2025)
  const [currentDate, setCurrentDate] = useState(new Date());

  // Date currently selected by the user (used in the right-side "Day details" card)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Controls visibility of "Add Event" dialog
  const [showDialog, setShowDialog] = useState(false);

  // Controls visibility of "Add Assignment" dialog
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);

  /*
  ----------------------------------------------------------
  FETCH GRADE-BASED EVENTS (FROM Base44)
  ----------------------------------------------------------
  We treat grade due dates, submission dates, and graded dates
  as "events" that can appear on the calendar.
  */
  const { data: grades = [] } = useQuery({
    queryKey: ['grades'],
    // Fallback to empty list if Grade entity doesn't exist
    queryFn: () =>
      base44.entities?.Grade?.list
        ? base44.entities.Grade.list()
        : Promise.resolve([]),
  });

  /*
  ----------------------------------------------------------
  FETCH CALENDAR EVENTS (From your /api/events endpoint)
  ----------------------------------------------------------
  These are generic events (meetings, exams, etc.) tied to "demo-user".
  */
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

  /*
  ----------------------------------------------------------
  FETCH ASSIGNMENTS (From your /api/assignments endpoint)
  ----------------------------------------------------------
  These assignments have due dates and can be marked done/undone.
  */
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

  /*
  ----------------------------------------------------------
  CALENDAR RANGE CALCULATIONS
  ----------------------------------------------------------
  - monthStart / monthEnd: first + last day of current month
  - calendarStart / calendarEnd: extend to full weeks (Sun-Sat)
  - calendarDays: list of all days shown in the grid
  */
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  /*
  ----------------------------------------------------------
  getEventsForDate(date)
  ----------------------------------------------------------
  Collects:
  - grade events whose due/submitted/graded dates match "date"
  - regular calendar events whose start/end fall on "date"
  - assignment events whose dueDate matches "date"
  Returned as a single combined list of "events" for that day.
  */
  const getEventsForDate = (date) => {
    // Grades from Base44 as events (due, submitted, graded)
    const gradeEvents = grades.filter((grade) => {
      const dueDate = grade.due_date ? new Date(grade.due_date) : null;
      const submittedDate = grade.submitted_date ? new Date(grade.submitted_date) : null;
      const gradedDate = grade.graded_date ? new Date(grade.graded_date) : null;
      
      return (
        (dueDate && isSameDay(dueDate, date)) ||
        (submittedDate && isSameDay(submittedDate, date)) ||
        (gradedDate && isSameDay(gradedDate, date))
      );
    });

    // Regular calendar events (start/end)
    const calendarEvents = events.filter((event) =>
      isSameDay(new Date(event.start), date) || 
      isSameDay(new Date(event.end), date)
    );

    // Assignments by dueDate
    const assignmentEvents = assignments.filter((assignment) =>
      isSameDay(new Date(assignment.dueDate), date)
    );

    // Merge all three into one array
    return [...gradeEvents, ...calendarEvents, ...assignmentEvents];
  };

  // Events that correspond to the currently selected date (shown on the right)
  const selectedDateEvents = getEventsForDate(selectedDate);

  /*
  ----------------------------------------------------------
  NAVIGATION FUNCTIONS
  ----------------------------------------------------------
  Move between months or jump to "today".
  */
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

  /*
  ----------------------------------------------------------
  ASSIGNMENT ACTIONS
  ----------------------------------------------------------
  Mark assignment as completed or undo completion via PATCH requests.
  Then refetch assignments to update UI.
  */
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
      {/* 
      ======================================================
      HEADER + ACTION BUTTONS (Add Event / Add Assignment / Today)
      ======================================================
      */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D5E]">Academic Calendar</h2>
          <p className="text-[#78909C] mt-1">
            Track assignments, exams, and important dates
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 mr-4">
          {/* Open Event dialog */}
          <Button
            onClick={() => setShowDialog(true)}
            variant="default"
            size="md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>

          {/* Open Assignment dialog */}
          <Button
            onClick={() => setShowAssignmentDialog(true)}
            variant="default"
            size="md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Assignment
          </Button>

          {/* Jump to today's date */}
          <Button
            onClick={today}
            variant="default"
            size="md"
          >
            <CalendarIcon className="w-4 h-4 mr-2" />
            Today
          </Button>

          {/* 
          --------------------------------------------------
          EVENT DIALOG
          --------------------------------------------------
          Wrapper that contains the EventForm. On submit, POST
          to /api/events and refetch event list.
          */}
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

          {/* 
          --------------------------------------------------
          ASSIGNMENT DIALOG
          --------------------------------------------------
          Wrapper that contains the AssignmentForm. On submit,
          POST to /api/assignments and refetch assignment list.
          */}
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

      {/* 
      ======================================================
      MAIN LAYOUT: LEFT = MONTH CALENDAR, RIGHT = DAY DETAILS
      ======================================================
      */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* 
        =======================================
        LEFT: MONTH VIEW
        =======================================
        */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0 bg-white">
            {/* Month header with month name and navigation arrows */}
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold text-[#1A4D5E]">
                  {format(currentDate, 'MMMM yyyy')}
                </CardTitle>
                <div className="flex gap-2">
                  {/* Previous month */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={previousMonth}
                    className="hover:bg-[#E0F2F1] hover:text-[#00796B]"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>

                  {/* Next month */}
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

            {/* Calendar body: weekday labels + day cells */}
            <CardContent className="p-4">
              {/* Weekday labels row */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div
                    key={day}
                    className="text-center text-sm font-semibold text-[#78909C] py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Day cells grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  const eventsForDay = getEventsForDate(day);
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
                      {/* Day number */}
                      <div className="text-sm">{format(day, 'd')}</div>

                      {/* Small dots indicating events exist on this day */}
                      {eventsForDay.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-1">
                          {eventsForDay.slice(0, 3).map((_, i) => (
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

        {/* 
        =======================================
        RIGHT: SELECTED DAY EVENTS + LEGEND
        =======================================
        */}
        <div>
          {/* 
          ---------------------------------------
          SELECTED DATE EVENTS
          ---------------------------------------
          Shows all events/assignments/grades for selectedDate
          */}
          <Card className="shadow-lg border-0 bg-white">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-[#1A4D5E]">
                {format(selectedDate, 'MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {/* No events message */}
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="w-12 h-12 text-[#CFD8DC] mx-auto mb-3" />
                  <p className="text-[#78909C]">No events on this date</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents.map((event) => {
                    /*
                    We distinguish between:
                    - Grade-based "events" (have assignment_name)
                    - Assignment events (have name + assignment structure)
                    - Calendar events (generic, have title/description/start/end)
                    */

                    // GRADE EVENT
                    if (event.assignment_name) {
                      return (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg border border-gray-100 hover:border-[#00796B] hover:bg-[#E0F2F1] transition-all duration-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-[#37474F]">
                              {event.assignment_name}
                            </h4>
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

                          {/* Badge if this is the due date */}
                          {event.due_date && isSameDay(new Date(event.due_date), selectedDate) && (
                            <Badge className="mt-2 bg-orange-100 text-orange-800 text-xs">
                              Due Date
                            </Badge>
                          )}

                          {/* Badge if this is the graded date */}
                          {event.graded_date && isSameDay(new Date(event.graded_date), selectedDate) && (
                            <Badge className="mt-2 bg-green-100 text-green-800 text-xs">
                              Graded: {event.percentage?.toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      );
                    } 
                    
                    // ASSIGNMENT EVENT (from /api/assignments)
                    else if (event.name) {
                      return (
                        <div
                          key={event._id}
                          className="p-3 rounded-lg border border-gray-100 hover:border-[#00796B] hover:bg-[#E0F2F1] transition-all duration-200"
                          style={{
                            borderLeftColor: event.completed ? '#4CAF50' : '#FF9800',
                            borderLeftWidth: '4px',
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-[#37474F] flex items-center gap-2">
                              {event.name}
                              {event.completed && (
                                <Badge className="bg-green-100 text-green-800 text-xs">
                                  Done
                                </Badge>
                              )}
                            </h4>
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              Assignment
                            </Badge>
                          </div>
                          <p className="text-sm text-[#78909C] mb-3">
                            Due: {format(new Date(event.dueDate), 'MMM d, h:mm a')}
                          </p>

                          {/* Mark assignment as done */}
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

                          {/* Undo completion */}
                          {event.completed && (
                            <div className="flex items-center gap-3 mt-2">
                              {event.completedAt && (
                                <p className="text-xs text-green-700">
                                  Completed{' '}
                                  {format(new Date(event.completedAt), 'MMM d, h:mm a')}
                                </p>
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
                    } 
                    
                    // GENERIC CALENDAR EVENT
                    else {
                      return (
                        <div
                          key={event.id}
                          className="p-3 rounded-lg border border-gray-100 hover:border-[#00796B] hover:bg-[#E0F2F1] transition-all duration-200"
                          style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-[#37474F]">
                              {event.title}
                            </h4>
                          </div>

                          {event.description && (
                            <p className="text-sm text-[#546E7A] mb-1">
                              {event.description}
                            </p>
                          )}

                          <p className="text-sm text-[#78909C]">
                            {format(new Date(event.start), 'h:mm a')} -{' '}
                            {format(new Date(event.end), 'h:mm a')}
                          </p>
                        </div>
                      );
                    }
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 
          ---------------------------------------
          LEGEND CARD
          ---------------------------------------
          Explains the visual cues used in calendar tiles.
          */}
          <Card className="shadow-lg border-0 bg-white mt-6">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg font-bold text-[#1A4D5E]">
                Legend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#00796B]" />
                  <span className="text-sm text-[#546E7A]">Has Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#00796B] text-white flex items-center justify-center text-xs font-bold">T</div>
                  <span className="text-sm text-[#546E7A]">Today</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#E0F2F1] border border-[#00796B]" />
                  <span className="text-sm text-[#546E7A]">Selected Day</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg border-l-4 border-[#FF9800] bg-white" />
                  <span className="text-sm text-[#546E7A]">Assignment (Pending)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg border-l-4 border-[#4CAF50] bg-white" />
                  <span className="text-sm text-[#546E7A]">Assignment (Done)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
