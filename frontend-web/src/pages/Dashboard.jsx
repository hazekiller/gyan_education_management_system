import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/slices/authSlice';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import StaffDashboard from '../components/dashboard/StaffDashboard';

const Dashboard = () => {
  const userRole = useSelector(selectUserRole);

  const renderDashboard = () => {
    switch (userRole) {
      case 'super_admin':
      case 'principal':
      case 'vice_principal':
      case 'hod':
        return <AdminDashboard />;
      
      case 'teacher':
        return <TeacherDashboard />;
      
      case 'student':
        return <StudentDashboard />;
      
      case 'accountant':
      case 'guard':
      case 'cleaner':
        return <StaffDashboard />;
      
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
