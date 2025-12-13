import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Plus,
    Search,
    Filter,
    Trash2,
    ChevronDown,
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

            {/* Filters */}
            <div className="card p-6 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name, reason..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="input pl-12 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="input w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="declined">Declined</option>
                    </select>

                    <select
                        value={filters.user_type}
                        onChange={(e) => setFilters({ ...filters, user_type: e.target.value })}
                        className="input w-full border border-gray-300 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-400 focus:border-blue-500"
                    >
                        <option value="">All Types</option>
                        <option value="student">Students</option>
                        <option value="teacher">Teachers</option>
                        <option value="staff">Staff</option>
                    </select>
                </div>

                <button
                    onClick={() => setFilters({ search: "", status: "", user_type: "" })}
                    className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
                >
                    <Filter className="w-4 h-4 mr-1" />
                    Reset Filters
                </button>
            </div>

            {/* Leave Applications Grid */}
            <div>
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
                    </div>
                ) : leavesData?.data?.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">No leave applications found</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leavesData?.data?.map((leave) => (
                            <LeaveCard
                                key={leave.id}
                                leave={leave}
                                isAdmin={true}
                                onView={(leave) => {
                                    setSelectedLeave(leave);
                                    setShowViewModal(true);
                                }}
                                onApprove={(leave) => {
                                    setSelectedLeave(leave);
                                    setShowApproveModal(true);
                                }}
                                onDecline={(leave) => {
                                    setSelectedLeave(leave);
                                    setShowDeclineModal(true);
                                }}
                            />
                        ))}
                    </div>
                )}
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
