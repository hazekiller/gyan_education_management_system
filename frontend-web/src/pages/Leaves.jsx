import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Plus,
    Search,
    Filter,
    Trash2,
    ChevronDown,
    Eye,
    CheckCircle,
    X as XHidden,
    Clock,
    FileText,
} from "lucide-react";
import { leavesAPI } from "../lib/api";
import Modal from "../components/common/Modal";
import LeaveForm from "../components/leaves/LeaveForm";
import LeaveCard from "../components/leaves/LeaveCard";
import LeaveDetailsModal from "../components/leaves/LeaveDetailsModal";
import toast from "react-hot-toast";

const Leaves = () => {
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [adminRemarks, setAdminRemarks] = useState("");
    const [filters, setFilters] = useState({
        status: "",
        user_type: "",
        search: "",
    });

    const { data: leavesData, isLoading } = useQuery({
        queryKey: ["leaves", filters],
        queryFn: () => leavesAPI.getAll(filters),
    });

    const { data: pendingCountData } = useQuery({
        queryKey: ["leaves-pending-count"],
        queryFn: leavesAPI.getPendingCount,
    });

    const handleCreate = async (formData) => {
        try {
            await leavesAPI.create(formData);
            toast.success("Leave application submitted successfully");
            setShowAddModal(false);
            queryClient.invalidateQueries(["leaves"]);
            queryClient.invalidateQueries(["leaves-pending-count"]);
        } catch (error) {
            toast.error(error.message || "Failed to submit leave application");
        }
    };

    const handleApprove = async () => {
        try {
            await leavesAPI.approve(selectedLeave.id, adminRemarks);
            toast.success("Leave application approved");
            setShowApproveModal(false);
            setSelectedLeave(null);
            setAdminRemarks("");
            queryClient.invalidateQueries(["leaves"]);
            queryClient.invalidateQueries(["leaves-pending-count"]);
        } catch (error) {
            toast.error(error.message || "Failed to approve leave");
        }
    };

    const handleDecline = async () => {
        try {
            if (!adminRemarks.trim()) {
                toast.error("Please provide remarks for declining");
                return;
            }
            await leavesAPI.decline(selectedLeave.id, adminRemarks);
            toast.success("Leave application declined");
            setShowDeclineModal(false);
            setSelectedLeave(null);
            setAdminRemarks("");
            queryClient.invalidateQueries(["leaves"]);
            queryClient.invalidateQueries(["leaves-pending-count"]);
        } catch (error) {
            toast.error(error.message || "Failed to decline leave");
        }
    };

    const handleDelete = async () => {
        try {
            await leavesAPI.delete(selectedLeave.id);
            toast.success("Leave application deleted");
            setShowDeleteModal(false);
            setSelectedLeave(null);
            queryClient.invalidateQueries(["leaves"]);
            queryClient.invalidateQueries(["leaves-pending-count"]);
        } catch (error) {
            toast.error(error.message || "Failed to delete leave");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Leave Management
                    </h1>
                    <p className="text-gray-600 mt-1 max-w-md">
                        Manage leave applications from students, teachers, and staff.
                    </p>
                    {pendingCountData?.count > 0 && (
                        <p className="text-sm text-blue-700 font-medium mt-2">
                            {pendingCountData.count} pending application{pendingCountData.count !== 1 ? "s" : ""} awaiting review
                        </p>
                    )}
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pending Requests</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{pendingCountData?.count || 0}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
                {/* We don't have direct API for these yet, but placeholders for standard UI structure */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Approved (All Time)</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">-</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Declined (All Time)</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">-</h3>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                        <XHidden className="w-6 h-6 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name, reason..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="declined">Declined</option>
                        </select>

                        <select
                            value={filters.user_type}
                            onChange={(e) => setFilters({ ...filters, user_type: e.target.value })}
                            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option value="">All Types</option>
                            <option value="student">Students</option>
                            <option value="teacher">Teachers</option>
                            <option value="staff">Staff</option>
                        </select>

                        <button
                            onClick={() => setFilters({ search: "", status: "", user_type: "" })}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip-trigger"
                            title="Reset Filters"
                        >
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-200">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex justify-center items-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        </div>
                                    </td>
                                </tr>
                            ) : leavesData?.data?.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                                <FileText className="w-8 h-8 text-gray-300" />
                                            </div>
                                            <p className="font-medium text-gray-900">No leave applications found</p>
                                            <p className="text-sm text-gray-500 mt-1">Try allowing some filters or check back later.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                leavesData?.data?.map((leave) => (
                                    <tr key={leave.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs uppercase">
                                                    {leave.user_name?.charAt(0) || "U"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{leave.user_name || "Unknown"}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded capitalize ${leave.user_type === 'student' ? 'bg-indigo-50 text-indigo-700' :
                                                            leave.user_type === 'teacher' ? 'bg-purple-50 text-purple-700' :
                                                                'bg-orange-50 text-orange-700'
                                                            }`}>
                                                            {leave.user_type}
                                                        </span>
                                                        <span className="text-xs text-gray-400">•</span>
                                                        <span className="text-xs text-gray-500">{leave.user_identifier}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize ${leave.leave_type === 'sick' ? 'bg-red-50 text-red-700' :
                                                leave.leave_type === 'emergency' ? 'bg-amber-50 text-amber-700' :
                                                    'bg-sky-50 text-sky-700'
                                                }`}>
                                                {leave.leave_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">
                                                    {new Date(leave.start_date).toLocaleDateString()}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    to {new Date(leave.end_date).toLocaleDateString()}
                                                    <span className="ml-1 font-semibold text-blue-600">({leave.total_days}d)</span>
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs">
                                            <p className="text-sm text-gray-600 truncate" title={leave.reason}>
                                                {leave.reason}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {leave.status === 'pending' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                                                    Pending
                                                </span>
                                            ) : leave.status === 'approved' ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
                                                    <XHidden className="w-3 h-3" />
                                                    Declined
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => { setSelectedLeave(leave); setShowViewModal(true); }}
                                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                {leave.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => { setSelectedLeave(leave); setShowApproveModal(true); }}
                                                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => { setSelectedLeave(leave); setShowDeclineModal(true); }}
                                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Decline"
                                                        >
                                                            <XHidden className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => { setSelectedLeave(leave); setShowDeleteModal(true); }}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination (Simplified placeholder if needed) */}
                <div className="bg-gray-50 border-t border-gray-200 p-4">
                    <p className="text-xs text-gray-500 text-center">Showing all matching records</p>
                </div>
            </div>

            {/* Approve Modal */}
            <Modal
                isOpen={showApproveModal}
                onClose={() => {
                    setShowApproveModal(false);
                    setSelectedLeave(null);
                    setAdminRemarks("");
                }}
                title="Approve Leave Application"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to approve this leave application for{" "}
                        <strong>{selectedLeave?.user_name}</strong>?
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Admin Remarks (Optional)
                        </label>
                        <textarea
                            value={adminRemarks}
                            onChange={(e) => setAdminRemarks(e.target.value)}
                            rows={3}
                            placeholder="Add any remarks..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => {
                                setShowApproveModal(false);
                                setSelectedLeave(null);
                                setAdminRemarks("");
                            }}
                            className="btn btn-outline"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApprove}
                            className="btn bg-blue-700 hover:bg-blue-800 text-white"
                        >
                            Approve
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Decline Modal */}
            <Modal
                isOpen={showDeclineModal}
                onClose={() => {
                    setShowDeclineModal(false);
                    setSelectedLeave(null);
                    setAdminRemarks("");
                }}
                title="Decline Leave Application"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        You are declining the leave application for{" "}
                        <strong>{selectedLeave?.user_name}</strong>.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Reason for Declining *
                        </label>
                        <textarea
                            value={adminRemarks}
                            onChange={(e) => setAdminRemarks(e.target.value)}
                            rows={3}
                            placeholder="Please provide a reason for declining..."
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => {
                                setShowDeclineModal(false);
                                setSelectedLeave(null);
                                setAdminRemarks("");
                            }}
                            className="btn btn-outline"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDecline}
                            className="btn bg-gray-700 hover:bg-gray-800 text-white"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedLeave(null);
                }}
                title="Delete Leave Application"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Are you sure you want to delete the leave application from{" "}
                        <strong>{selectedLeave?.user_name}</strong>? This action cannot be undone.
                    </p>

                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setSelectedLeave(null);
                            }}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-sm transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>

            {/* View Details Modal */}
            <LeaveDetailsModal
                isOpen={showViewModal}
                onClose={() => {
                    setShowViewModal(false);
                    setSelectedLeave(null);
                }}
                leave={selectedLeave}
            />
        </div>
    );
};

export default Leaves;
