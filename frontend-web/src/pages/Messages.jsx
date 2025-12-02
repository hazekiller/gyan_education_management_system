import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {
  Send,
  Search,
  User,
  Clock,
  Check,
  CheckCheck,
  UserPlus,
  X,
  Loader,
  Video,
  Phone,
} from "lucide-react";
import { selectCurrentUser } from "../store/slices/authSlice";
import messagesAPI from "../lib/messagesAPI";
import socketService from "../services/socket";
import Modal from "../components/common/Modal";
import VideoCall from "../components/chat/VideoCall";
import toast from "react-hot-toast";

const IMAGE_URL = import.meta.env.VITE_IMAGE_URL;

const Messages = () => {
  const currentUser = useSelector(selectCurrentUser);
  const queryClient = useQueryClient();
  const messagesEndRef = useRef(null);

  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  // Call State
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [callerName, setCallerName] = useState("");
  const [isAudioOnly, setIsAudioOnly] = useState(false);

  // Fetch conversations
  const { data: conversationsData, refetch: refetchConversations } = useQuery({
    queryKey: ["conversations"],
    queryFn: messagesAPI.getConversations,
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  });

  // Fetch messages for selected chat
  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["messages", selectedChat?.user_id],
    queryFn: () => messagesAPI.getMessages(selectedChat.user_id),
    enabled: !!selectedChat,
    refetchInterval: 10000, // Refetch every 10 seconds as backup
  });

  // Fetch users for new chat
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["messageable-users", userSearchQuery],
    queryFn: () => messagesAPI.getUsers(userSearchQuery),
    enabled: showNewChatModal,
  });

  // Send message mutation (fallback for HTTP)
  const sendMessageMutation = useMutation({
    mutationFn: messagesAPI.sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", selectedChat.user_id]);
      queryClient.invalidateQueries(["conversations"]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  // Initialize Socket.IO
  useEffect(() => {
    if (currentUser?.id) {
      socketService.connect(currentUser.id);
      socketService.userOnline(currentUser.id);

      // Listen for new messages
      socketService.onNewMessage((newMessage) => {
        console.log("New message received:", newMessage);
        queryClient.invalidateQueries(["messages"]);
        queryClient.invalidateQueries(["conversations"]);

        // Show notification if message is not from selected chat
        if (newMessage.sender_id !== selectedChat?.user_id) {
          toast.success("New message received");
        }
      });

      // Listen for message sent confirmation
      socketService.onMessageSent((sentMessage) => {
        console.log("Message sent:", sentMessage);
        queryClient.invalidateQueries(["messages", selectedChat?.user_id]);
        queryClient.invalidateQueries(["conversations"]);
      });

      // Listen for typing indicator
      socketService.onUserTyping(({ sender_id, isTyping: typing }) => {
        if (sender_id === selectedChat?.user_id) {
          setIsTyping(typing);
        }
      });

      // Listen for user status changes
      socketService.onUserStatusChanged(({ userId, isOnline }) => {
        setOnlineUsers((prev) => {
          const newSet = new Set(prev);
          if (isOnline) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      });

      // Listen for conversation updates
      socketService.onConversationUpdated(() => {
        refetchConversations();
      });

      // Listen for message errors
      socketService.onMessageError(({ error }) => {
        toast.error(error || "Failed to send message");
      });

      // Listen for incoming calls
      socketService.onCallUser((data) => {
        setReceivingCall(true);
        setCaller(data.from);
        setCallerName(data.name);
        setCallerSignal(data.signal);
        setIsAudioOnly(data.isAudioOnly);
        setShowVideoCall(true);
      });

      return () => {
        socketService.removeAllListeners();
      };
    }
  }, [currentUser, selectedChat, queryClient, refetchConversations]);

  // Handle sending message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && selectedChat && currentUser) {
      const messageData = {
        sender_id: currentUser.id,
        receiver_id: selectedChat.user_id,
        content: message.trim(),
      };

      // Send via Socket.IO
      if (socketService.isConnected()) {
        socketService.sendMessage(messageData);
        setMessage("");
      } else {
        // Fallback to HTTP
        sendMessageMutation.mutate(messageData);
        setMessage("");
      }

      // Stop typing indicator
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      socketService.typing(selectedChat.user_id, currentUser.id, false);
    }
  };

  // Handle typing indicator
  const handleTyping = (e) => {
    setMessage(e.target.value);

    if (!selectedChat || !currentUser) return;

    // Clear existing timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Send typing indicator
    socketService.typing(selectedChat.user_id, currentUser.id, true);

    // Set timeout to stop typing indicator
    const timeout = setTimeout(() => {
      socketService.typing(selectedChat.user_id, currentUser.id, false);
    }, 1000);

    setTypingTimeout(timeout);
  };

  const handleStartChat = (user) => {
    setSelectedChat({
      user_id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_photo: user.profile_photo,
      is_online: onlineUsers.has(user.id) || user.is_online,
      unread_count: 0,
    });
    setShowNewChatModal(false);
    setUserSearchQuery("");
  };

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesData]);

  const conversations = conversationsData?.data || [];
  const messages = messagesData?.data || [];
  const availableUsers = usersData?.data || [];

  const filteredConversations = conversations
    .map((conv) => ({
      ...conv,
      is_online: onlineUsers.has(conv.user_id) || conv.is_online,
    }))
    .filter(
      (conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const formatTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diff = now - messageDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return messageDate.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return messageDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <>
      <div className="h-[calc(100vh-8rem)]">
        <div className="card h-full p-0 overflow-hidden">
          <div className="grid grid-cols-12 h-full">
            {/* Conversations List */}
            <div className="col-span-12 lg:col-span-4 border-r border-gray-200 flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-gray-200 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Messages
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          socketService.isConnected()
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-500">
                        {socketService.isConnected() ? "Connected" : "Offline"}
                      </span>
                    </div>
                    <button
                      onClick={() => setShowNewChatModal(true)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="New Chat"
                    >
                      <UserPlus className="w-5 h-5 text-blue-600" />
                    </button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input pl-10"
                  />
                </div>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No conversations yet</p>
                    <button
                      onClick={() => setShowNewChatModal(true)}
                      className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Start a new chat
                    </button>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.user_id}
                      onClick={() => setSelectedChat(conv)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChat?.user_id === conv.user_id
                          ? "bg-blue-50"
                          : ""
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                            {conv.profile_photo ? (
                              <img
                                src={`${IMAGE_URL}/${conv.profile_photo}`}
                                alt={conv.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-600 font-semibold text-lg">
                                {conv.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {conv.is_online && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {conv.name}
                            </h4>
                            <span className="text-xs text-gray-500 flex-shrink-0">
                              {formatTime(conv.last_message_time)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mb-1 capitalize">
                            {conv.role?.replace("_", " ")}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 truncate flex-1">
                              {conv.last_message}
                            </p>
                            {conv.unread_count > 0 && (
                              <span className="flex-shrink-0 ml-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                                {conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="col-span-12 lg:col-span-8 flex flex-col h-full">
              {selectedChat ? (
                <>
                  {/* Chat Header - Sticky at top */}
                  <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                            {selectedChat.profile_photo ? (
                              <img
                                src={`${IMAGE_URL}/${selectedChat.profile_photo}`}
                                alt={selectedChat.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-blue-600 font-semibold">
                                {selectedChat.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          {selectedChat.is_online && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                          )}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {selectedChat.name}
                          </h3>
                          <p className="text-xs text-gray-500 capitalize">
                            {isTyping ? (
                              <span className="text-green-600">typing...</span>
                            ) : (
                              `${
                                selectedChat.is_online ? "Online" : "Offline"
                              } • ${selectedChat.role?.replace("_", " ")}`
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {selectedChat.is_online && (
                          <>
                            <button
                              onClick={() => {
                                setIsCalling(true);
                                setIsAudioOnly(true);
                                setShowVideoCall(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg text-green-600"
                              title="Audio Call"
                            >
                              <Phone className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                setIsCalling(true);
                                setIsAudioOnly(false);
                                setShowVideoCall(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg text-blue-600"
                              title="Video Call"
                            >
                              <Video className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedChat(null)}
                          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                        >
                          <X className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Messages - Scrollable area */}
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
                    style={{ maxHeight: "calc(100vh - 20rem)" }}
                  >
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            msg.message_type === "sent"
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.message_type === "sent"
                                ? "bg-blue-600 text-white"
                                : "bg-white text-gray-900 border border-gray-200"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <div className="flex items-center justify-end mt-1 space-x-1">
                              <Clock className="w-3 h-3 opacity-70" />
                              <span className="text-xs opacity-70">
                                {new Date(msg.created_at).toLocaleTimeString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                              {msg.message_type === "sent" &&
                                (msg.is_read ? (
                                  <CheckCheck className="w-4 h-4 opacity-70" />
                                ) : (
                                  <Check className="w-4 h-4 opacity-70" />
                                ))}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input - Fixed at bottom */}
                  <div className="flex-shrink-0 p-4 border-t border-gray-200 bg-white">
                    <form
                      onSubmit={handleSendMessage}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="text"
                        value={message}
                        onChange={handleTyping}
                        placeholder="Type a message..."
                        className="flex-1 input"
                        disabled={sendMessageMutation.isLoading}
                      />
                      <button
                        type="submit"
                        disabled={
                          !message.trim() || sendMessageMutation.isLoading
                        }
                        className="btn btn-primary px-4 py-2 flex items-center space-x-2"
                      >
                        {sendMessageMutation.isLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>Send</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No conversation selected
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Select a conversation from the list or start a new one
                    </p>
                    <button
                      onClick={() => setShowNewChatModal(true)}
                      className="btn btn-primary"
                    >
                      Start New Chat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Chat Modal */}
      <Modal
        isOpen={showNewChatModal}
        onClose={() => {
          setShowNewChatModal(false);
          setUserSearchQuery("");
        }}
        title="Start New Chat"
      >
        <div className="space-y-4">
          {/* Search Users */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="input pl-10"
            />
          </div>

          {/* Users List */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {usersLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="w-6 h-6 text-blue-600 animate-spin" />
              </div>
            ) : availableUsers.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {userSearchQuery
                  ? "No users found"
                  : "Start typing to search users"}
              </p>
            ) : (
              availableUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleStartChat(user)}
                  className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                      {user.profile_photo ? (
                        <img
                          src={user.profile_photo}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-blue-600 font-semibold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {(onlineUsers.has(user.id) || user.is_online) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </h4>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.role?.replace("_", " ")}
                      {user.class_name && ` • ${user.class_name}`}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
      {/* Video Call Modal */}
      {showVideoCall && (
        <VideoCall
          isOpen={showVideoCall}
          onClose={() => {
            setShowVideoCall(false);
            setReceivingCall(false);
            setIsCalling(false);
          }}
          callerData={{
            from: caller,
            name: callerName,
            signal: callerSignal,
          }}
          isIncomingCall={receivingCall}
          userToCall={selectedChat}
          isAudioOnly={isAudioOnly}
          onCallEnded={() => {
            setShowVideoCall(false);
            setReceivingCall(false);
            setIsCalling(false);
            setIsAudioOnly(false);
          }}
        />
      )}
    </>
  );
};

export default Messages;
