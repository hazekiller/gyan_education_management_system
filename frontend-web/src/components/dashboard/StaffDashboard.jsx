import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Megaphone,
  Clock,
  Users
} from 'lucide-react';
import { dashboardAPI } from '../../lib/api';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const userRole = useSelector(selectUserRole);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  const getRoleTitle = () => {
    const roleTitles = {
      guard: 'Security Guard',
      cleaner: 'Maintenance Staff',
      accountant: 'Accountant',
    };
    return roleTitles[userRole] || 'Staff Member';
  };

  const getRoleGreeting = () => {
    const greetings = {
      guard: 'Keep the school safe and secure!',
      cleaner: 'Thank you for keeping our school clean!',
      accountant: 'Manage school finances efficiently.',
    };
    return greetings[userRole] || 'Welcome to the school management system!';
  };

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-3xl font-bold mb-2">Welcome back, {getRoleTitle()}!</h2>
        <p className="text-blue-100 text-lg">{getRoleGreeting()}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">Current Time</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Clock className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.students || 0}</h3>
              <p className="text-xs text-gray-500 mt-1">Active students</p>
            </div>
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">Total Teachers</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.teachers || 0}</h3>
              <p className="text-xs text-gray-500 mt-1">Teaching staff</p>
            </div>
            <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Events & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Upcoming Events
            </h3>
            <button
              onClick={() => navigate('/events')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              View All
            </button>
          </div>
          {stats?.upcomingEvents && stats.upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 transition-colors">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No upcoming events</p>
            </div>
          )}
        </div>

        {/* Recent Announcements */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-blue-600" />
              Announcements
            </h3>
            <button
              onClick={() => navigate('/announcements')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-white border border-gray-200 border-l-4 border-l-blue-600 rounded-xl hover:shadow-md transition-all">
              <div className="flex items-start space-x-3">
                <Megaphone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Check Announcements</p>
                  <p className="text-xs text-gray-600">
                    View important updates and notifications from the administration
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info based on role */}
      {userRole === 'guard' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-blue-600">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Security Reminders</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Check all entry and exit points regularly</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Verify visitor identification before allowing entry</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Report any suspicious activity immediately</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Maintain visitor log and attendance records</span>
            </li>
          </ul>
        </div>
      )}

      {userRole === 'cleaner' && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-l-4 border-l-green-600">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Maintenance Schedule</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Morning: Clean all classrooms before 8:00 AM</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Afternoon: Sanitize common areas and restrooms</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Evening: Deep cleaning of designated areas</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></span>
              <span>Report any maintenance issues immediately</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
