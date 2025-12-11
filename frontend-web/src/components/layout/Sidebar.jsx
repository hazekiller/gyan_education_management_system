import { useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  BookText,
  FileText,
  DollarSign,
  Calendar,
  Megaphone,
  MessageSquare,
  GraduationCap,
  X,
  Home,
  Bell,
  Bus,
  Sparkles,
  UserCheck,
} from "lucide-react";
import {
  selectCurrentUser,
  selectUserRole,
} from "../../store/slices/authSlice";
import { PERMISSIONS } from "../../utils/rbac";
import { usePermission } from "../../hooks/usePermission";
import gsap from "gsap";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectUserRole);
  const { hasPermission } = usePermission();

  // Refs for GSAP animations
  const sidebarRef = useRef(null);
  const logoRef = useRef(null);
  const navItemsRef = useRef([]);
  const profileRef = useRef(null);

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      show: true,
    },
    {
      name: "Classes",
      path: "/classes",
      icon: BookOpen,
      show: hasPermission(PERMISSIONS.VIEW_CLASSES),
    },
    {
      name: "Users",
      path: "/users",
      icon: Users,
      show: true,
    },
    {
      name: "Subjects",
      path: "/subjects",
      icon: BookText,
      show: hasPermission(PERMISSIONS.VIEW_CLASS_SUBJECTS),
    },
    /* {
      name: "Students",
      path: "/students",
      icon: Users,
      show: hasPermission(PERMISSIONS.VIEW_STUDENTS),
    }, */
    {
      name: "Admissions",
      path: "/admissions",
      icon: FileText,
      show: hasPermission(PERMISSIONS.VIEW_ADMISSIONS),
    },
    {
      name: "Visitors",
      path: "/visitors",
      icon: UserCheck,
      permission: "visitors",
    },
    /* {
      name: "Teachers",
      path: "/teachers",
      icon: UserCheck,
      show: hasPermission(PERMISSIONS.VIEW_TEACHERS),
    }, */
    {
      name: "Attendance",
      path: "/attendance",
      icon: ClipboardList,
      show: hasPermission(PERMISSIONS.VIEW_ATTENDANCE),
    },
    {
      name: "Front Desk",
      path: "/frontdesk",
      icon: UserCheck,
      show: hasPermission(PERMISSIONS.VIEW_FRONTDESK) || true, // Temporarily allow all
    },
    {
      name: "Exams",
      path: "/exams",
      icon: BookOpen,
      show: hasPermission(PERMISSIONS.VIEW_EXAMS),
    },
    {
      name: "Results",
      path: "/results",
      icon: FileText,
      show: role === "student", // Only show to students
    },
    {
      name: "My Reports",
      path: "/my-reports",
      icon: ClipboardList,
      show: role === "student", // Only show to students
    },
    {
      name: "Assignments",
      path: "/assignments",
      icon: FileText,
      show: hasPermission(PERMISSIONS.VIEW_ASSIGNMENTS),
    },
    {
      name: "Fee Management",
      path: "/fees",
      icon: DollarSign,
      show: hasPermission(PERMISSIONS.VIEW_FEES),
    },
    {
      name: "Events",
      path: "/events",
      icon: Calendar,
      show: hasPermission(PERMISSIONS.VIEW_EVENTS),
    },
    {
      name: "Announcements",
      path: "/announcements",
      icon: Megaphone,
      show: hasPermission(PERMISSIONS.VIEW_ANNOUNCEMENTS),
    },
    {
      name: "Schedule",
      path: "/schedule",
      icon: Megaphone,
      show: hasPermission(PERMISSIONS.VIEW_SCHEDULE),
    },
    {
      name: "Messages",
      path: "/messages",
      icon: MessageSquare,
      show: hasPermission(PERMISSIONS.VIEW_MESSAGES),
    },
    {
      name: "Library",
      path: "/library",
      icon: BookOpen,
      show: true,
    },
    {
      name: "Hostel",
      path: "/hostel",
      icon: Home,
      show: role !== "teacher", // Hide from teachers
    },
    {
      name: "Transport",
      path: "/transport",
      icon: Bus,
      show: role !== "teacher", // Hide from teachers
    },
    {
      name: "Payroll",
      path: "/payroll",
      icon: DollarSign,
      show: hasPermission(PERMISSIONS.VIEW_PAYROLL),
    },
    {
      name: "Reports",
      path: "/reports",
      icon: FileText,
      show: role !== "student", // Hide from students
    },
    {
      name: "Blogs",
      path: "/blogs",
      icon: BookOpen,
      show: hasPermission(PERMISSIONS.VIEW_BLOGS),
    },
    {
      name: "Bus Attendance",
      path: "/bus-attendance-reports",
      icon: ClipboardList,
      show: role !== "teacher", // Hide from teachers
    },
  ];

  const visibleNavigation = navigationItems.filter((item) => item.show);

  useEffect(() => {
    if (!isOpen) return;

    const ctx = gsap.context(() => {
      // Logo animation
      gsap.from(logoRef.current, {
        scale: 0,
        rotation: 360,
        duration: 0.8,
        ease: "elastic.out(1, 0.5)",
      });

      // Continuous subtle rotation for logo
      gsap.to(logoRef.current, {
        rotation: 5,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Nav items stagger animation
      gsap.from(navItemsRef.current, {
        x: -50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.out",
        delay: 0.2,
      });

      // Profile section animation
      gsap.from(profileRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.6,
        delay: 0.5,
        ease: "power2.out",
      });
    }, sidebarRef);

    return () => ctx.revert();
  }, [isOpen]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        ref={sidebarRef}
        className={`
    fixed lg:static inset-y-0 left-0 z-30
    w-64 bg-gradient-to-b from-white via-blue-50/30 to-white shadow-2xl flex flex-col
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
    border-r border-gray-200
  `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center space-x-3">
            <div
              ref={logoRef}
              className="bg-gradient-to-br from-blue-600 to-blue-400 p-2 rounded-xl shadow-lg shadow-blue-500/20 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent to-white opacity-20"></div>
              <GraduationCap className="w-6 h-6 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Gyan School
              </h1>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <Sparkles className="w-2 h-2" />
                Management System
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-lg transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1">
            {visibleNavigation.map((item, index) => (
              <li
                key={item.path}
                ref={(el) => (navItemsRef.current[index] = el)}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `nav-item flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 hover:shadow-md"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                >
                  {({ isActive }) => (
                    <>
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-600/0 group-hover:from-blue-500/10 group-hover:to-purple-600/10 transition-all duration-300"></div>
                      )}
                      <item.icon
                        className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"
                          }`}
                      />
                      <span className="font-medium relative z-10">
                        {item.name}
                      </span>
                      {isActive && (
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></div>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Profile Section */}
        <div
          ref={profileRef}
          className="p-4 border-t border-gray-200 flex-shrink-0 bg-gradient-to-r from-blue-50/50 to-purple-50/50"
        >
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.details?.first_name || user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {role?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <style jsx>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #1e40af, #3b82f6);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #1e3a8a, #2563eb);
  }
`}</style>

    </>
  );
};

export default Sidebar;
