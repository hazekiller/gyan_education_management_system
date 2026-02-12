import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';

const AccountsDashboard = () => {
    const token = useSelector(selectToken);
    const [stats, setStats] = useState({
        income: 0,
        expense: 0,
        netProfit: 0,
        recentExpenses: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('http://localhost:5002/api/accounts/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.success) {
                    setStats(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch account stats', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [token]);

    if (loading) return <div>Loading Financial Data...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Accounts Dashboard (GAAP)</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                    <h3 className="text-gray-500 text-sm">Total Income (This Month)</h3>
                    <p className="text-2xl font-bold">NPR {stats.income.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                    <h3 className="text-gray-500 text-sm">Total Expenses (This Month)</h3>
                    <p className="text-2xl font-bold">NPR {stats.expense.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                    <h3 className="text-gray-500 text-sm">Net Profit (This Month)</h3>
                    <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        NPR {stats.netProfit.toLocaleString()}
                    </p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Recent Expenses</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-3">Reference No (Tally)</th>
                                <th className="p-3">Title</th>
                                <th className="p-3">Date</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Head</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentExpenses.length > 0 ? (
                                stats.recentExpenses.map((expense) => (
                                    <tr key={expense.id} className="border-b">
                                        <td className="p-3">
                                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                                                {expense.reference_no || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="p-3">{expense.title}</td>
                                        <td className="p-3">{new Date(expense.expense_date).toLocaleDateString()}</td>
                                        <td className="p-3 text-red-500 font-medium">
                                            {Number(expense.amount).toLocaleString()}
                                        </td>
                                        <td className="p-3">{expense.expense_head || '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-4 text-center text-gray-500">No recent expenses found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mt-8 bg-blue-50 p-4 rounded-md border border-blue-200">
                <h3 className="text-blue-800 font-semibold mb-2">GAAP Compliance Note</h3>
                <p className="text-blue-700 text-sm">
                    All financial records shown here are aggregated from Fee Collection and Expense modules.
                    Please ensure "Reference No" is updated with valid Tally Voucher Numbers for audit trails.
                </p>
            </div>
        </div>
    );
};

export default AccountsDashboard;
