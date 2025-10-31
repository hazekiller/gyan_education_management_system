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
    return <div className="p-8">Loading...</div>;
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
      <div className="bg-gradient-to-r from-teal-500 to-cyan-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, {getRoleTitle()}!</h2>
        <p className="text-teal-100">{getRoleGreeting()}</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Current Time</p>
              <h3 className="text-2xl font-bold text-gray-900">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Students</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.students || 0}</h3>
              <p className="text-xs text-gray-600 mt-1">Active students</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Teachers</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats?.teachers || 0}</h3>
              <p className="text-xs text-gray-600 mt-1">Teaching staff</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Events & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <button 
              onClick={() => navigate('/events')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          {stats?.upcomingEvents && stats.upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-xs text-gray-500">
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
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No upcoming events</p>
            </div>
          )}
        </div>

        {/* Recent Announcements */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
            <button 
              onClick={() => navigate('/announcements')}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
              <div className="flex items-start space-x-3">
                <Megaphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Check Announcements</p>
                  <p className="text-xs text-gray-600 mt-1">
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
        <div className="card bg-blue-50 border-l-4 border-blue-600">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Security Reminders</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Check all entry and exit points regularly</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Verify visitor identification before allowing entry</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Report any suspicious activity immediately</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-blue-600 mt-0.5">•</span>
              <span>Maintain visitor log and attendance records</span>
            </li>
          </ul>
        </div>
      )}

      {userRole === 'cleaner' && (
        <div className="card bg-green-50 border-l-4 border-green-600">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Maintenance Schedule</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start space-x-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Morning: Clean all classrooms before 8:00 AM</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Afternoon: Sanitize common areas and restrooms</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Evening: Deep cleaning of designated areas</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="text-green-600 mt-0.5">•</span>
              <span>Report any maintenance issues immediately</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
