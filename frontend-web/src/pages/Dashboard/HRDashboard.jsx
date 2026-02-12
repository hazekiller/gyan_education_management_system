import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';

const HRDashboard = () => {
    const token = useSelector(selectToken);
    const [stats, setStats] = useState({
        totalStaff: 0,
        totalTeachers: 0,
        totalEmployees: 0,
        pendingLeaves: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:5002/api/hr/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch HR stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    if (loading) return <div>Loading HR Data...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">HR Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm">Total Employees</h3>
                    <p className="text-3xl font-bold">{stats.totalEmployees}</p>
                    <p className="text-xs text-gray-400 mt-1">Staff + Teachers</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
                    <h3 className="text-gray-500 text-sm">Total Staff</h3>
                    <p className="text-3xl font-bold">{stats.totalStaff}</p>
                    <p className="text-xs text-gray-400 mt-1">Support Staff</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm">Total Teachers</h3>
                    <p className="text-3xl font-bold">{stats.totalTeachers}</p>
                    <p className="text-xs text-gray-400 mt-1">Teaching Staff</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
                    <h3 className="text-gray-500 text-sm">Pending Leave Requests</h3>
                    <p className="text-3xl font-bold">{stats.pendingLeaves}</p>
                    <p className="text-xs text-gray-400 mt-1">Awaiting Approval</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="flex gap-4">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        View Staff Directory
                    </button>
                    <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                        Process Payroll
                    </button>
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700">
                        Review Leaves
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HRDashboard;
