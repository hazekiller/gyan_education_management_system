import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  BookOpen,
  ClipboardCheck,
  Clock,
  Award,
  Megaphone,
  TrendingUp,
  FileText,
  Sparkles,
  Target,
  BookMarked,
} from "lucide-react";
import api, { dashboardAPI, teachersAPI } from "../../lib/api";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice";
import toast from "react-hot-toast";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSIONS } from "../../utils/rbac";
import gsap from "gsap";
import { StatCard, WelcomeBanner, SectionCard, QuickActionButton, LoadingSpinner, EmptyState } from "../common/EnhancedComponents";

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const { hasPermission } = usePermission();

  const [stats, setStats] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  // Refs for GSAP
  const containerRef = useRef(null);
  const welcomeRef = useRef(null);
  const statsCardsRef = useRef([]);
  const sectionsRef = useRef([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // GSAP Animations
  useEffect(() => {
    if (loading) return;

    const ctx = gsap.context(() => {
      // Welcome banner
      gsap.fromTo(welcomeRef.current,
        { y: -30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      // Stats cards
      statsCardsRef.current.forEach((card, index) => {
        if (!card) return;
        gsap.set(card, { opacity: 1, y: 0, scale: 1 });

        // Counter animation
        const numberElement = card.querySelector('.stat-number');
        if (numberElement) {
          const finalValue = parseInt(numberElement.textContent) || 0;
          numberElement.textContent = '0';

          gsap.to(numberElement, {
            textContent: finalValue,
            duration: 1.5,
            delay: 0.2 + (index * 0.1),
            ease: "power2.out",
            snap: { textContent: 1 },
            onUpdate: function () {
              numberElement.textContent = Math.ceil(this.targets()[0].textContent);
            }
          });
        }
      });

      // Sections
      sectionsRef.current.forEach((section) => {
        if (section) gsap.set(section, { opacity: 1, y: 0 });
      });
    }, containerRef);

    return () => ctx.revert();
  }, [loading]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      let finalStats = {};
      let finalStudents = 0;
      let finalSchedule = [];
      let teacherId = null;

      // Get Teacher ID from user_id
      try {
        const teachersRes = await teachersAPI.getAll();
        const teacherRecord = teachersRes.data?.find(
          (t) => t.user_id === currentUser.id
        );
        if (teacherRecord) {
          teacherId = teacherRecord.id;
          console.log(
            "Found teacher ID:",
            teacherId,
            "for user:",
            currentUser.id
          );
        } else {
          console.error("Teacher record not found for user:", currentUser.id);
        }
      } catch (err) {
        console.error("Teacher fetch error:", err);
      }

      if (!teacherId) {
        setLoading(false);
        toast.error("Teacher profile not found");
        return;
      }

      // Dashboard Stats - Use teacher-specific endpoint
      try {
        const statsRes = await dashboardAPI.getTeacherStats(teacherId);
        finalStats = statsRes.data || {};
        // Override students count with the one from teacher stats
        finalStudents = finalStats.students || 0;
      } catch (err) {
        console.error("Stats fetch error:", err);
      }

      // Teacher Schedule
      try {
        const scheduleRes = await teachersAPI.getSchedule(teacherId);
        finalSchedule = scheduleRes.data || [];
      } catch (err) {
        console.error("Schedule fetch error:", err);
      }

      // UPDATE UI
      setStats(finalStats);
      setSchedule(finalSchedule);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get today's schedule
  const getTodaySchedule = () => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const today = days[new Date().getDay()];
    return schedule.filter((s) => s.day_of_week?.toLowerCase() === today);
  };

  // Helper: Get upcoming class
  const getUpcomingClass = () => {
    const todaySchedule = getTodaySchedule();
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return todaySchedule.find((s) => {
      const [hours, minutes] = s.start_time.split(":");
      const classTime = parseInt(hours) * 60 + parseInt(minutes);
      return classTime > currentTime;
    });
  };

  if (loading) {
    return <LoadingSpinner size="lg" className="h-64" />;
  }

  const todaySchedule = getTodaySchedule();
  const upcomingClass = getUpcomingClass();

  const attendanceRate = stats?.todayAttendance?.total > 0
    ? Math.round((stats.todayAttendance.present / stats.todayAttendance.total) * 100)
    : 0;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Welcome Message */}
      <WelcomeBanner
        ref={welcomeRef}
        title={`Welcome back, ${currentUser?.details?.first_name || 'Teacher'}!`}
        subtitle={upcomingClass ? `Next Class: ${upcomingClass.subject_name} - ${upcomingClass.class_name}${upcomingClass.section_name ? ` ${upcomingClass.section_name}` : ''}` : "No upcoming classes today"}
        gradient="from-blue-600 to-blue-700"
        stats={upcomingClass ? [{
          icon: Clock,
          label: "Next Class",
          value: `${upcomingClass.start_time} - ${upcomingClass.end_time}`,
          subtitle: `Room ${upcomingClass.room_number || 'TBA'}`
        }] : []}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hasPermission(PERMISSIONS.VIEW_STUDENTS) && (
          <StatCard
            ref={(el) => (statsCardsRef.current[0] = el)}
            title="Total Students"
            value={stats?.students || 0}
            subtitle="Under your classes"
            icon={Users}
            iconGradient="from-blue-600 to-blue-700"
            textColor="text-gray-900"
            bgGradient="from-white to-white"
            className="border border-gray-200 shadow-sm"
            onClick={() => navigate("/students")}
          />
        )}

        {hasPermission(PERMISSIONS.VIEW_CLASSES) && (
          <StatCard
            ref={(el) => (statsCardsRef.current[1] = el)}
            title="Subjects Taught"
            value={stats?.subjects || 0}
            subtitle="Unique subjects"
            icon={BookOpen}
            iconGradient="from-blue-600 to-blue-700"
            textColor="text-gray-900"
            bgGradient="from-white to-white"
            className="border border-gray-200 shadow-sm"
            onClick={() => navigate("/classes")}
          />
        )}

        {hasPermission(PERMISSIONS.VIEW_ATTENDANCE) && (
          <StatCard
            ref={(el) => (statsCardsRef.current[2] = el)}
            title="Attendance Rate"
            value={`${attendanceRate}%`}
            subtitle="Today's average"
            icon={ClipboardCheck}
            iconGradient="from-blue-600 to-blue-700"
            textColor="text-gray-900"
            bgGradient="from-white to-white"
            className="border border-gray-200 shadow-sm"
            onClick={() => navigate("/attendance")}
          />
        )}

        {hasPermission(PERMISSIONS.VIEW_ASSIGNMENTS) && (
          <StatCard
            ref={(el) => (statsCardsRef.current[3] = el)}
            title="Pending Reviews"
            value={stats?.pendingAssignments || 0}
            subtitle="Assignments to grade"
            icon={Award}
            iconGradient="from-gray-700 to-gray-800"
            textColor="text-gray-900"
            bgGradient="from-white to-white"
            className="border border-gray-200 shadow-sm"
            onClick={() => navigate("/assignments")}
          />
        )}
      </div>

      {/* Today's Schedule & Quick Actions */}
      <div ref={(el) => (sectionsRef.current[0] = el)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <SectionCard
          className="lg:col-span-2"
          title="Today's Schedule"
          icon={Calendar}
          action={() => navigate("/schedule")}
          actionLabel="View Full Schedule"
        >
          {todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule.map((period) => {
                const isPast = () => {
                  const now = new Date();
                  const [hours, minutes] = period.end_time.split(":");
                  const endTime = new Date();
                  endTime.setHours(parseInt(hours), parseInt(minutes));
                  return now > endTime;
                };

                const isCurrent = () => {
                  const now = new Date();
                  const [startHours, startMinutes] = period.start_time.split(":");
                  const [endHours, endMinutes] = period.end_time.split(":");
                  const startTime = new Date();
                  startTime.setHours(parseInt(startHours), parseInt(startMinutes));
                  const endTime = new Date();
                  endTime.setHours(parseInt(endHours), parseInt(endMinutes));
                  return now >= startTime && now <= endTime;
                };

                return (
                  <div
                    key={period.id}
                    className={`p-4 rounded-xl border-l-4 transition-all duration-300 ${isCurrent()
                      ? "bg-green-50 border-green-500 shadow-md border border-gray-100"
                      : isPast()
                        ? "bg-gray-50 border-gray-300 opacity-60"
                        : "bg-white border-blue-500 border border-gray-100 shadow-sm"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {isCurrent() && (
                            <span className="px-3 py-1 bg-green-500 text-white text-xs rounded-full font-semibold animate-pulse">
                              Current
                            </span>
                          )}
                          <h4 className="font-bold text-gray-900">
                            Period {period.period_number}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-700 font-semibold mb-1">
                          {period.subject_name || "Subject"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {period.class_name}{" "}
                          {period.section_name && `- ${period.section_name}`}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {period.start_time} - {period.end_time}
                            </span>
                          </span>
                          {period.room_number && (
                            <span className="flex items-center gap-1">
                              <BookMarked className="w-3 h-3" />
                              Room {period.room_number}
                            </span>
                          )}
                        </div>
                      </div>
                      {!isPast() && (
                        <button
                          onClick={() => navigate("/attendance")}
                          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                        >
                          Mark Attendance
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Calendar}
              title="No classes scheduled for today"
              description="Enjoy your day off!"
            />
          )}
        </SectionCard>

        {/* Quick Actions */}
        <SectionCard
          title="Quick Actions"
          icon={Sparkles}
        >
          <div className="space-y-3">
            <QuickActionButton
              icon={ClipboardCheck}
              label="Mark Attendance"
              description="Record student presence"
              onClick={() => navigate("/attendance")}
              color="blue"
            />
            <QuickActionButton
              icon={FileText}
              label="Create Assignment"
              description="Add new homework"
              onClick={() => navigate("/assignments")}
              color="green"
            />
            <QuickActionButton
              icon={Award}
              label="Enter Results"
              description="Update exam marks"
              onClick={() => navigate("/exams")}
              color="purple"
            />
            <QuickActionButton
              icon={Users}
              label="View Students"
              description="Class roster"
              onClick={() => navigate("/students")}
              color="orange"
            />
          </div>
        </SectionCard>
      </div>

      {/* Performance & Announcements */}
      <div ref={(el) => (sectionsRef.current[1] = el)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Performance */}
        <SectionCard
          title="Class Performance"
          icon={TrendingUp}
          action={() => { }}
          actionLabel="View Details"
        >
          <div className="space-y-3">
            {[
              { class: "Grade 10-A", subject: "Mathematics", score: 85, color: "from-blue-600 to-blue-700" },
              { class: "Grade 9-B", subject: "Physics", score: 78, color: "from-blue-600 to-blue-700" },
              { class: "Grade 8-A", subject: "Science", score: 72, color: "from-blue-600 to-blue-700" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-200`}>
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.class}</p>
                    <p className="text-xs text-gray-600">{item.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-2xl font-bold text-gray-900`}>{item.score}%</p>
                  <p className="text-xs text-gray-500">Avg Score</p>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Announcements */}
        <SectionCard
          title="Announcements"
          icon={Megaphone}
          action={() => navigate("/announcements")}
          actionLabel="View All"
        >
          {stats?.announcements && stats.announcements.length > 0 ? (
            <div className="space-y-3">
              {stats.announcements.slice(0, 3).map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-4 bg-white border border-gray-200 border-l-4 border-l-blue-600 rounded-xl hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start space-x-3">
                    <Megaphone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 mb-1">
                        {announcement.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(announcement.published_at).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Megaphone}
              title="No announcements"
              description="Check back later for updates"
            />
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default TeacherDashboard;
