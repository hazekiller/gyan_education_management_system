import HomeNavbar from "../homeNavbar/HomeNavbar";
import HomeFooter from "../homeNavbar/HomeNavbar";

import { Users, BookOpen, Calendar, FileText, GraduationCap, Award, TrendingUp, Clock, ChevronRight, Play, Star } from 'lucide-react';

export default function HomePage() {
  const stats = [
    { icon: Users, value: '5,000+', label: 'Students' },
    { icon: GraduationCap, value: '300+', label: 'Teachers' },
    { icon: Award, value: '50+', label: 'Awards' },
    { icon: TrendingUp, value: '95%', label: 'Success Rate' }
  ];

  const features = [
    {
      icon: Users,
      title: 'Student Management',
      description: 'Comprehensive student records, attendance tracking, and performance monitoring all in one place.'
    },
    {
      icon: BookOpen,
      title: 'Academic Excellence',
      description: 'Manage curriculum, assignments, grades, and academic resources efficiently.'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Automated timetables, event management, and calendar integration for seamless planning.'
    },
    {
      icon: FileText,
      title: 'Advanced Reports',
      description: 'Generate detailed analytics and reports to track progress and make data-driven decisions.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Principal',
      content: 'EduManage has transformed how we run our school. The efficiency gains are remarkable!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'Teacher',
      content: 'Managing my classes and tracking student progress has never been easier. Highly recommend!',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Parent',
      content: 'Love being able to stay updated on my child\'s progress. The parent portal is fantastic!',
      rating: 5
    }
  ];

  return (
    <>
    <HomeNavbar/>
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section id="home" className="pt-16 pb-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Transform Your School Management
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Streamline operations, enhance communication, and improve student outcomes with our comprehensive school management system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center transition-colors shadow-lg">
                  Get Started
                  <ChevronRight className="ml-2 h-5 w-5" />
                </button>
                <button className="px-8 py-4 bg-white hover:bg-gray-50 text-blue-600 rounded-lg font-semibold flex items-center justify-center transition-colors shadow-lg border-2 border-blue-600">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </button>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-lg p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">Today's Overview</span>
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-blue-600">850</p>
                      <p className="text-sm text-gray-600">Present</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-2xl font-bold text-green-600">98%</p>
                      <p className="text-sm text-gray-600">Attendance</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Classes Today</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Events</span>
                      <span className="font-semibold">3</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-gray-600 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Schools
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your school efficiently and effectively
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600">
              Trusted by thousands of educators worldwide
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-lg">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your School?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of schools already using EduManage
          </p>
          <button className="px-8 py-4 bg-white hover:bg-gray-100 text-blue-600 rounded-lg font-semibold transition-colors shadow-lg">
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
    <HomeFooter/>
    </>
  );
}

