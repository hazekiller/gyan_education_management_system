// File: frontend-web/src/pages/MyReports.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../store/slices/authSlice';

const MyReports = () => {
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);

    useEffect(() => {
        // Redirect to student reports page with the logged-in student's ID
        if (user?.details?.id) {
            navigate(`/student-reports/${user.details.id}`, { replace: true });
        } else {
            // If student ID not found, show error or redirect to dashboard
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    // Show loading while redirecting
    return (
        <div className="flex justify-center items-center h-64">
            <div className="loading"></div>
        </div>
    );
};

export default MyReports;
