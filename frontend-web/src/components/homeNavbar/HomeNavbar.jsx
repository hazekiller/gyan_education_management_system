import { useState } from 'react';
import { Menu, X, Home, Users, BookOpen, Calendar, FileText, Settings, Bell, User } from 'lucide-react';

export default function HomeNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const menuItems = [
    { name: 'Dashboard', icon: Home, link: '#' },
    {
      name: 'Students',
      icon: Users,
      link: '#',
      dropdown: ['All Students', 'Admissions', 'Attendance', 'Performance']
    },
    {
      name: 'Academics',
      icon: BookOpen,
      link: '#',
      dropdown: ['Classes', 'Subjects', 'Syllabus', 'Assignments']
    },
    {
      name: 'Schedule',
      icon: Calendar,
      link: '#',
      dropdown: ['Timetable', 'Events', 'Holidays']
    },
    { name: 'Reports', icon: FileText, link: '#' },
    { name: 'Settings', icon: Settings, link: '#' }
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <BookOpen className="h-8 w-8 text-white" />
              <span className="ml-2 text-white text-xl font-bold">EduManage</span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {menuItems.map((item) => (
                <div key={item.name} className="relative">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === item.name ? null : item.name)}
                    className="text-white hover:bg-blue-700 px-3 py-2 rounded-md text-sm font-medium flex items-center transition-colors"
                  >
                    <item.icon className="h-4 w-4 mr-1" />
                    {item.name}
                    {item.dropdown && (
                      <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {item.dropdown && activeDropdown === item.name && (
                    <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        {item.dropdown.map((subItem) => (
                          <a
                            key={subItem}
                            href="#"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            {subItem}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="text-white hover:bg-blue-700 p-2 rounded-full relative transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="text-white hover:bg-blue-700 p-2 rounded-full transition-colors">
              <User className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-white hover:bg-blue-700 p-2 rounded-md transition-colors"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-blue-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {menuItems.map((item) => (
              <div key={item.name}>
                <a
                  href={item.link}
                  className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center transition-colors"
                >
                  <item.icon className="h-5 w-5 mr-2" />
                  {item.name}
                </a>
                {item.dropdown && (
                  <div className="ml-8 space-y-1">
                    {item.dropdown.map((subItem) => (
                      <a
                        key={subItem}
                        href="#"
                        className="text-blue-100 hover:bg-blue-600 block px-3 py-2 rounded-md text-sm transition-colors"
                      >
                        {subItem}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div className="border-t border-blue-600 pt-2 mt-2">
              <a href="#" className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center transition-colors">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </a>
              <a href="#" className="text-white hover:bg-blue-600 block px-3 py-2 rounded-md text-base font-medium flex items-center transition-colors">
                <User className="h-5 w-5 mr-2" />
                Profile
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
