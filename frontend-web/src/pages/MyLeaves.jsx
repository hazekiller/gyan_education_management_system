import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Calendar, FileText } from "lucide-react";
import { leavesAPI } from "../lib/api";
import Modal from "../components/common/Modal";
import LeaveForm from "../components/leaves/LeaveForm";
import LeaveCard from "../components/leaves/LeaveCard";
import toast from "react-hot-toast";

const MyLeaves = () => {
    const queryClient = useQueryClient();
    const [showAddModal, setShowAddModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);

    const { data: leavesData, isLoading } = useQuery({
        queryKey: ["my-leaves"],
        queryFn: leavesAPI.getMyLeaves,
    });

    const handleCreate = async (formData) => {
        try {
            await leavesAPI.create(formData);
            toast.success("Leave application submitted successfully");
            setShowAddModal(false);
            queryClient.invalidateQueries(["my-leaves"]);
        } catch (error) {
            toast.error(error.message || "Failed to submit leave application");
        }
    };

    const handleDelete = async () => {
        try {
            await leavesAPI.delete(selectedLeave.id);
            toast.success("Leave application deleted");
            setShowDeleteModal(false);
            setSelectedLeave(null);
            queryClient.invalidateQueries(["my-leaves"]);
        } catch (error) {
            toast.error(error.message || "Failed to delete leave");
        }
    };

    const getStatistics = () => {
        if (!leavesData?.data) return { total: 0, pending: 0, approved: 0, declined: 0 };

        return {
            total: leavesData.data.length,
            pending: leavesData.data.filter(l => l.status === 'pending').length,
            approved: leavesData.data.filter(l => l.status === 'approved').length,
            declined: leavesData.data.filter(l => l.status === 'declined').length,
        };
    };

    const stats = getStatistics();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">My Leaves</h1>
                    <p className="text-gray-600 mt-1 max-w-md">
                        Submit and track your leave applications.
                    </p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors mt-4 md:mt-0"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    <span>New Leave Application</span>
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Applications</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <FileText className="w-10 h-10 text-blue-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white border border-blue-200 rounded-lg p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-blue-700 mt-1">{stats.pending}</p>
                        </div>
                        <Calendar className="w-10 h-10 text-blue-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Approved</p>
                            <p className="text-2xl font-bold text-gray-700 mt-1">{stats.approved}</p>
                        </div>
                        <Calendar className="w-10 h-10 text-gray-500 opacity-20" />
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-5">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Declined</p>
                            <p className="text-2xl font-bold text-gray-700 mt-1">{stats.declined}</p>
                        </div>
                        <Calendar className="w-10 h-10 text-gray-500 opacity-20" />
                    </div>
                </div>
            </div>

            {/* Leave Applications */}
            <div>
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="loading"></div>
                    </div>
                ) : leavesData?.data?.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">No leave applications yet</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Submit Your First Leave
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leavesData?.data?.map((leave) => (
                            <div key={leave.id} className="relative">
                                <LeaveCard leave={leave} isAdmin={false} />
                                {leave.status === "pending" && (
                                    <button
                                        onClick={() => {
                                            setSelectedLeave(leave);
                                            setShowDeleteModal(true);
                                        }}
                                        className="absolute top-3 right-3 p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                        title="Delete application"
                                    >
                                        <Plus className="w-4 h-4 rotate-45" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                title="New Leave Application"
                size="md"
            >
                <LeaveForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowAddModal(false)}
                />
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
                        Are you sure you want to delete this leave application? This action
                        cannot be undone.
                    </p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setSelectedLeave(null);
                            }}
                            className="btn btn-outline"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            className="btn bg-red-600 hover:bg-red-700 text-white"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MyLeaves;
