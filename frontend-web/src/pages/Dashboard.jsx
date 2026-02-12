import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/slices/authSlice';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';
import AccountsDashboard from './Dashboard/AccountsDashboard';
import HRDashboard from './Dashboard/HRDashboard';
import FounderDashboard from './Dashboard/FounderDashboard';
import StaffDashboard from './Dashboard/StaffDashboard';

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
        return <AccountsDashboard />;

      case 'hr':
        return <HRDashboard />;

      case 'founder':
        return <FounderDashboard />;

      case 'guard':
      case 'cleaner':
      case 'staff':
        return <StaffDashboard />;

      default:
        return <AdminDashboard />; // Or unauthorized/default view
    }
  };

  return (
    <div className="space-y-6">
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;