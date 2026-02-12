import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { selectToken } from '../../store/slices/authSlice';
import { Plus, Search } from 'lucide-react';

const Expenses = () => {
    const token = useSelector(selectToken);
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        amount: '',
        expense_date: new Date().toISOString().split('T')[0],
        expense_head: '',
        payment_method: 'cash',
        reference_no: ''
    });

    const fetchExpenses = async () => {
        try {
            const response = await axios.get('http://localhost:5002/api/accounts/expenses', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.success) {
                setExpenses(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, [token]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5002/api/accounts/expenses', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowModal(false);
            setFormData({
                title: '',
                description: '',
                amount: '',
                expense_date: new Date().toISOString().split('T')[0],
                expense_head: '',
                payment_method: 'cash',
                reference_no: ''
            });
            fetchExpenses();
        } catch (error) {
            console.error('Error adding expense:', error);
            alert('Failed to add expense');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Expense Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
                >
                    <Plus size={18} /> Add Expense
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 font-semibold text-gray-600">Date</th>
                            <th className="p-4 font-semibold text-gray-600">Title</th>
                            <th className="p-4 font-semibold text-gray-600">Head</th>
                            <th className="p-4 font-semibold text-gray-600">Amount</th>
                            <th className="p-4 font-semibold text-gray-600">Reference (Tally)</th>
                            <th className="p-4 font-semibold text-gray-600">Method</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr>
                        ) : expenses.length === 0 ? (
                            <tr><td colSpan="6" className="p-4 text-center">No expenses recorded.</td></tr>
                        ) : (
                            expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50">
                                    <td className="p-4">{new Date(expense.expense_date).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <div className="font-medium">{expense.title}</div>
                                        <div className="text-sm text-gray-500">{expense.description}</div>
                                    </td>
                                    <td className="p-4">{expense.expense_head}</td>
                                    <td className="p-4 text-red-600 font-medium">
                                        {Number(expense.amount).toLocaleString()}
                                    </td>
                                    <td className="p-4">
                                        <span className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                                            {expense.reference_no || '-'}
                                        </span>
                                    </td>
                                    <td className="p-4 capitalize">{expense.payment_method}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Expense Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4">Add New Expense</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    className="w-full border rounded p-2"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Amount</label>
                                    <input
                                        type="number"
                                        name="amount"
                                        required
                                        step="0.01"
                                        className="w-full border rounded p-2"
                                        value={formData.amount}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="expense_date"
                                        required
                                        className="w-full border rounded p-2"
                                        value={formData.expense_date}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Expense Head</label>
                                <select
                                    name="expense_head"
                                    required
                                    className="w-full border rounded p-2"
                                    value={formData.expense_head}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select Head</option>
                                    <option value="Electricity">Electricity</option>
                                    <option value="Water">Water</option>
                                    <option value="Internet">Internet</option>
                                    <option value="Stationery">Stationery</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Miscellaneous">Miscellaneous</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Tally Reference No.</label>
                                <input
                                    type="text"
                                    name="reference_no"
                                    placeholder="Voucher No / Ledger"
                                    className="w-full border rounded p-2"
                                    value={formData.reference_no}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                    Save Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Expenses;
