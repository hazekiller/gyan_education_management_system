import { useEffect, useState, useRef } from 'react';
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
  AlertCircle,
  Sparkles,
  Target,
  Trophy
} from 'lucide-react';
import { dashboardAPI } from '../../lib/api';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import gsap from 'gsap';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Refs for GSAP
  const containerRef = useRef(null);
  const welcomeRef = useRef(null);
  const statsCardsRef = useRef([]);
  const sectionsRef = useRef([]);

  useEffect(() => {
    fetchStats();
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

  const attendancePercentage = 92;
  const pendingFees = 15000;
  const averageGrade = 85;

  return (
    <div ref={containerRef} className="space-y-6">
      {/* Welcome Message */}
      {/* Welcome Message */}
      <div
        ref={welcomeRef}
        className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <h2 className="text-3xl font-bold">Welcome back, {currentUser?.details?.first_name || 'Student'}!</h2>
          </div>
          <p className="text-blue-100 text-lg mb-6">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <ClipboardCheck className="w-5 h-5 text-blue-100" />
                <p className="text-sm text-blue-100">Attendance</p>
              </div>
              <p className="text-3xl font-bold">{attendancePercentage}%</p>
              <div className="mt-2 w-full bg-white/20 rounded-full h-2">
                <div className="bg-white h-2 rounded-full" style={{ width: `${attendancePercentage}%` }}></div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5 text-blue-100" />
                <p className="text-sm text-blue-100">Average Grade</p>
              </div>
              <p className="text-3xl font-bold">{averageGrade}%</p>
              <p className="text-sm text-blue-100 mt-2">Grade: B+</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-blue-100" />
                <p className="text-sm text-blue-100">Class Rank</p>
              </div>
              <p className="text-3xl font-bold">5th</p>
              <p className="text-sm text-blue-100 mt-2">Out of 45</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          ref={(el) => (statsCardsRef.current[0] = el)}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
          onClick={() => navigate('/attendance')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">My Attendance</p>
              <h3 className="stat-number text-4xl font-bold text-gray-900">{attendancePercentage}</h3>
              <div className="flex items-center mt-3 text-xs">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-semibold">Good standing</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <ClipboardCheck className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div
          ref={(el) => (statsCardsRef.current[1] = el)}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
          onClick={() => navigate('/assignments')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">Assignments</p>
              <h3 className="stat-number text-4xl font-bold text-gray-900">5</h3>
              <div className="flex items-center mt-3 text-xs">
                <AlertCircle className="w-4 h-4 text-orange-600 mr-1" />
                <span className="text-orange-600 font-semibold">3 pending</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <FileText className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div
          ref={(el) => (statsCardsRef.current[2] = el)}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
          onClick={() => navigate('/exams')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">Average Grade</p>
              <h3 className="stat-number text-4xl font-bold text-gray-900">{averageGrade}</h3>
              <div className="flex items-center mt-3 text-xs">
                <span className="text-blue-600 font-semibold">Grade: B+</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <Award className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div
          ref={(el) => (statsCardsRef.current[3] = el)}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
          onClick={() => navigate('/fees')}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-medium">Pending Fees</p>
              <h3 className="stat-number text-4xl font-bold text-gray-900">{pendingFees.toLocaleString()}</h3>
              <div className="flex items-center mt-3 text-xs">
                <Clock className="w-4 h-4 text-red-600 mr-1" />
                <span className="text-red-600 font-semibold">Due soon</span>
              </div>
            </div>
            <div className="w-14 h-14 bg-gray-900 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Academic Performance & Schedule */}
      <div ref={(el) => (sectionsRef.current[0] = el)} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subject Performance */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-blue-600" />
              Subject Performance
            </h3>
            <button
              onClick={() => navigate('/exams')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              View All Results
            </button>
          </div>
          <div className="space-y-3">
            {[
              { subject: 'Mathematics', score: 92, grade: 'A', trend: 'up' },
              { subject: 'Physics', score: 88, grade: 'A-', trend: 'up' },
              { subject: 'Chemistry', score: 78, grade: 'B+', trend: 'down' },
              { subject: 'English', score: 85, grade: 'A-', trend: 'up' },
              { subject: 'Computer Science', score: 95, grade: 'A+', trend: 'up' },
            ].map((subject, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-300 border border-gray-100 hover:border-blue-200">
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-200`}>
                    <BookOpen className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-2">{subject.subject}</p>
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`bg-blue-600 h-2.5 rounded-full transition-all duration-500`}
                          style={{ width: `${subject.score}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-bold text-gray-700 w-14">{subject.score}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 ml-4">
                  <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-sm font-bold rounded-full">
                    {subject.grade}
                  </span>
                  {subject.trend === 'up' ? (
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  ) : (
                    <TrendingUp className="w-6 h-6 text-red-600 transform rotate-180" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            Quick Access
          </h3>
          <div className="space-y-3">
            {[
              { icon: ClipboardCheck, label: 'My Attendance', desc: 'View records', path: '/attendance' },
              { icon: FileText, label: 'Assignments', desc: 'Submit work', path: '/assignments' },
              { icon: Award, label: 'Exam Results', desc: 'View scores', path: '/exams' },
              { icon: DollarSign, label: 'Fee Payment', desc: 'Pay online', path: '/fees' },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className={`w-full p-4 bg-gray-50 hover:bg-blue-50 rounded-xl transition-all duration-300 text-left group hover:shadow-md border border-gray-100 hover:border-blue-200`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm border border-gray-200`}>
                    <item.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.label}</p>
                    <p className="text-xs text-gray-600">{item.desc}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Events & Announcements */}
      <div ref={(el) => (sectionsRef.current[1] = el)} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
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
                <div key={event.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-300 cursor-pointer border border-gray-100 hover:border-blue-200">
                  <div className="flex-shrink-0 w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Calendar className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
                    <p className="text-xs text-gray-600">
                      {new Date(event.event_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${event.event_type === 'holiday'
                    ? 'bg-gray-900 text-white'
                    : 'bg-blue-100 text-blue-700'
                    }`}>
                    {event.event_type}
                  </span>
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

        {/* Announcements */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Megaphone className="w-6 h-6 text-blue-600" />
              Important Announcements
            </h3>
            <button
              onClick={() => navigate('/announcements')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            <div className="p-4 bg-white border border-gray-200 border-l-4 border-l-red-600 rounded-xl hover:shadow-md transition-all duration-300">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Fee Payment Deadline</p>
                  <p className="text-xs text-gray-600">
                    Please clear your pending fees before October 30th to avoid late fees.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 border-l-4 border-l-blue-600 rounded-xl hover:shadow-md transition-all duration-300">
              <div className="flex items-start space-x-3">
                <Megaphone className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Mid-term Exams Schedule</p>
                  <p className="text-xs text-gray-600">
                    Mid-term examinations will begin from November 5th. Check the schedule.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 border-l-4 border-l-green-600 rounded-xl hover:shadow-md transition-all duration-300">
              <div className="flex items-start space-x-3">
                <Megaphone className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">Annual Sports Day</p>
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
