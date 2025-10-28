import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Textarea } from "../Components/ui/textarea";
import { Badge } from "../Components/ui/badge";
import { Avatar } from "../Components/ui/avatar";
import { Send, Search, Plus, Users, User, Mail } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../Components/ui/dialog";
import { Label } from "../Components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";

export default function Messages() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMessage, setComposeMessage] = useState("");

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => base44.entities.Student.list(),
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  // Mock conversations data (in a real app, this would come from a Messages entity)
  const conversations = [
    {
      id: 1,
      participant: "John Smith",
      participantEmail: "john.smith@example.com",
      lastMessage: "Thank you for the feedback on my essay!",
      timestamp: new Date(2024, 0, 20, 14, 30),
      unread: 2,
      avatar: "JS"
    },
    {
      id: 2,
      participant: "Sarah Johnson",
      participantEmail: "sarah.j@example.com",
      lastMessage: "When is the next assignment due?",
      timestamp: new Date(2024, 0, 19, 10, 15),
      unread: 0,
      avatar: "SJ"
    },
    {
      id: 3,
      participant: "Mike Williams",
      participantEmail: "mike.w@example.com",
      lastMessage: "I have a question about the midterm exam",
      timestamp: new Date(2024, 0, 18, 16, 45),
      unread: 1,
      avatar: "MW"
    },
  ];

  const messages = selectedConversation ? [
    {
      id: 1,
      sender: selectedConversation.participant,
      content: "Hello! I wanted to discuss my recent grade.",
      timestamp: new Date(2024, 0, 20, 14, 0),
      isOwn: false
    },
    {
      id: 2,
      sender: user?.full_name || "You",
      content: "Of course! What would you like to know?",
      timestamp: new Date(2024, 0, 20, 14, 15),
      isOwn: true
    },
    {
      id: 3,
      sender: selectedConversation.participant,
      content: selectedConversation.lastMessage,
      timestamp: selectedConversation.timestamp,
      isOwn: false
    },
  ] : [];

  const filteredConversations = conversations.filter(conv =>
    conv.participant.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participantEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would create a new message in the database
      console.log("Sending message:", newMessage);
      setNewMessage("");
    }
  };

  const handleCompose = () => {
    // In a real app, this would send the message via email or save to database
    console.log("Composing message to:", composeTo, composeSubject, composeMessage);
    setComposeOpen(false);
    setComposeTo("");
    setComposeSubject("");
    setComposeMessage("");
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D5E]">Messages</h2>
          <p className="text-[#78909C] mt-1">Communicate with students and parents</p>
        </div>
        <Button
          onClick={() => setComposeOpen(true)}
          className="bg-[#00796B] hover:bg-[#00695C]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Message
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Conversations List */}
        <Card className="shadow-lg border-0 bg-white overflow-hidden flex flex-col">
          <CardHeader className="border-b border-gray-100 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#78909C] w-4 h-4" />
              <Input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-2 focus:border-[#00796B]"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-8 px-4">
                <Users className="w-12 h-12 text-[#CFD8DC] mx-auto mb-3" />
                <p className="text-[#78909C]">No conversations found</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredConversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full text-left p-4 transition-colors duration-200 ${
                      selectedConversation?.id === conv.id
                        ? 'bg-[#E0F2F1]'
                        : 'hover:bg-[#F5F5F5]'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {conv.avatar}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-[#37474F] truncate">
                            {conv.participant}
                          </h4>
                          {conv.unread > 0 && (
                            <Badge className="bg-[#00796B] text-white text-xs">
                              {conv.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#78909C] truncate mb-1">
                          {conv.lastMessage}
                        </p>
                        <p className="text-xs text-[#B0BEC5]">
                          {format(conv.timestamp, 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="lg:col-span-2 shadow-lg border-0 bg-white overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {selectedConversation.avatar}
                    </span>
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-[#1A4D5E]">
                      {selectedConversation.participant}
                    </CardTitle>
                    <p className="text-xs text-[#78909C]">{selectedConversation.participantEmail}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isOwn
                          ? 'bg-[#00796B] text-white'
                          : 'bg-[#F5F5F5] text-[#37474F]'
                      }`}
                    >
                      <p className="text-sm mb-1">{message.content}</p>
                      <p className={`text-xs ${message.isOwn ? 'text-white/70' : 'text-[#78909C]'}`}>
                        {format(message.timestamp, 'h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
              <div className="border-t border-gray-100 p-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 border-2 focus:border-[#00796B]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-[#00796B] hover:bg-[#00695C]"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Mail className="w-16 h-16 text-[#CFD8DC] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#37474F] mb-2">
                  No conversation selected
                </h3>
                <p className="text-[#78909C]">
                  Select a conversation from the list to view messages
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1A4D5E]">
              New Message
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="to">To</Label>
              <Select value={composeTo} onValueChange={setComposeTo}>
                <SelectTrigger className="border-2 focus:border-[#00796B]">
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  {students.filter(s => s.status === 'active').map(student => (
                    <SelectItem key={student.id} value={student.email}>
                      {student.first_name} {student.last_name} ({student.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={composeSubject}
                onChange={(e) => setComposeSubject(e.target.value)}
                placeholder="Message subject"
                className="border-2 focus:border-[#00796B]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={composeMessage}
                onChange={(e) => setComposeMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={8}
                className="border-2 focus:border-[#00796B]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setComposeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCompose}
              className="bg-[#00796B] hover:bg-[#00695C]"
              disabled={!composeTo || !composeSubject || !composeMessage}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}