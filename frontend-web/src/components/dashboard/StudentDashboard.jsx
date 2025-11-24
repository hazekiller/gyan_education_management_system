import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar,
  BookOpen,
  ClipboardCheck,
  Award,
  DollarSign,
  TrendingUp,
  Clock,
  Megaphone,
  FileText,
  AlertCircle
} from 'lucide-react';
import { dashboardAPI } from '../../lib/api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
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
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const attendancePercentage = 92; // Mock data
  const pendingFees = 15000; // Mock data
  const averageGrade = 85; // Mock data

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Student!</h2>
        <p className="text-indigo-100">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm text-indigo-100 mb-1">Attendance</p>
            <p className="text-2xl font-bold">{attendancePercentage}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm text-indigo-100 mb-1">Average Grade</p>
            <p className="text-2xl font-bold">{averageGrade}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-sm text-indigo-100 mb-1">Class Rank</p>
            <p className="text-2xl font-bold">5th</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/attendance')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">My Attendance</p>
              <h3 className="text-2xl font-bold text-gray-900">{attendancePercentage}%</h3>
              <div className="flex items-center mt-2 text-xs">
                <TrendingUp className="w-3 h-3 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">Good standing</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/assignments')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Assignments</p>
              <h3 className="text-2xl font-bold text-gray-900">5</h3>
              <div className="flex items-center mt-2 text-xs">
                <AlertCircle className="w-3 h-3 text-orange-600 mr-1" />
                <span className="text-orange-600 font-medium">3 pending</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/exams')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Grade</p>
              <h3 className="text-2xl font-bold text-gray-900">{averageGrade}%</h3>
              <div className="flex items-center mt-2 text-xs">
                <span className="text-purple-600 font-medium">Grade: B+</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/fees')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Pending Fees</p>
              <h3 className="text-2xl font-bold text-gray-900">₹{pendingFees.toLocaleString()}</h3>
              <div className="flex items-center mt-2 text-xs">
                <Clock className="w-3 h-3 text-red-600 mr-1" />
                <span className="text-red-600 font-medium">Due soon</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Academic Performance & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Performance */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Subject Performance</h3>
            <button 
              onClick={() => navigate('/exams')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All Results
            </button>
          </div>
          <div className="space-y-4">
            {[
              { subject: 'Mathematics', score: 92, grade: 'A', color: 'blue', trend: 'up' },
              { subject: 'Physics', score: 88, grade: 'A-', color: 'green', trend: 'up' },
              { subject: 'Chemistry', score: 78, grade: 'B+', color: 'yellow', trend: 'down' },
              { subject: 'English', score: 85, grade: 'A-', color: 'purple', trend: 'up' },
              { subject: 'Computer Science', score: 95, grade: 'A+', color: 'indigo', trend: 'up' },
            ].map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-10 h-10 bg-${subject.color}-100 rounded-lg flex items-center justify-center`}>
                    <BookOpen className={`w-5 h-5 text-${subject.color}-600`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{subject.subject}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`bg-${subject.color}-500 h-2 rounded-full transition-all duration-500`} 
                          style={{ width: `${subject.score}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600 w-12">{subject.score}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`px-3 py-1 bg-${subject.color}-100 text-${subject.color}-700 text-sm font-semibold rounded-full`}>
                    {subject.grade}
                  </span>
                  {subject.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-red-600 transform rotate-180" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/attendance')}
              className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ClipboardCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">My Attendance</p>
                  <p className="text-xs text-gray-600">View records</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/assignments')}
              className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Assignments</p>
                  <p className="text-xs text-gray-600">Submit work</p>
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
                  <p className="font-medium text-gray-900">Exam Results</p>
                  <p className="text-xs text-gray-600">View scores</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigate('/fees')}
              className="w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Fee Payment</p>
                  <p className="text-xs text-gray-600">Pay online</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Upcoming Events & Recent Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
            <button 
              onClick={() => navigate('/events')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          {stats?.upcomingEvents && stats.upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {stats.upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    event.event_type === 'holiday' 
                      ? 'bg-red-100 text-red-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {event.event_type}
                  </span>
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

        {/* Announcements */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Important Announcements</h3>
            <button 
              onClick={() => navigate('/announcements')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Fee Payment Deadline</p>
                  <p className="text-xs text-gray-600">
                    Please clear your pending fees before October 30th to avoid late fees.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
              <div className="flex items-start space-x-3">
                <Megaphone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Mid-term Exams Schedule</p>
                  <p className="text-xs text-gray-600">
                    Mid-term examinations will begin from November 5th. Check the schedule.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-green-50 border-l-4 border-green-600 rounded">
              <div className="flex items-start space-x-3">
                <Megaphone className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Annual Sports Day</p>
                  <p className="text-xs text-gray-600">
                    Registration open for Annual Sports Day on November 15th.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

