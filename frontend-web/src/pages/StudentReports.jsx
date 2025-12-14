// File: frontend-web/src/pages/StudentReports.jsx
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Calendar,
    BookOpen,
    ClipboardCheck,
    DollarSign,
    Bus,
    Home,
    Library,
    TrendingUp,
    FileText
} from 'lucide-react';
import { studentReportsAPI } from '../lib/api';

const StudentReports = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');

    const { data: reportData, isLoading } = useQuery({
        queryKey: ['student-comprehensive-report', id],
        queryFn: () => studentReportsAPI.getComprehensiveReport(id)
    });

    const { data: attendanceData } = useQuery({
        queryKey: ['student-attendance-report', id],
        queryFn: () => studentReportsAPI.getAttendanceReport(id, { limit: 30 }),
        enabled: activeTab === 'attendance'
    });

    const { data: examData } = useQuery({
        queryKey: ['student-exam-report', id],
        queryFn: () => studentReportsAPI.getExamReport(id),
        enabled: activeTab === 'exams'
    });

    const { data: assignmentData } = useQuery({
        queryKey: ['student-assignment-report', id],
        queryFn: () => studentReportsAPI.getAssignmentReport(id),
        enabled: activeTab === 'assignments'
    });

    const { data: feeData } = useQuery({
        queryKey: ['student-fee-report', id],
        queryFn: () => studentReportsAPI.getFeeReport(id),
        enabled: activeTab === 'fees'
    });

    const { data: transportData } = useQuery({
        queryKey: ['student-transport-report', id],
        queryFn: () => studentReportsAPI.getTransportReport(id),
        enabled: activeTab === 'transport'
    });

    const { data: hostelData } = useQuery({
        queryKey: ['student-hostel-report', id],
        queryFn: () => studentReportsAPI.getHostelReport(id),
        enabled: activeTab === 'hostel'
    });

    const { data: libraryData } = useQuery({
        queryKey: ['student-library-report', id],
        queryFn: () => studentReportsAPI.getLibraryReport(id),
        enabled: activeTab === 'library'
    });

    const report = reportData?.data;
    const student = report?.student;

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="loading"></div>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">Student report not found</p>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', name: 'Overview', icon: TrendingUp },
        { id: 'attendance', name: 'Attendance', icon: ClipboardCheck },
        { id: 'exams', name: 'Exams', icon: FileText },
        { id: 'assignments', name: 'Assignments', icon: BookOpen },
        { id: 'fees', name: 'Fees', icon: DollarSign },
        { id: 'transport', name: 'Transport', icon: Bus },
        { id: 'hostel', name: 'Hostel', icon: Home },
        { id: 'library', name: 'Library', icon: Library }
    ];

    const calculateAttendancePercentage = () => {
        const { total_days, present_days } = report.attendance;
        if (total_days === 0) return 0;
        return ((present_days / total_days) * 100).toFixed(1);
    };

    const calculateExamPercentage = () => {
        const { total_marks_obtained, total_max_marks } = report.exams;
        if (total_max_marks === 0) return 0;
        return ((total_marks_obtained / total_max_marks) * 100).toFixed(1);
    };

    const calculateAssignmentCompletion = () => {
        const { total_assignments, submitted_assignments } = report.assignments;
        if (total_assignments === 0) return 0;
        return ((submitted_assignments / total_assignments) * 100).toFixed(1);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/students')}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Students</span>
                </button>
            </div>

            {/* Student Header */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24"></div>
                <div className="px-6 pb-6">
                    <div className="flex items-center -mt-12 mb-4">
                        <div className="w-24 h-24 rounded-full border-4 border-white bg-white flex items-center justify-center">
                            {student.profile_photo ? (
                                <img
                                    src={`http://localhost:5000/${student.profile_photo}`}
                                    alt={student.first_name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-blue-600">
                                    {student.first_name.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div className="ml-6 flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {student.first_name} {student.middle_name} {student.last_name}
                            </h1>
                            <p className="text-gray-600">
                                {student.class_name} {student.section_name && `- ${student.section_name}`} • Roll No: {student.roll_number}
                            </p>
                            <p className="text-sm text-gray-500">Admission No: {student.admission_number}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="border-b border-gray-200 overflow-x-auto">
                    <nav className="flex space-x-1 px-4" aria-label="Tabs">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap
                    ${activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }
                  `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.name}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900">Student Overview</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Attendance Card */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <ClipboardCheck className="w-8 h-8 text-blue-700" />
                                        <span className="text-2xl font-bold text-blue-700">
                                            {calculateAttendancePercentage()}%
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900">Attendance Rate</h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {report.attendance.present_days} / {report.attendance.total_days} days
                                    </p>
                                </div>

                                {/* Exam Performance Card */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <FileText className="w-8 h-8 text-gray-700" />
                                        <span className="text-2xl font-bold text-gray-900">
                                            {calculateExamPercentage()}%
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900">Exam Average</h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {report.exams.total_exams} exams taken
                                    </p>
                                </div>

                                {/* Assignments Card */}
                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <BookOpen className="w-8 h-8 text-blue-700" />
                                        <span className="text-2xl font-bold text-blue-700">
                                            {calculateAssignmentCompletion()}%
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900">Assignments</h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                        {report.assignments.submitted_assignments} / {report.assignments.total_assignments} submitted
                                    </p>
                                </div>

                                {/* Fee Status Card */}
                                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <DollarSign className="w-8 h-8 text-gray-700" />
                                        <span className="text-2xl font-bold text-gray-900">
                                            ₹{report.fees.balance || 0}
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900">Fee Balance</h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                        Paid: ₹{report.fees.total_paid || 0}
                                    </p>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Transport Info */}
                                {report.transport && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <Bus className="w-6 h-6 text-blue-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">Transport</h3>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="font-medium">Route:</span> {report.transport.route_name}</p>
                                            <p><span className="font-medium">Vehicle:</span> {report.transport.bus_number}</p>
                                            <p><span className="font-medium">Driver:</span> {report.transport.driver_name}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Hostel Info */}
                                {report.hostel && (
                                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <Home className="w-6 h-6 text-gray-700" />
                                            <h3 className="text-lg font-semibold text-gray-900">Hostel</h3>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <p><span className="font-medium">Building:</span> {report.hostel.building_name}</p>
                                            <p><span className="font-medium">Room:</span> {report.hostel.room_number}</p>
                                            <p><span className="font-medium">Type:</span> {report.hostel.room_type}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Library Info */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center space-x-3 mb-3">
                                        <Library className="w-6 h-6 text-blue-700" />
                                        <h3 className="text-lg font-semibold text-gray-900">Library</h3>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Total Transactions:</span> {report.library.total_transactions}</p>
                                        <p><span className="font-medium">Current Books:</span> {report.library.current_books}</p>
                                        <p><span className="font-medium">Total Fines:</span> ₹{report.library.total_fines || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Attendance Tab */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-900">Attendance Records</h2>
                                <div className="text-sm text-gray-600">
                                    Total: {report.attendance.total_days} days |
                                    Present: {report.attendance.present_days} |
                                    Absent: {report.attendance.absent_days}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {attendanceData?.data?.map((record) => (
                                            <tr key={record.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(record.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${record.status === 'present' ? 'bg-green-100 text-green-800' :
                                                        record.status === 'absent' ? 'bg-red-100 text-red-800' :
                                                            record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {record.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {record.remarks || '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Exams Tab */}
                    {activeTab === 'exams' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Exam Results</h2>

                            {examData?.data && examData.data.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {examData.data.map((result) => (
                                                <tr key={result.id}>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {result.exam_name}
                                                        <div className="text-xs text-gray-500">{result.exam_type}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{result.subject_name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {result.marks_obtained} / {result.max_marks}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                                                            {result.grade || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {((result.marks_obtained / result.max_marks) * 100).toFixed(1)}%
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900">No Exam Results Yet</h3>
                                    <p className="text-gray-500 mt-1">Exam results will appear here once published.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Assignments Tab */}
                    {activeTab === 'assignments' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Assignments</h2>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {assignmentData?.data?.map((assignment) => (
                                            <tr key={assignment.id}>
                                                <td className="px-6 py-4 text-sm text-gray-900">{assignment.title}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{assignment.subject_name}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(assignment.due_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${assignment.submission_status === 'graded' ? 'bg-green-100 text-green-800' :
                                                        assignment.submission_status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {assignment.submission_status || 'Not Submitted'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {assignment.marks_obtained ? `${assignment.marks_obtained} / ${assignment.total_marks}` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Fees Tab */}
                    {activeTab === 'fees' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Fee</p>
                                    <p className="text-2xl font-bold text-blue-600">₹{report.fees.total_fee || 0}</p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Total Paid</p>
                                    <p className="text-2xl font-bold text-green-600">₹{report.fees.total_paid || 0}</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-gray-600">Balance</p>
                                    <p className="text-2xl font-bold text-red-600">₹{report.fees.balance || 0}</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h3>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fee Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Receipt</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {feeData?.data?.payments?.map((payment) => (
                                                <tr key={payment.id}>
                                                    <td className="px-6 py-4 text-sm text-gray-900">
                                                        {new Date(payment.payment_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{payment.fee_head_name}</td>
                                                    <td className="px-6 py-4 text-sm font-semibold text-green-600">
                                                        ₹{payment.amount_paid}
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{payment.payment_method}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{payment.receipt_number || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Transport Tab */}
                    {activeTab === 'transport' && (
                        <div className="space-y-6">
                            {transportData?.data?.transport_info ? (
                                <>
                                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Transport Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Route</p>
                                                <p className="font-medium text-gray-900">{transportData.data.transport_info.route_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Bus Number</p>
                                                <p className="font-medium text-gray-900">{transportData.data.transport_info.bus_number}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Pickup Point</p>
                                                <p className="font-medium text-gray-900">{transportData.data.transport_info.pickup_point}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Drop Point</p>
                                                <p className="font-medium text-gray-900">{transportData.data.transport_info.drop_point}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Driver</p>
                                                <p className="font-medium text-gray-900">{transportData.data.transport_info.driver_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Driver Contact</p>
                                                <p className="font-medium text-gray-900">{transportData.data.transport_info.driver_phone}</p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No transport allocation found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Hostel Tab */}
                    {activeTab === 'hostel' && (
                        <div className="space-y-4">
                            {hostelData?.data && hostelData.data.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Building</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocation Date</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {hostelData.data.map((allocation) => (
                                                <tr key={allocation.id}>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{allocation.building_name}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-900">{allocation.room_number}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500 capitalize">{allocation.room_type}</td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {new Date(allocation.allocation_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${allocation.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                            }`}>
                                                            {allocation.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Home className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">No hostel allocation found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Library Tab */}
                    {activeTab === 'library' && (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900">Library Transactions</h2>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Book</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Issue Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return Date</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fine</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {libraryData?.data?.map((transaction) => (
                                            <tr key={transaction.id}>
                                                <td className="px-6 py-4 text-sm text-gray-900">{transaction.book_title}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">{transaction.author}</td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(transaction.issue_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {new Date(transaction.due_date).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {transaction.return_date ? new Date(transaction.return_date).toLocaleDateString() : '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${transaction.status === 'returned' ? 'bg-green-100 text-green-800' :
                                                        transaction.status === 'issued' ? 'bg-blue-100 text-blue-800' :
                                                            transaction.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {transaction.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900">
                                                    {transaction.fine_amount > 0 ? `₹${transaction.fine_amount}` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentReports;
