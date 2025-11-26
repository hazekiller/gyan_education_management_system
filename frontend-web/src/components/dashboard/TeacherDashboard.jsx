import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  Users,
  BookOpen,
  ClipboardCheck,
  Clock,
  Award,
  Megaphone,
  TrendingUp,
  FileText
} from 'lucide-react';
import { dashboardAPI } from '../../lib/api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

import axios from 'axios';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [stats, setStats] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, scheduleResponse] = await Promise.all([
        dashboardAPI.getStats().catch(() => null),
        axios.get(`${import.meta.env.VITE_API_URL}/my-schedule`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);

      // Set stats
      if (statsResponse?.data) {
        setStats(statsResponse.data);
      }
      setSchedule(scheduleResponse.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getTodaySchedule = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];
    return schedule.filter(s => s.day_of_week === today);
  };

  const getUpcomingClass = () => {
    const todaySchedule = getTodaySchedule();
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return todaySchedule.find(s => {
      const [hours, minutes] = s.start_time.split(':');
      const classTime = parseInt(hours) * 60 + parseInt(minutes);
      return classTime > currentTime;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const todaySchedule = getTodaySchedule();
  const upcomingClass = getUpcomingClass();

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Teacher!</h2>
        <p className="text-green-100">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        {upcomingClass && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <p className="text-sm text-green-100 mb-1">Next Class</p>
            <h3 className="text-lg font-semibold">
              {upcomingClass.class_name} {upcomingClass.section_name && `- ${upcomingClass.section_name}`}
            </h3>
            <p className="text-sm text-green-100">
              {upcomingClass.subject_name} • {upcomingClass.start_time} - {upcomingClass.end_time} • Room {upcomingClass.room_number}
            </p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/students')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.students || 0}</h3>
              <p className="text-xs text-gray-600 mt-1">Under your classes</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow" onClick={()=>navigate('/class')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Classes Today</p>
              <h3 className="text-2xl font-bold text-gray-900">{todaySchedule.length}</h3>
              <p className="text-xs text-gray-600 mt-1">Scheduled periods</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/attendance')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {stats?.todayAttendance?.total > 0 
                  ? Math.round((stats.todayAttendance.present / stats.todayAttendance.total) * 100)
                  : 0}%
              </h3>
              <p className="text-xs text-gray-600 mt-1">Today's average</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/assignments')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Reviews</p>
              <h3 className="text-2xl font-bold text-gray-900">8</h3>
              <p className="text-xs text-gray-600 mt-1">Assignments to grade</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
            <button 
              onClick={() => navigate('/schedule')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View Full Schedule
            </button>
          </div>
          {todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule.map((period) => {
                const isPast = () => {
                  const now = new Date();
                  const [hours, minutes] = period.end_time.split(':');
                  const endTime = new Date();
                  endTime.setHours(parseInt(hours), parseInt(minutes));
                  return now > endTime;
                };

                const isCurrent = () => {
                  const now = new Date();
                  const [startHours, startMinutes] = period.start_time.split(':');
                  const [endHours, endMinutes] = period.end_time.split(':');
                  const startTime = new Date();
                  startTime.setHours(parseInt(startHours), parseInt(startMinutes));
                  const endTime = new Date();
                  endTime.setHours(parseInt(endHours), parseInt(endMinutes));
                  return now >= startTime && now <= endTime;
                };

                return (
                  <div 
                    key={period.id} 
                    className={`p-4 rounded-lg border-l-4 ${
                      isCurrent() 
                        ? 'bg-green-50 border-green-500' 
                        : isPast() 
                        ? 'bg-gray-50 border-gray-300 opacity-60' 
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {isCurrent() && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full font-medium">
                              Current
                            </span>
                          )}
                          <h4 className="font-semibold text-gray-900">
                            Period {period.period_number}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-700 font-medium mb-1">
                          {period.subject_name || 'Subject'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {period.class_name} {period.section_name && `- ${period.section_name}`}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{period.start_time} - {period.end_time}</span>
                          </span>
                          {period.room_number && (
                            <span>Room {period.room_number}</span>
                          )}
                        </div>
                      </div>
                      {!isPast() && (
                        <button
                          onClick={() => navigate('/attendance')}
                          className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
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
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No classes scheduled for today</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/attendance')}
              className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Mark Attendance</p>
                  <p className="text-xs text-gray-600">Record student presence</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/assignments')}
              className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Create Assignment</p>
                  <p className="text-xs text-gray-600">Add new homework</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/exams')}
              className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Enter Results</p>
                  <p className="text-xs text-gray-600">Update exam marks</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/students')}
              className="w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">View Students</p>
                  <p className="text-xs text-gray-600">Class roster</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Overview */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Class Performance</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View Details
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Grade 10-A</p>
                  <p className="text-xs text-gray-600">Mathematics</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">85%</p>
                <p className="text-xs text-gray-500">Avg Score</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Grade 9-B</p>
                  <p className="text-xs text-gray-600">Physics</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-blue-600">78%</p>
                <p className="text-xs text-gray-500">Avg Score</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Grade 8-A</p>
                  <p className="text-xs text-gray-600">Science</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-orange-600">72%</p>
                <p className="text-xs text-gray-500">Avg Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Announcements */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
            <button 
              onClick={() => navigate('/announcements')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          {stats?.upcomingEvents && stats.upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingEvents.slice(0, 3).map((event) => (
                <div key={event.id} className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                  <div className="flex items-start space-x-3">
                    <Megaphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">{event.title}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(event.event_date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No announcements</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;


