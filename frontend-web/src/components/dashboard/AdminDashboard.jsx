import { useEffect, useState, useRef } from "react";
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
  Sparkles,
  TrendingUp,
} from "lucide-react";
import api, { dailyReportsAPI } from "../../lib/api"; // Import API service

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    staff: 0,
    todayAttendance: {
      present: 0,
      absent: 0,
      total: 0
    },
    fees: {
      collected: 0,
      pending: 0,
      collectionRate: 0
    }
  });

  const [recentRegistrations, setRecentRegistrations] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [upcomingEvents] = useState([
    {
      id: 1,
      title: "Annual Sports Day",
      event_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      event_type: "event"
    },
    {
      id: 2,
      title: "Parent-Teacher Meeting",
      event_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      event_type: "meeting"
    },
    {
      id: 3,
      title: "Summer Vacation",
      event_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      event_type: "holiday"
    }
  ]);

  const containerRef = useRef(null);
  const welcomeRef = useRef(null);
  const statsCardsRef = useRef([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, registrationsRes, reportsRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/recent-registrations?limit=5"),
          dailyReportsAPI.getAll({ limit: 5 })
        ]);

        if (statsRes.data.success) {
          setStats(prev => ({
            ...prev,
            ...statsRes.data.data
          }));
        }

        if (registrationsRes.data.success) {
          setRecentRegistrations(registrationsRes.data.data);
        }

        if (reportsRes.success) {
          setRecentReports(reportsRes.data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (loading) return;

    // Number counting animation
    statsCardsRef.current.forEach((card, index) => {
      if (!card) return;
      const numberElement = card.querySelector('.stat-number');
      if (numberElement) {
        // Ensure finalValue is a number, checking both textContent and dataset
        const finalValue = parseInt(numberElement.dataset.value) || 0;

        let currentValue = 0;
        // Adjust counting speed based on value magnitude
        const steps = 60;
        const increment = finalValue / steps;

        const timer = setInterval(() => {
          currentValue += increment;
          if (currentValue >= finalValue) {
            numberElement.textContent = finalValue.toLocaleString(); // Add commas
            clearInterval(timer);
          } else {
            numberElement.textContent = Math.ceil(currentValue).toLocaleString();
          }
        }, 16);
      }
    });
  }, [loading, stats]);

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " year" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " month" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " day" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hour" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minute" + (Math.floor(interval) > 1 ? "s" : "") + " ago";
    return "Just now";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NTR', // Or INR/NPR depending on requirements - defaulting to existing symbol logic concept
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('NTR', '₹'); // Quick replace if currency mismatch
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Welcome Banner */}
      <div
        ref={welcomeRef}
        className="relative bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-7 h-7" />
            <h1 className="text-3xl font-bold">Welcome back, Administrator!</h1>
          </div>
          <p className="text-blue-100 text-lg mb-6">
            Here's what's happening in your school today.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full border border-white/20">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">All Systems Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students */}
        <div
          ref={(el) => (statsCardsRef.current[0] = el)}
          onClick={() => navigate('/users?tab=students')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">Total Students</p>
              <h3 className="stat-number text-4xl font-bold text-gray-900" data-value={stats.students}>
                0
              </h3>
              <div className="flex items-center mt-3 text-xs">
                <ArrowUpRight className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-blue-600 font-semibold">Active</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Total Teachers */}
        <div
          ref={(el) => (statsCardsRef.current[1] = el)}
          onClick={() => navigate('/users?tab=teachers')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">Total Teachers</p>
              <h3 className="stat-number text-4xl font-bold text-gray-900" data-value={stats.teachers}>
                0
              </h3>
              <div className="flex items-center mt-3 text-xs">
                <ArrowUpRight className="w-4 h-4 text-blue-600 mr-1" />
                <span className="text-blue-600 font-semibold">Active</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <UserCheck className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Total Classes */}
        <div
          ref={(el) => (statsCardsRef.current[2] = el)}
          onClick={() => navigate('/classes')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">Total Classes</p>
              <h3 className="stat-number text-4xl font-bold text-gray-900" data-value={stats.classes}>
                0
              </h3>
              <div className="flex items-center mt-3 text-xs">
                <span className="text-gray-600 font-semibold">Active classes</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Total Staff */}
        <div
          ref={(el) => (statsCardsRef.current[3] = el)}
          onClick={() => navigate('/users?tab=staffs')}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">Total Staff</p>
              <h3 className="stat-number text-4xl font-bold text-gray-900" data-value={stats.staff}>
                0
              </h3>
              <div className="flex items-center mt-3 text-xs">
                <span className="text-gray-600 font-semibold">Including teachers</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <UsersRound className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance & Fees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Attendance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Today's Attendance</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Details
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <ClipboardCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Present</p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.todayAttendance.present}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Absent</p>
                  <p className="text-xs text-gray-500">Students</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                {stats.todayAttendance.absent}
              </span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">Attendance Rate</span>
                <span className="text-sm font-bold text-gray-900">
                  {stats.todayAttendance.total > 0
                    ? Math.round((stats.todayAttendance.present / stats.todayAttendance.total) * 100)
                    : 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{
                    width: `${stats.todayAttendance.total > 0
                      ? (stats.todayAttendance.present / stats.todayAttendance.total) * 100
                      : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Fee Collection */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Fee Collection (This Month)</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Details
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Collected</p>
                  <p className="text-xs text-gray-500">From students</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(stats.fees?.collected || 0)}</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Pending</p>
                  <p className="text-xs text-gray-500">To be collected</p>
                </div>
              </div>
              <span className="text-lg font-bold text-gray-900">{formatCurrency(stats.fees?.pending || 0)}</span>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 font-medium">Collection Rate</span>
                <span className="text-sm font-bold text-gray-900">{stats.fees?.collectionRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${stats.fees?.collectionRate || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/users?tab=students')}
            className="p-5 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all border border-gray-200 hover:border-blue-600 text-center group">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-semibold text-gray-900">Add Student</p>
          </button>

          <button
            onClick={() => navigate('/attendance')}
            className="p-5 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all border border-gray-200 hover:border-blue-600 text-center group">
            <ClipboardCheck className="w-8 h-8 text-gray-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-semibold text-gray-900">Mark Attendance</p>
          </button>

          <button
            onClick={() => navigate('/exams')}
            className="p-5 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all border border-gray-200 hover:border-blue-600 text-center group">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-semibold text-gray-900">Create Exam</p>
          </button>

          <button
            onClick={() => navigate('/events')}
            className="p-5 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all border border-gray-200 hover:border-blue-600 text-center group">
            <Calendar className="w-8 h-8 text-gray-900 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <p className="text-sm font-semibold text-gray-900">Add Event</p>
          </button>
        </div>
      </div>

      {/* Recent Daily Reports */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Daily Reports</h3>
          <button
            onClick={() => navigate('/reports')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View All
          </button>
        </div>
        <div className="space-y-3">
          {recentReports.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No recent reports found.</p>
          ) : (
            recentReports.map((report) => (
              <div
                key={report.id}
                onClick={() => navigate(`/reports/${report.id}`)}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all cursor-pointer border border-gray-100 hover:border-blue-600"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0">
                    {report.teacher_first_name?.[0]}{report.teacher_last_name?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {report.teacher_first_name} {report.teacher_last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.class_name && <span>{report.class_name} • </span>}
                      {report.subject_name}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-gray-500 font-medium block">
                    {new Date(report.report_date).toLocaleDateString()}
                  </span>
                  <span className="text-[10px] font-semibold text-blue-600 uppercase">
                    {report.period_number ? `Period ${report.period_number}` : 'Report'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Activity & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {recentRegistrations.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No recent registrations found.</p>
            ) : (
              recentRegistrations.map((registration) => (
                <div
                  key={`${registration.type}-${registration.id}`}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all cursor-pointer border border-gray-100 hover:border-blue-600"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center overflow-hidden">
                      {registration.profile_photo ? (
                        <img
                          src={`http://localhost:5000/${registration.profile_photo}`}
                          alt={registration.first_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white font-semibold text-sm">
                          {registration.first_name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {registration.first_name} {registration.last_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="capitalize">{registration.type}</span>
                        {registration.class_name && (
                          <> • {registration.class_name}{registration.section_name && `-${registration.section_name}`}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">
                    {getTimeAgo(registration.created_at)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          <div className="space-y-3">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-blue-50 transition-all cursor-pointer border border-gray-100 hover:border-blue-600"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.event_date).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs px-3 py-1 rounded-full font-semibold ${event.event_type === "holiday"
                    ? "bg-gray-900 text-white"
                    : "bg-blue-600 text-white"
                    }`}
                >
                  {event.event_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
