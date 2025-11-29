import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { teachersAPI } from '../../lib/api'; // Assuming we have a staff API too, or we fetch staff differently

const PayrollForm = ({ payroll, onSubmit, onCancel, isSubmitting }) => {
    const [formData, setFormData] = useState({
        employee_type: 'teacher',
        employee_id: '',
        month: new Date().toLocaleString('default', { month: 'long' }),
        year: new Date().getFullYear().toString(),
        basic_salary: '',
        allowances: '0',
        deductions: '0',
        payment_method: 'cash',
        status: 'pending',
        remarks: '',
        payment_date: ''
    });

    // Fetch teachers for selection
    const { data: teachersData } = useQuery({
        queryKey: ['teachers'],
        queryFn: () => teachersAPI.getAll()
    });

    // Mock staff data or fetch if API exists
    // const { data: staffData } = useQuery(...) 

    const teachers = teachersData?.data || [];

    useEffect(() => {
        if (payroll) {
            setFormData({
                employee_type: payroll.employee_type,
                employee_id: payroll.employee_id,
                month: payroll.month,
                year: payroll.year,
                basic_salary: payroll.basic_salary,
                allowances: payroll.allowances || '0',
                deductions: payroll.deductions || '0',
                payment_method: payroll.payment_method,
                status: payroll.status,
                remarks: payroll.remarks || '',
                payment_date: payroll.payment_date ? payroll.payment_date.split('T')[0] : ''
            });
        }
    }, [payroll]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const netSalary = (parseFloat(formData.basic_salary || 0) + parseFloat(formData.allowances || 0) - parseFloat(formData.deductions || 0)).toFixed(2);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Employee Type</label>
                    <select
                        name="employee_type"
                        value={formData.employee_type}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        disabled={!!payroll} // Disable changing type/employee on edit for simplicity
                    >
                        <option value="teacher">Teacher</option>
                        <option value="staff">Staff</option>
                    </select>
                </div>

                {/* Employee Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Employee</label>
                    <select
                        name="employee_id"
                        value={formData.employee_id}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        disabled={!!payroll}
                        required
                    >
                        <option value="">Select Employee</option>
                        {formData.employee_type === 'teacher' && teachers.map(t => (
                            <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.employee_id})</option>
                        ))}
                        {/* Add staff mapping here when available */}
                    </select>
                </div>

                {/* Month */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Month</label>
                    <select
                        name="month"
                        value={formData.month}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        required
                    >
                        {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                </div>

                {/* Year */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Year</label>
                    <input
                        type="number"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        required
                    />
                </div>

                {/* Basic Salary */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Basic Salary</label>
                    <input
                        type="number"
                        name="basic_salary"
                        value={formData.basic_salary}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        required
                        min="0"
                    />
                </div>

                {/* Allowances */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Allowances</label>
                    <input
                        type="number"
                        name="allowances"
                        value={formData.allowances}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        min="0"
                    />
                </div>

                {/* Deductions */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Deductions</label>
                    <input
                        type="number"
                        name="deductions"
                        value={formData.deductions}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                        min="0"
                    />
                </div>

                {/* Net Salary Display */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Net Salary</label>
                    <div className="mt-1 block w-full rounded-md bg-gray-100 border-gray-300 sm:text-sm p-2 border font-bold">
                        {netSalary}
                    </div>
                </div>

                {/* Payment Method */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                    <select
                        name="payment_method"
                        value={formData.payment_method}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                    >
                        <option value="cash">Cash</option>
                        <option value="cheque">Cheque</option>
                        <option value="bank_transfer">Bank Transfer</option>
                    </select>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                    >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Payment Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Payment Date</label>
                    <input
                        type="date"
                        name="payment_date"
                        value={formData.payment_date}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                    />
                </div>
            </div>

            {/* Remarks */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Remarks</label>
                <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border"
                ></textarea>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                    {isSubmitting ? 'Saving...' : 'Save Record'}
                </button>
            </div>
        </form>
    );
};

export default PayrollForm;
