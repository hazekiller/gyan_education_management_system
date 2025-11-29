// File: frontend-web/src/components/layout/DashboardLayout.jsx
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../store/slices/authSlice";
import socketService from "../../services/socket";
import Sidebar from "./Sidebar";
import Header from "./Header";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const user = useSelector(selectCurrentUser);

  useEffect(() => {
    if (user?.id) {
      socketService.connect(user.id);
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
