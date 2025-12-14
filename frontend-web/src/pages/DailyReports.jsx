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
    Trash2,
    BookOpen,
    Users,
    CheckCircle,
    XCircle,
    TrendingUp,
    Award,
    AlertCircle,
    Target,
    Clock
} from 'lucide-react';
import { dailyReportsAPI, teachersAPI, classesAPI, subjectsAPI } from '../lib/api';
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
    const isTeacher = role === 'teacher';

    const { data: teachersData } = useQuery({
        queryKey: ['teachers-list'],
        queryFn: () => teachersAPI.getAll({ status: 'active' }),
        enabled: canManageReports
    });

    // Fetch Classes
    const { data: classesData } = useQuery({
        queryKey: ['classes-list'],
        queryFn: () => classesAPI.getAll()
    });

    // Fetch Subjects
    const { data: subjectsData } = useQuery({
        queryKey: ['subjects-list'],
        queryFn: () => subjectsAPI.getAll()
    });

    const reports = reportsData?.data || [];
    const teachers = teachersData?.data || [];
    const classes = classesData?.data || [];
    const subjects = subjectsData?.data || [];
    const totalPages = reportsData?.totalPages || 1;

    // Mutations
    const createMutation = useMutation({
        mutationFn: dailyReportsAPI.create,
        onSuccess: () => {
            toast.success('Report submitted successfully');
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
        remarks: '',
        class_id: '',
        subject_id: '',
        period_number: '',
        topics_covered: '',
        teaching_method: '',
        homework_assigned: '',
        students_present: '',
        students_absent: '',
        student_engagement: '',
        challenges_faced: '',
        achievements: '',
        resources_used: '',
        next_class_plan: ''
    });

    const resetForm = () => {
        setFormData({
            teacher_id: '',
            report_date: new Date().toISOString().split('T')[0],
            content: '',
            remarks: '',
            class_id: '',
            subject_id: '',
            period_number: '',
            topics_covered: '',
            teaching_method: '',
            homework_assigned: '',
            students_present: '',
            students_absent: '',
            student_engagement: '',
            challenges_faced: '',
            achievements: '',
            resources_used: '',
            next_class_plan: ''
        });
        setSelectedReport(null);
    };

    const handleEdit = (report) => {
        setSelectedReport(report);
        setFormData({
            teacher_id: report.teacher_id,
            report_date: report.report_date.split('T')[0],
            content: report.content,
            remarks: report.remarks || '',
            class_id: report.class_id || '',
            subject_id: report.subject_id || '',
            period_number: report.period_number || '',
            topics_covered: report.topics_covered || '',
            teaching_method: report.teaching_method || '',
            homework_assigned: report.homework_assigned || '',
            students_present: report.students_present || '',
            students_absent: report.students_absent || '',
            student_engagement: report.student_engagement || '',
            challenges_faced: report.challenges_faced || '',
            achievements: report.achievements || '',
            resources_used: report.resources_used || '',
            next_class_plan: report.next_class_plan || ''
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

    const getEngagementBadge = (engagement) => {
        const badges = {
            excellent: 'bg-green-100 text-green-800 border-green-200',
            good: 'bg-blue-100 text-blue-800 border-blue-200',
            average: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            poor: 'bg-red-100 text-red-800 border-red-200'
        };
        return badges[engagement] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-black">Daily Reports</h1>
                    <p className="text-black mt-1">
                        {isTeacher ? 'Submit your daily teaching work and activities' : 'Track and manage teacher daily reports'}
                    </p>
                </div>
                {isTeacher && (
                    <button
                        onClick={() => {
                            resetForm();
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-xl hover:bg-blue-800 transition-all font-medium shadow-sm hover:shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Submit Report</span>
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {canManageReports && (
                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Teacher</label>
                            <select
                                className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        <label className="block text-sm font-medium text-black mb-2">From Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filters.date_from}
                            onChange={(e) => setFilters({ ...filters, date_from: e.target.value, page: 1 })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-2">To Date</label>
                        <input
                            type="date"
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filters.date_to}
                            onChange={(e) => setFilters({ ...filters, date_to: e.target.value, page: 1 })}
                        />
                    </div>
                </div>
            </div>

            {/* Reports List */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-black mb-2">No reports found</h3>
                    <p className="text-black mb-6">
                        {isTeacher ? 'Start by submitting your first daily report' : 'No daily reports have been submitted yet'}
                    </p>
                    {isTeacher && (
                        <button
                            onClick={() => {
                                resetForm();
                                setIsModalOpen(true);
                            }}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-all font-medium"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Submit Your First Report</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <Calendar className="w-6 h-6 text-blue-700" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-black">
                                                {new Date(report.report_date).toLocaleDateString('en-US', {
                                                    weekday: 'long',
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <User className="w-4 h-4 text-black" />
                                                <span className="text-sm text-black">
                                                    {report.teacher_first_name} {report.teacher_last_name}
                                                </span>
                                                {report.class_name && (
                                                    <>
                                                        <span className="text-black">•</span>
                                                        <span className="text-sm text-black">
                                                            {report.class_name} {report.section}
                                                        </span>
                                                    </>
                                                )}
                                                {report.subject_name && (
                                                    <>
                                                        <span className="text-black">•</span>
                                                        <span className="text-sm text-black">
                                                            {report.subject_name}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => navigate(`/reports/${report.id}`)}
                                            className="p-2 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="View Details"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                        {(canManageReports || isTeacher) && (
                                            <>
                                                <button
                                                    onClick={() => handleEdit(report)}
                                                    className="p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                {canManageReports && (
                                                    <button
                                                        onClick={() => handleDelete(report.id)}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Content Preview */}
                                <div className="mb-4">
                                    <p className="text-black line-clamp-2">{report.content}</p>
                                </div>

                                {/* Metrics Grid */}
                                {(report.students_present || report.student_engagement || report.topics_covered) && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        {report.students_present !== null && (
                                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                <div>
                                                    <p className="text-xs text-green-600 font-medium">Present</p>
                                                    <p className="text-lg font-bold text-green-900">{report.students_present}</p>
                                                </div>
                                            </div>
                                        )}
                                        {report.students_absent !== null && (
                                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                                                <XCircle className="w-5 h-5 text-red-600" />
                                                <div>
                                                    <p className="text-xs text-red-600 font-medium">Absent</p>
                                                    <p className="text-lg font-bold text-red-900">{report.students_absent}</p>
                                                </div>
                                            </div>
                                        )}
                                        {report.period_number && (
                                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <Clock className="w-5 h-5 text-blue-600" />
                                                <div>
                                                    <p className="text-xs text-blue-600 font-medium">Period</p>
                                                    <p className="text-lg font-bold text-blue-900">{report.period_number}</p>
                                                </div>
                                            </div>
                                        )}
                                        {report.student_engagement && (
                                            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-100">
                                                <TrendingUp className="w-5 h-5 text-purple-600" />
                                                <div>
                                                    <p className="text-xs text-purple-600 font-medium">Engagement</p>
                                                    <p className="text-sm font-bold text-purple-900 capitalize">{report.student_engagement}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Topics & Homework */}
                                {(report.topics_covered || report.homework_assigned) && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {report.topics_covered && (
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <BookOpen className="w-4 h-4 text-black" />
                                                    <span className="text-xs font-semibold text-black uppercase">Topics Covered</span>
                                                </div>
                                                <p className="text-sm text-black">{report.topics_covered}</p>
                                            </div>
                                        )}
                                        {report.homework_assigned && (
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Target className="w-4 h-4 text-black" />
                                                    <span className="text-xs font-semibold text-black uppercase">Homework Assigned</span>
                                                </div>
                                                <p className="text-sm text-black">{report.homework_assigned}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                            disabled={filters.page === 1}
                            className="px-4 py-2 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm text-black font-medium">
                            Page {filters.page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
                            disabled={filters.page === totalPages}
                            className="px-4 py-2 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={selectedReport ? 'Edit Daily Report' : (isTeacher ? 'Submit Daily Work Report' : 'Create Daily Report')}
                size="2xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-700" />
                            Basic Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {!selectedReport && canManageReports && (
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Teacher *</label>
                                    <select
                                        value={formData.teacher_id}
                                        onChange={(e) => setFormData({ ...formData, teacher_id: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                <label className="block text-sm font-medium text-black mb-2">Date *</label>
                                <input
                                    type="date"
                                    value={formData.report_date}
                                    onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Class</label>
                                <select
                                    value={formData.class_id}
                                    onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Subject</label>
                                <select
                                    value={formData.subject_id}
                                    onChange={(e) => setFormData({ ...formData, subject_id: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Period Number</label>
                                <input
                                    type="number"
                                    value={formData.period_number}
                                    onChange={(e) => setFormData({ ...formData, period_number: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., 1, 2, 3..."
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Teaching Method</label>
                                <input
                                    type="text"
                                    value={formData.teaching_method}
                                    onChange={(e) => setFormData({ ...formData, teaching_method: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g., Lecture, Discussion, Practical"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Teaching Details */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-700" />
                            Teaching Details
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Daily Work Summary *</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Describe what you taught today, activities conducted, and overall class summary..."
                                rows="4"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Topics Covered</label>
                            <textarea
                                value={formData.topics_covered}
                                onChange={(e) => setFormData({ ...formData, topics_covered: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="List the specific topics or chapters covered in today's class..."
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Homework Assigned</label>
                            <textarea
                                value={formData.homework_assigned}
                                onChange={(e) => setFormData({ ...formData, homework_assigned: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Describe the homework or assignments given to students..."
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Resources Used</label>
                            <textarea
                                value={formData.resources_used}
                                onChange={(e) => setFormData({ ...formData, resources_used: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="List any teaching aids, materials, or technology used (e.g., projector, charts, videos)..."
                                rows="2"
                            />
                        </div>
                    </div>

                    {/* Student Metrics */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-700" />
                            Student Attendance & Engagement
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Students Present</label>
                                <input
                                    type="number"
                                    value={formData.students_present}
                                    onChange={(e) => setFormData({ ...formData, students_present: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Number of students"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Students Absent</label>
                                <input
                                    type="number"
                                    value={formData.students_absent}
                                    onChange={(e) => setFormData({ ...formData, students_absent: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Number of students"
                                    min="0"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-black mb-2">Student Engagement</label>
                                <select
                                    value={formData.student_engagement}
                                    onChange={(e) => setFormData({ ...formData, student_engagement: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Select Level</option>
                                    <option value="excellent">Excellent</option>
                                    <option value="good">Good</option>
                                    <option value="average">Average</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Observations */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-black flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-blue-700" />
                            Observations & Planning
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Challenges Faced</label>
                            <textarea
                                value={formData.challenges_faced}
                                onChange={(e) => setFormData({ ...formData, challenges_faced: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Describe any difficulties or challenges encountered during the class..."
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Achievements & Highlights</label>
                            <textarea
                                value={formData.achievements}
                                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Note any positive outcomes, student achievements, or memorable moments..."
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Next Class Plan</label>
                            <textarea
                                value={formData.next_class_plan}
                                onChange={(e) => setFormData({ ...formData, next_class_plan: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Outline your plan for the next class session..."
                                rows="3"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-black mb-2">Additional Remarks</label>
                            <textarea
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-black focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Any other notes or comments..."
                                rows="2"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => {
                                setIsModalOpen(false);
                                resetForm();
                            }}
                            className="px-6 py-2.5 bg-white border border-gray-300 text-black rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-blue-700 text-white rounded-lg hover:bg-blue-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {createMutation.isPending || updateMutation.isPending ? 'Saving...' : (selectedReport ? 'Update Report' : 'Submit Report')}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default DailyReports;
