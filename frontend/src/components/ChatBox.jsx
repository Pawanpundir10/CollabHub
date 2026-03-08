import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Pencil, Trash2, X } from "lucide-react";
import { format, isToday, isYesterday, isSameDay } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
const socketURL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : "http://localhost:5000";
const ChatBox = ({ groupId, profiles }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const messagesEndRef = useRef(null);
  useEffect(() => {
    fetchMessages();
    // Initialize socket connection
    const newSocket = io(socketURL, {
      withCredentials: true,
    });
    setSocket(newSocket);
    newSocket.on("connect", () => {
      setIsConnected(true);
      newSocket.emit("join-group", groupId);
    });
    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });
    newSocket.on("new-message", (msg) => {
      console.log("New message received:", msg);
      setMessages((prev) => {
        const isDuplicate = prev.some((m) => m._id === msg._id);
        return isDuplicate ? prev : [...prev, msg];
      });
    });
    newSocket.on("message-deleted", (messageId) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    });
    newSocket.on("message-edited", (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    });
    return () => {
      newSocket.disconnect();
    };
  }, [groupId]);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const fetchMessages = async () => {
    try {
      const response = await api.get(`/groups/${groupId}/messages`);
      setMessages(response.data || []);
    }
    catch (error) {
      console.error("Unexpected error fetching messages:", error);
      toast({
        title: "Error loading messages",
        description: "Failed to load chat history.",
        variant: "destructive",
      });
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !user || !socket)
      return;
    setSending(true);

    const activeUserId = user.id || user._id;

    try {
      if (editingMessage) {
        socket.emit("edit-message", {
          messageId: editingMessage._id,
          groupId,
          newText: newMessage.trim(),
          senderId: activeUserId
        });
        setEditingMessage(null);
      } else {
        socket.emit("send-message", {
          groupId,
          text: newMessage.trim(),
          senderId: activeUserId,
        });
      }
      setNewMessage("");
    }
    catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
    finally {
      setSending(false);
    }
  };

  const handleEditInit = (msg) => {
    setEditingMessage(msg);
    setNewMessage(msg.text);
  };

  const handleDelete = (messageId) => {
    if (!socket || !user) return;
    socket.emit("delete-message", {
      messageId,
      groupId,
      senderId: user.id
    });
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };
  return (<div className="bg-card rounded-xl border border-border shadow-card overflow-hidden flex flex-col h-[500px]">
    <div className="px-4 py-3 border-b border-border bg-muted/50">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        <h3 className="font-semibold text-foreground">Group Chat</h3>
      </div>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 ? (<div className="flex flex-col items-center justify-center h-full text-center">
        <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">No messages yet</p>
        <p className="text-sm text-muted-foreground/70">
          Be the first to say hello!
        </p>
      </div>) : (messages.map((message, index) => {
        const senderId = message.sender?._id || message.sender;
        const currentUserId = user?.id || user?._id;
        const isOwn = String(senderId) === String(currentUserId);

        const messageDate = new Date(message.createdAt);
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const prevMessageDate = prevMessage ? new Date(prevMessage.createdAt) : null;
        // Check if we need to show a date separator
        const showDateSeparator = !prevMessageDate || !isSameDay(messageDate, prevMessageDate);
        // Get the date label
        const getDateLabel = (date) => {
          if (isToday(date))
            return "Today";
          if (isYesterday(date))
            return "Yesterday";
          return format(date, "MMMM d, yyyy");
        };
        const senderName = message.sender?.name || profiles[message.sender?._id] || "Unknown";
        return (<div key={message._id}>
          {showDateSeparator && (<div className="flex items-center justify-center my-4">
            <div className="bg-muted/80 text-muted-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-sm">
              {getDateLabel(messageDate)}
            </div>
          </div>)}
          <div className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}>
            {!isOwn && (
              <Avatar className="h-8 w-8 mr-2 mt-auto mb-1">
                <AvatarImage src={message.sender?.avatarUrl} />
                <AvatarFallback className="text-xs bg-secondary text-secondary-foreground">{senderName.charAt(0)}</AvatarFallback>
              </Avatar>
            )}
            {isOwn && (
              <div className="flex flex-col justify-center items-center gap-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEditInit(message)} className="text-muted-foreground hover:text-primary transition-colors" title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => handleDelete(message._id)} className="text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="flex flex-col max-w-[75%]">
              <p className={`text-[10px] font-medium mb-1 px-1 ${isOwn ? "text-right text-muted-foreground" : "text-left text-muted-foreground"}`}>
                {isOwn ? "You" : senderName}
              </p>
              <div className={`rounded-2xl px-4 py-2.5 ${isOwn
                ? "bg-primary text-primary-foreground rounded-br-md"
                : "bg-secondary text-secondary-foreground rounded-bl-md"}`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{message.text}</p>
                <div className={`flex items-center gap-1 text-[10px] mt-1 ${isOwn
                  ? "text-primary-foreground/60"
                  : "text-muted-foreground"}`}>
                  <span>{format(messageDate, "HH:mm")}</span>
                  {message.isEdited && <span className="italic">(edited)</span>}
                </div>
              </div>
            </div>
            {isOwn && (
              <Avatar className="h-8 w-8 ml-2 mt-auto mb-1">
                <AvatarImage src={message.sender?.avatarUrl || user?.avatarUrl} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">{user?.name?.charAt(0) || senderName.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>);
      }))}
      <div ref={messagesEndRef} />
    </div>

    <form onSubmit={sendMessage} className="p-4 border-t border-border bg-muted/30">
      {editingMessage && (
        <div className="flex items-center justify-between bg-primary/10 text-primary text-xs px-3 py-1.5 rounded-t-md border border-primary/20 border-b-0 -mt-8 mb-2 z-10 relative">
          <span className="flex items-center gap-1"><Pencil className="h-3 w-3" /> Editing specific message</span>
          <button type="button" onClick={cancelEdit} className="hover:text-foreground">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
      <div className="flex gap-2">
        <Input placeholder={editingMessage ? "Update message..." : "Type a message..."} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className={`flex-1 ${editingMessage ? 'border-primary' : ''}`} disabled={sending || !isConnected} />
        <Button type="submit" variant={editingMessage ? "default" : "gradient"} disabled={!newMessage.trim() || sending || !isConnected}>
          {editingMessage ? "Save" : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </form>
  </div>);
};
export default ChatBox;
