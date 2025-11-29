import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Check,
  Trash2,
  Filter,
  CheckCircle,
  AlertCircle,
  Info,
  Megaphone,
  Calendar,
  FileText,
  Award,
} from "lucide-react";
import { notificationsAPI } from "../lib/api";
import toast from "react-hot-toast";

const Notifications = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all"); // all, unread
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch notifications
  const { data: notificationsData, isLoading } = useQuery({
    queryKey: ["notifications", filter, page],
    queryFn: () =>
      notificationsAPI.getAll({
        limit,
        offset: (page - 1) * limit,
        unreadOnly: filter === "unread",
      }),
  });

  const notifications = notificationsData?.data?.data || [];
  const unreadCount = notificationsData?.data?.unreadCount || 0;

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

  // Delete notification mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => notificationsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
      toast.success("Notification deleted");
    },
  });

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      markReadMutation.mutate(notification.id);
    }

    if (notification.link) {
      navigate(notification.link);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-6 h-6 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case "announcement":
        return <Megaphone className="w-6 h-6 text-purple-500" />;
      case "exam":
        return <FileText className="w-6 h-6 text-blue-500" />;
      case "event":
        return <Calendar className="w-6 h-6 text-orange-500" />;
      case "result":
        return <Award className="w-6 h-6 text-indigo-500" />;
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-50";
      case "warning":
        return "bg-yellow-50";
      case "error":
        return "bg-red-50";
      case "announcement":
        return "bg-purple-50";
      case "exam":
        return "bg-blue-50";
      case "event":
        return "bg-orange-50";
      case "result":
        return "bg-indigo-50";
      default:
        return "bg-blue-50";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with latest activities and announcements
          </p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              className="btn btn-outline flex items-center gap-2"
              disabled={markAllReadMutation.isPending}
            >
              <Check className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex gap-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          All Notifications
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filter === "unread"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Unread Only
          {unreadCount > 0 && (
            <span className="ml-2 bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="loading mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No notifications found</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors flex gap-4 group ${
                  !notification.is_read ? "bg-blue-50/30" : ""
                }`}
              >
                <div
                  className={`p-3 rounded-full h-fit ${getBgColor(
                    notification.type
                  )}`}
                >
                  {getIcon(notification.type)}
                </div>

                <div
                  className="flex-1 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex justify-between items-start">
                    <h3
                      className={`text-lg ${
                        !notification.is_read
                          ? "font-bold text-gray-900"
                          : "font-medium text-gray-800"
                      }`}
                    >
                      {notification.title}
                    </h3>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {new Date(notification.created_at).toLocaleDateString()}{" "}
                      {new Date(notification.created_at).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{notification.message}</p>
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markReadMutation.mutate(notification.id);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMutation.mutate(notification.id);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination (Simple) */}
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="btn btn-outline"
        >
          Previous
        </button>
        <span className="py-2 px-4 font-medium text-gray-600">Page {page}</span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={notifications.length < limit}
          className="btn btn-outline"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Notifications;
