import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../store/slices/authSlice';

const StaffDashboard = () => {
    const user = useSelector(selectCurrentUser);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Staff Dashboard</h1>
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-2">Welcome, {user?.details?.first_name || 'Staff Member'}!</h2>
                <p className="text-gray-600">
                    Designation: <span className="font-medium bg-gray-100 px-2 py-1 rounded">{user?.details?.designation || user?.role}</span>
                </p>

                <div className="mt-6">
                    <h3 className="font-medium mb-3">Your Quick Links</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-4 rounded text-center hover:bg-blue-100 cursor-pointer text-blue-700">
                            Check Emails
                        </div>
                        <div className="bg-green-50 p-4 rounded text-center hover:bg-green-100 cursor-pointer text-green-700">
                            Apply Leave
                        </div>
                        <div className="bg-yellow-50 p-4 rounded text-center hover:bg-yellow-100 cursor-pointer text-yellow-700">
                            View Payslip
                        </div>
                        <div className="bg-purple-50 p-4 rounded text-center hover:bg-purple-100 cursor-pointer text-purple-700">
                            My Profile
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboard;
