import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Calendar,
    User,
    FileText,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';
import { dailyReportsAPI, teachersAPI } from '../lib/api';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../store/slices/authSlice';

const DailyReports = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const role = useSelector(selectUserRole);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        teacher_id: '',
        date_from: '',
        date_to: ''
    });

    // Fetch Reports
    const { data: reportsData, isLoading } = useQuery({
        queryKey: ['daily-reports', filters],
        queryFn: () => dailyReportsAPI.getAll(filters)
    });

    // Fetch Teachers for dropdown (only if admin/principal/hod)
    const canManageReports = ['super_admin', 'admin', 'principal', 'hod'].includes(role);
    const { data: teachersData } = useQuery({
        queryKey: ['teachers-list'],
        queryFn: () => teachersAPI.getAll({ status: 'active' }),
        enabled: canManageReports
    });

    const reports = reportsData?.data || [];
    const teachers = teachersData?.data || [];
    const totalPages = reportsData?.totalPages || 1;

    // Mutations
    const createMutation = useMutation({
        mutationFn: dailyReportsAPI.create,
        onSuccess: () => {
            toast.success('Report created successfully');
            setIsModalOpen(false);
            resetForm();
            queryClient.invalidateQueries(['daily-reports']);
        },
        onError: (error) => toast.error(error.message || 'Failed to create report')
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => dailyReportsAPI.update(id, data),
        onSuccess: () => {
            toast.success('Report updated successfully');
            setIsModalOpen(false);
            resetForm();
            queryClient.invalidateQueries(['daily-reports']);
        },
        onError: (error) => toast.error(error.message || 'Failed to update report')
    });

    const deleteMutation = useMutation({
        mutationFn: dailyReportsAPI.delete,
        onSuccess: () => {
            toast.success('Report deleted successfully');
            queryClient.invalidateQueries(['daily-reports']);
        },
        onError: (error) => toast.error(error.message || 'Failed to delete report')
    });

    // Form State
    const [formData, setFormData] = useState({
        teacher_id: '',
        report_date: new Date().toISOString().split('T')[0],
        content: '',
        remarks: ''
    });

    const resetForm = () => {
        setFormData({
            teacher_id: '',
            report_date: new Date().toISOString().split('T')[0],
            content: '',
            remarks: ''
        });
        setSelectedReport(null);
    };

    const handleEdit = (report) => {
        setSelectedReport(report);
        setFormData({
            teacher_id: report.teacher_id,
            report_date: report.report_date.split('T')[0],
            content: report.content,
            remarks: report.remarks || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selectedReport) {
            updateMutation.mutate({ id: selectedReport.id, data: formData });
        } else {
            createMutation.mutate(formData);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Daily Reports</h1>
                    <p className="text-gray-600 mt-1">Track and manage teacher daily reports</p>
                </div>
                {canManageReports && (
                    <button
                        onClick={() => {
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Create Report</span>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {canManageReports && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                            <select
                                className="input w-full"
                                value={filters.teacher_id}
                                onChange={(e) => setFilters({ ...filters, teacher_id: e.target.value, page: 1 })}
                            >
                                <option value="">All Teachers</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            className="input w-full"
                            value={filters.date_from}
                            onChange={(e) => setFilters({ ...filters, date_from: e.target.value, page: 1 })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            className="input w-full"
                            value={filters.date_to}
                            onChange={(e) => setFilters({ ...filters, date_to: e.target.value, page: 1 })}
                        />
                    </div>
                </div>
            </div>

            {/* Reports List */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="loading"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No reports found</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content Preview</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {new Date(report.report_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {report.teacher_first_name} {report.teacher_last_name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600 truncate max-w-xs">{report.content}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {report.creator_email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() => navigate(`/reports/${report.id}`)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                {canManageReports && (
                                                    <>
                                                        <button
                                                            onClick={() => handleEdit(report)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(report.id)}
                                                            className="text-red-600 hover:text-red-900"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                                    disabled={filters.page === 1}
                                    className="btn btn-outline btn-sm"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Page {filters.page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
                                    disabled={filters.page === totalPages}
                                    className="btn btn-outline btn-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={selectedReport ? 'Edit Daily Report' : 'Create Daily Report'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    {!selectedReport && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
                            <select
                                name="teacher_id"
                                value={formData.teacher_id}
                                onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                                className="input w-full"
                                required
                            >
                                <option value="">Select Teacher</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.employee_id})</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                        <input
                            type="date"
                            name="report_date"
                            value={formData.report_date}
                            onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                            className="input w-full"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="input w-full h-32"
                            placeholder="Enter report details..."
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                        <textarea
                            name="remarks"
                            value={formData.remarks}
                            onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                            className="input w-full h-20"
                            placeholder="Optional remarks..."
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                            className="btn btn-outline"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Report'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DailyReports;
