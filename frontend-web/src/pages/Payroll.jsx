import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import {
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    DollarSign,
    Calendar
} from 'lucide-react';
import { payrollAPI } from '../lib/api';
import { selectCurrentUser, selectUserRole } from '../store/slices/authSlice';
import Modal from '../components/common/Modal';
import PayrollForm from '../components/common/PayrollForm';
import PermissionGuard from '../components/common/PermissionGuard';
import { PERMISSIONS } from '../utils/rbac';
import toast from 'react-hot-toast';

const Payroll = () => {
    const queryClient = useQueryClient();
    const user = useSelector(selectCurrentUser);
    const role = useSelector(selectUserRole);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPayroll, setSelectedPayroll] = useState(null);

    // Determine if user is admin/management or employee
    const isManagement = ['super_admin', 'principal', 'vice_principal', 'accountant'].includes(role);

    // Determine employee type and ID for non-management users
    const getEmployeeDetails = () => {
        if (isManagement) return null;

        let type = 'staff';
        if (['teacher', 'hod'].includes(role)) {
            type = 'teacher';
        }
        // For guard, cleaner, etc. type remains 'staff'

        return {
            type,
            id: user?.details?.id
        };
    };

    const employeeDetails = getEmployeeDetails();

    const { data: payrollData, isLoading } = useQuery({
        queryKey: ['payroll', searchTerm, filterMonth, filterYear, role, employeeDetails?.id],
        queryFn: () => {
            if (isManagement) {
                return payrollAPI.getAll({
                    search: searchTerm,
                    month: filterMonth,
                    year: filterYear
                });
            } else if (employeeDetails?.id) {
                return payrollAPI.getEmployeePayroll(employeeDetails.type, employeeDetails.id);
            }
            return Promise.resolve([]);
        },
        enabled: isManagement || !!employeeDetails?.id
    });

    const payrolls = payrollData || [];

    // Create payroll mutation
    const createMutation = useMutation({
        mutationFn: payrollAPI.create,
        onSuccess: () => {
            toast.success('Payroll record added successfully');
            setIsModalOpen(false);
            setSelectedPayroll(null);
            queryClient.invalidateQueries(['payroll']);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to add payroll record');
        }
    });

    // Update payroll mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => payrollAPI.update(id, data),
        onSuccess: () => {
            toast.success('Payroll record updated successfully');
            setIsModalOpen(false);
            setSelectedPayroll(null);
            queryClient.invalidateQueries(['payroll']);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to update payroll record');
        }
    });

    // Delete payroll mutation
    const deleteMutation = useMutation({
        mutationFn: payrollAPI.delete,
        onSuccess: () => {
            toast.success('Payroll record deleted successfully');
            queryClient.invalidateQueries(['payroll']);
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to delete payroll record');
        }
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this payroll record?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (formData) => {
        if (selectedPayroll) {
            updateMutation.mutate({ id: selectedPayroll.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    const handleAddNew = () => {
        setSelectedPayroll(null);
        setIsModalOpen(true);
    };

    const handleEdit = (payroll) => {
        setSelectedPayroll(payroll);
        setIsModalOpen(true);
    };

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {isManagement ? 'Payroll Management' : 'My Payroll History'}
                    </h1>
                    <p className="text-gray-600 mt-1">
                        {isManagement ? 'Manage salaries for teachers and staff' : 'View your salary history and slips'}
                    </p>
                </div>
                {isManagement && (
                    <PermissionGuard permission={PERMISSIONS.MANAGE_PAYROLL}>
                        <button
                            onClick={handleAddNew}
                            className="btn btn-primary flex items-center space-x-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Record</span>
                        </button>
                    </PermissionGuard>
                )}
            </div>

            {/* Filters - Only for Management */}
            {isManagement && (
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by employee name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="input pl-10 w-full"
                            />
                        </div>
                        <select
                            className="select w-full"
                            value={filterMonth}
                            onChange={(e) => setFilterMonth(e.target.value)}
                        >
                            <option value="">All Months</option>
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <select
                            className="select w-full"
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                        >
                            <option value="">All Years</option>
                            <option value="2024">2024</option>
                            <option value="2025">2025</option>
                            <option value="2026">2026</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Payroll Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="loading"></div>
                    </div>
                ) : payrolls.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No payroll records found
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    {isManagement && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>}
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Basic Salary</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Salary</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    {isManagement && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {payrolls.map((payroll) => (
                                    <tr key={payroll.id} className="hover:bg-gray-50">
                                        {isManagement && (
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {payroll.employee_name || 'Unknown'}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {payroll.employee_type.charAt(0).toUpperCase() + payroll.employee_type.slice(1)} • {payroll.employee_code}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{payroll.month} {payroll.year}</div>
                                            <div className="text-xs text-gray-500">
                                                {payroll.payment_date ? new Date(payroll.payment_date).toLocaleDateString() : 'Not paid'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            Rs. {Number(payroll.basic_salary).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-gray-900">
                                                Rs. {Number(payroll.net_salary).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payroll.status === 'paid' ? 'bg-green-100 text-green-800' :
                                                payroll.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {payroll.status.toUpperCase()}
                                            </span>
                                        </td>
                                        {isManagement && (
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <PermissionGuard permission={PERMISSIONS.MANAGE_PAYROLL}>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(payroll)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(payroll.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </PermissionGuard>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal - Only for Management */}
            {isManagement && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedPayroll(null);
                    }}
                    title={selectedPayroll ? 'Edit Payroll Record' : 'Add New Payroll Record'}
                    size="lg"
                >
                    <PayrollForm
                        payroll={selectedPayroll}
                        onSubmit={handleSubmit}
                        onCancel={() => {
                            setIsModalOpen(false);
                            setSelectedPayroll(null);
                        }}
                        isSubmitting={createMutation.isPending || updateMutation.isPending}
                    />
                </Modal>
            )}
        </div>
    );
};

export default Payroll;
