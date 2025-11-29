import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Check, Trash2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsAPI } from "../../lib/api";
import socketService from "../../services/socket";
import toast from "react-hot-toast";

const NotificationBell = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch unread count
  const { data: unreadCountData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsAPI.getUnreadCount(),
    refetchInterval: 60000, // Poll every minute as backup
  });

  const unreadCount = unreadCountData?.count || 0;

  // Fetch recent notifications when dropdown is open
  const {
    data: notificationsData,
    refetch: refetchNotifications,
    isLoading,
  } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => notificationsAPI.getAll({ limit: 5 }),
    enabled: isOpen,
  });

  const notifications = notificationsData?.data || [];

  // Listen for real-time notifications
  useEffect(() => {
    const handleNewNotification = (notification) => {
      console.log("🔔 Client received notification:", notification);
      // Play sound or show toast
      toast.success(notification.title, {
        icon: "🔔",
        duration: 4000,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries(["notifications"]);
    };

    socketService.onNewNotification(handleNewNotification);

    return () => {
      socketService.removeListener("new_notification");
    };
  }, [queryClient]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Mark as read mutation
  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  // Mark all as read mutation
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      toast.success("All notifications marked as read");
    },
  });

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }

    setIsOpen(false);

    if (notification.link) {
      navigate(notification.link);
    } else {
      navigate("/notifications");
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "success":
        return "text-green-500 bg-green-50";
      case "warning":
        return "text-yellow-500 bg-yellow-50";
      case "error":
        return "text-red-500 bg-red-50";
      case "announcement":
        return "text-purple-500 bg-purple-50";
      default:
        return "text-blue-500 bg-blue-50";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllReadMutation.mutate()}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="loading mx-auto"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.is_read ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                          !notification.is_read
                            ? "bg-blue-500"
                            : "bg-transparent"
                        }`}
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            !notification.is_read
                              ? "font-semibold text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/notifications");
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full"
            >
              View All Notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
