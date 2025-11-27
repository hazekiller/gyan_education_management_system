import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  LayoutDashboard,
  Users,
  UserCheck,
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
} from "lucide-react";
import {
  selectCurrentUser,
  selectUserRole,
} from "../../store/slices/authSlice";
import { PERMISSIONS } from "../../utils/rbac";
import { usePermission } from "../../hooks/usePermission";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const user = useSelector(selectCurrentUser);
  const role = useSelector(selectUserRole);
  const { hasPermission } = usePermission();

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
      show: true, // Everyone can see dashboard
    },
    {
      name: "Classes",
      path: "/classes",
      icon: BookOpen,
      show: hasPermission(PERMISSIONS.VIEW_CLASSES),
    },
    {
      name: "Subjects",
      path: "/subjects",
      icon: BookText,
      show: hasPermission(PERMISSIONS.VIEW_CLASS_SUBJECTS),
    },
    {
      name: "Students",
      path: "/students",
      icon: Users,
      show: hasPermission(PERMISSIONS.VIEW_STUDENTS),
    },
    {
      name: "Teachers",
      path: "/teachers",
      icon: UserCheck,
      show: hasPermission(PERMISSIONS.VIEW_TEACHERS),
    },
    {
      name: "Attendance",
      path: "/attendance",
      icon: ClipboardList,
      show: hasPermission(PERMISSIONS.VIEW_ATTENDANCE),
    },
    {
      name: "Exams",
      path: "/exams",
      icon: BookOpen,
      show: hasPermission(PERMISSIONS.VIEW_EXAMS),
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
      show: true, // Everyone can see library (permissions handled inside)
    },
  ];

  const visibleNavigation = navigationItems.filter((item) => item.show);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
    fixed lg:static inset-y-0 left-0 z-30
    w-64 bg-white shadow-lg flex flex-col
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
  `}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Gyan School</h1>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-2">
            {visibleNavigation.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Profile Section */}
        <div className="p-4 border-t flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">
                {user?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.details?.first_name || user?.email}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {role?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </aside>

    </>
  );
};

export default Sidebar;
