import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  BookOpen,
  UsersRound,
  Calendar,
  ClipboardCheck,
  DollarSign,
  ArrowUpRight,
  X,
} from "lucide-react";
import { dashboardAPI, eventsAPI } from "../../lib/api";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSIONS } from "../../utils/rbac";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { hasPermission } = usePermission();
  const [stats, setStats] = useState(null);
  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Refresh data every 30 seconds for real-time updates
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all dashboard data
      const [statsResponse, registrationsResponse, eventsResponse] =
        await Promise.all([
          dashboardAPI.getStats().catch(() => null),
          dashboardAPI.getRecentRegistrations(5).catch(() => ({ data: [] })),
          eventsAPI.getAll({ limit: 5 }).catch(() => ({ data: [] })),
        ]);

      // Set stats
      if (statsResponse?.data) {
        setStats(statsResponse.data);
      }

      // Set recent registrations
      const registrations = Array.isArray(registrationsResponse.data)
        ? registrationsResponse.data
        : [];
      setRecentRegistrations(registrations);

      // Set upcoming events
      const events = Array.isArray(eventsResponse.data)
        ? eventsResponse.data
        : eventsResponse.data?.events || [];

      const upcoming = events
        .filter((event) => new Date(event.event_date) > new Date())
        .sort((a, b) => new Date(a.event_date) - new Date(b.event_date))
        .slice(0, 5);

      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1)
      return (
        Math.floor(interval) +
        " year" +
        (Math.floor(interval) > 1 ? "s" : "") +
        " ago"
      );

    interval = seconds / 2592000;
    if (interval > 1)
      return (
        Math.floor(interval) +
        " month" +
        (Math.floor(interval) > 1 ? "s" : "") +
        " ago"
      );

    interval = seconds / 86400;
    if (interval > 1)
      return (
        Math.floor(interval) +
        " day" +
        (Math.floor(interval) > 1 ? "s" : "") +
        " ago"
      );

    interval = seconds / 3600;
    if (interval > 1)
      return (
        Math.floor(interval) +
        " hour" +
        (Math.floor(interval) > 1 ? "s" : "") +
        " ago"
      );

    interval = seconds / 60;
    if (interval > 1)
      return (
        Math.floor(interval) +
        " minute" +
        (Math.floor(interval) > 1 ? "s" : "") +
        " ago"
      );

    return "Just now";
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    const baseUrl = import.meta.env.VITE_IMAGE_URL || "http://localhost:5000";
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.substring(1)
      : imagePath;
    return `${baseUrl}/${cleanPath}`;
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, Administrator!
        </h2>
        <p className="text-blue-100">
          Here's what's happening in your school today.
        </p>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        {hasPermission(PERMISSIONS.VIEW_STUDENTS) && (
          <div
            className="card hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => navigate("/students")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats?.students || 0}
                </h3>
                <div className="flex items-center mt-2 text-xs">
                  <ArrowUpRight className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Total Teachers */}
        {hasPermission(PERMISSIONS.VIEW_TEACHERS) && (
          <div
            className="card hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            onClick={() => navigate("/teachers")}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Teachers</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats?.teachers || 0}
                </h3>
                <div className="flex items-center mt-2 text-xs">
                  <ArrowUpRight className="w-3 h-3 text-green-600 mr-1" />
                  <span className="text-green-600 font-medium">Active</span>
                </div>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        )}

        {/* Total Classes */}
        <div
          className="card hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
          onClick={() => navigate("/classes")}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Classes</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {stats?.classes || 0}
              </h3>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-gray-500">Active classes</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Total Staff */}
        <div className="card hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Staff</p>
              <h3 className="text-3xl font-bold text-gray-900">
                {stats?.staff || 0}
              </h3>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-gray-500">Including teachers</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
              <UsersRound className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance & Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Attendance */}
        {hasPermission(PERMISSIONS.VIEW_ATTENDANCE) && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Today's Attendance
              </h3>
              <button
                onClick={() => navigate("/attendance")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Details
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <ClipboardCheck className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Present</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {stats?.todayAttendance?.present || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <X className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Absent</p>
                    <p className="text-xs text-gray-500">Students</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {stats?.todayAttendance?.absent || 0}
                </span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Attendance Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {stats?.todayAttendance?.total > 0
                      ? Math.round(
                          (stats.todayAttendance.present /
                            stats.todayAttendance.total) *
                            100
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${
                        stats?.todayAttendance?.total > 0
                          ? (stats.todayAttendance.present /
                              stats.todayAttendance.total) *
                            100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fee Collection */}
        {hasPermission(PERMISSIONS.VIEW_FEES) && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Fee Collection (This Month)
              </h3>
              <button
                onClick={() => navigate("/fees")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View Details
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Collected
                    </p>
                    <p className="text-xs text-gray-500">From students</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-green-600">
                  ₹2,45,000
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Pending</p>
                    <p className="text-xs text-gray-500">To be collected</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-orange-600">
                  ₹85,000
                </span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Collection Rate</span>
                  <span className="text-sm font-semibold text-gray-900">
                    74%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    style={{ width: "74%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {(hasPermission(PERMISSIONS.CREATE_STUDENTS) ||
        hasPermission(PERMISSIONS.CREATE_EVENTS)) && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {hasPermission(PERMISSIONS.CREATE_STUDENTS) && (
              <button
                onClick={() => navigate("/students")}
                className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center group"
              >
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Add Student</p>
              </button>
            )}

            {hasPermission(PERMISSIONS.MARK_ATTENDANCE) && (
              <button
                onClick={() => navigate("/attendance")}
                className="p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-center group"
              >
                <ClipboardCheck className="w-8 h-8 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">
                  Mark Attendance
                </p>
              </button>
            )}

            {hasPermission(PERMISSIONS.CREATE_EXAMS) && (
              <button
                onClick={() => navigate("/exams")}
                className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-center group"
              >
                <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Create Exam</p>
              </button>
            )}

            {hasPermission(PERMISSIONS.CREATE_EVENTS) && (
              <button
                onClick={() => navigate("/events")}
                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-center group"
              >
                <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-gray-900">Add Event</p>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        {hasPermission(PERMISSIONS.VIEW_STUDENTS) && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Registrations
              </h3>
              <button
                onClick={() =>
                  navigate(
                    recentRegistrations[0]?.type === "student"
                      ? "/students"
                      : "/teachers"
                  )
                }
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            {recentRegistrations.length > 0 ? (
              <div className="space-y-3">
                {recentRegistrations.map((registration) => (
                  <div
                    key={`${registration.type}-${registration.id}`}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() =>
                      navigate(`/${registration.type}s/${registration.id}`)
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center overflow-hidden">
                        {registration.profile_photo ? (
                          <img
                            src={getImageUrl(registration.profile_photo)}
                            alt={registration.first_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML = `<span class="text-white font-semibold text-sm">${registration.first_name.charAt(
                                0
                              )}</span>`;
                            }}
                          />
                        ) : (
                          <span className="text-white font-semibold text-sm">
                            {registration.first_name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {registration.first_name} {registration.last_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          <span className="capitalize">
                            {registration.type}
                          </span>
                          {registration.class_name && (
                            <>
                              {" "}
                              • {registration.class_name}
                              {registration.section_name &&
                                `-${registration.section_name}`}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {getTimeAgo(registration.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No recent registrations</p>
              </div>
            )}
          </div>
        )}

        {/* Upcoming Events */}
        {hasPermission(PERMISSIONS.VIEW_EVENTS) && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Upcoming Events
              </h3>
              <button
                onClick={() => navigate("/events")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate("/events")}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(event.event_date).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        event.event_type === "holiday"
                          ? "bg-red-100 text-red-600"
                          : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {event.event_type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No upcoming events</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
