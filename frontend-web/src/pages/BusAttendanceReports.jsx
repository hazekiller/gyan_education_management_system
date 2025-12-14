import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Bus,
    Calendar,
    Users,
    Plus,
    Edit,
    Trash2,
    Eye,
    CheckCircle,
    X,
    Filter,
    ClipboardList,
    UserCheck,
    UserX
} from 'lucide-react';
import { transportAPI } from '../lib/api';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const BusAttendanceReports = () => {
    const { user } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('reports');
    const isAdmin = ['super_admin', 'admin', 'principal', 'hod'].includes(user?.role);
    const isStudent = user?.role === 'student';

    // If student, default to my-attendance
    useEffect(() => {
        if (isStudent && activeTab === 'reports') {
            setActiveTab('my-attendance');
        }
    }, [isStudent, activeTab]);

    return (
        <div className="space-y-8">
            <div className="bg-blue-600 rounded-2xl p-8 text-white shadow-xl">

                <div className="flex items-center gap-3 mb-2">
                    <ClipboardList className="w-10 h-10" />
                    <h1 className="text-4xl font-bold">Bus Attendance Reports</h1>
                </div>
                <p className="text-white text-lg opacity-90">

                    Track and manage daily bus attendance records
                </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-2 bg-white border border-gray-200 p-1.5 rounded-xl shadow-sm overflow-x-auto">
                {isAdmin && (
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'reports'
                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                            : 'text-black hover:bg-gray-100'

                            }`}
                    >
                        <ClipboardList className="w-4 h-4 mr-2" />
                        All Reports
                    </button>
                )}
                {isStudent && (
                    <button
                        onClick={() => setActiveTab('my-attendance')}
                        className={`flex items-center px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === 'my-attendance'
                            ? 'bg-blue-600 text-white shadow-md transform scale-105'
                            : 'text-black hover:bg-gray-100'

                            }`}
                    >
                        <Bus className="w-4 h-4 mr-2" />
                        My Attendance
                    </button>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 min-h-[500px]">
                {activeTab === 'reports' && isAdmin && <ReportsTab />}
                {activeTab === 'my-attendance' && isStudent && <MyAttendanceTab />}
            </div>
        </div>
    );
};

// ==========================================
// REPORTS TAB (Admin/HOD/Principal)
// ==========================================
const ReportsTab = () => {
    const { user } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [selectedReport, setSelectedReport] = useState(null);
    const [viewMode, setViewMode] = useState(false);

    // Filters
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        route_id: '',
        vehicle_id: '',
        date_from: '',
        date_to: '',
        status: ''
    });

    // Fetch Reports
    const { data: reportsData, isLoading } = useQuery({
        queryKey: ['bus-attendance-reports', filters],
        queryFn: () => transportAPI.getBusAttendanceReports(filters)
    });

    // Fetch Routes for filter
    const { data: routesData } = useQuery({
        queryKey: ['transport-routes'],
        queryFn: () => transportAPI.getAllRoutes()
    });

    // Fetch Vehicles for filter
    const { data: vehiclesData } = useQuery({
        queryKey: ['transport-vehicles'],
        queryFn: () => transportAPI.getAllVehicles()
    });

    const reports = reportsData?.data || [];
    const routes = routesData?.data || [];
    const vehicles = vehiclesData?.data || [];
    const totalPages = reportsData?.totalPages || 1;

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: transportAPI.deleteBusAttendanceReport,
        onSuccess: () => {
            queryClient.invalidateQueries(['bus-attendance-reports']);
            toast.success('Report deleted successfully');
        },
        onError: (err) => toast.error(err.message || 'Failed to delete report')
    });

    // Verify Mutation
    const verifyMutation = useMutation({
        mutationFn: transportAPI.verifyBusAttendanceReport,
        onSuccess: () => {
            queryClient.invalidateQueries(['bus-attendance-reports']);
            toast.success('Report verified successfully');
        },
        onError: (err) => toast.error(err.message || 'Failed to verify report')
    });

    const handleEdit = (report) => {
        setSelectedReport(report);
        setViewMode(false);
        setShowModal(true);
    };

    const handleView = (report) => {
        setSelectedReport(report);
        setViewMode(true);
        setShowModal(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleVerify = (id) => {
        if (window.confirm('Verify this report?')) {
            verifyMutation.mutate(id);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedReport(null);
        setViewMode(false);
    };

    const getStatusBadge = (status) => {
        const styles = {
            draft: 'bg-white text-black border-gray-200',
            submitted: 'bg-blue-600 text-white border-blue-600',
            verified: 'bg-white text-black border-blue-600'

        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border-2 ${styles[status] || styles.draft}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center p-6 bg-white rounded-2xl border border-gray-200">
                <h3 className="text-2xl font-bold text-black flex items-center gap-3">
                    <ClipboardList className="w-8 h-8 text-blue-600" />

                    Bus Attendance Reports
                </h3>
                <button
                    onClick={() => {
                        setSelectedReport(null);
                        setViewMode(false);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all font-medium"
                >
                    <Plus className="w-4 h-4" /> Create Report
                </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-gray-600" />
                    <h4 className="font-semibold text-gray-900">Filters</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">Route</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                            value={filters.route_id}
                            onChange={(e) => setFilters({ ...filters, route_id: e.target.value, page: 1 })}
                        >
                            <option value="">All Routes</option>
                            {routes.map(r => (
                                <option key={r.id} value={r.id}>
                                    {r.route_name} {r.bus_number ? `(${r.bus_number})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">Bus</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"

                            value={filters.vehicle_id}
                            onChange={(e) => setFilters({ ...filters, vehicle_id: e.target.value, page: 1 })}
                        >
                            <option value="">All Buses</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.bus_number}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">From Date</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"

                            value={filters.date_from}
                            onChange={(e) => setFilters({ ...filters, date_from: e.target.value, page: 1 })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filters.date_to}
                            onChange={(e) => setFilters({ ...filters, date_to: e.target.value, page: 1 })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-black mb-1">Status</label>
                        <select
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"

                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="submitted">Submitted</option>
                            <option value="verified">Verified</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reports Table */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900">No Reports Found</h3>
                    <p className="text-gray-500 mt-2">Create your first bus attendance report</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-white border-b border-gray-200">
                                    <th className="px-6 py-5 text-left text-xs font-bold text-black uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-black uppercase tracking-wider">Route / Bus</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-black uppercase tracking-wider">Attendance</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-black uppercase tracking-wider">Created By</th>
                                    <th className="px-6 py-5 text-right text-xs font-bold text-black uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {reports.map((report) => (
                                    <tr key={report.id} className="hover:bg-gray-50 transition-all">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-blue-600" />
                                                <span className="font-medium text-black">

                                                    {new Date(report.report_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-black">{report.route_name}</div>
                                            <div className="text-sm font-mono bg-white border border-blue-600 text-black px-3 py-1 rounded-full mt-1 inline-block">

                                                {report.bus_number}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="text-center">
                                                    <div className="text-xs text-black">Total</div>
                                                    <div className="text-lg font-bold text-black">{report.total_students}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-black">Present</div>
                                                    <div className="text-lg font-bold text-black">{report.present_count}</div>
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs text-black">Absent</div>
                                                    <div className="text-lg font-bold text-black">{report.absent_count}</div>

                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(report.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {report.creator_email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleView(report)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(report)}
                                                    className="p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"

                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                {['super_admin', 'admin', 'principal'].includes(user?.role) && (
                                                    <button
                                                        onClick={() => handleDelete(report.id)}
                                                        className="p-2 text-black hover:bg-gray-100 rounded-lg transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
                                                {report.status !== 'verified' && ['super_admin', 'principal'].includes(user?.role) && (
                                                    <button
                                                        onClick={() => handleVerify(report.id)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Verify"
                                                    >
                                                        <CheckCircle className="w-5 h-5" />
                                                    </button>
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
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span className="px-4 py-2 text-sm text-gray-700">
                                    Page {filters.page} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
                                    disabled={filters.page === totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <ReportModal
                    onClose={handleCloseModal}
                    initialData={selectedReport}
                    viewMode={viewMode}
                />
            )}
        </div>
    );
};

// ==========================================
// MY ATTENDANCE TAB (Students)
// ==========================================
const MyAttendanceTab = () => {
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        date_from: '',
        date_to: ''
    });

    const { data: attendanceData, isLoading } = useQuery({
        queryKey: ['my-bus-attendance', filters],
        queryFn: () => transportAPI.getMyBusAttendance(filters)
    });

    const attendance = attendanceData?.data || [];
    const totalPages = attendanceData?.totalPages || 1;

    const getStatusBadge = (status) => {
        if (status === 'present') {
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white border-2 border-blue-600">PRESENT</span>;
        } else if (status === 'absent') {
            return <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-black border-2 border-gray-200">ABSENT</span>;

        }
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-black border-2 border-gray-200">UNKNOWN</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <Bus className="w-8 h-8 text-blue-600" />
                    My Bus Attendance
                </h3>
                <p className="text-gray-600 mt-1">View your daily bus attendance records</p>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filters.date_from}
                            onChange={(e) => setFilters({ ...filters, date_from: e.target.value, page: 1 })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                        <input
                            type="date"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={filters.date_to}
                            onChange={(e) => setFilters({ ...filters, date_to: e.target.value, page: 1 })}
                        />
                    </div>
                </div>
            </div>

            {/* Attendance Records */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : attendance.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
                    <Bus className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900">No Attendance Records</h3>
                    <p className="text-gray-500 mt-2">Your bus attendance records will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attendance.map((record) => (
                        <div key={record.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1 transition-all duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-blue-600" />
                                    <span className="font-bold text-gray-900">
                                        {new Date(record.report_date).toLocaleDateString()}
                                    </span>
                                </div>
                                {getStatusBadge(record.my_status)}
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                                    <Bus className="w-4 h-4 text-blue-600" />
                                    <div>
                                        <div className="text-xs text-gray-500">Bus</div>
                                        <div className="font-semibold text-gray-900">{record.bus_number}</div>
                                    </div>
                                </div>

                                <div className="p-3 bg-gray-50 rounded-xl">
                                    <div className="text-xs text-gray-500 mb-1">Route</div>
                                    <div className="font-semibold text-gray-900">{record.route_name}</div>
                                </div>

                                {record.my_remarks && (
                                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                        <div className="text-xs text-gray-700 mb-1">Remarks</div>
                                        <div className="text-sm text-gray-900">{record.my_remarks}</div>
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
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setFilters({ ...filters, page: Math.max(1, filters.page - 1) })}
                            disabled={filters.page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <span className="px-4 py-2 text-sm text-gray-700">
                            Page {filters.page} of {totalPages}
                        </span>
                        <button
                            onClick={() => setFilters({ ...filters, page: Math.min(totalPages, filters.page + 1) })}
                            disabled={filters.page === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// REPORT MODAL (Create/Edit/View)
// ==========================================
const ReportModal = ({ onClose, initialData, viewMode }) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        report_date: initialData?.report_date?.split('T')[0] || new Date().toISOString().split('T')[0],
        route_id: initialData?.route_id || '',
        vehicle_id: initialData?.vehicle_id || '',
        remarks: initialData?.remarks || '',
        status: initialData?.status || 'draft',
        attendance_data: initialData?.attendance_data || []
    });

    const [students, setStudents] = useState([]);

    // Fetch Routes
    const { data: routesData } = useQuery({
        queryKey: ['transport-routes'],
        queryFn: () => transportAPI.getAllRoutes()
    });

    // Fetch Students for selected route
    useEffect(() => {
        if (formData.route_id) {
            transportAPI.getRouteStudents(formData.route_id).then(res => {
                const studentsData = res.data || [];
                setStudents(studentsData);

                // Initialize attendance data if creating new report
                if (!initialData && studentsData.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        attendance_data: studentsData.map(s => ({
                            student_id: s.id,
                            student_name: `${s.first_name} ${s.last_name}`,
                            status: 'present',
                            remarks: ''
                        }))
                    }));
                }
            });
        }
    }, [formData.route_id, initialData]);

    const routes = routesData?.data || [];

    // Create/Update Mutation
    const mutation = useMutation({
        mutationFn: (data) => initialData
            ? transportAPI.updateBusAttendanceReport(initialData.id, data)
            : transportAPI.createBusAttendanceReport(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['bus-attendance-reports']);
            toast.success(initialData ? 'Report updated successfully' : 'Report created successfully');
            onClose();
        },
        onError: (err) => toast.error(err.message || 'Failed to save report')
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    const handleAttendanceChange = (studentId, field, value) => {
        setFormData(prev => ({
            ...prev,
            attendance_data: prev.attendance_data.map(a =>
                a.student_id === studentId ? { ...a, [field]: value } : a
            )
        }));
    };

    const selectedRoute = routes.find(r => r.id === parseInt(formData.route_id));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-white">

                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-black">
                            {viewMode ? 'View Report' : initialData ? 'Edit Report' : 'Create Report'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Date *</label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"

                                    value={formData.report_date}
                                    onChange={(e) => setFormData({ ...formData, report_date: e.target.value })}
                                    required
                                    disabled={viewMode}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Route *</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
                                    value={formData.route_id}
                                    onChange={(e) => {
                                        const route = routes.find(r => r.id === parseInt(e.target.value));
                                        setFormData({
                                            ...formData,
                                            route_id: e.target.value,
                                            vehicle_id: route?.vehicle_id || ''
                                        });
                                    }}
                                    required
                                    disabled={viewMode || initialData}
                                >
                                    <option value="">Select Route</option>
                                    {routes.map(r => (
                                        <option key={r.id} value={r.id}>
                                            {r.route_name}
                                            {r.bus_number ? ` (${r.bus_number})` : r.vehicle_number && r.vehicle_number !== 'Unassigned' ? ` (${r.vehicle_number})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Status */}
                        {!viewMode && (
                            <div>
                                <label className="block text-sm font-medium text-black mb-1">Status</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"

                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option value="draft">Draft</option>
                                    <option value="submitted">Submitted</option>
                                </select>
                            </div>
                        )}

                        {/* Student Attendance */}
                        {formData.attendance_data.length > 0 && (
                            <div>
                                <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-600" />

                                    Student Attendance ({formData.attendance_data.length} students)
                                </h3>
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="max-h-96 overflow-y-auto">
                                        <table className="w-full">
                                            <thead className="bg-white sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase">Student</th>
                                                    <th className="px-4 py-3 text-center text-xs font-bold text-black uppercase">Status</th>
                                                    <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase">Remarks</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {formData.attendance_data.map((attendance) => (
                                                    <tr key={attendance.student_id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium text-black">
                                                                {attendance.student_name}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex justify-center gap-2">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAttendanceChange(attendance.student_id, 'status', 'present')}
                                                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${attendance.status === 'present'
                                                                        ? 'bg-blue-600 text-white shadow-md'
                                                                        : 'bg-white text-black border border-gray-300 hover:bg-gray-50'

                                                                        }`}
                                                                    disabled={viewMode}
                                                                >
                                                                    <UserCheck className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleAttendanceChange(attendance.student_id, 'status', 'absent')}
                                                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${attendance.status === 'absent'
                                                                        ? 'bg-black text-white shadow-md'
                                                                        : 'bg-white text-black border border-gray-300 hover:bg-gray-50'

                                                                        }`}
                                                                    disabled={viewMode}
                                                                >
                                                                    <UserX className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <input
                                                                type="text"
                                                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-600 focus:border-blue-600"

                                                                placeholder="Optional remarks..."
                                                                value={attendance.remarks || ''}
                                                                onChange={(e) => handleAttendanceChange(attendance.student_id, 'remarks', e.target.value)}
                                                                disabled={viewMode}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* General Remarks */}
                        <div>
                            <label className="block text-sm font-medium text-black mb-1">General Remarks</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:border-blue-600"

                                rows="3"
                                placeholder="Optional general remarks about the day..."
                                value={formData.remarks}
                                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                disabled={viewMode}
                            />
                        </div>

                        {/* Actions */}
                        {!viewMode && (
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 font-medium shadow-lg"
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? 'Saving...' : 'Save Report'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default BusAttendanceReports;
