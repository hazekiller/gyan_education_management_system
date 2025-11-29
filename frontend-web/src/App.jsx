import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "./store/slices/authSlice";

// Layouts
import AuthLayout from "./components/layout/AuthLayout";
import DashboardLayout from "./components/layout/DashboardLayout";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Students from "./pages/Students";
import StudentDetails from "./pages/StudentDetails";
import Teachers from "./pages/Teachers";
import TeacherDetails from "./pages/TeacherDetails";
import Attendance from "./pages/Attendance";
import Exams from "./pages/Exams";
import Assignments from "./pages/Assignments";
import FeeManagement from "./pages/FeeManagement";
import Events from "./pages/Events";
import Announcements from "./pages/Announcements";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import ClassDetails from "./pages/ClassDetails";
import TeacherSchedule from "./pages/Schedule";
import TeacherScheduleDetail from "./pages/ScheduleDetail";
import Subjects from "./pages/Subjects";
import ExamDetails from "./pages/ExamDetails";
import AssignmentDetails from "./pages/AssignmentDetails";
import AnnouncementDetails from "./pages/AnnouncementDetails";
import LibraryManagement from "./pages/LibraryManagement";
import HostelManagement from "./pages/HostelManagement";
import TransportationManagement from "./pages/TransportationManagement";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <Login />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="classes" element={<Classes />} />
        <Route path="/classes/:id" element={<ClassDetails />} />
        <Route path="/subjects" element={<Subjects />} />

        <Route path="students" element={<Students />} />
        <Route path="students/:id" element={<StudentDetails />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="teachers/:id" element={<TeacherDetails />} />
        <Route path="attendance" element={<Attendance />} />
        <Route path="exams" element={<Exams />} />
        <Route path="exams/:id" element={<ExamDetails />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="assignments/:id" element={<AssignmentDetails />} />
        <Route path="fees" element={<FeeManagement />} />
        <Route path="events" element={<Events />} />
        <Route path="announcements" element={<Announcements />} />
        <Route path="announcements/:id" element={<AnnouncementDetails />} />
        <Route path="messages" element={<Messages />} />
        <Route path="profile" element={<Profile />} />
        <Route path="schedule" element={<TeacherSchedule />} />
        <Route path="schedule/:id" element={<TeacherScheduleDetail />} />
        <Route path="library" element={<LibraryManagement />} />
        <Route path="hostel" element={<HostelManagement />} />
        <Route path="transport" element={<TransportationManagement />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
