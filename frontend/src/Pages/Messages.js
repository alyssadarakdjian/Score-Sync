import React, { useState, useEffect } from "react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Input } from "../Components/ui/input";
import { Textarea } from "../Components/ui/textarea";
import { Badge } from "../Components/ui/badge";
import { Send, Search, Plus, Users, Mail } from "lucide-react";
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
  const [messages, setMessages] = useState([]);

  const queryClient = useQueryClient();
  const API_BASE = process.env.REACT_APP_API_URL;
  const cachedUser = JSON.parse(localStorage.getItem("user"));
  const cachedEmail = localStorage.getItem("scoreSyncEmail");
  const [user, setUser] = useState(cachedUser || null);

  // Resolve user from email if not present in localStorage
  useEffect(() => {
    const fetchUser = async () => {
      if (user || !cachedEmail) return;
      try {
        const res = await axios.get(`/api/auth/user?email=${encodeURIComponent(cachedEmail)}`);
        if (res.data && res.data.user) {
          setUser(res.data.user);
          // cache for future
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.warn("Failed to resolve user from email", err.message);
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cachedEmail]);

  // Fetch all conversations for current user
  const userId = user?._id;
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ["conversations", userId || "unknown"],
    queryFn: async () => {
      if (!userId) return [];
      const res = await axios.get(`${API_BASE}/api/messages/conversations/${userId}`);
      return res.data;
    },
    enabled: !!userId,
  });

  // Fetch messages between current user and selected conversation participant
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }
    const fetchMessages = async () => {
      if (!selectedConversation || !userId) return;
      const res = await axios.get(
        `${API_BASE}/api/messages/${userId}/${selectedConversation._id}`
      );
      setMessages(res.data);
    };
    fetchMessages();
  }, [selectedConversation, API_BASE, userId]);

  // Fetch all users for composing
  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/api/auth/users`);
      return res.data;
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      const res = await axios.post(`${API_BASE}/api/messages`, data);
      return res.data;
    },
    onSuccess: () => {
      if (userId) {
        queryClient.invalidateQueries({ queryKey: ["conversations", userId] });
      }
      if (selectedConversation) {
        // Refetch messages for the selected conversation
        if (userId) {
          axios
            .get(`${API_BASE}/api/messages/${userId}/${selectedConversation._id}`)
            .then((res) => setMessages(res.data));
        }
      }
      setNewMessage("");
      setComposeOpen(false);
      setComposeTo("");
      setComposeSubject("");
      setComposeMessage("");
    },
  });

  const filteredConversations = (conversations || []).filter((conv) => {
    const name = conv.fullname ? conv.fullname.toLowerCase() : "";
    const email = conv.email ? conv.email.toLowerCase() : "";
    return (
      name.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase())
    );
  });

  // Send a reply inside a thread
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    await sendMessageMutation.mutateAsync({
      senderId: userId,
      recipientId: selectedConversation._id,
      subject: "Re: " + (selectedConversation.lastMessage || "Message"),
      content: newMessage,
    });
  };

  // Compose a new message
  const handleCompose = async () => {
    if (!composeTo || !composeSubject || !composeMessage) return;
    await sendMessageMutation.mutateAsync({
      senderId: userId,
      recipientId: composeTo,
      subject: composeSubject,
      content: composeMessage,
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#1A4D5E]">Messages</h2>
          <p className="text-[#78909C] mt-1">
            Communicate with teachers, students, or admins
          </p>
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
                    key={conv._id}
                    onClick={() =>
                      setSelectedConversation({
                        _id: conv._id,
                        fullname: conv.fullname || conv.email || "Unknown",
                        email: conv.email || "",
                        lastMessage: conv.lastMessage || "",
                        timestamp: conv.timestamp || null,
                        unread: conv.unread || 0,
                        avatar: ((conv.fullname || conv.email || "U")
                          .split(" ")
                          .map((n) => n[0])
                          .join("") || "U").toUpperCase(),
                      })
                    }
                    className={`w-full text-left p-4 transition-colors duration-200 ${
                      selectedConversation?._id === conv._id
                        ? "bg-[#E0F2F1]"
                        : "hover:bg-[#F5F5F5]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#00796B] to-[#004D40] rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {((conv.fullname || conv.email || "U")
                            .split(" ")
                            .map((n) => n[0])
                            .join("") || "U").toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-[#37474F] truncate">
                            {conv.fullname || conv.email || "Unknown"}
                          </h4>
                          {conv.unread > 0 && (
                            <Badge className="bg-[#00796B] text-white text-xs">
                              {conv.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#78909C] truncate mb-1">
                          {conv.lastMessage || ""}
                        </p>
                        <p className="text-xs text-[#B0BEC5]">
                          {conv.timestamp
                            ? format(new Date(conv.timestamp), "MMM d, h:mm a")
                            : ""}
                        </p>
                      </div>
                    </div>
                    {/* Delete Conversation Button (only for selected conversation) */}
                    {selectedConversation?._id === conv._id && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm("Delete this conversation?")) {
                            if (!userId) return;
                            await axios.delete(`${API_BASE}/api/messages/conversation/${userId}/${conv._id}`);
                            queryClient.invalidateQueries(["conversations", userId]);
                            setSelectedConversation(null);
                          }
                        }}
                        className="text-red-500 text-xs mt-2 hover:underline"
                      >
                        Delete Conversation
                      </button>
                    )}
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
                      {selectedConversation.fullname}
                    </CardTitle>
                    <p className="text-xs text-[#78909C]">
                      {selectedConversation.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.senderId?._id?.toString() === user._id.toString()
                        ? "justify-end"
                        : "justify-start"
                    } items-start gap-2`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId?._id?.toString() === user._id.toString()
                          ? "bg-[#00796B] text-white"
                          : "bg-[#F5F5F5] text-[#37474F]"
                      }`}
                    >
                      <p className="text-sm mb-1">{message.content}</p>
                      <p
                        className={`text-xs ${
                          message.senderId?._id?.toString() === user._id.toString()
                            ? "text-white/70"
                            : "text-[#78909C]"
                        }`}
                      >
                        {format(new Date(message.createdAt), "h:mm a")}
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
                    onKeyPress={(e) =>
                      e.key === "Enter" && handleSendMessage()
                    }
                    className="flex-1 border-2 focus:border-[#00796B]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    className="bg-[#00796B] hover:bg-[#00695C]"
                    disabled={sendMessageMutation.isPending}
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
                          {users
                    .filter((u) => (userId ? u._id !== userId : true))
                    .map((u) => (
                      <SelectItem key={u._id} value={u._id}>
                        {u.fullname} ({u.email})
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
            <Button variant="outline" onClick={() => setComposeOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCompose}
              className="bg-[#00796B] hover:bg-[#00695C]"
              disabled={
                !composeTo || !composeSubject || !composeMessage || sendMessageMutation.isPending
              }
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